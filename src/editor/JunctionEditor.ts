import { GraphBuilder } from '@/core/graph';
import { GridMap } from '@/core/grid';
import { DIRECTIONS } from '@/core/model';
import type { Direction, GridPosition, LevelConfig } from '@/core/model';

import { createNextEntityId } from './LevelEditor';

export interface JunctionEditorExit {
  readonly exitTo: Direction;
  readonly weight: number;
}
export interface JunctionEditorTransition {
  readonly enterFrom: Direction;
  readonly exits: readonly JunctionEditorExit[];
}
export interface JunctionEditorState {
  readonly position: Readonly<GridPosition>;
  readonly isCandidate: boolean;
  readonly physicalDirections: readonly Direction[];
  readonly junctionId: string | null;
  readonly transitions: readonly JunctionEditorTransition[];
}

export function getJunctionEditorState(
  level: LevelConfig,
  position: GridPosition,
): JunctionEditorState {
  const graph = createJunctionGraph(level);
  const node = graph.getNode(position);
  const junction = level.junctions.find((item) => item.x === position.x && item.y === position.y);
  const physicalDirections = DIRECTIONS.filter((direction) =>
    node?.neighbors.some((neighbor) => neighbor.direction === direction),
  );
  return {
    position: { x: position.x, y: position.y },
    isCandidate: node?.kind === 'junction',
    physicalDirections,
    junctionId: junction?.id ?? null,
    transitions:
      junction?.transitions.map((transition) => ({
        enterFrom: transition.enterFrom,
        exits: transition.exits.map((exit) => ({ ...exit })),
      })) ?? [],
  };
}
export function createJunctionConfig(level: LevelConfig, position: GridPosition): LevelConfig {
  const state = getJunctionEditorState(level, position);
  if (!state.isCandidate || state.junctionId !== null) return level;
  return {
    ...level,
    junctions: [
      ...level.junctions,
      {
        id: createNextEntityId(
          'junction',
          level.junctions.map((junction) => junction.id),
        ),
        x: position.x,
        y: position.y,
        transitions: [],
      },
    ],
  };
}
export function removeJunctionConfig(level: LevelConfig, position: GridPosition): LevelConfig {
  const junctions = level.junctions.filter(
    (item) => item.x !== position.x || item.y !== position.y,
  );
  return junctions.length === level.junctions.length ? level : { ...level, junctions };
}
export function setJunctionEntryEnabled(
  level: LevelConfig,
  position: GridPosition,
  enterFrom: Direction,
  enabled: boolean,
): LevelConfig {
  const junction = level.junctions.find((item) => item.x === position.x && item.y === position.y);
  if (junction === undefined) return level;
  const exists = junction.transitions.some((item) => item.enterFrom === enterFrom);
  if (!enabled)
    return exists
      ? updateJunction(level, position, {
          ...junction,
          transitions: junction.transitions.filter((item) => item.enterFrom !== enterFrom),
        })
      : level;
  if (exists || !getJunctionEditorState(level, position).physicalDirections.includes(enterFrom))
    return level;
  return updateJunction(level, position, {
    ...junction,
    transitions: [...junction.transitions, { enterFrom, exits: [] }],
  });
}
export function setJunctionExitEnabled(
  level: LevelConfig,
  position: GridPosition,
  enterFrom: Direction,
  exitTo: Direction,
  enabled: boolean,
): LevelConfig {
  const junction = level.junctions.find((item) => item.x === position.x && item.y === position.y);
  const transition = junction?.transitions.find((item) => item.enterFrom === enterFrom);
  if (junction === undefined || transition === undefined) return level;
  const exists = transition.exits.some((item) => item.exitTo === exitTo);
  if (!enabled)
    return exists
      ? replaceTransition(level, position, enterFrom, {
          ...transition,
          exits: redistribute(transition.exits.filter((item) => item.exitTo !== exitTo)),
        })
      : level;
  const physical = getJunctionEditorState(level, position).physicalDirections;
  if (exists || exitTo === enterFrom || !physical.includes(exitTo)) return level;
  return replaceTransition(level, position, enterFrom, {
    ...transition,
    exits: redistribute([...transition.exits, { exitTo, weight: 1 }]),
  });
}
export function setJunctionExitWeight(
  level: LevelConfig,
  position: GridPosition,
  enterFrom: Direction,
  exitTo: Direction,
  weight: number,
): LevelConfig {
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1) return level;
  const junction = level.junctions.find((item) => item.x === position.x && item.y === position.y);
  const transition = junction?.transitions.find((item) => item.enterFrom === enterFrom);
  if (transition === undefined) return level;
  if (!transition.exits.some((item) => item.exitTo === exitTo)) return level;
  return replaceTransition(level, position, enterFrom, {
    ...transition,
    exits: transition.exits.map((item) => (item.exitTo === exitTo ? { ...item, weight } : item)),
  });
}
export function isJunctionSelectable(level: LevelConfig, position: GridPosition): boolean {
  const state = getJunctionEditorState(level, position);
  return state.isCandidate || state.junctionId !== null;
}
function createJunctionGraph(level: LevelConfig) {
  const raw = new GridMap(level.grid, level.pathCells);
  return GraphBuilder.build(
    new GridMap(
      level.grid,
      level.pathCells.filter((item) => raw.isInBounds(item)),
    ),
  );
}
function redistribute(exits: readonly JunctionEditorExit[]) {
  return exits.map((exit) => ({ ...exit, weight: exits.length === 0 ? 0 : 1 / exits.length }));
}
function replaceTransition(
  level: LevelConfig,
  position: GridPosition,
  enterFrom: Direction,
  transition: JunctionEditorTransition,
): LevelConfig {
  const junction = level.junctions.find((item) => item.x === position.x && item.y === position.y)!;
  return updateJunction(level, position, {
    ...junction,
    transitions: junction.transitions.map((item) =>
      item.enterFrom === enterFrom
        ? { enterFrom: transition.enterFrom, exits: [...transition.exits] }
        : item,
    ),
  });
}
function updateJunction(
  level: LevelConfig,
  position: GridPosition,
  next: LevelConfig['junctions'][number],
): LevelConfig {
  return {
    ...level,
    junctions: level.junctions.map((item) =>
      item.x === position.x && item.y === position.y ? next : item,
    ),
  };
}
