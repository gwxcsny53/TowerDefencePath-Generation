import { MapValidator } from '@/core/validation';
import type { ValidationCode } from '@/core/validation';
import type { JunctionTransition, LevelConfig } from '@/core/model';
import { describe, expect, it } from 'vitest';

import { createLevel } from './fixtures';

function codes(level: LevelConfig): ValidationCode[] {
  return MapValidator.validate(level).map((issue) => issue.code);
}

function createTJunction(transitions: JunctionTransition[] = []): LevelConfig {
  return createLevel({
    grid: { rows: 3, cols: 3 },
    pathCells: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    junctions: [{ id: 'junction', x: 1, y: 1, transitions }],
  });
}

describe('MapValidator junction validation', () => {
  it('reports an unconfigured Junction candidate', () => {
    const level = createTJunction();
    level.junctions = [];

    expect(codes(level)).toContain('JUNCTION_NOT_CONFIGURED');
  });

  it('reports a Junction configuration on a non-junction path cell', () => {
    const level = createLevel({
      grid: { rows: 1, cols: 3 },
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      junctions: [{ id: 'junction', x: 1, y: 0, transitions: [] }],
    });

    expect(codes(level)).toContain('JUNCTION_POSITION_INVALID');
  });

  it('reports duplicate Junction configurations at one position', () => {
    const level = createTJunction();
    level.junctions.push({ id: 'duplicate', x: 1, y: 1, transitions: [] });

    expect(codes(level)).toContain('JUNCTION_DUPLICATE_CONFIG');
  });

  it('reports invalid entry, exit, immediate-return, duplicate, and empty transitions', () => {
    const level = createTJunction([
      { enterFrom: 'down', exits: [{ exitTo: 'left', weight: 1 }] },
      { enterFrom: 'left', exits: [{ exitTo: 'down', weight: 1 }] },
      { enterFrom: 'up', exits: [{ exitTo: 'up', weight: 1 }] },
      {
        enterFrom: 'right',
        exits: [
          { exitTo: 'up', weight: 0.5 },
          { exitTo: 'up', weight: 0.5 },
        ],
      },
      { enterFrom: 'right', exits: [] },
    ]);

    expect(codes(level)).toContain('JUNCTION_DIRECTION_INVALID');
  });

  it('reports a direction used as an exit and another transition entry', () => {
    const level = createTJunction([
      { enterFrom: 'left', exits: [{ exitTo: 'right', weight: 1 }] },
      { enterFrom: 'right', exits: [{ exitTo: 'up', weight: 1 }] },
    ]);

    expect(codes(level)).toContain('JUNCTION_DIRECTION_INVALID');
  });

  it('allows a merge and fork when every direction has one global role', () => {
    const merge = createTJunction([
      { enterFrom: 'up', exits: [{ exitTo: 'right', weight: 1 }] },
      { enterFrom: 'left', exits: [{ exitTo: 'right', weight: 1 }] },
    ]);
    const fork = createTJunction([
      {
        enterFrom: 'left',
        exits: [
          { exitTo: 'up', weight: 0.5 },
          { exitTo: 'right', weight: 0.5 },
        ],
      },
    ]);

    expect(codes(merge)).not.toContain('JUNCTION_DIRECTION_INVALID');
    expect(codes(fork)).not.toContain('JUNCTION_DIRECTION_INVALID');
  });

  it.each([
    ['negative', -0.1],
    ['zero', 0],
    ['greater than one', 1.1],
    ['NaN', Number.NaN],
    ['infinite', Number.POSITIVE_INFINITY],
  ])('reports %s Junction weights', (_label, weight) => {
    const level = createTJunction([{ enterFrom: 'left', exits: [{ exitTo: 'right', weight }] }]);

    expect(codes(level)).toContain('JUNCTION_WEIGHT_INVALID');
  });

  it('reports a Junction transition whose weights do not sum to one', () => {
    const level = createTJunction([
      {
        enterFrom: 'left',
        exits: [
          { exitTo: 'up', weight: 0.5 },
          { exitTo: 'right', weight: 0.25 },
        ],
      },
    ]);

    expect(codes(level)).toContain('JUNCTION_WEIGHT_INVALID');
  });

  it('accepts probability weights that sum to one, including a single exit', () => {
    const split = createTJunction([
      {
        enterFrom: 'left',
        exits: [
          { exitTo: 'up', weight: 0.8 },
          { exitTo: 'right', weight: 0.2 },
        ],
      },
    ]);
    const single = createTJunction([
      { enterFrom: 'left', exits: [{ exitTo: 'right', weight: 1 }] },
    ]);

    expect(codes(split)).not.toContain('JUNCTION_WEIGHT_INVALID');
    expect(codes(single)).not.toContain('JUNCTION_WEIGHT_INVALID');
  });
});
