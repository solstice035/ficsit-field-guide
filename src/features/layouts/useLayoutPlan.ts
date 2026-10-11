import { useMemo } from 'react';
import type { FactoryLayout } from '../../content/types.ts';
import { type FactoryPlan, type PlanConfig, buildFactoryPlan } from '../../lib/plan/factoryPlan.ts';
import { type LayoutUserConfig, resolveLayoutConfig } from '../../lib/plan/layoutConfig.ts';
import { useLayouts } from '../../state/layouts.ts';
import { useSettings } from '../../state/settings.ts';

export interface LayoutPlanResult {
  user: LayoutUserConfig;
  config: PlanConfig;
  plan: FactoryPlan;
}

const EMPTY: LayoutUserConfig = {};

/** Resolves a layout against the user's saved tweaks and purity overrides, then plans it. */
export function useLayoutPlan(layout: FactoryLayout): LayoutPlanResult {
  const user = useLayouts((s) => s.configs[layout.id]) ?? EMPTY;
  const purityOverrides = useSettings((s) => s.purityOverrides);
  return useMemo(() => {
    const config = resolveLayoutConfig(layout, user, purityOverrides);
    return { user, config, plan: buildFactoryPlan(config) };
  }, [layout, user, purityOverrides]);
}
