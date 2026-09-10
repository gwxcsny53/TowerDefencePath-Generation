import type { GridPosition } from '@/core/model';

import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';

/** Draws in-bounds path cells as a layer below special map nodes. */
export function renderPaths(
  context: CanvasRenderingContext2D,
  pathCells: readonly GridPosition[],
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  if (!viewport.isValid) {
    return;
  }

  const inset = Math.min(theme.pathInset, viewport.cellSize / 2);
  const pathCellSize = viewport.cellSize - inset * 2;

  context.save();
  context.fillStyle = theme.pathFill;

  for (const pathCell of pathCells) {
    if (!viewport.isInBounds(pathCell)) {
      continue;
    }

    const position = viewport.gridToCanvas(pathCell);
    context.fillRect(position.x + inset, position.y + inset, pathCellSize, pathCellSize);
  }

  context.restore();
}
