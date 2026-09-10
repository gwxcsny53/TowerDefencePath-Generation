import { describe, expect, it } from 'vitest';
import { rasterizeOrthogonalSegment } from '@/editor';

describe('rasterizeOrthogonalSegment', () => {
  it.each([
    [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ],
    [
      { x: 0, y: 0 },
      { x: 0, y: 4 },
    ],
    [
      { x: 0, y: 0 },
      { x: 3, y: 2 },
    ],
  ])('creates a four-connected segment from %o to %o', (from, to) => {
    const positions = rasterizeOrthogonalSegment(from, to);
    expect(positions[0]).toEqual(from);
    expect(positions.at(-1)).toEqual(to);
    for (let index = 1; index < positions.length; index += 1) {
      const previous = positions[index - 1];
      const current = positions[index];
      expect(Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y)).toBe(1);
    }
  });
});
