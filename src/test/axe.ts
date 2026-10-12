import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core against a rendered container and fails with a readable
 * summary of any WCAG 2.2 A/AA violations (2.0, 2.1 and 2.2 rules).
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    // jsdom cannot compute layout/colour, so contrast is verified in the browser instead.
    rules: { 'color-contrast': { enabled: false } },
  });
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
  );
  expect(summary).toEqual([]);
}
