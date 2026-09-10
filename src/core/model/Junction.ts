import type { Direction } from './Direction';
import type { GridPosition } from './GridPosition';

/** A possible direction and its selection weight after entering a junction. */
export interface JunctionExit {
  /** The next grid cell's direction relative to the junction. */
  exitTo: Direction;
  /** The expected relative selection weight among exits for the same `enterFrom` direction. */
  weight: number;
}

/** Route choices for an entry direction at a junction. */
export interface JunctionTransition {
  /**
   * The direction of the grid cell occupied immediately before entering the junction.
   * This is not the enemy's movement direction: entering from a cell to the left uses `'left'`.
   */
  enterFrom: Direction;
  exits: JunctionExit[];
}

/** A path intersection with route choices that depend on the entry direction. */
export interface Junction extends GridPosition {
  id: string;
  transitions: JunctionTransition[];
}
