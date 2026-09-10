import { describe, expect, it } from 'vitest';

import { createRenderGraph } from '@/renderer';

import { createLevel } from '../core/validation/fixtures';

describe('createRenderGraph', () => {
  it('ignores out-of-bounds paths when classifying visible topology', () => {
    const graph = createRenderGraph(
      createLevel({
        grid: { rows: 2, cols: 2 },
        pathCells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 0 },
        ],
      }),
    );

    expect(graph.getNode({ x: 1, y: 0 })?.kind).toBe('normal');
  });
});
