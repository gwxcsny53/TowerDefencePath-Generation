import type { GridPosition, GridSize } from '@/core/model';

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface RenderViewport {
  canvasWidth: number;
  canvasHeight: number;
  gridRows: number;
  gridCols: number;
  cellSize: number;
  offsetX: number;
  offsetY: number;
  isValid: boolean;
  gridToCanvas(position: GridPosition): CanvasPoint;
  gridCellCenter(position: GridPosition): CanvasPoint;
  isInBounds(position: GridPosition): boolean;
}

export const RENDER_VIEWPORT_PADDING = 24;
export const MAX_CELL_SIZE = 48;

/** Calculates a centered, read-only fit-to-view transform for one grid. */
export function createRenderViewport(canvasSize: CanvasSize, gridSize: GridSize): RenderViewport {
  const canvasWidth = Math.max(0, canvasSize.width);
  const canvasHeight = Math.max(0, canvasSize.height);
  const gridRows = gridSize.rows;
  const gridCols = gridSize.cols;
  const isValid =
    Number.isFinite(gridRows) &&
    Number.isFinite(gridCols) &&
    gridRows > 0 &&
    gridCols > 0 &&
    canvasWidth > 0 &&
    canvasHeight > 0;

  const availableWidth = Math.max(0, canvasWidth - RENDER_VIEWPORT_PADDING * 2);
  const availableHeight = Math.max(0, canvasHeight - RENDER_VIEWPORT_PADDING * 2);
  const cellSize = isValid
    ? Math.min(MAX_CELL_SIZE, availableWidth / gridCols, availableHeight / gridRows)
    : 0;
  const mapWidth = gridCols * cellSize;
  const mapHeight = gridRows * cellSize;
  const offsetX = (canvasWidth - mapWidth) / 2;
  const offsetY = (canvasHeight - mapHeight) / 2;

  return {
    canvasWidth,
    canvasHeight,
    gridRows,
    gridCols,
    cellSize,
    offsetX,
    offsetY,
    isValid,
    gridToCanvas(position) {
      return {
        x: offsetX + position.x * cellSize,
        y: offsetY + position.y * cellSize,
      };
    },
    gridCellCenter(position) {
      return {
        x: offsetX + (position.x + 0.5) * cellSize,
        y: offsetY + (position.y + 0.5) * cellSize,
      };
    },
    isInBounds(position) {
      return position.x >= 0 && position.x < gridCols && position.y >= 0 && position.y < gridRows;
    },
  };
}
