import type { GridPosition } from '@/core/model';
import type { PathNeighbor } from '@/core/grid';
import { toGridPositionKey } from '@/core/grid';

export type PathNodeKind = 'isolated' | 'endpoint' | 'normal' | 'junction';

export interface PathGraphNode {
  position: GridPosition;
  neighbors: readonly PathNeighbor[];
  kind: PathNodeKind;
}

/** A snapshot of physical path topology built from a GridMap. */
export class PathGraph {
  private readonly nodesByKey = new Map<string, PathGraphNode>();

  constructor(nodes: readonly PathGraphNode[]) {
    for (const node of nodes) {
      this.nodesByKey.set(toGridPositionKey(node.position), node);
    }
  }

  get size(): number {
    return this.nodesByKey.size;
  }

  hasNode(position: GridPosition): boolean {
    return this.nodesByKey.has(toGridPositionKey(position));
  }

  getNode(position: GridPosition): PathGraphNode | undefined {
    return this.nodesByKey.get(toGridPositionKey(position));
  }

  getNodes(): readonly PathGraphNode[] {
    return Array.from(this.nodesByKey.values());
  }
}
