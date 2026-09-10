import type { GridPosition } from './GridPosition';

/** A tower placement node. `locked` controls whether it starts unavailable. */
export interface TowerNode extends GridPosition {
  id: string;
  locked: boolean;
}
