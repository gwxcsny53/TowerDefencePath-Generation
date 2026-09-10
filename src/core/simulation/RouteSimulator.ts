import { GraphBuilder } from '@/core/graph';
import { GridMap, toGridPositionKey } from '@/core/grid';
import { createNextRouteState, toRouteStateKey } from '@/core/route';
import type { PathGraphNode } from '@/core/graph';
import type { Direction, GridPosition, Junction, JunctionExit, LevelConfig } from '@/core/model';

import type {
  RouteSimulationOptions,
  RouteSimulationResult,
  RouteSimulationStatus,
} from './SimulationResult';

/** Simulates one weighted route from a selected SpawnPoint without mutating the level. */
export class RouteSimulator {
  static simulate(
    level: LevelConfig,
    spawnId: string,
    options: RouteSimulationOptions = {},
  ): RouteSimulationResult {
    const rawGridMap = new GridMap(level.grid, level.pathCells);
    const analysisGridMap = new GridMap(
      level.grid,
      level.pathCells.filter((position) => rawGridMap.isInBounds(position)),
    );
    const graph = GraphBuilder.build(analysisGridMap);
    const spawn = level.spawnPoints.find((candidate) => candidate.id === spawnId);

    if (!spawn || graph.getNode(spawn)?.kind !== 'endpoint') {
      return RouteSimulator.createResult('invalid-spawn', spawnId, spawn ? [spawn] : []);
    }

    const endPointsByKey = RouteSimulator.getEndPointsByKey(level, rawGridMap);
    const path = [RouteSimulator.copyPosition(spawn)];
    const spawnEnd = endPointsByKey.get(toGridPositionKey(spawn));

    if (spawnEnd) {
      return RouteSimulator.createResult('reached-end', spawnId, path, spawnEnd.id);
    }

    const spawnNode = graph.getNode(spawn);
    const firstNeighbor = spawnNode?.neighbors[0];

    if (!firstNeighbor) {
      return RouteSimulator.createResult('invalid-spawn', spawnId, path);
    }

    const random = options.random ?? Math.random;
    const maxSteps = options.maxSteps ?? Math.max(analysisGridMap.getPathCount() * 8, 100);
    const visitedStates = new Set<string>();
    let state = createNextRouteState(spawn, firstNeighbor.direction);
    let steps = 0;

    while (true) {
      if (steps >= maxSteps) {
        return RouteSimulator.createResult('step-limit', spawnId, path);
      }

      path.push(RouteSimulator.copyPosition(state.position));
      steps += 1;

      const stateKey = toRouteStateKey(state);

      if (visitedStates.has(stateKey)) {
        return RouteSimulator.createResult('cycle', spawnId, path);
      }

      visitedStates.add(stateKey);

      const endPoint = endPointsByKey.get(toGridPositionKey(state.position));

      if (endPoint) {
        return RouteSimulator.createResult('reached-end', spawnId, path, endPoint.id);
      }

      const node = graph.getNode(state.position);

      if (!node || node.kind === 'isolated' || node.kind === 'endpoint') {
        return RouteSimulator.createResult('dead-end', spawnId, path);
      }

      if (node.kind === 'normal') {
        const nextNeighbor = node.neighbors.find(
          (neighbor) => neighbor.direction !== state.enterFrom,
        );

        if (!nextNeighbor) {
          return RouteSimulator.createResult('dead-end', spawnId, path);
        }

        state = createNextRouteState(node.position, nextNeighbor.direction);
        continue;
      }

      const junction = RouteSimulator.getJunctionAt(level, state.position);
      const transition = junction?.transitions.find(
        (candidate) => candidate.enterFrom === state.enterFrom,
      );

      if (!transition) {
        return RouteSimulator.createResult('junction-not-configured', spawnId, path);
      }

      const exits = RouteSimulator.getUsableExits(node, state.enterFrom, transition.exits);

      if (exits.length === 0) {
        return RouteSimulator.createResult('junction-not-configured', spawnId, path);
      }

      const exit = RouteSimulator.selectExit(exits, random());
      state = createNextRouteState(node.position, exit.exitTo);
    }
  }

  private static getEndPointsByKey(
    level: LevelConfig,
    rawGridMap: GridMap,
  ): Map<string, LevelConfig['endPoints'][number]> {
    const endPointsByKey = new Map<string, LevelConfig['endPoints'][number]>();

    for (const endPoint of level.endPoints) {
      const key = toGridPositionKey(endPoint);

      if (rawGridMap.isInBounds(endPoint) && !endPointsByKey.has(key)) {
        endPointsByKey.set(key, endPoint);
      }
    }

    return endPointsByKey;
  }

  private static getJunctionAt(
    level: LevelConfig,
    position: Readonly<GridPosition>,
  ): Junction | undefined {
    const key = toGridPositionKey(position);

    return level.junctions.find((junction) => toGridPositionKey(junction) === key);
  }

  private static getUsableExits(
    node: PathGraphNode,
    enterFrom: Direction,
    exits: readonly JunctionExit[],
  ): JunctionExit[] {
    const physicalDirections = new Set(node.neighbors.map((neighbor) => neighbor.direction));

    return exits.filter(
      (exit) =>
        physicalDirections.has(exit.exitTo) &&
        exit.exitTo !== enterFrom &&
        Number.isFinite(exit.weight) &&
        exit.weight > 0,
    );
  }

  private static selectExit(exits: readonly JunctionExit[], randomValue: number): JunctionExit {
    let cumulativeWeight = 0;

    for (const exit of exits) {
      cumulativeWeight += exit.weight;

      if (randomValue < cumulativeWeight) {
        return exit;
      }
    }

    return exits[exits.length - 1];
  }

  private static createResult(
    status: RouteSimulationStatus,
    spawnId: string,
    path: readonly Readonly<GridPosition>[],
    endId?: string,
  ): RouteSimulationResult {
    const finalPosition = path[path.length - 1];

    return {
      status,
      spawnId,
      path,
      ...(endId !== undefined ? { endId } : {}),
      ...(finalPosition ? { finalPosition } : {}),
    };
  }

  private static copyPosition(position: Readonly<GridPosition>): GridPosition {
    return { x: position.x, y: position.y };
  }
}
