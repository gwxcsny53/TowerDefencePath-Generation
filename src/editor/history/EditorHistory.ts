import type { EditorCommand, EditorSnapshot } from './EditorCommand';

export const DEFAULT_HISTORY_LIMIT = 100;

export interface EditorHistoryState {
  readonly undoStack: readonly EditorCommand[];
  readonly redoStack: readonly EditorCommand[];
}

export interface EditorHistoryOperation {
  readonly history: EditorHistoryState;
  readonly snapshot: EditorSnapshot | null;
}

export function createEditorHistory(): EditorHistoryState {
  return { undoStack: [], redoStack: [] };
}

export function recordEditorCommand(
  history: EditorHistoryState,
  command: EditorCommand,
  limit = DEFAULT_HISTORY_LIMIT,
): EditorHistoryState {
  const undoStack = [...history.undoStack, command];
  return {
    undoStack: undoStack.slice(Math.max(0, undoStack.length - limit)),
    redoStack: [],
  };
}

export function undoEditorHistory(history: EditorHistoryState): EditorHistoryOperation {
  const command = history.undoStack.at(-1);
  if (command === undefined) return { history, snapshot: null };
  return {
    history: {
      undoStack: history.undoStack.slice(0, -1),
      redoStack: [...history.redoStack, command],
    },
    snapshot: command.before,
  };
}

export function redoEditorHistory(history: EditorHistoryState): EditorHistoryOperation {
  const command = history.redoStack.at(-1);
  if (command === undefined) return { history, snapshot: null };
  return {
    history: {
      undoStack: [...history.undoStack, command],
      redoStack: history.redoStack.slice(0, -1),
    },
    snapshot: command.after,
  };
}

export function clearEditorHistory(): EditorHistoryState {
  return createEditorHistory();
}

export function canUndoEditorHistory(history: EditorHistoryState): boolean {
  return history.undoStack.length > 0;
}

export function canRedoEditorHistory(history: EditorHistoryState): boolean {
  return history.redoStack.length > 0;
}
