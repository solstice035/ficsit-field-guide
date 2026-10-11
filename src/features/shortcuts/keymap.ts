/** Single-key shortcuts for the guide. Each one also has a visible control. */
export type ShortcutAction =
  'tick-next' | 'next-step' | 'previous-step' | 'open-glance' | 'show-help';

export interface Shortcut {
  key: string;
  action: ShortcutAction;
  description: string;
}

export const SHORTCUTS: readonly Shortcut[] = [
  { key: 'n', action: 'tick-next', description: 'Tick the NEXT task' },
  { key: 'j', action: 'next-step', description: 'Move to the next step' },
  { key: 'k', action: 'previous-step', description: 'Move to the previous step' },
  { key: 'g', action: 'open-glance', description: 'Open glance in its own window' },
  { key: '?', action: 'show-help', description: 'Show these shortcuts' },
];

/** The parts of a keyboard event the keymap needs, so it can be tested without a DOM. */
export interface KeyInput {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  /** Upper-case tag name of the focused element. */
  targetTag: string;
  targetEditable: boolean;
}

const TYPING_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

/**
 * The action for a key press, or null. Quiet while typing in a field and while
 * Alt, Ctrl or Cmd is held, so browser and system shortcuts keep working.
 * Shift is allowed because `?` needs it on most layouts.
 */
export function shortcutFor(input: KeyInput): ShortcutAction | null {
  if (input.altKey || input.ctrlKey || input.metaKey) return null;
  if (input.targetEditable || TYPING_TAGS.has(input.targetTag)) return null;
  return SHORTCUTS.find((s) => s.key === input.key)?.action ?? null;
}
