export { cloneEditorSelection, createEditorSnapshot } from './EditorCommand';
export type { EditorCommand, EditorSnapshot } from './EditorCommand';
export {
  canRedoEditorHistory,
  canUndoEditorHistory,
  clearEditorHistory,
  createEditorHistory,
  DEFAULT_HISTORY_LIMIT,
  recordEditorCommand,
  redoEditorHistory,
  undoEditorHistory,
} from './EditorHistory';
export type { EditorHistoryOperation, EditorHistoryState } from './EditorHistory';
