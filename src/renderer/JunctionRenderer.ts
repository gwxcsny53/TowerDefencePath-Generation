import type { PathGraph } from '@/core/graph';
import { toGridPositionKey } from '@/core/grid';
import type { Junction } from '@/core/model';

import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';

export type JunctionRenderKind = 'candidate-unconfigured' | 'candidate-configured' | 'stale-config';
export interface JunctionRenderItem {
  readonly position: Readonly<import('@/core/model').GridPosition>;
  readonly kind: JunctionRenderKind;
}
export function getJunctionRenderItems(
  graph: PathGraph,
  junctions: readonly Junction[],
): JunctionRenderItem[] {
  const configured = new Map(junctions.map((junction) => [toGridPositionKey(junction), junction]));
  const items: JunctionRenderItem[] = [];
  for (const node of graph.getNodes())
    if (node.kind === 'junction') {
      const key = toGridPositionKey(node.position);
      items.push({
        position: node.position,
        kind: configured.has(key) ? 'candidate-configured' : 'candidate-unconfigured',
      });
      configured.delete(key);
    }
  for (const junction of configured.values())
    items.push({ position: junction, kind: 'stale-config' });
  return items;
}

/** Draws topology junction candidates and configured or stale junctions. */
export function renderJunctions(
  context: CanvasRenderingContext2D,
  graph: PathGraph,
  junctions: readonly Junction[],
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  if (!viewport.isValid) {
    return;
  }

  const radius = Math.max(3, viewport.cellSize * theme.markerScale * 0.8);

  context.save();
  context.lineWidth = 2;

  for (const item of getJunctionRenderItems(graph, junctions)) {
    if (!viewport.isInBounds(item.position)) {
      continue;
    }

    const center = viewport.gridCellCenter(item.position);

    context.beginPath();
    context.moveTo(center.x, center.y - radius);
    context.lineTo(center.x + radius, center.y);
    context.lineTo(center.x, center.y + radius);
    context.lineTo(center.x - radius, center.y);
    context.closePath();

    if (item.kind === 'candidate-configured') {
      context.fillStyle = theme.configuredJunctionFill;
      context.fill();
    } else {
      context.strokeStyle =
        item.kind === 'stale-config' ? theme.staleJunctionStroke : theme.unconfiguredJunctionStroke;
      context.stroke();
    }
  }

  context.restore();
}
