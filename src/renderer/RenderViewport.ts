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
  canvasToGrid(point: CanvasPoint): GridPosition | null;
  isInBounds(position: GridPosition): boolean;
}

export const RENDER_VIEWPORT_PADDING = 24;
export const MAX_CELL_SIZE = 48;

/** Calculates a centered, read-only fit-to-view transform for one grid. */
export function createRenderViewport(canvasSize: CanvasSize, gridSize: GridSize): RenderViewport {
  const canvasWidth = toNonNegativeFiniteNumber(canvasSize.width);
  const canvasHeight = toNonNegativeFiniteNumber(canvasSize.height);
  const gridRows = toNonNegativeFiniteNumber(gridSize.rows);
  const gridCols = toNonNegativeFiniteNumber(gridSize.cols);
  const gridIsValid = gridRows > 0 && gridCols > 0;

  const availableWidth = Math.max(0, canvasWidth - RENDER_VIEWPORT_PADDING * 2);
  const availableHeight = Math.max(0, canvasHeight - RENDER_VIEWPORT_PADDING * 2);
  const fittedCellSize = gridIsValid
    ? Math.min(MAX_CELL_SIZE, availableWidth / gridCols, availableHeight / gridRows)
    : 0;
  const isValid = Number.isFinite(fittedCellSize) && fittedCellSize > 0;
  const cellSize = isValid ? fittedCellSize : 0;
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
    canvasToGrid(point) {
      if (
        !isValid ||
        point.x < offsetX ||
        point.x >= offsetX + gridCols * cellSize ||
        point.y < offsetY ||
        point.y >= offsetY + gridRows * cellSize
      )
        return null;
      return {
        x: Math.floor((point.x - offsetX) / cellSize),
        y: Math.floor((point.y - offsetY) / cellSize),
      };
    },
    isInBounds(position) {
      return position.x >= 0 && position.x < gridCols && position.y >= 0 && position.y < gridRows;
    },
  };
}

function toNonNegativeFiniteNumber(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
