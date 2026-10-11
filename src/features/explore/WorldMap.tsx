/*
 * The map surface is a custom pan/zoom widget (role="application") with its own keyboard
 * support (arrows, +/−) plus equivalent toolbar buttons. jsx-a11y does not recognise
 * role="application" as interactive, so these two rules are disabled for this file only.
 */
/* eslint-disable jsx-a11y-x/no-noninteractive-element-interactions, jsx-a11y-x/no-noninteractive-tabindex */
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

/** Playable-area bounds in metres (matches the in-game map framing). */
const WORLD = { minX: -3247, maxX: 4253, minY: -3750, maxY: 3750 } as const;
const WORLD_W = WORLD.maxX - WORLD.minX;
const MIN_VIEW = 150;
const MAX_VIEW = WORLD_W * 1.2;

export type MarkerShape = 'circle' | 'diamond' | 'square' | 'triangle';

export interface MapPoint {
  id: string;
  x: number;
  y: number;
  colour: string;
  shape: MarkerShape;
  label: string;
  dim?: boolean;
}

export interface MapLabel {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface WorldMapProps {
  points: readonly MapPoint[];
  base: { x: number; y: number };
  labels?: readonly MapLabel[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** When set, the next click on the map reports world coordinates. */
  onPick?: (x: number, y: number) => void;
  focus?: { x: number; y: number; nonce: number } | null;
  className?: string;
}

interface View {
  cx: number;
  cy: number;
  w: number;
}

function Marker({ point, r }: { point: MapPoint; r: number }) {
  const common = {
    fill: point.colour,
    fillOpacity: point.dim ? 0.25 : 0.95,
    stroke: '#0b0d10',
    strokeWidth: r * 0.25,
  };
  switch (point.shape) {
    case 'square':
      return <rect x={point.x - r} y={point.y - r} width={r * 2} height={r * 2} {...common} />;
    case 'diamond':
      return (
        <path
          d={`M${point.x},${point.y - r * 1.3} L${point.x + r * 1.3},${point.y} L${point.x},${point.y + r * 1.3} L${point.x - r * 1.3},${point.y} Z`}
          {...common}
        />
      );
    case 'triangle':
      return (
        <path
          d={`M${point.x},${point.y - r * 1.2} L${point.x + r * 1.1},${point.y + r} L${point.x - r * 1.1},${point.y + r} Z`}
          {...common}
        />
      );
    default:
      return <circle cx={point.x} cy={point.y} r={r} {...common} />;
  }
}

/**
 * Pan/zoom vector map in world metres (north up: y grows southwards, as on
 * screen). Uses `/map/world.png` as a backdrop if the user has supplied one.
 */
export function WorldMap({
  points,
  base,
  labels = [],
  selectedId,
  onSelect,
  onPick,
  focus,
  className,
}: WorldMapProps) {
  const titleId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 560 });
  const [view, setView] = useState<View>(() =>
    focus ? { cx: focus.x, cy: focus.y, w: 1600 } : { cx: base.x, cy: base.y, w: 3200 },
  );
  const [backdrop, setBackdrop] = useState(false);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBackdrop(true);
    img.src = '/map/world.png';
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-centre when a new focus request arrives (adjusting state during render,
  // guarded by the request nonce, avoids an extra effect pass).
  const [focusNonce, setFocusNonce] = useState(focus?.nonce);
  if (focus && focus.nonce !== focusNonce) {
    setFocusNonce(focus.nonce);
    setView((v) => ({ cx: focus.x, cy: focus.y, w: Math.min(v.w, 1600) }));
  }

  const viewH = view.w * (size.h / Math.max(1, size.w));
  const metresPerPx = view.w / Math.max(1, size.w);

  const zoomAt = useCallback(
    (factor: number, px?: number, py?: number) => {
      setView((v) => {
        const w = Math.min(MAX_VIEW, Math.max(MIN_VIEW, v.w * factor));
        if (px === undefined || py === undefined) return { ...v, w };
        const mpp = v.w / size.w;
        const wx = v.cx + (px - size.w / 2) * mpp;
        const wy = v.cy + (py - size.h / 2) * mpp;
        const nmpp = w / size.w;
        return { w, cx: wx - (px - size.w / 2) * nmpp, cy: wy - (py - size.h / 2) * nmpp };
      });
    },
    [size],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.deltaY > 0 ? 1.2 : 1 / 1.2, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    d.x = e.clientX;
    d.y = e.clientY;
    setView((v) => ({ ...v, cx: v.cx - dx * metresPerPx, cy: v.cy - dy * metresPerPx }));
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved && onPick) {
      const rect = e.currentTarget.getBoundingClientRect();
      onPick(
        Math.round(view.cx + (e.clientX - rect.left - size.w / 2) * metresPerPx),
        Math.round(view.cy + (e.clientY - rect.top - size.h / 2) * metresPerPx),
      );
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = view.w * 0.1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      setView((v) => ({ ...v, cx: v.cx + move[0], cy: v.cy + move[1] }));
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomAt(1 / 1.25);
    } else if (e.key === '-') {
      e.preventDefault();
      zoomAt(1.25);
    }
  };

