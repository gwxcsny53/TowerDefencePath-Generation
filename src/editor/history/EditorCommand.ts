import type { LevelConfig } from '@/core/model';

import type { EditorSelection } from '../EditorSelection';

export interface EditorSnapshot {
  readonly level: LevelConfig;
  readonly selection: EditorSelection | null;
}

export interface EditorCommand {
  readonly label: string;
  readonly before: EditorSnapshot;
  readonly after: EditorSnapshot;
}

export function createEditorSnapshot(
  level: LevelConfig,
  selection: EditorSelection | null,
): EditorSnapshot {
  return { level, selection: cloneEditorSelection(selection) };
}

export function cloneEditorSelection(selection: EditorSelection | null): EditorSelection | null {
  return selection === null ? null : { ...selection, position: { ...selection.position } };
}
