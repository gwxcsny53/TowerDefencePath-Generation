/**
 * A grid coordinate whose origin is the top-left cell `(0, 0)`.
 * `x` increases to the right and `y` increases downward. It does not represent canvas pixels,
 * world coordinates, or Cocos coordinates.
 */
export interface GridPosition {
  x: number;
  y: number;
}