  const r = Math.max(4, view.w / 240);
  const font = view.w / 70;

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => zoomAt(1 / 1.5)}
          className="border-line-strong hover:border-accent rounded border px-2.5 py-1 text-sm"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomAt(1.5)}
          className="border-line-strong hover:border-accent rounded border px-2.5 py-1 text-sm"
          aria-label="Zoom out"
        >
          −
        </button>
        {(
          [
            ['Pan north', '↑', 0, -1],
            ['Pan south', '↓', 0, 1],
            ['Pan west', '←', -1, 0],
            ['Pan east', '→', 1, 0],
          ] as const
        ).map(([label, glyph, dx, dy]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() =>
              setView((v) => ({ ...v, cx: v.cx + dx * v.w * 0.2, cy: v.cy + dy * v.w * 0.2 }))
            }
            className="border-line-strong hover:border-accent rounded border px-2.5 py-1 text-sm"
          >
            {glyph}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setView({ cx: base.x, cy: base.y, w: 3200 })}
          className="border-line-strong hover:border-accent rounded border px-2.5 py-1 text-sm"
        >
          Centre on base
        </button>
        <button
          type="button"
          onClick={() => setView({ cx: (WORLD.minX + WORLD.maxX) / 2, cy: 0, w: WORLD_W })}
          className="border-line-strong hover:border-accent rounded border px-2.5 py-1 text-sm"
        >
          Whole world
        </button>
        <span className="text-ink-faint num ml-auto text-xs">
          View {(view.w / 1000).toFixed(1)} km wide · drag to pan, scroll or +/− to zoom
        </span>
      </div>
      <div
        ref={wrapRef}
        tabIndex={0}
        role="application"
        aria-roledescription="map"
        aria-label="World map. Use arrow keys to pan and plus or minus to zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className={`border-line bg-bg relative h-[60vh] min-h-[360px] touch-none overflow-hidden rounded-md border select-none ${onPick ? 'cursor-crosshair' : 'cursor-grab'}`}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`${view.cx - view.w / 2} ${view.cy - viewH / 2} ${view.w} ${viewH}`}
          role="img"
          aria-labelledby={titleId}
          className="block"
        >
          <title id={titleId}>{`Map showing ${points.length} markers around your base.`}</title>
          {backdrop && (
            <image
              href="/map/world.png"
              x={WORLD.minX}
              y={WORLD.minY}
              width={WORLD_W}
              height={WORLD.maxY - WORLD.minY}
              opacity={0.55}
              preserveAspectRatio="none"
            />
          )}
          <rect
            x={WORLD.minX}
            y={WORLD.minY}
            width={WORLD_W}
            height={WORLD.maxY - WORLD.minY}
            fill="none"
            stroke="#3a414d"
            strokeWidth={r * 0.4}
          />
          {[500, 1000, 2000].map((radius) => (
            <g key={radius}>
              <circle
                cx={base.x}
                cy={base.y}
                r={radius}
                fill="none"
                stroke="#fa9549"
                strokeOpacity={0.35}
                strokeWidth={r * 0.3}
                strokeDasharray={`${r * 2} ${r * 1.5}`}
              />
              <text
                x={base.x + radius * 0.71 + r}
                y={base.y - radius * 0.71}
                fontSize={font * 0.8}
                className="fill-ink-faint"
              >
                {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
              </text>
            </g>
          ))}
          {labels.map((l) => (
            <text
              key={l.id}
              x={l.x}
              y={l.y}
              fontSize={font}
              textAnchor="middle"
              className="fill-ink-muted"
              fontWeight={600}
            >
              {l.text}
            </text>
          ))}
          {points.map((p) => (
            <g
              key={p.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(p.id);
              }}
              className="cursor-pointer"
            >
              <Marker point={p} r={p.id === selectedId ? r * 1.8 : r} />
              <title>{p.label}</title>
            </g>
          ))}
          {selectedId &&
            points
              .filter((p) => p.id === selectedId)
              .map((p) => (
                <circle
                  key="sel"
                  cx={p.x}
                  cy={p.y}
                  r={r * 3}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={r * 0.35}
                />
              ))}
          <g aria-hidden="true">
            <circle
              cx={base.x}
              cy={base.y}
              r={r * 1.6}
              fill="#fa9549"
              stroke="#111317"
              strokeWidth={r * 0.4}
            />
            <text
              x={base.x}
              y={base.y - r * 2.6}
              textAnchor="middle"
              fontSize={font * 1.1}
              fontWeight={700}
              className="fill-accent-strong"
            >
              Base
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
