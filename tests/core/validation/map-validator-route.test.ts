import { MapValidator } from '@/core/validation';
import type { ValidationCode } from '@/core/validation';
import type { Junction, LevelConfig } from '@/core/model';
import { describe, expect, it } from 'vitest';

import { createLevel } from './fixtures';

function codes(level: LevelConfig): ValidationCode[] {
  return MapValidator.validate(level).map((issue) => issue.code);
}

function createFork(junctions: Junction[], endPoints: LevelConfig['endPoints']): LevelConfig {
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
    junctions,
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

describe('MapValidator directed route validation', () => {
  it('accepts straight and corner routes', () => {
    const straight = createLevel({
      grid: { rows: 1, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn', x: 0, y: 0 }],
      endPoints: [{ id: 'end', x: 2, y: 0 }],
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

    expect(MapValidator.validate(straight)).toEqual([]);
    expect(MapValidator.validate(corner)).toEqual([]);
  });

  it('accepts a fork when every positive branch reaches an End', () => {
    const level = createFork(
      [
        {
          id: 'junction',
          x: 1,
          y: 1,
          transitions: [
            {
              enterFrom: 'left',
              exits: [
                { exitTo: 'up', weight: 0.2 },
                { exitTo: 'right', weight: 0.8 },
              ],
            },
          ],
        },
      ],
      [
        { id: 'upper-end', x: 1, y: 0 },
        { id: 'right-end', x: 2, y: 1 },
      ],
    );

    expect(MapValidator.validate(level)).toEqual([]);
  });

  it('reports a dead-end branch while retaining Spawn-to-End reachability', () => {
    const level = createFork(
      [
        {
          id: 'junction',
          x: 1,
          y: 1,
          transitions: [
            {
              enterFrom: 'left',
              exits: [
                { exitTo: 'up', weight: 0.5 },
                { exitTo: 'right', weight: 0.5 },
              ],
            },
          ],
        },
      ],
      [{ id: 'right-end', x: 2, y: 1 }],
    );

    expect(codes(level)).toContain('ROUTE_DEAD_END');
    expect(codes(level)).not.toContain('SPAWN_CANNOT_REACH_END');
  });

  it('reports a Spawn that cannot reach any End', () => {
    const level = createLevel({
      grid: { rows: 1, cols: 2 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn', x: 0, y: 0 }],
    });

    expect(codes(level)).toEqual(
      expect.arrayContaining(['SPAWN_CANNOT_REACH_END', 'ROUTE_DEAD_END']),
    );
  });

  it('reports a reachable Junction entry without a transition', () => {
    const level = createFork(
      [
        {
          id: 'junction',
          x: 1,
          y: 1,
          transitions: [{ enterFrom: 'right', exits: [{ exitTo: 'up', weight: 1 }] }],
        },
      ],
      [{ id: 'end', x: 2, y: 1 }],
    );

    expect(codes(level)).toEqual(
      expect.arrayContaining(['JUNCTION_ENTRY_NOT_CONFIGURED', 'SPAWN_CANNOT_REACH_END']),
    );
  });

  it('does not treat a physical loop with forward transitions as a route cycle', () => {
    const level = createDiamond([
      {
        id: 'left-junction',
        x: 1,
        y: 1,
        transitions: [
          {
            enterFrom: 'left',
            exits: [
              { exitTo: 'up', weight: 0.5 },
              { exitTo: 'down', weight: 0.5 },
            ],
          },
        ],
      },
      {
        id: 'right-junction',
        x: 3,
        y: 1,
        transitions: [
          { enterFrom: 'up', exits: [{ exitTo: 'right', weight: 1 }] },
          { enterFrom: 'down', exits: [{ exitTo: 'right', weight: 1 }] },
        ],
      },
    ]);

    expect(MapValidator.validate(level)).toEqual([]);
  });

  it('reports a reachable directed route cycle', () => {
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

    expect(codes(level)).toEqual(expect.arrayContaining(['ROUTE_CYCLE', 'SPAWN_CANNOT_REACH_END']));
  });

  it('reports a positive-probability cycle even when another branch reaches an End', () => {
    const level = createDiamond([
      {
        id: 'left-junction',
        x: 1,
        y: 1,
        transitions: [
          {
            enterFrom: 'left',
            exits: [
              { exitTo: 'up', weight: 0.99 },
              { exitTo: 'down', weight: 0.01 },
            ],
          },
          { enterFrom: 'up', exits: [{ exitTo: 'down', weight: 1 }] },
        ],
      },
      {
        id: 'right-junction',
        x: 3,
        y: 1,
        transitions: [
          { enterFrom: 'up', exits: [{ exitTo: 'right', weight: 1 }] },
          { enterFrom: 'down', exits: [{ exitTo: 'up', weight: 1 }] },
        ],
      },
    ]);

    expect(codes(level)).toContain('ROUTE_CYCLE');
    expect(codes(level)).not.toContain('SPAWN_CANNOT_REACH_END');
  });
});
