import { describe, expect, it } from 'vitest';

import { createRenderViewport, MAX_CELL_SIZE, RENDER_VIEWPORT_PADDING } from '@/renderer';

describe('createRenderViewport', () => {
  it('fits a 20 by 20 grid into the available canvas area', () => {
    const viewport = createRenderViewport({ width: 1000, height: 800 }, { rows: 20, cols: 20 });

    expect(viewport.isValid).toBe(true);
    expect(viewport.cellSize).toBeCloseTo((800 - RENDER_VIEWPORT_PADDING * 2) / 20);
    expect(viewport.offsetX).toBeCloseTo(124);
    expect(viewport.offsetY).toBe(RENDER_VIEWPORT_PADDING);
  });

  it('caps small maps at the maximum cell size', () => {
    const viewport = createRenderViewport({ width: 800, height: 600 }, { rows: 3, cols: 3 });

    expect(viewport.cellSize).toBe(MAX_CELL_SIZE);
    expect(viewport.offsetX).toBe(328);
    expect(viewport.offsetY).toBe(228);
  });

  it('fits a wide grid while preserving the cell aspect ratio', () => {
    const viewport = createRenderViewport({ width: 1000, height: 500 }, { rows: 10, cols: 50 });

    expect(viewport.cellSize).toBeCloseTo((1000 - RENDER_VIEWPORT_PADDING * 2) / 50);
    expect(viewport.offsetX).toBe(RENDER_VIEWPORT_PADDING);
    expect(viewport.offsetY).toBeCloseTo(154.8);
  });

  it('converts grid positions to cell corners and centers', () => {
    const viewport = createRenderViewport({ width: 400, height: 300 }, { rows: 10, cols: 20 });

    const cellCorner = viewport.gridToCanvas({ x: 2, y: 3 });
    const cellCenter = viewport.gridCellCenter({ x: 2, y: 3 });

    expect(cellCorner.x).toBeCloseTo(59.2);
    expect(cellCorner.y).toBeCloseTo(114.8);
    expect(cellCenter.x).toBeCloseTo(68);
    expect(cellCenter.y).toBeCloseTo(123.6);
    expect(viewport.isInBounds({ x: 19, y: 9 })).toBe(true);
    expect(viewport.isInBounds({ x: 20, y: 9 })).toBe(false);
  });

  it('safely reports an invalid viewport for invalid grid dimensions', () => {
    const viewport = createRenderViewport({ width: 400, height: 300 }, { rows: 0, cols: 20 });

    expect(viewport.isValid).toBe(false);
    expect(viewport.cellSize).toBe(0);
    expect(viewport.gridToCanvas({ x: 1, y: 1 })).toEqual({ x: 200, y: 150 });
  });

  it('reports an invalid viewport when padding leaves no drawable canvas area', () => {
    const viewport = createRenderViewport({ width: 20, height: 20 }, { rows: 10, cols: 10 });

    expect(viewport.isValid).toBe(false);
    expect(viewport.cellSize).toBe(0);
  });

  it('converts canvas points to in-bounds grid positions only', () => {
    const viewport = createRenderViewport({ width: 400, height: 300 }, { rows: 10, cols: 20 });
    expect(viewport.canvasToGrid({ x: viewport.offsetX, y: viewport.offsetY })).toEqual({
      x: 0,
      y: 0,
    });
    expect(viewport.canvasToGrid(viewport.gridCellCenter({ x: 2, y: 3 }))).toEqual({ x: 2, y: 3 });
    expect(
      viewport.canvasToGrid({
        x: viewport.offsetX + viewport.gridCols * viewport.cellSize - 0.01,
        y: viewport.offsetY + viewport.gridRows * viewport.cellSize - 0.01,
      }),
    ).toEqual({ x: 19, y: 9 });
    expect(viewport.canvasToGrid({ x: viewport.offsetX - 1, y: viewport.offsetY })).toBeNull();
    expect(
      viewport.canvasToGrid({
        x: viewport.offsetX + viewport.gridCols * viewport.cellSize,
        y: viewport.offsetY,
      }),
    ).toBeNull();
    expect(viewport.canvasToGrid({ x: viewport.offsetX, y: viewport.offsetY - 1 })).toBeNull();
    expect(
      viewport.canvasToGrid({
        x: viewport.offsetX,
        y: viewport.offsetY + viewport.gridRows * viewport.cellSize,
      }),
    ).toBeNull();
  });

  it('does not convert canvas points for an invalid viewport', () => {
    expect(
      createRenderViewport({ width: 20, height: 20 }, { rows: 10, cols: 10 }).canvasToGrid({
        x: 0,
        y: 0,
      }),
    ).toBeNull();
  });
});
