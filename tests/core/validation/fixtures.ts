import { DEFAULT_SPAWN_MOVE_SECONDS_PER_CELL, LEVEL_CONFIG_VERSION } from '@/core/model';
import type { LevelConfig, SpawnPoint } from '@/core/model';

type TestSpawnPointInput = Omit<SpawnPoint, 'moveSecondsPerCell'> &
  Partial<Pick<SpawnPoint, 'moveSecondsPerCell'>>;
type TestLevelOverrides = Omit<Partial<LevelConfig>, 'spawnPoints'> & {
  spawnPoints?: TestSpawnPointInput[];
};

export function createLevel(overrides: TestLevelOverrides = {}): LevelConfig {
  const { spawnPoints = [], ...levelOverrides } = overrides;
  return {
    version: LEVEL_CONFIG_VERSION,
    level: { chapter: 1, stage: 1 },
    grid: { rows: 5, cols: 5 },
    pathCells: [],
    spawnPoints: spawnPoints.map((spawnPoint) => ({
      ...spawnPoint,
      moveSecondsPerCell: spawnPoint.moveSecondsPerCell ?? DEFAULT_SPAWN_MOVE_SECONDS_PER_CELL,
    })),
    endPoints: [],
    junctions: [],
    towerNodes: [],
    ...levelOverrides,
  };
}
