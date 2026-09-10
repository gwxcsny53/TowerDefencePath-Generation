import { LEVEL_CONFIG_VERSION } from '@/core/model';
import type { LevelConfig } from '@/core/model';

export function createLevel(overrides: Partial<LevelConfig> = {}): LevelConfig {
  return {
    version: LEVEL_CONFIG_VERSION,
    level: { chapter: 1, stage: 1 },
    grid: { rows: 5, cols: 5 },
    pathCells: [],
    spawnPoints: [],
    endPoints: [],
    junctions: [],
    towerNodes: [],
    ...overrides,
  };
}
