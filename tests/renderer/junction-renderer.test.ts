import { describe, expect, it } from 'vitest';
import { GraphBuilder } from '@/core/graph';
import { GridMap } from '@/core/grid';
import { getJunctionRenderItems } from '@/renderer';

describe('getJunctionRenderItems', () => {
  const graph = GraphBuilder.build(
    new GridMap({ rows: 3, cols: 3 }, [
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ]),
  );
  it('classifies unconfigured, configured, and stale junctions', () => {
    expect(getJunctionRenderItems(graph, [])).toMatchObject([{ kind: 'candidate-unconfigured' }]);
    expect(
      getJunctionRenderItems(graph, [{ id: 'junction_01', x: 1, y: 1, transitions: [] }]),
    ).toMatchObject([{ kind: 'candidate-configured' }]);
    expect(
      getJunctionRenderItems(graph, [{ id: 'junction_01', x: 0, y: 0, transitions: [] }]),
    ).toMatchObject([{ kind: 'candidate-unconfigured' }, { kind: 'stale-config' }]);
  });
});
