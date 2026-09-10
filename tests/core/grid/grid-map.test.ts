import { fromGridPositionKey, getAdjacentPosition, GridMap, toGridPositionKey } from '@/core/grid';
import { describe, expect, it } from 'vitest';

describe('GridMap', () => {
  it('initializes from path cells and removes duplicate internal paths', () => {
    const gridMap = new GridMap({ rows: 3, cols: 3 }, [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]);

    expect(gridMap.getPathCount()).toBe(2);
    expect(gridMap.hasPath({ x: 1, y: 1 })).toBe(true);
    expect(gridMap.getPathCells()).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]);
  });

  it('adds and removes a path only when occupancy changes', () => {
    const gridMap = new GridMap({ rows: 2, cols: 2 });
    const position = { x: 0, y: 1 };

    expect(gridMap.addPath(position)).toBe(true);
    expect(gridMap.addPath(position)).toBe(false);
    expect(gridMap.removePath(position)).toBe(true);
    expect(gridMap.removePath(position)).toBe(false);
    expect(gridMap.getPathCount()).toBe(0);
  });

  it('checks grid bounds without changing path occupancy', () => {
    const gridMap = new GridMap({ rows: 2, cols: 3 }, [{ x: 3, y: 0 }]);

    expect(gridMap.isInBounds({ x: 0, y: 0 })).toBe(true);
    expect(gridMap.isInBounds({ x: 2, y: 1 })).toBe(true);
    expect(gridMap.isInBounds({ x: 3, y: 0 })).toBe(false);
    expect(gridMap.isInBounds({ x: 0, y: 2 })).toBe(false);
    expect(gridMap.isInBounds({ x: -1, y: 0 })).toBe(false);
    expect(gridMap.hasPath({ x: 3, y: 0 })).toBe(true);
    expect(gridMap.getPathCount()).toBe(1);
  });

  it('returns adjacent path neighbors in the Direction order', () => {
    const gridMap = new GridMap({ rows: 3, cols: 3 }, [
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ]);

    expect(gridMap.getPathNeighbors({ x: 1, y: 1 })).toEqual([
      { direction: 'up', position: { x: 1, y: 0 } },
      { direction: 'down', position: { x: 1, y: 2 } },
      { direction: 'left', position: { x: 0, y: 1 } },
      { direction: 'right', position: { x: 2, y: 1 } },
    ]);
  });

  it('converts grid positions to stable keys and back', () => {
    const position = { x: -5, y: 8 };

    expect(toGridPositionKey(position)).toBe('-5,8');
    expect(fromGridPositionKey('-5,8')).toEqual(position);
  });

  it('calculates the adjacent position for every direction', () => {
    const position = { x: 5, y: 8 };

    expect(getAdjacentPosition(position, 'up')).toEqual({ x: 5, y: 7 });
    expect(getAdjacentPosition(position, 'down')).toEqual({ x: 5, y: 9 });
    expect(getAdjacentPosition(position, 'left')).toEqual({ x: 4, y: 8 });
    expect(getAdjacentPosition(position, 'right')).toEqual({ x: 6, y: 8 });
  });
});
