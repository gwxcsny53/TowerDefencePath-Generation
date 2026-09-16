import { describe, expect, it } from 'vitest';
import { getEditorToolShortcut } from '@/editor';

describe('editor tool shortcuts', () => {
  it.each([
    ['1', 'select'],
    ['2', 'path'],
    ['3', 'spawn'],
    ['4', 'end'],
    ['5', 'tower'],
    ['6', 'eraser'],
  ] as const)('maps %s to %s', (key, tool) => {
    expect(getEditorToolShortcut(key)).toBe(tool);
  });

  it.each(['0', '7', 'a'])('returns null for %s', (key) => {
    expect(getEditorToolShortcut(key)).toBeNull();
  });
});
