import { RouteSimulator } from '@/core/simulation';
import type { Junction, LevelConfig } from '@/core/model';
import { describe, expect, it } from 'vitest';

function createLevel(overrides: Partial<LevelConfig> = {}): LevelConfig {
  return {
    version: 1,
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

function createFork(endPoints: LevelConfig['endPoints']): LevelConfig {
  // E
  // S-J-E
  return createLevel({
    grid: { rows: 2, cols: 3 },
    pathCells: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    spawnPoints: [{ id: 'spawn', x: 0, y: 1 }],
    endPoints,
    junctions: [
      {
        id: 'junction',
        x: 1,
        y: 1,
        transitions: [
          {
            enterFrom: 'left',
            exits: [
              { exitTo: 'up', weight: 0.8 },
              { exitTo: 'right', weight: 0.2 },
            ],
          },
        ],
      },
    ],
  });
}

function createDiamond(junctions: Junction[]): LevelConfig {
  //  .---.
  // S-J   J-E
  //  .---.
  return createLevel({
    grid: { rows: 3, cols: 5 },
    pathCells: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ],
    spawnPoints: [{ id: 'spawn', x: 0, y: 1 }],
    endPoints: [{ id: 'end', x: 4, y: 1 }],
    junctions,
  });
}

describe('RouteSimulator', () => {
  it('simulates complete straight and corner paths', () => {
    const straight = createLevel({
      grid: { rows: 1, cols: 4 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn', x: 0, y: 0 }],
      endPoints: [{ id: 'end', x: 3, y: 0 }],
    });
    const corner = createLevel({
      grid: { rows: 2, cols: 2 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ],
      spawnPoints: [{ id: 'spawn', x: 0, y: 0 }],
      endPoints: [{ id: 'end', x: 1, y: 1 }],
    });

    expect(RouteSimulator.simulate(straight, 'spawn')).toMatchObject({
      status: 'reached-end',
      endId: 'end',
      path: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
    });
    expect(RouteSimulator.simulate(corner, 'spawn')).toMatchObject({
      status: 'reached-end',
      path: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ],
    });
  });

  it('selects weighted fork exits with an injected random source', () => {
    const level = createFork([
      { id: 'upper-end', x: 1, y: 0 },
      { id: 'right-end', x: 2, y: 1 },
    ]);

    expect(RouteSimulator.simulate(level, 'spawn', { random: () => 0.1 })).toMatchObject({
      status: 'reached-end',
      endId: 'upper-end',
      finalPosition: { x: 1, y: 0 },
    });
    expect(RouteSimulator.simulate(level, 'spawn', { random: () => 0.9 })).toMatchObject({
      status: 'reached-end',
      endId: 'right-end',
      finalPosition: { x: 2, y: 1 },
    });
  });

  it('uses cumulative weight boundaries consistently', () => {
    const level = createFork([
      { id: 'upper-end', x: 1, y: 0 },
      { id: 'right-end', x: 2, y: 1 },
    ]);

    expect(RouteSimulator.simulate(level, 'spawn', { random: () => 0.799 }).endId).toBe(
      'upper-end',
    );
    expect(RouteSimulator.simulate(level, 'spawn', { random: () => 0.8 }).endId).toBe('right-end');
  });

  it('selects the requested SpawnPoint in a multi-Spawn level', () => {
    const level = createLevel({
      grid: { rows: 3, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
      spawnPoints: [
        { id: 'spawn-a', x: 0, y: 0 },
        { id: 'spawn-b', x: 0, y: 2 },
      ],
      endPoints: [
        { id: 'end-a', x: 2, y: 0 },
        { id: 'end-b', x: 2, y: 2 },
      ],
    });

    expect(RouteSimulator.simulate(level, 'spawn-b')).toMatchObject({
      spawnId: 'spawn-b',
      status: 'reached-end',
      endId: 'end-b',
      path: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
    });
  });

  it('returns invalid-spawn for missing Spawn IDs and non-endpoint Spawns', () => {
    const level = createLevel({
      grid: { rows: 1, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'middle', x: 1, y: 0 }],
    });

    expect(RouteSimulator.simulate(level, 'missing')).toMatchObject({
      status: 'invalid-spawn',
      path: [],
    });
    expect(RouteSimulator.simulate(level, 'middle')).toMatchObject({
      status: 'invalid-spawn',
      path: [{ x: 1, y: 0 }],
    });
  });

  it('ends at a non-End endpoint as a dead end', () => {
    const level = createFork([{ id: 'right-end', x: 2, y: 1 }]);

    expect(RouteSimulator.simulate(level, 'spawn', { random: () => 0.1 })).toMatchObject({
      status: 'dead-end',
      finalPosition: { x: 1, y: 0 },
    });
  });

  it('returns junction-not-configured for a reachable missing entry transition', () => {
    const level = createFork([{ id: 'right-end', x: 2, y: 1 }]);
    level.junctions[0].transitions = [{ enterFrom: 'right', exits: [{ exitTo: 'up', weight: 1 }] }];

    expect(RouteSimulator.simulate(level, 'spawn')).toMatchObject({
      status: 'junction-not-configured',
      finalPosition: { x: 1, y: 1 },
    });
  });

  it('stops safely when a directed route cycle repeats a state', () => {
    const level = createDiamond([
      {
        id: 'left-junction',
        x: 1,
        y: 1,
        transitions: [
          { enterFrom: 'left', exits: [{ exitTo: 'up', weight: 1 }] },
          { enterFrom: 'down', exits: [{ exitTo: 'up', weight: 1 }] },
        ],
      },
      {
        id: 'right-junction',
        x: 3,
        y: 1,
        transitions: [{ enterFrom: 'up', exits: [{ exitTo: 'down', weight: 1 }] }],
      },
    ]);

    expect(RouteSimulator.simulate(level, 'spawn')).toMatchObject({
      status: 'cycle',
      finalPosition: { x: 1, y: 0 },
    });
  });

  it('returns step-limit when the configured safety limit is exhausted', () => {
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

    expect(RouteSimulator.simulate(level, 'spawn', { maxSteps: 1 })).toMatchObject({
      status: 'step-limit',
      path: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    });
  });

  it('does not mutate the LevelConfig during simulation', () => {
    const level = createFork([
      { id: 'upper-end', x: 1, y: 0 },
      { id: 'right-end', x: 2, y: 1 },
    ]);
    const before = structuredClone(level);

    RouteSimulator.simulate(level, 'spawn', { random: () => 0.1 });

    expect(level).toEqual(before);
  });
});
