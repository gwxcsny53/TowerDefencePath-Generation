import type { GridPosition, LevelConfig } from '@/core/model';

export interface GridResizeTarget {
  readonly rows: number;
  readonly cols: number;
}

export interface LevelResizeImpact {
  readonly from: GridResizeTarget;
  readonly to: GridResizeTarget;
  readonly removedPathCellCount: number;
  readonly removedSpawnCount: number;
  readonly removedEndCount: number;
  readonly removedTowerCount: number;
  readonly removedJunctionCount: number;
  readonly hasDataLoss: boolean;
}

export function analyzeLevelResize(
  level: LevelConfig,
  target: GridResizeTarget,
): LevelResizeImpact {
  const isInBounds = (position: GridPosition): boolean => isPositionInTarget(position, target);
  const removedPathCellCount = countOutOfBounds(level.pathCells, isInBounds);
  const removedSpawnCount = countOutOfBounds(level.spawnPoints, isInBounds);
  const removedEndCount = countOutOfBounds(level.endPoints, isInBounds);
  const removedTowerCount = countOutOfBounds(level.towerNodes, isInBounds);
  const removedJunctionCount = countOutOfBounds(level.junctions, isInBounds);
  const hasDataLoss =
    removedPathCellCount +
      removedSpawnCount +
      removedEndCount +
      removedTowerCount +
      removedJunctionCount >
    0;

  return {
    from: { rows: level.grid.rows, cols: level.grid.cols },
    to: { ...target },
    removedPathCellCount,
    removedSpawnCount,
    removedEndCount,
    removedTowerCount,
    removedJunctionCount,
    hasDataLoss,
  };
}

export function resizeLevelGrid(level: LevelConfig, target: GridResizeTarget): LevelConfig {
  if (!isValidGridResizeTarget(target)) return level;
  if (level.grid.rows === target.rows && level.grid.cols === target.cols) return level;
  const isInBounds = (position: GridPosition): boolean => isPositionInTarget(position, target);

  return {
    ...level,
    grid: { rows: target.rows, cols: target.cols },
    pathCells: level.pathCells.filter(isInBounds),
    spawnPoints: level.spawnPoints.filter(isInBounds),
    endPoints: level.endPoints.filter(isInBounds),
    towerNodes: level.towerNodes.filter(isInBounds),
    junctions: level.junctions.filter(isInBounds),
  };
}

export function isValidGridResizeTarget(target: GridResizeTarget): boolean {
  return [target.rows, target.cols].every(
    (value) => Number.isFinite(value) && Number.isInteger(value) && value > 0,
  );
}

function isPositionInTarget(position: GridPosition, target: GridResizeTarget): boolean {
  return position.x >= 0 && position.x < target.cols && position.y >= 0 && position.y < target.rows;
}

function countOutOfBounds(
  positions: readonly GridPosition[],
  isInBounds: (position: GridPosition) => boolean,
): number {
  return positions.filter((position) => !isInBounds(position)).length;
}
