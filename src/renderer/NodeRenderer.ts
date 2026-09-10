import type { EndPoint, SpawnPoint, TowerNode } from '@/core/model';

import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';

/** Draws in-bounds spawn points, end points, and tower nodes. */
export function renderNodes(
  context: CanvasRenderingContext2D,
  spawnPoints: readonly SpawnPoint[],
  endPoints: readonly EndPoint[],
  towerNodes: readonly TowerNode[],
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  if (!viewport.isValid) {
    return;
  }

  renderCircularMarkers(context, spawnPoints, viewport, theme.spawnFill, theme.markerScale);
  renderCircularMarkers(context, endPoints, viewport, theme.endFill, theme.markerScale);
  renderTowerNodes(context, towerNodes, viewport, theme);
}

function renderCircularMarkers(
  context: CanvasRenderingContext2D,
  positions: readonly (SpawnPoint | EndPoint)[],
  viewport: RenderViewport,
  fillStyle: string,
  markerScale: number,
): void {
  const radius = Math.max(2, viewport.cellSize * markerScale);

  context.save();
  context.fillStyle = fillStyle;

  for (const position of positions) {
    if (!viewport.isInBounds(position)) {
      continue;
    }

    const center = viewport.gridCellCenter(position);
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function renderTowerNodes(
  context: CanvasRenderingContext2D,
  towerNodes: readonly TowerNode[],
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  const sideLength = Math.max(4, viewport.cellSize * theme.markerScale * 2);

  context.save();

  for (const towerNode of towerNodes) {
    if (!viewport.isInBounds(towerNode)) {
      continue;
    }

    const center = viewport.gridCellCenter(towerNode);
    const halfSide = sideLength / 2;

    context.fillStyle = towerNode.locked ? theme.lockedTowerFill : theme.towerFill;
    context.globalAlpha = towerNode.locked ? 0.55 : 1;
    context.fillRect(center.x - halfSide, center.y - halfSide, sideLength, sideLength);

    if (towerNode.locked) {
      context.globalAlpha = 1;
      context.strokeStyle = theme.towerFill;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(center.x - halfSide, center.y - halfSide);
      context.lineTo(center.x + halfSide, center.y + halfSide);
      context.moveTo(center.x + halfSide, center.y - halfSide);
      context.lineTo(center.x - halfSide, center.y + halfSide);
      context.stroke();
    }
  }

  context.restore();
}
