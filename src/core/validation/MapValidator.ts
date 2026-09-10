import { GraphBuilder } from '@/core/graph';
import type { PathGraph, PathGraphNode } from '@/core/graph';
import { getAdjacentPosition, getOppositeDirection, GridMap, toGridPositionKey } from '@/core/grid';
import type { Direction, GridPosition, Junction, JunctionExit, LevelConfig } from '@/core/model';

import type { ValidationCode, ValidationIssue } from './ValidationIssue';

const WEIGHT_EPSILON = 1e-6;

interface RouteState {
  readonly position: Readonly<GridPosition>;
  readonly enterFrom: Direction;
}

interface JunctionRouteConfig {
  readonly exitsByEntry: ReadonlyMap<Direction, readonly JunctionExit[]>;
}

/** Validates a LevelConfig without mutating its serialized runtime data. */
export class MapValidator {
  static validate(level: LevelConfig): readonly ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const rawGridMap = new GridMap(level.grid, level.pathCells);

    MapValidator.validateBounds(level, rawGridMap, issues);

    const analysisGridMap = new GridMap(
      level.grid,
      level.pathCells.filter((position) => rawGridMap.isInBounds(position)),
    );
    const analysisGraph = GraphBuilder.build(analysisGridMap);
    MapValidator.validatePathTopology(analysisGraph, issues);
    const validSpawns = MapValidator.validateEndpoints(
      level.spawnPoints,
      'SPAWN_NOT_ENDPOINT',
      analysisGraph,
      rawGridMap,
      issues,
    );
    const validEnds = MapValidator.validateEndpoints(
      level.endPoints,
      'END_NOT_ENDPOINT',
      analysisGraph,
      rawGridMap,
      issues,
    );
    MapValidator.validateTowers(level, analysisGridMap, rawGridMap, issues);
    const junctionRoutes = MapValidator.validateJunctions(
      level.junctions,
      analysisGraph,
      rawGridMap,
      issues,
    );
    MapValidator.validateComponents(analysisGraph, validSpawns, validEnds, issues);
    MapValidator.validateRoutes(analysisGraph, validSpawns, validEnds, junctionRoutes, issues);

