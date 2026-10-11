import { useId, useMemo } from 'react';
import { itemName } from '../../data/gameData.ts';
import { describeConveyance } from '../../lib/plan/checklist.ts';
import type { FactoryPlan, FlowNodeRef } from '../../lib/plan/factoryPlan.ts';
import { formatClock, formatNumber, formatRate } from '../../lib/plan/format.ts';

type Tone = 'extract' | 'import' | 'group' | 'output' | 'surplus';

interface DiagramNode {
  ref: string;
  label: string;
  sub: string;
  stage: number;
  tone: Tone;
  x: number;
  y: number;
}

const W = 196;
const H = 54;
const GAP_X = 20;
const GAP_Y = 64;
const LINE_GAP = 14;
const MAX_PER_LINE = 4;
const PAD = 16;

const refKey = (r: FlowNodeRef): string => `${r.kind}:${r.key}`;

const TONE_STYLE: Record<Tone, { fill: string; stroke: string }> = {
  extract: { fill: '#1d2a22', stroke: '#5ee08f' },
  import: { fill: '#1d2533', stroke: '#7cc4ff' },
  group: { fill: '#22262e', stroke: '#4d5563' },
  output: { fill: '#2e2216', stroke: '#fa9549' },
  surplus: { fill: '#2b2420', stroke: '#8f98a6' },
};

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Top-to-bottom production flow: raw inputs → machine groups (by stage) →
 * outputs. Rows are ordered by the average position of their suppliers to
 * reduce crossings.
 */
export function FlowDiagram({ plan }: { plan: FactoryPlan }) {
  const titleId = useId();
  const { nodes, width, height } = useMemo(() => {
    const maxStage = plan.groups.reduce((m, g) => Math.max(m, g.stage), 0);
    const list: Omit<DiagramNode, 'x' | 'y'>[] = [
      ...plan.extraction.map((e) => ({
        ref: `extract:${e.key}`,
        label: itemName(e.item),
        sub: `${e.plan.nodes}× ${e.building.name}${e.building.id === 'Build_WaterPump_C' ? '' : ` · ${e.purity}`}`,
        stage: 0,
        tone: 'extract' as const,
      })),
      ...plan.imports.map((i) => ({
        ref: `import:${i.item}`,
        label: `Import ${itemName(i.item)}`,
        sub: formatRate(i.rate, i.item),
        stage: 0,
        tone: 'import' as const,
      })),
      ...plan.groups.map((g) => ({
        ref: `group:${g.key}`,
        label: g.recipe.name,
        sub: `${g.split.count}× ${g.building.name} @ ${formatClock(g.split.groups[0]?.clock ?? 1)}`,
        stage: g.stage,
        tone: 'group' as const,
      })),
      ...plan.outputs.map((o) => ({
        ref: `output:${o.item}`,
        label: plan.generators
          ? `→ ${plan.generators.count}× ${plan.generators.building.name}`
          : itemName(o.item),
        sub: formatRate(o.rate, o.item),
        stage: maxStage + 1,
        tone: 'output' as const,
      })),
      ...plan.surplus.map((s) => ({
        ref: `surplus:${s.item}`,
        label: `Surplus ${itemName(s.item)}`,
        sub: formatRate(s.rate, s.item),
        stage: maxStage + 1,
        tone: 'surplus' as const,
      })),
    ];

    const rows = new Map<number, typeof list>();
    for (const n of list) rows.set(n.stage, [...(rows.get(n.stage) ?? []), n]);
    const widest = Math.min(MAX_PER_LINE, Math.max(...[...rows.values()].map((r) => r.length), 1));
    const totalW = PAD * 2 + widest * W + (widest - 1) * GAP_X;

    // Suppliers of each node, for barycentric ordering.
    const suppliers = new Map<string, string[]>();
    for (const e of plan.edges) {
      const to = refKey(e.to);
      suppliers.set(to, [...(suppliers.get(to) ?? []), refKey(e.from)]);
    }

    const placed = new Map<string, DiagramNode>();
    let top = PAD;
    for (const stage of [...rows.keys()].sort((a, b) => a - b)) {
      const row = rows.get(stage)!;
      const centreOf = (ref: string): number => {
        const xs = (suppliers.get(ref) ?? [])
          .map((s) => placed.get(s)?.x)
          .filter((x): x is number => x !== undefined);
        return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : Number.POSITIVE_INFINITY;
      };
      const ordered =
        stage === 0 ? row : [...row].sort((a, b) => centreOf(a.ref) - centreOf(b.ref));
      // Wrap wide stages onto several lines so the diagram fits the panel.
      for (let start = 0; start < ordered.length; start += MAX_PER_LINE) {
        const line = ordered.slice(start, start + MAX_PER_LINE);
        const lineW = line.length * W + (line.length - 1) * GAP_X;
        const left = (totalW - lineW) / 2;
        line.forEach((n, i) => placed.set(n.ref, { ...n, x: left + i * (W + GAP_X), y: top }));
        top += H + LINE_GAP;
      }
      top += GAP_Y - LINE_GAP;
    }

    return {
      nodes: placed,
      width: totalW,
      height: top - GAP_Y + PAD,
    };
  }, [plan]);

  const maxRate = plan.edges.reduce((m, e) => Math.max(m, e.rate), 1);
  const showLabels = plan.edges.length <= 40;

  return (
    <div className="space-y-2">
      <p className="text-ink-faint text-xs">
        Line thickness is proportional to flow. Hover a line or box for details. Orange = belts,
        blue = pipes.
      </p>
      <div className="border-line bg-bg overflow-auto rounded-md border">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={titleId}
          className="mx-auto block"
        >
          <title id={titleId}>
            {`Production flow with ${plan.groups.length} machine groups, ${plan.extraction.length} extracted resources and ${plan.edges.length} connections.`}
          </title>
          <g fill="none">
            {plan.edges.map((edge) => {
              const from = nodes.get(refKey(edge.from));
              const to = nodes.get(refKey(edge.to));
              if (!from || !to) return null;
              const x1 = from.x + W / 2;
              const y1 = from.y + H;
              const x2 = to.x + W / 2;
              const y2 = to.y;
              const mid = (y1 + y2) / 2;
              const stroke = edge.conveyance.kind === 'pipe' ? '#7cc4ff' : '#fa9549';
              const label = `${formatNumber(edge.rate)}/min ${itemName(edge.item)} · ${describeConveyance(edge.conveyance)}`;
              return (
                <g key={edge.id}>
                  <path
                    d={`M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`}
                    stroke={stroke}
                    strokeOpacity={0.55}
                    strokeWidth={1.5 + 4 * Math.sqrt(edge.rate / maxRate)}
                  >
                    <title>{label}</title>
                  </path>
                  {showLabels && (
                    <text
                      x={(x1 + x2) / 2 + 4}
                      y={mid + 3}
                      className="fill-ink-muted"
                      fontSize={10}
                    >
                      {formatNumber(edge.rate)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
          {[...nodes.values()].map((n) => (
            <g key={n.ref} transform={`translate(${n.x},${n.y})`}>
              <rect
                width={W}
                height={H}
                rx={6}
                fill={TONE_STYLE[n.tone].fill}
                stroke={TONE_STYLE[n.tone].stroke}
              />
              <text x={10} y={21} fontSize={12.5} fontWeight={600} className="fill-ink">
                {truncate(n.label, 25)}
              </text>
              <text x={10} y={39} fontSize={10.5} className="fill-ink-muted">
                {truncate(n.sub, 32)}
              </text>
              <title>{`${n.label}: ${n.sub}`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
