import type { GridPosition } from './GridPosition';

/** An enemy route ending node. */
export interface EndPoint extends GridPosition {
  id: string;
}
