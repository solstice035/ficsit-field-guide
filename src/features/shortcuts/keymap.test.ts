import { describe, expect, it } from 'vitest';
import { type KeyInput, shortcutFor } from './keymap.ts';

const press = (key: string, extra: Partial<KeyInput> = {}): KeyInput => ({
  key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  targetTag: 'BODY',
  targetEditable: false,
  ...extra,
});

describe('shortcutFor', () => {
  it.each([
    ['n', 'tick-next'],
    ['j', 'next-step'],
    ['k', 'previous-step'],
    ['g', 'open-glance'],
    ['?', 'show-help'],
  ] as const)('maps %s to %s', (key, action) => {
    expect(shortcutFor(press(key))).toBe(action);
  });

  it('ignores other keys', () => {
    expect(shortcutFor(press('x'))).toBeNull();
    expect(shortcutFor(press('Enter'))).toBeNull();
  });

  it('is case-sensitive so Shift+N does nothing', () => {
    expect(shortcutFor(press('N'))).toBeNull();
  });

  it.each(['INPUT', 'SELECT', 'TEXTAREA'])('stays quiet while typing in %s', (targetTag) => {
    expect(shortcutFor(press('n', { targetTag }))).toBeNull();
  });

  it('stays quiet in contenteditable', () => {
    expect(shortcutFor(press('n', { targetEditable: true }))).toBeNull();
  });

  it.each(['altKey', 'ctrlKey', 'metaKey'] as const)('stays quiet with %s held', (mod) => {
    expect(shortcutFor(press('n', { [mod]: true }))).toBeNull();
  });
});
