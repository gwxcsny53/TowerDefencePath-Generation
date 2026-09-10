import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';

/** Draws the finite grid background and its shared row and column lines. */
export function renderGrid(
  context: CanvasRenderingContext2D,
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  if (!viewport.isValid) {
    return;
  }

  const mapWidth = viewport.gridCols * viewport.cellSize;
  const mapHeight = viewport.gridRows * viewport.cellSize;

  context.save();
  context.fillStyle = theme.gridBackground;
  context.fillRect(viewport.offsetX, viewport.offsetY, mapWidth, mapHeight);

  context.beginPath();
  for (let column = 0; column <= viewport.gridCols; column += 1) {
    const x = viewport.offsetX + column * viewport.cellSize;
    context.moveTo(x, viewport.offsetY);
    context.lineTo(x, viewport.offsetY + mapHeight);
  }

  for (let row = 0; row <= viewport.gridRows; row += 1) {
    const y = viewport.offsetY + row * viewport.cellSize;
    context.moveTo(viewport.offsetX, y);
    context.lineTo(viewport.offsetX + mapWidth, y);
  }

  context.strokeStyle = theme.gridLine;
  context.lineWidth = theme.gridLineWidth;
  context.stroke();
  context.restore();
}
