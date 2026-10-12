import { GameIcon } from '../../components/GameIcon.tsx';
import { cx } from '../../components/cx.ts';
import type { FactoryLayout } from '../../content/types.ts';
import { itemName } from '../../data/gameData.ts';
import { formatMW, formatRate } from '../../lib/plan/format.ts';
import { useLayoutPlan } from '../layouts/useLayoutPlan.ts';

/** A layout's headline figures: what it makes, how many machines, how much power. */
export interface StepFiguresProps {
  layout: FactoryLayout;
  /** Amber is reserved for the NEXT strip; everywhere else the lead figure is plain ink. */
  emphasis?: boolean;
  className?: string;
}

export function StepFigures({ layout, emphasis = false, className }: StepFiguresProps) {
  const { plan } = useLayoutPlan(layout);
  const lead = cx('text-lg', emphasis ? 'text-accent-strong' : 'text-ink');
  const output = plan.outputs[0];
  return (
    <dl className={cx('num flex flex-wrap items-baseline gap-x-5 gap-y-1', className)}>
      {plan.generators ? (
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">Generates</dt>
          <dd>
            <b className={lead}>{formatMW(plan.generators.powerMW)}</b>{' '}
            <span className="text-ink-muted">from {plan.generators.building.name}</span>
          </dd>
        </div>
      ) : (
        output && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Makes</dt>
            <dd className="flex items-center gap-1.5">
              <b className={lead}>{formatRate(output.rate, output.item)}</b>
              <GameIcon id={output.item} />
              <span className="text-ink-muted">{itemName(output.item)}</span>
            </dd>
          </div>
        )
      )}
      <div className="flex items-baseline gap-1.5">
        <dt className="text-ink-muted order-2">machines</dt>
        <dd className="text-ink order-1 font-semibold">{plan.machineCount}</dd>
      </div>
      <div className="flex items-baseline gap-1.5">
        <dt className="sr-only">Power use</dt>
        <dd className="text-ink font-semibold">{formatMW(plan.power.totalMW)}</dd>
      </div>
    </dl>
  );
}
