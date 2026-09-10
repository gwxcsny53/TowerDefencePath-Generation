import { DIRECTIONS, LEVEL_CONFIG_VERSION } from '@/core/model';
import type { LevelConfig } from '@/core/model';
import { describe, expect, it } from 'vitest';

const levelConfig: LevelConfig = {
  version: LEVEL_CONFIG_VERSION,
  level: {
    chapter: 1,
    stage: 3,
  },
  grid: {
    rows: 20,
    cols: 20,
  },
  pathCells: [
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ],
  spawnPoints: [{ id: 'spawn_01', x: 2, y: 0 }],
  endPoints: [{ id: 'end_01', x: 3, y: 1 }],
  junctions: [
    {
      id: 'junction_01',
      x: 2,
      y: 1,
      transitions: [
        {
          enterFrom: 'left',
          exits: [
            { exitTo: 'right', weight: 0.8 },
            { exitTo: 'down', weight: 0.2 },
          ],
        },
      ],
    },
  ],
  towerNodes: [{ id: 'tower_01', x: 5, y: 5, locked: true }],
};

describe('LevelConfig model', () => {
  it('constructs a complete V1 configuration', () => {
    expect(levelConfig.version).toBe(1);
    expect(levelConfig.level).toEqual({ chapter: 1, stage: 3 });
    expect(levelConfig.grid).toEqual({ rows: 20, cols: 20 });
    expect(levelConfig.pathCells).toHaveLength(3);
    expect(levelConfig.spawnPoints).toEqual([{ id: 'spawn_01', x: 2, y: 0 }]);
    expect(levelConfig.endPoints).toEqual([{ id: 'end_01', x: 3, y: 1 }]);
    expect(levelConfig.towerNodes).toEqual([{ id: 'tower_01', x: 5, y: 5, locked: true }]);
  });

  it('exports the V1 version, directions, and junction transition structure', () => {
    expect(LEVEL_CONFIG_VERSION).toBe(1);
    expect(DIRECTIONS).toEqual(['up', 'down', 'left', 'right']);
    expect(levelConfig.junctions[0]?.transitions).toEqual([
      {
        enterFrom: 'left',
        exits: [
          { exitTo: 'right', weight: 0.8 },
          { exitTo: 'down', weight: 0.2 },
        ],
      },
    ]);
  });
});
