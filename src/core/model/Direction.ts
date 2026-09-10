/**
 * Cardinal directions relative to a grid cell: up `(x, y - 1)`, down `(x, y + 1)`,
 * left `(x - 1, y)`, and right `(x + 1, y)`.
 */
export const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

export type Direction = (typeof DIRECTIONS)[number];
