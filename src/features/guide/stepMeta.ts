import { LAYOUT_BY_ID, SITE_BY_ID } from '../../content/index.ts';
import type { FactoryLayout, GuideStep, StepKind } from '../../content/types.ts';

export const KIND_LABEL: Record<StepKind, string> = {
  handcraft: 'Hand-craft',
  build: 'Build',
  power: 'Power',
  milestone: 'Milestone',
  research: 'MAM',
  explore: 'Explore',
  logistics: 'Logistics',
  'space-elevator': 'Space Elevator',
};

/** Where the step happens: its first site, else its first layout's site. */
export function stepSiteName(step: GuideStep): string | undefined {
  const siteId = step.siteIds?.[0] ?? stepLayout(step)?.siteId;
  return siteId ? SITE_BY_ID.get(siteId)?.name : undefined;
}

/** The step's lead factory layout, if it has one. */
export function stepLayout(step: GuideStep): FactoryLayout | undefined {
  const id = step.layoutIds?.[0];
  return id ? LAYOUT_BY_ID.get(id) : undefined;
}

/** DOM id of a step row, the target of "Go to step nn" and NEXT links. */
export const stepAnchor = (stepId: string): string => `step-${stepId}`;
