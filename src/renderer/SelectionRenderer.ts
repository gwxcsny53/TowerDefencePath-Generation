import type { GridPosition } from '@/core/model';
import type { RenderViewport } from './RenderViewport';

/** Draws a final-layer highlight for a selected grid cell. */
export function renderSelection(
  context: CanvasRenderingContext2D,
  selectedPosition: Readonly<GridPosition> | null | undefined,
  viewport: RenderViewport,
): void {
  if (
    !viewport.isValid ||
    selectedPosition === null ||
    selectedPosition === undefined ||
    !viewport.isInBounds(selectedPosition)
  )
    return;
  const position = viewport.gridToCanvas(selectedPosition);
  context.save();
  context.strokeStyle = '#0f172a';
  context.lineWidth = 2;
  context.strokeRect(position.x + 1, position.y + 1, viewport.cellSize - 2, viewport.cellSize - 2);
  context.restore();
}
