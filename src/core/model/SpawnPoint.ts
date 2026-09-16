import type { GridPosition } from './GridPosition';

export const DEFAULT_SPAWN_MOVE_SECONDS_PER_CELL = 0.3;

/** An enemy route starting node. */
export interface SpawnPoint extends GridPosition {
  id: string;

  /** Time in seconds required to move across one grid segment. */
  moveSecondsPerCell: number;
}
