import { GraphBuilder } from '@/core/graph';
import { GridMap, toGridPositionKey } from '@/core/grid';
import { LEVEL_CONFIG_VERSION } from '@/core/model';
import type { GridPosition, LevelConfig } from '@/core/model';

import type { EditorSelection } from './EditorSelection';

export function createEmptyLevelConfig(chapter = 1, stage = 1, rows = 20, cols = 20): LevelConfig {
  return {
    version: LEVEL_CONFIG_VERSION,
    level: { chapter, stage },
    grid: { rows, cols },
    pathCells: [],
    spawnPoints: [],
    endPoints: [],
    junctions: [],
    towerNodes: [],
  };
}

export function addPath(level: LevelConfig, position: GridPosition): LevelConfig {
  return addPathCells(level, [position]);
}

export function addPathCells(level: LevelConfig, positions: readonly GridPosition[]): LevelConfig {
  const gridMap = new GridMap(level.grid, level.pathCells);
  const pathKeys = new Set(level.pathCells.map(toGridPositionKey));
  const towerKeys = new Set(level.towerNodes.map(toGridPositionKey));
  const additions: GridPosition[] = [];

  for (const position of positions) {
    const key = toGridPositionKey(position);
    if (!gridMap.isInBounds(position) || pathKeys.has(key) || towerKeys.has(key)) {
      continue;
    }

    pathKeys.add(key);
    additions.push({ x: position.x, y: position.y });
  }

  return additions.length === 0
    ? level
    : { ...level, pathCells: [...level.pathCells, ...additions] };
}

export function eraseCell(level: LevelConfig, position: GridPosition): LevelConfig {
  const matchesPosition = (item: GridPosition): boolean =>
    item.x === position.x && item.y === position.y;
  const pathCells = level.pathCells.filter((pathCell) => !matchesPosition(pathCell));
  const spawnPoints = level.spawnPoints.filter((spawnPoint) => !matchesPosition(spawnPoint));
  const endPoints = level.endPoints.filter((endPoint) => !matchesPosition(endPoint));
  const towerNodes = level.towerNodes.filter((towerNode) => !matchesPosition(towerNode));

  if (
    pathCells.length === level.pathCells.length &&
    spawnPoints.length === level.spawnPoints.length &&
    endPoints.length === level.endPoints.length &&
    towerNodes.length === level.towerNodes.length
  ) {
    return level;
  }

  return { ...level, pathCells, spawnPoints, endPoints, towerNodes };
}

export function placeSpawn(level: LevelConfig, position: GridPosition): LevelConfig {
  if (!canPlaceEndpointEntity(level, position) || level.spawnPoints.some(isAtPosition(position))) {
    return level;
  }

  return {
    ...level,
    spawnPoints: [
      ...level.spawnPoints,
      {
        id: createNextEntityId(
          'spawn',
          level.spawnPoints.map((spawn) => spawn.id),
        ),
        ...position,
      },
    ],
  };
}

export function placeEnd(level: LevelConfig, position: GridPosition): LevelConfig {
  if (!canPlaceEndpointEntity(level, position) || level.endPoints.some(isAtPosition(position))) {
    return level;
  }

  return {
    ...level,
    endPoints: [
      ...level.endPoints,
      {
        id: createNextEntityId(
          'end',
          level.endPoints.map((end) => end.id),
        ),
        ...position,
      },
    ],
  };
}

export function placeTower(level: LevelConfig, position: GridPosition): LevelConfig {
  const gridMap = new GridMap(level.grid, level.pathCells);
  if (
    !gridMap.isInBounds(position) ||
    gridMap.hasPath(position) ||
    level.towerNodes.some(isAtPosition(position))
  ) {
    return level;
  }

  return {
    ...level,
    towerNodes: [
      ...level.towerNodes,
      {
        id: createNextEntityId(
          'tower',
          level.towerNodes.map((tower) => tower.id),
        ),
        ...position,
        locked: false,
      },
    ],
  };
}

export function setTowerLocked(level: LevelConfig, towerId: string, locked: boolean): LevelConfig {
  const tower = level.towerNodes.find((towerNode) => towerNode.id === towerId);
  if (tower === undefined || tower.locked === locked) {
    return level;
  }

  return {
    ...level,
    towerNodes: level.towerNodes.map((towerNode) =>
      towerNode.id === towerId ? { ...towerNode, locked } : towerNode,
    ),
  };
}

export function selectAt(level: LevelConfig, position: GridPosition): EditorSelection | null {
  const tower = level.towerNodes.find(isAtPosition(position));
  if (tower !== undefined)
    return { kind: 'tower', id: tower.id, position: { x: tower.x, y: tower.y } };
  const spawn = level.spawnPoints.find(isAtPosition(position));
  if (spawn !== undefined)
    return { kind: 'spawn', id: spawn.id, position: { x: spawn.x, y: spawn.y } };
  const end = level.endPoints.find(isAtPosition(position));
  if (end !== undefined) return { kind: 'end', id: end.id, position: { x: end.x, y: end.y } };
  return level.pathCells.some(isAtPosition(position))
    ? { kind: 'path', position: { x: position.x, y: position.y } }
    : null;
}

export function createNextEntityId(prefix: string, existingIds: readonly string[]): string {
  const ids = new Set(existingIds);
  let index = 1;
  while (ids.has(`${prefix}_${String(index).padStart(2, '0')}`)) index += 1;
  return `${prefix}_${String(index).padStart(2, '0')}`;
}

function canPlaceEndpointEntity(level: LevelConfig, position: GridPosition): boolean {
  const rawGridMap = new GridMap(level.grid, level.pathCells);
  if (!rawGridMap.isInBounds(position) || !rawGridMap.hasPath(position)) return false;
  const graph = GraphBuilder.build(
    new GridMap(
      level.grid,
      level.pathCells.filter((pathCell) => rawGridMap.isInBounds(pathCell)),
    ),
  );
  return graph.getNode(position)?.kind === 'endpoint';
}

function isAtPosition(position: GridPosition): (item: GridPosition) => boolean {
  return (item) => item.x === position.x && item.y === position.y;
}
