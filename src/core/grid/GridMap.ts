import { DIRECTIONS } from '@/core/model';
import type { Direction, GridPosition, GridSize } from '@/core/model';

import { getAdjacentPosition } from './GridDirection';
import { fromGridPositionKey, toGridPositionKey } from './GridPositionKey';

export interface PathNeighbor {
  direction: Direction;
  position: GridPosition;
}

/** Stores path occupancy for a level grid without applying validation rules. */
export class GridMap {
  private readonly pathKeys = new Set<string>();

  constructor(
    readonly grid: GridSize,
    pathCells: readonly GridPosition[] = [],
  ) {
    for (const pathCell of pathCells) {
      this.pathKeys.add(toGridPositionKey(pathCell));
    }
  }

  isInBounds(position: GridPosition): boolean {
    return (
      position.x >= 0 &&
      position.x < this.grid.cols &&
      position.y >= 0 &&
      position.y < this.grid.rows
    );
  }

  hasPath(position: GridPosition): boolean {
    return this.pathKeys.has(toGridPositionKey(position));
  }

  addPath(position: GridPosition): boolean {
    const key = toGridPositionKey(position);

    if (this.pathKeys.has(key)) {
      return false;
    }

    this.pathKeys.add(key);
    return true;
  }

  removePath(position: GridPosition): boolean {
    return this.pathKeys.delete(toGridPositionKey(position));
  }

  getPathCells(): GridPosition[] {
    return Array.from(this.pathKeys, fromGridPositionKey);
  }

  getPathCount(): number {
    return this.pathKeys.size;
  }

  getPathNeighbors(position: GridPosition): PathNeighbor[] {
    const neighbors: PathNeighbor[] = [];

    for (const direction of DIRECTIONS) {
      const adjacentPosition = getAdjacentPosition(position, direction);

      if (this.hasPath(adjacentPosition)) {
        neighbors.push({ direction, position: adjacentPosition });
      }
    }

    return neighbors;
  }
}
