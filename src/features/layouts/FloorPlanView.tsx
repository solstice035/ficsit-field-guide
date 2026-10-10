import { useId, useState } from 'react';
import { Segmented } from '../../components/Fields.tsx';
import type { FloorPlan } from '../../lib/calc/floorplan.ts';
import { FOUNDATION_M } from '../../lib/calc/constants.ts';

const LANE_M = 2;
const MARGIN_M = 2;

/** To-scale manifold floor plan on an 8 m foundation grid. */
export function FloorPlanView({ floor }: { floor: FloorPlan }) {
  const titleId = useId();
  const [scale, setScale] = useState(5);
  if (!floor.rows.length) {
    return <p className="text-ink-muted text-sm">Nothing to lay out: this plan has no machines.</p>;
  }
  const widthM = Math.ceil(floor.widthM / FOUNDATION_M) * FOUNDATION_M;
  const depthM = Math.ceil(floor.depthM / FOUNDATION_M) * FOUNDATION_M;
  const pad = 24;
  const w = widthM * scale + pad * 2;
  const h = depthM * scale + pad * 2;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-ink-muted text-sm">
          Footprint ≈{' '}
          <strong className="text-ink">
            {floor.foundationsWide} × {floor.foundationsDeep}
          </strong>{' '}
          foundations ({Math.round(floor.widthM)} × {Math.round(floor.depthM)} m). Each numbered
          block is a manifold in production order: input lanes (green) on top, machines, output
          lanes (orange) below.
        </p>
        <Segmented
          legend="Zoom"
          value={scale}
          onChange={setScale}
          options={[
            { value: 3, label: 'S' },
            { value: 5, label: 'M' },
            { value: 8, label: 'L' },
          ]}
        />
      </div>
      <div className="border-line bg-bg overflow-auto rounded-md border">
        <svg width={w} height={h} role="img" aria-labelledby={titleId} className="block">
          <title
            id={titleId}
          >{`Floor plan: ${floor.rows.length} manifold rows on ${floor.foundationsWide} by ${floor.foundationsDeep} foundations.`}</title>
          <g transform={`translate(${pad},${pad})`}>
            {Array.from({ length: widthM / FOUNDATION_M + 1 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * FOUNDATION_M * scale}
                y1={0}
                x2={i * FOUNDATION_M * scale}
                y2={depthM * scale}
                stroke="#2b3039"
              />
            ))}
            {Array.from({ length: depthM / FOUNDATION_M + 1 }, (_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={i * FOUNDATION_M * scale}
                x2={widthM * scale}
                y2={i * FOUNDATION_M * scale}
                stroke="#2b3039"
              />
            ))}
            {floor.rows.map((row, index) => {
              const top = 0;
              const inputs = Math.max(1, row.inputLanes);
              const outputs = Math.max(1, row.outputLanes);
              const machineTop = top + (inputs * LANE_M + 1) * scale;
              const outputTop = machineTop + (Math.ceil(row.machineL) + 1) * scale;
              const full = `${index + 1}. ${row.count}× ${row.label}`;
              const fits = row.lengthM * scale > full.length * 6.2;
              return (
                <g
                  key={row.key}
                  transform={`translate(${row.offsetX * scale},${row.offsetM * scale})`}
                >
                  <title>{`${full}: ${row.foundationsLong} × ${row.foundationsDeep} foundations`}</title>
                  <rect
                    x={0}
                    y={top}
                    width={row.lengthM * scale}
                    height={row.depthM * scale}
                    fill="#fa954914"
                    stroke="#fa954955"
                    strokeDasharray="4 3"
                  />
                  {Array.from({ length: inputs }, (_, i) => (
                    <line
                      key={`in${i}`}
                      x1={0}
                      x2={row.lengthM * scale}
                      y1={top + (i + 0.5) * LANE_M * scale}
                      y2={top + (i + 0.5) * LANE_M * scale}
                      stroke="#5ee08f"
                      strokeWidth={Math.max(1, scale * 0.5)}
                      strokeOpacity={0.7}
                    />
                  ))}
                  {Array.from({ length: row.count }, (_, i) => (
                    <rect
                      key={`m${i}`}
                      x={(MARGIN_M + i * row.pitchM) * scale}
                      y={machineTop}
                      width={row.machineW * scale}
                      height={row.machineL * scale}
                      rx={2}
                      fill="#2b3039"
                      stroke="#b3bac6"
                    />
                  ))}
                  {Array.from({ length: outputs }, (_, i) => (
                    <line
                      key={`out${i}`}
                      x1={0}
                      x2={row.lengthM * scale}
                      y1={outputTop + (i + 0.5) * LANE_M * scale}
                      y2={outputTop + (i + 0.5) * LANE_M * scale}
                      stroke="#fa9549"
                      strokeWidth={Math.max(1, scale * 0.5)}
                      strokeOpacity={0.8}
                    />
                  ))}
                  <text x={0} y={-4} fontSize={11} fontWeight={600} className="fill-ink">
                    {fits ? full : String(index + 1)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <table>
        <caption className="sr-only">Manifold rows</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Row</th>
            <th scope="col">Machines</th>
            <th scope="col" className="text-right">
              Foundations
            </th>
            <th scope="col" className="text-right">
              Size (m)
            </th>
          </tr>
        </thead>
        <tbody>
          {floor.rows.map((row, index) => (
            <tr key={row.key} className="border-line border-t">
              <td className="num text-ink-faint py-1.5 pr-2">{index + 1}</td>
              <td>{row.label}</td>
              <td>{row.count}</td>
              <td className="num text-right">
                {row.foundationsLong} × {row.foundationsDeep}
              </td>
              <td className="num text-right">
                {Math.round(row.lengthM)} × {Math.round(row.depthM)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
