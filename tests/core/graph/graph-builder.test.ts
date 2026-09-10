import { GraphBuilder } from '@/core/graph';
import { GridMap } from '@/core/grid';
import type { GridPosition } from '@/core/model';
import { describe, expect, it } from 'vitest';

function buildGraph(pathCells: readonly GridPosition[]) {
  return GraphBuilder.build(new GridMap({ rows: 5, cols: 5 }, pathCells));
}

describe('GraphBuilder', () => {
  it('builds an empty graph for an empty map', () => {
    expect(buildGraph([]).size).toBe(0);
  });

  it('classifies a single path cell as isolated', () => {
    const node = buildGraph([{ x: 2, y: 2 }]).getNode({ x: 2, y: 2 });

    expect(node).toMatchObject({ kind: 'isolated', neighbors: [] });
  });

  it('classifies a straight path as endpoint, normal, endpoint', () => {
    const graph = buildGraph([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);

    expect(graph.getNode({ x: 0, y: 0 })?.kind).toBe('endpoint');
    expect(graph.getNode({ x: 1, y: 0 })?.kind).toBe('normal');
    expect(graph.getNode({ x: 1, y: 0 })?.neighbors).toHaveLength(2);
    expect(graph.getNode({ x: 2, y: 0 })?.kind).toBe('endpoint');
  });

  it('classifies a ninety-degree corner as normal', () => {
    const graph = buildGraph([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]);

    expect(graph.getNode({ x: 1, y: 0 })).toMatchObject({ kind: 'normal' });
    expect(graph.getNode({ x: 1, y: 0 })?.neighbors).toEqual([
      { direction: 'down', position: { x: 1, y: 1 } },
      { direction: 'left', position: { x: 0, y: 0 } },
    ]);
  });

  it('classifies the center of a T junction as a junction candidate', () => {
    const graph = buildGraph([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]);

    expect(graph.getNode({ x: 1, y: 1 })).toMatchObject({ kind: 'junction' });
    expect(graph.getNode({ x: 1, y: 1 })?.neighbors).toHaveLength(3);
  });

  it('classifies the center of a cross junction as a junction candidate', () => {
    const graph = buildGraph([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ]);

    expect(graph.getNode({ x: 1, y: 1 })).toMatchObject({ kind: 'junction' });
    expect(graph.getNode({ x: 1, y: 1 })?.neighbors).toHaveLength(4);
  });

  it('builds symmetric undirected edges', () => {
    const graph = buildGraph([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);

    expect(graph.getNode({ x: 0, y: 0 })?.neighbors).toEqual([
      { direction: 'right', position: { x: 1, y: 0 } },
    ]);
    expect(graph.getNode({ x: 1, y: 0 })?.neighbors).toEqual([
      { direction: 'left', position: { x: 0, y: 0 } },
    ]);
  });

  it('creates one graph node for duplicate path input', () => {
    const graph = buildGraph([
      { x: 2, y: 2 },
      { x: 2, y: 2 },
    ]);

    expect(graph.size).toBe(1);
    expect(graph.hasNode({ x: 2, y: 2 })).toBe(true);
  });

  it('keeps graphs as snapshots after GridMap mutations', () => {
    const gridMap = new GridMap({ rows: 2, cols: 2 }, [{ x: 0, y: 0 }]);
    const graph = GraphBuilder.build(gridMap);

    gridMap.addPath({ x: 1, y: 0 });

    expect(graph.size).toBe(1);
    expect(graph.hasNode({ x: 1, y: 0 })).toBe(false);
  });
});
