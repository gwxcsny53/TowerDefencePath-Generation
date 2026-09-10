import { getAdjacentPosition, getOppositeDirection, toGridPositionKey } from '@/core/grid';
import type { Direction, GridPosition } from '@/core/model';

export interface RouteState {
  readonly position: Readonly<GridPosition>;
  readonly enterFrom: Direction;
}

/** Creates the state after leaving `position` in `direction` and entering its adjacent cell. */
export function createNextRouteState(position: GridPosition, direction: Direction): RouteState {
  return {
    position: getAdjacentPosition(position, direction),
    enterFrom: getOppositeDirection(direction),
  };
}

/** Returns a stable key for route traversal and cycle detection. */
export function toRouteStateKey(state: RouteState): string {
  return `${toGridPositionKey(state.position)}|${state.enterFrom}`;
}
