import { MapValidator } from '@/core/validation';
import type { ValidationCode } from '@/core/validation';
import type { LevelConfig } from '@/core/model';
import { describe, expect, it } from 'vitest';

import { createLevel } from './fixtures';

function codes(level: LevelConfig): ValidationCode[] {
  return MapValidator.validate(level).map((issue) => issue.code);
}

describe('MapValidator basic validation', () => {
  it('accepts a complete straight Spawn-to-End route', () => {
    const level = createLevel({
      grid: { rows: 1, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn', x: 0, y: 0 }],
      endPoints: [{ id: 'end', x: 2, y: 0 }],
    });

    expect(MapValidator.validate(level)).toEqual([]);
  });

  it('reports each out-of-bounds runtime position without dependent endpoint errors', () => {
    const level = createLevel({
      grid: { rows: 2, cols: 2 },
      pathCells: [{ x: 2, y: 0 }],
      spawnPoints: [{ id: 'spawn', x: -1, y: 0 }],
      endPoints: [{ id: 'end', x: 0, y: 2 }],
      junctions: [{ id: 'junction', x: 2, y: 2, transitions: [] }],
      towerNodes: [{ id: 'tower', x: 0, y: -1, locked: false }],
    });

    expect(codes(level)).toEqual([
      'GRID_OUT_OF_RANGE',
      'GRID_OUT_OF_RANGE',
      'GRID_OUT_OF_RANGE',
      'GRID_OUT_OF_RANGE',
      'GRID_OUT_OF_RANGE',
    ]);
  });

  it('reports isolated paths and invalid Spawn and End endpoint placement', () => {
    const isolated = createLevel({ pathCells: [{ x: 1, y: 1 }] });
    const nonEndpoint = createLevel({
      grid: { rows: 1, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn', x: 1, y: 0 }],
      endPoints: [{ id: 'end', x: 1, y: 0 }],
    });

    expect(codes(isolated)).toContain('PATH_ISOLATED');
    expect(codes(nonEndpoint)).toEqual(
      expect.arrayContaining(['SPAWN_NOT_ENDPOINT', 'END_NOT_ENDPOINT']),
    );
  });

  it('reports a tower that overlaps a path', () => {
    const level = createLevel({
      grid: { rows: 1, cols: 2 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn', x: 0, y: 0 }],
      endPoints: [{ id: 'end', x: 1, y: 0 }],
      towerNodes: [{ id: 'tower', x: 1, y: 0, locked: true }],
    });

    expect(codes(level)).toContain('TOWER_PATH_CONFLICT');
  });

  it('reports components missing a Spawn or an End but permits two complete components', () => {
    const withoutSpawn = createLevel({
      grid: { rows: 3, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
      ],
      spawnPoints: [{ id: 'spawn', x: 0, y: 0 }],
      endPoints: [{ id: 'end', x: 2, y: 0 }],
    });
    const withoutEnd = createLevel({
      grid: { rows: 3, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
      ],
      spawnPoints: [
        { id: 'first-spawn', x: 0, y: 0 },
        { id: 'second-spawn', x: 0, y: 2 },
      ],
      endPoints: [{ id: 'end', x: 2, y: 0 }],
    });
    const twoCompleteComponents = createLevel({
      grid: { rows: 3, cols: 2 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
      ],
      spawnPoints: [
        { id: 'first-spawn', x: 0, y: 0 },
        { id: 'second-spawn', x: 0, y: 2 },
      ],
      endPoints: [
        { id: 'first-end', x: 1, y: 0 },
        { id: 'second-end', x: 1, y: 2 },
      ],
    });

    expect(codes(withoutSpawn)).toContain('PATH_DISCONNECTED_COMPONENT');
    expect(codes(withoutEnd)).toContain('PATH_DISCONNECTED_COMPONENT');
    expect(codes(twoCompleteComponents)).not.toContain('PATH_DISCONNECTED_COMPONENT');
  });

  it('does not mutate the configuration being validated', () => {
    const level = createLevel({
      grid: { rows: 1, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn', x: 0, y: 0 }],
      endPoints: [{ id: 'end', x: 2, y: 0 }],
    });
    const before = structuredClone(level);

    MapValidator.validate(level);

    expect(level).toEqual(before);
  });
});
