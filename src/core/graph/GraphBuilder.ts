import { GridMap } from '@/core/grid';

import { PathGraph } from './PathGraph';
import type { PathGraphNode, PathNodeKind } from './PathGraph';

export class GraphBuilder {
  /** Builds a new topology snapshot; later GridMap mutations do not alter this graph. */
  static build(gridMap: GridMap): PathGraph {
    const nodes: PathGraphNode[] = gridMap.getPathCells().map((position) => {
      const neighbors = gridMap.getPathNeighbors(position);

      return {
        position,
        neighbors,
        kind: classifyPathNodeKind(neighbors.length),
      };
    });

    return new PathGraph(nodes);
  }
}

function classifyPathNodeKind(degree: number): PathNodeKind {
  if (degree === 0) {
    return 'isolated';
  }

  if (degree === 1) {
    return 'endpoint';
  }

  if (degree === 2) {
    return 'normal';
  }

  return 'junction';
}