    return issues;
  }

  private static validateBounds(
    level: LevelConfig,
    rawGridMap: GridMap,
    issues: ValidationIssue[],
  ): void {
    const positionedItems: readonly (readonly GridPosition[])[] = [
      level.pathCells,
      level.spawnPoints,
      level.endPoints,
      level.junctions,
      level.towerNodes,
    ];

    for (const items of positionedItems) {
      for (const item of items) {
        if (!rawGridMap.isInBounds(item)) {
          MapValidator.addIssue(issues, 'GRID_OUT_OF_RANGE', item);
        }
      }
    }
  }

  private static validatePathTopology(graph: PathGraph, issues: ValidationIssue[]): void {
    for (const node of graph.getNodes()) {
      if (node.kind === 'isolated') {
        MapValidator.addIssue(issues, 'PATH_ISOLATED', node.position);
      }
    }
  }

  private static validateEndpoints<T extends GridPosition>(
    points: readonly T[],
    code: 'SPAWN_NOT_ENDPOINT' | 'END_NOT_ENDPOINT',
    graph: PathGraph,
    rawGridMap: GridMap,
    issues: ValidationIssue[],
  ): T[] {
    const validPoints: T[] = [];

    for (const point of points) {
      if (!rawGridMap.isInBounds(point)) {
        continue;
      }

      if (graph.getNode(point)?.kind !== 'endpoint') {
        MapValidator.addIssue(issues, code, point);
        continue;
      }

      validPoints.push(point);
    }

    return validPoints;
  }

  private static validateTowers(
    level: LevelConfig,
    analysisGridMap: GridMap,
    rawGridMap: GridMap,
    issues: ValidationIssue[],
  ): void {
    for (const tower of level.towerNodes) {
      if (rawGridMap.isInBounds(tower) && analysisGridMap.hasPath(tower)) {
        MapValidator.addIssue(issues, 'TOWER_PATH_CONFLICT', tower);
      }
    }
  }

  private static validateJunctions(
    junctions: readonly Junction[],
    graph: PathGraph,
    rawGridMap: GridMap,
    issues: ValidationIssue[],
  ): ReadonlyMap<string, JunctionRouteConfig> {
    const junctionsByPosition = new Map<string, Junction[]>();

    for (const junction of junctions) {
      if (!rawGridMap.isInBounds(junction)) {
        continue;
      }

      const key = toGridPositionKey(junction);
      const existing = junctionsByPosition.get(key);

      if (existing) {
        existing.push(junction);
      } else {
        junctionsByPosition.set(key, [junction]);
      }
    }

    for (const node of graph.getNodes()) {
      if (node.kind === 'junction' && !junctionsByPosition.has(toGridPositionKey(node.position))) {
        MapValidator.addIssue(issues, 'JUNCTION_NOT_CONFIGURED', node.position);
      }
    }

    const routeConfigs = new Map<string, JunctionRouteConfig>();

    for (const [key, configs] of junctionsByPosition) {
      if (configs.length > 1) {
        MapValidator.addIssue(issues, 'JUNCTION_DUPLICATE_CONFIG', configs[0]);
      }

      for (const config of configs) {
        const node = graph.getNode(config);

        if (node?.kind !== 'junction') {
          MapValidator.addIssue(issues, 'JUNCTION_POSITION_INVALID', config);
          continue;
        }

        const routeConfig = MapValidator.validateJunctionConfig(config, node, issues);

        if (!routeConfigs.has(key)) {
          routeConfigs.set(key, routeConfig);
        }
      }
    }

    return routeConfigs;
  }

  private static validateJunctionConfig(
    junction: Junction,
    node: PathGraphNode,
    issues: ValidationIssue[],
  ): JunctionRouteConfig {
    const physicalDirections = new Set(node.neighbors.map((neighbor) => neighbor.direction));
    const exitsByEntry = new Map<Direction, readonly JunctionExit[]>();
    const configuredEntries = new Set<Direction>();

    for (const transition of junction.transitions) {
      const entryIsPhysical = physicalDirections.has(transition.enterFrom);
      const entryIsDuplicate = configuredEntries.has(transition.enterFrom);

      if (!entryIsPhysical || entryIsDuplicate) {
        MapValidator.addIssue(issues, 'JUNCTION_DIRECTION_INVALID', junction);
      }

      configuredEntries.add(transition.enterFrom);

      if (transition.exits.length === 0) {
        MapValidator.addIssue(issues, 'JUNCTION_DIRECTION_INVALID', junction);
      }

      const configuredExits = new Set<Direction>();
      const validExits: JunctionExit[] = [];
      let weightSum = 0;

      for (const exit of transition.exits) {
        const exitIsPhysical = physicalDirections.has(exit.exitTo);
        const exitIsDuplicate = configuredExits.has(exit.exitTo);
        const isImmediateReturn = exit.exitTo === transition.enterFrom;
        const hasValidWeight = Number.isFinite(exit.weight) && exit.weight > 0 && exit.weight <= 1;

        if (!exitIsPhysical || exitIsDuplicate || isImmediateReturn) {
          MapValidator.addIssue(issues, 'JUNCTION_DIRECTION_INVALID', junction);
        }

        if (!hasValidWeight) {
          MapValidator.addIssue(issues, 'JUNCTION_WEIGHT_INVALID', junction);
        }

        configuredExits.add(exit.exitTo);
        weightSum += exit.weight;

        if (
          entryIsPhysical &&
          !entryIsDuplicate &&
          exitIsPhysical &&
          !exitIsDuplicate &&
          !isImmediateReturn &&
          hasValidWeight
        ) {
          validExits.push(exit);
        }
      }

      if (!Number.isFinite(weightSum) || Math.abs(weightSum - 1) > WEIGHT_EPSILON) {
        MapValidator.addIssue(issues, 'JUNCTION_WEIGHT_INVALID', junction);
      }

      if (entryIsPhysical && !entryIsDuplicate) {
        exitsByEntry.set(transition.enterFrom, validExits);
      }
    }

    return { exitsByEntry };
  }

  private static validateComponents(
    graph: PathGraph,
    validSpawns: readonly GridPosition[],
    validEnds: readonly GridPosition[],
    issues: ValidationIssue[],
  ): void {
    const spawnKeys = new Set(validSpawns.map(toGridPositionKey));
    const endKeys = new Set(validEnds.map(toGridPositionKey));
    const visited = new Set<string>();
    const componentIssues: GridPosition[] = [];

    for (const startNode of graph.getNodes()) {
      const startKey = toGridPositionKey(startNode.position);

      if (visited.has(startKey)) {
        continue;
      }

      const component = MapValidator.getComponent(graph, startNode, visited);

      if (component.length <= 1) {
        continue;
      }

      const hasSpawn = component.some((node) => spawnKeys.has(toGridPositionKey(node.position)));
      const hasEnd = component.some((node) => endKeys.has(toGridPositionKey(node.position)));

      if (!hasSpawn || !hasEnd) {
        componentIssues.push(MapValidator.getStableComponentPosition(component));
      }
    }

    componentIssues.sort(MapValidator.comparePositions);

    for (const position of componentIssues) {
      MapValidator.addIssue(issues, 'PATH_DISCONNECTED_COMPONENT', position);
    }
  }

  private static getComponent(
    graph: PathGraph,
    startNode: PathGraphNode,
    visited: Set<string>,
  ): PathGraphNode[] {
    const component: PathGraphNode[] = [];
    const pending: PathGraphNode[] = [startNode];
    visited.add(toGridPositionKey(startNode.position));

    while (pending.length > 0) {
      const node = pending.shift();

      if (!node) {
        continue;
      }

      component.push(node);

      for (const neighbor of node.neighbors) {
        const neighborNode = graph.getNode(neighbor.position);
        const neighborKey = toGridPositionKey(neighbor.position);

        if (neighborNode && !visited.has(neighborKey)) {
          visited.add(neighborKey);
          pending.push(neighborNode);
        }
      }
    }

    return component;
  }

  private static getStableComponentPosition(component: readonly PathGraphNode[]): GridPosition {
    return [...component].sort((left, right) =>
      MapValidator.comparePositions(left.position, right.position),
    )[0].position;
  }

  private static comparePositions(
    left: Readonly<GridPosition>,
    right: Readonly<GridPosition>,
  ): number {
    return left.y - right.y || left.x - right.x;
  }

  private static validateRoutes(
    graph: PathGraph,
    validSpawns: readonly GridPosition[],
    validEnds: readonly GridPosition[],
    junctionConfigs: ReadonlyMap<string, JunctionRouteConfig>,
    issues: ValidationIssue[],
  ): void {
    const endKeys = new Set(validEnds.map(toGridPositionKey));
    const routeIssueKeys = new Set<string>();

    for (const spawn of validSpawns) {
      const spawnKey = toGridPositionKey(spawn);

      if (endKeys.has(spawnKey)) {
        continue;
      }

      const spawnNode = graph.getNode(spawn);
      const firstNeighbor = spawnNode?.neighbors[0];

      if (!firstNeighbor) {
        continue;
      }

      const completed = new Map<string, boolean>();
      const visiting = new Set<string>();
      const reachesEnd = MapValidator.exploreRoute(
        {
          position: firstNeighbor.position,
          enterFrom: getOppositeDirection(firstNeighbor.direction),
        },
        graph,
        endKeys,
        junctionConfigs,
        visiting,
        completed,
        routeIssueKeys,
        issues,
      );

      if (!reachesEnd) {
        MapValidator.addRouteIssue(issues, routeIssueKeys, 'SPAWN_CANNOT_REACH_END', spawn);
      }
    }
  }

  private static exploreRoute(
    state: RouteState,
    graph: PathGraph,
    endKeys: ReadonlySet<string>,
    junctionConfigs: ReadonlyMap<string, JunctionRouteConfig>,
    visiting: Set<string>,
    completed: Map<string, boolean>,
    routeIssueKeys: Set<string>,
    issues: ValidationIssue[],
  ): boolean {
    const stateKey = `${toGridPositionKey(state.position)}|${state.enterFrom}`;

    if (visiting.has(stateKey)) {
      MapValidator.addRouteIssue(
        issues,
        routeIssueKeys,
        'ROUTE_CYCLE',
        state.position,
        state.enterFrom,
      );
      return false;
    }

    const cached = completed.get(stateKey);

    if (cached !== undefined) {
      return cached;
    }

    visiting.add(stateKey);
    const positionKey = toGridPositionKey(state.position);
    const node = graph.getNode(state.position);
    let reachesEnd = false;

    if (endKeys.has(positionKey)) {
      reachesEnd = true;
    } else if (node?.kind === 'endpoint') {
      MapValidator.addRouteIssue(issues, routeIssueKeys, 'ROUTE_DEAD_END', state.position);
    } else if (node?.kind === 'normal') {
      const nextNeighbor = node.neighbors.find(
        (neighbor) => neighbor.direction !== state.enterFrom,
      );

      if (nextNeighbor) {
        reachesEnd = MapValidator.exploreRoute(
          {
            position: nextNeighbor.position,
            enterFrom: getOppositeDirection(nextNeighbor.direction),
          },
          graph,
          endKeys,
          junctionConfigs,
          visiting,
          completed,
          routeIssueKeys,
          issues,
        );
      }
    } else if (node?.kind === 'junction') {
      const exits = junctionConfigs.get(positionKey)?.exitsByEntry.get(state.enterFrom);

      if (!exits) {
        MapValidator.addRouteIssue(
          issues,
          routeIssueKeys,
          'JUNCTION_ENTRY_NOT_CONFIGURED',
          state.position,
          state.enterFrom,
        );
      } else {
        for (const exit of exits) {
          const nextPosition = getAdjacentPosition(state.position, exit.exitTo);
          const branchReachesEnd = MapValidator.exploreRoute(
            {
              position: nextPosition,
              enterFrom: getOppositeDirection(exit.exitTo),
            },
            graph,
            endKeys,
            junctionConfigs,
            visiting,
            completed,
            routeIssueKeys,
            issues,
          );

          reachesEnd = reachesEnd || branchReachesEnd;
        }
      }
    }

    visiting.delete(stateKey);
    completed.set(stateKey, reachesEnd);

    return reachesEnd;
  }

  private static addRouteIssue(
    issues: ValidationIssue[],
    issueKeys: Set<string>,
    code: ValidationCode,
    position: Readonly<GridPosition>,
    stateDetail?: Direction,
  ): void {
    const key = `${code}|${toGridPositionKey(position)}|${stateDetail ?? ''}`;

    if (!issueKeys.has(key)) {
      issueKeys.add(key);
      MapValidator.addIssue(issues, code, position);
    }
  }

  private static addIssue(
    issues: ValidationIssue[],
    code: ValidationCode,
    position?: Readonly<GridPosition>,
  ): void {
    issues.push({
      severity: 'error',
      code,
      message: MapValidator.getMessage(code),
      ...(position ? { position: { ...position } } : {}),
    });
  }

  private static getMessage(code: ValidationCode): string {
    return code.toLowerCase().replaceAll('_', ' ');
  }
}
