import type { GridPosition } from '@/core/model';

/** Converts a grid position to the stable key used by Core's internal path collections. */
export function toGridPositionKey(position: GridPosition): string {
  return `${position.x},${position.y}`;
}

/** Restores a grid position from a key created by `toGridPositionKey`. */
export function fromGridPositionKey(key: string): GridPosition {
  const [x, y] = key.split(',');

  return {
    x: Number(x),
    y: Number(y),
  };
}
