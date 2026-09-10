import type { Direction, GridPosition } from '@/core/model';

const DIRECTION_OFFSETS: Record<Direction, GridPosition> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/** Returns the grid cell immediately adjacent to `position` in `direction`. */
export function getAdjacentPosition(position: GridPosition, direction: Direction): GridPosition {
  const offset = DIRECTION_OFFSETS[direction];

  return {
    x: position.x + offset.x,
    y: position.y + offset.y,
  };
}
