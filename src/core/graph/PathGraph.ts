import type { GridPosition } from '@/core/model';
import type { PathNeighbor } from '@/core/grid';
import { toGridPositionKey } from '@/core/grid';

export type PathNodeKind = 'isolated' | 'endpoint' | 'normal' | 'junction';

export interface PathGraphNode {
  readonly position: Readonly<GridPosition>;
  readonly neighbors: readonly PathNeighbor[];
  readonly kind: PathNodeKind;
}

/** A snapshot of physical path topology built from a GridMap. */
export class PathGraph {
  private readonly nodesByKey = new Map<string, PathGraphNode>();

  constructor(nodes: readonly PathGraphNode[]) {
    for (const node of nodes) {
      const snapshotNode: PathGraphNode = {
        position: { ...node.position },
        neighbors: node.neighbors.map((neighbor) => ({
          direction: neighbor.direction,
          position: { ...neighbor.position },
        })),
        kind: node.kind,
      };

      this.nodesByKey.set(toGridPositionKey(snapshotNode.position), snapshotNode);
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
