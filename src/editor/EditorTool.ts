export const EDITOR_TOOLS = ['select', 'path', 'spawn', 'end', 'tower', 'eraser'] as const;

export type EditorTool = (typeof EDITOR_TOOLS)[number];

export const EDITOR_TOOL_SHORTCUTS = {
  '1': 'select',
  '2': 'path',
  '3': 'spawn',
  '4': 'end',
  '5': 'tower',
  '6': 'eraser',
} as const satisfies Record<string, EditorTool>;

export function getEditorToolShortcut(key: string): EditorTool | null {
  return EDITOR_TOOL_SHORTCUTS[key as keyof typeof EDITOR_TOOL_SHORTCUTS] ?? null;
}

export function getEditorToolShortcutLabel(tool: EditorTool): string {
  return Object.entries(EDITOR_TOOL_SHORTCUTS).find(([, value]) => value === tool)?.[0] ?? '';
}
