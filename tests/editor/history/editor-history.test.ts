import { describe, expect, it } from 'vitest';
import {
  canRedoEditorHistory,
  canUndoEditorHistory,
  clearEditorHistory,
  createEditorHistory,
  createEditorSnapshot,
  DEFAULT_HISTORY_LIMIT,
  recordEditorCommand,
  redoEditorHistory,
  undoEditorHistory,
} from '@/editor';
import { createLevel } from '../../core/validation/fixtures';

const before = createEditorSnapshot(createLevel(), null);
const after = createEditorSnapshot(createLevel({ pathCells: [{ x: 1, y: 1 }] }), {
  kind: 'path',
  position: { x: 1, y: 1 },
});
const command = { label: '绘制路线', before, after };

describe('editor history', () => {
  it('starts empty, records commands, and restores snapshots through undo and redo', () => {
    const initial = createEditorHistory();
    expect(canUndoEditorHistory(initial)).toBe(false);
    expect(canRedoEditorHistory(initial)).toBe(false);

    const recorded = recordEditorCommand(initial, command);
    expect(canUndoEditorHistory(recorded)).toBe(true);
    expect(canRedoEditorHistory(recorded)).toBe(false);

    const undone = undoEditorHistory(recorded);
    expect(undone.snapshot).toBe(before);
    expect(undone.history.undoStack).toHaveLength(0);
    expect(undone.history.redoStack).toEqual([command]);

    const redone = redoEditorHistory(undone.history);
    expect(redone.snapshot).toBe(after);
    expect(redone.history.undoStack).toEqual([command]);
    expect(redone.history.redoStack).toHaveLength(0);
  });

  it('clears redo only for a new recorded command and retains the newest history limit commands', () => {
    const first = recordEditorCommand(createEditorHistory(), command);
    const undone = undoEditorHistory(first).history;
    expect(undoEditorHistory(undone).history).toBe(undone);
    expect(recordEditorCommand(undone, { ...command, label: '放置塔位' }).redoStack).toEqual([]);

    let history = createEditorHistory();
    for (let index = 0; index <= DEFAULT_HISTORY_LIMIT; index += 1) {
      history = recordEditorCommand(history, { ...command, label: `命令 ${index}` });
    }
    expect(history.undoStack).toHaveLength(DEFAULT_HISTORY_LIMIT);
    expect(history.undoStack[0]?.label).toBe('命令 1');
    expect(clearEditorHistory()).toEqual(createEditorHistory());
  });
});
