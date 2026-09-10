export const EDITOR_TOOLS = ['select', 'path', 'spawn', 'end', 'tower', 'eraser'] as const;

export type EditorTool = (typeof EDITOR_TOOLS)[number];
