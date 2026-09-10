import type { PathGraph } from '@/core/graph';
import { toGridPositionKey } from '@/core/grid';
import type { Junction } from '@/core/model';

import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';

/** Draws topology junction candidates and distinguishes configured candidates. */
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

  const configuredJunctionKeys = new Set(junctions.map(toGridPositionKey));
  const radius = Math.max(3, viewport.cellSize * theme.markerScale * 0.8);

  context.save();
  context.lineWidth = 2;

  for (const node of graph.getNodes()) {
    if (node.kind !== 'junction' || !viewport.isInBounds(node.position)) {
      continue;
    }

    const center = viewport.gridCellCenter(node.position);
    const isConfigured = configuredJunctionKeys.has(toGridPositionKey(node.position));

    context.beginPath();
    context.moveTo(center.x, center.y - radius);
    context.lineTo(center.x + radius, center.y);
    context.lineTo(center.x, center.y + radius);
    context.lineTo(center.x - radius, center.y);
    context.closePath();

    if (isConfigured) {
      context.fillStyle = theme.configuredJunctionFill;
      context.fill();
    } else {
      context.strokeStyle = theme.unconfiguredJunctionStroke;
      context.stroke();
    }
  }

  context.restore();
}
