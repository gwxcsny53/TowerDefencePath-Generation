import type { GridPosition } from './GridPosition';

/** An enemy route starting node. */
export interface SpawnPoint extends GridPosition {
  id: string;
}
