import { describe, expect, it } from 'vitest';

import { createJunctionConfig, analyzeLevelResize, resizeLevelGrid } from '@/editor';
import { MapValidator } from '@/core/validation';
import { createLevel } from '../../core/validation/fixtures';

function createPopulatedLevel() {
  return createLevel({
    grid: { rows: 4, cols: 4 },
    pathCells: [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 3 },
      { x: 3, y: 3 },
    ],
    spawnPoints: [{ id: 'spawn_01', x: 3, y: 0 }],
    endPoints: [{ id: 'end_01', x: 0, y: 3 }],
    towerNodes: [
      { id: 'tower_01', x: 1, y: 1, locked: false },
      { id: 'tower_02', x: 3, y: 3, locked: true },
    ],
    junctions: [{ id: 'junction_01', x: 3, y: 3, transitions: [] }],
  });
}

describe('level grid resize', () => {
  it.each([
    { rows: 0, cols: 2 },
    { rows: 2, cols: 0 },
    { rows: 1.5, cols: 2 },
    { rows: 2, cols: Infinity },
  ])('returns the original level for invalid target %o', (target) => {
    const level = createPopulatedLevel();
    expect(resizeLevelGrid(level, target)).toBe(level);
  });

  it('returns the original level for the same size and grows without moving or deleting data', () => {
    const level = createPopulatedLevel();

    expect(resizeLevelGrid(level, { rows: 4, cols: 4 })).toBe(level);
    expect(resizeLevelGrid(level, { rows: 6, cols: 7 })).toEqual({
      ...level,
      grid: { rows: 6, cols: 7 },
    });
  });

  it('crops every positioned data type from the right and bottom while preserving level identity', () => {
    const level = createPopulatedLevel();
    const resized = resizeLevelGrid(level, { rows: 3, cols: 3 });

    expect(resized.grid).toEqual({ rows: 3, cols: 3 });
    expect(resized.pathCells).toEqual([{ x: 0, y: 0 }]);
    expect(resized.spawnPoints).toEqual([]);
    expect(resized.endPoints).toEqual([]);
    expect(resized.towerNodes).toEqual([{ id: 'tower_01', x: 1, y: 1, locked: false }]);
    expect(resized.junctions).toEqual([]);
    expect(resized.version).toBe(level.version);
    expect(resized.level).toEqual(level.level);
    expect(level.grid).toEqual({ rows: 4, cols: 4 });
    expect(level.pathCells).toHaveLength(4);
  });

  it('reports only actual data loss', () => {
    const level = createPopulatedLevel();
    const loss = analyzeLevelResize(level, { rows: 3, cols: 3 });
    const emptyCrop = analyzeLevelResize(
      createLevel({ grid: { rows: 4, cols: 4 }, pathCells: [{ x: 0, y: 0 }] }),
      { rows: 3, cols: 3 },
    );

    expect(loss).toMatchObject({
      from: { rows: 4, cols: 4 },
      to: { rows: 3, cols: 3 },
      removedPathCellCount: 3,
      removedSpawnCount: 1,
      removedEndCount: 1,
      removedTowerCount: 1,
      removedJunctionCount: 1,
      hasDataLoss: true,
    });
    expect(emptyCrop.hasDataLoss).toBe(false);
  });

  it('keeps an in-bounds stale junction and its transitions after a neighboring path is cropped', () => {
    const position = { x: 1, y: 1 };
    const level = createJunctionConfig(
      createLevel({
        grid: { rows: 4, cols: 4 },
        pathCells: [position, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }],
      }),
      position,
    );
    const resized = resizeLevelGrid(level, { rows: 4, cols: 2 });

    expect(resized.junctions).toEqual(level.junctions);
    expect(resized.junctions[0]?.transitions).toBe(level.junctions[0]?.transitions);
    expect(MapValidator.validate(resized).map((issue) => issue.code)).toContain(
      'JUNCTION_POSITION_INVALID',
    );
  });
});
