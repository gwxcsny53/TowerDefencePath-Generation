import type { EndPoint } from './EndPoint';
import type { GridPosition } from './GridPosition';
import type { Junction } from './Junction';
import type { SpawnPoint } from './SpawnPoint';
import type { TowerNode } from './TowerNode';

export const LEVEL_CONFIG_VERSION = 1 as const;

export type LevelConfigVersion = typeof LEVEL_CONFIG_VERSION;

export interface LevelIdentity {
  chapter: number;
  stage: number;
}

export interface GridSize {
  rows: number;
  cols: number;
}

/** The JSON-serializable runtime configuration for one tower defense level. */
export interface LevelConfig {
  version: LevelConfigVersion;
  level: LevelIdentity;
  grid: GridSize;
  pathCells: GridPosition[];
  spawnPoints: SpawnPoint[];
  endPoints: EndPoint[];
  junctions: Junction[];
  towerNodes: TowerNode[];
}
