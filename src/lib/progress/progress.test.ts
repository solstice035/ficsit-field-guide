import { describe, expect, it } from 'vitest';
import type { GuideStep, TierGuide } from '../../content/types.ts';
import {
  isStepOpen,
  isTaskDone,
  mergeLinkedTicks,
  nextInTier,
  stepProgress,
  stepStates,
  tierProgress,
  type ProgressFlags,
} from './progress.ts';

const step = (id: string, tasks: GuideStep['tasks'], optional?: boolean): GuideStep => ({
  id,
  title: id,
  kind: 'milestone',
  summary: '',
  tasks,
  ...(optional ? { optional } : {}),
});

const submit = { id: 'submit', label: 'Submit A', milestoneId: 'M_A' };
const build = { id: 'build', label: 'Build it' };
const jump = { id: 'jump', label: 'Submit Jump Pads', milestoneId: 'M_J' };

const tier: TierGuide = {
  tier: 1,
  title: 'T',
  tagline: '',
  unlockedBy: '',
  briefing: [],
  goals: [],
  steps: [step('s1', [submit, build]), step('s2', [jump], true)],
};

const flags = (p: Partial<ProgressFlags> = {}): ProgressFlags => ({
  tasks: {},
  milestones: {},
  phases: {},
  skipped: {},
  ...p,
});

describe('isTaskDone', () => {
  it('reads a linked task from its milestone flag', () => {
    expect(isTaskDone(submit, flags({ milestones: { M_A: true } }))).toBe(true);
    expect(isTaskDone(submit, flags({ tasks: { submit: true } }))).toBe(false);
  });

  it('reads a delivery task from its Space Elevator phase flag', () => {
    const deliver = { id: 'deliver', label: 'Deliver Phase 1', phase: 1 };
    expect(isTaskDone(deliver, flags({ phases: { '1': true } }))).toBe(true);
    expect(isTaskDone(deliver, flags({ tasks: { deliver: true } }))).toBe(false);
  });

  it('reads an unlinked task from its own flag', () => {
    expect(isTaskDone(build, flags({ tasks: { build: true } }))).toBe(true);
  });
});

describe('stepProgress and isStepOpen', () => {
  it('counts done tasks per step', () => {
    const s1 = tier.steps[0]!;
    expect(stepProgress(s1, flags({ milestones: { M_A: true } }))).toEqual({ done: 1, total: 2 });
    expect(isStepOpen(s1, flags({ milestones: { M_A: true } }))).toBe(true);
    expect(isStepOpen(s1, flags({ milestones: { M_A: true }, tasks: { build: true } }))).toBe(
      false,
    );
  });

  it('treats a skipped optional step as closed', () => {
    expect(isStepOpen(tier.steps[1]!, flags({ skipped: { s2: true } }))).toBe(false);
  });

  it('ignores a skip flag on a step that is not optional', () => {
    expect(isStepOpen(tier.steps[0]!, flags({ skipped: { s1: true } }))).toBe(true);
  });
});

describe('tierProgress', () => {
  it('counts each milestone once, through its task', () => {
    expect(tierProgress(tier, flags({ milestones: { M_A: true } }))).toEqual({ done: 1, total: 3 });
  });

  it('drops skipped optional steps from the total', () => {
    expect(tierProgress(tier, flags({ skipped: { s2: true } }))).toEqual({ done: 0, total: 2 });
  });
});

describe('mergeLinkedTicks', () => {
  const links = new Map([['submit', 'M_A']]);

  it('moves a ticked linked task onto its milestone', () => {
    expect(mergeLinkedTicks({ submit: true, build: true }, {}, links)).toEqual({
      tasks: { build: true },
      targets: { M_A: true },
    });
  });

  it('keeps a milestone ticked on its own and drops a stale unticked link', () => {
    expect(mergeLinkedTicks({}, { M_A: true }, links)).toEqual({
      tasks: {},
      targets: { M_A: true },
    });
  });
});

describe('nextInTier and stepStates', () => {
  it('points at the first open task of the first open step', () => {
    expect(nextInTier(tier, flags())).toEqual({ step: tier.steps[0], index: 0, task: submit });
    expect(nextInTier(tier, flags({ milestones: { M_A: true } }))?.task).toBe(build);
  });

  it('stops on an optional step until it is done or skipped', () => {
    const p = flags({ milestones: { M_A: true }, tasks: { build: true } });
    expect(nextInTier(tier, p)?.step.id).toBe('s2');
    expect(nextInTier(tier, { ...p, skipped: { s2: true } })).toBeNull();
  });

  it('labels each step done, skipped, current or later', () => {
    const three = { ...tier, steps: [...tier.steps, step('s3', [{ id: 'x', label: 'X' }])] };
    expect(stepStates(three, flags({ skipped: { s2: true } }))).toEqual([
      'current',
      'skipped',
      'later',
    ]);
    expect(
      stepStates(three, flags({ milestones: { M_A: true }, tasks: { build: true, x: true } })),
    ).toEqual(['done', 'current', 'done']);
  });
});
