import { describe, expect, it } from 'vitest';

import { createRenderViewport, getRoutePreviewGeometry } from '@/renderer';

const viewport = createRenderViewport({ width: 300, height: 300 }, { rows: 3, cols: 3 });

describe('getRoutePreviewGeometry', () => {
  it('interpolates horizontal and vertical marker positions in canvas coordinates', () => {
    const horizontal = getRoutePreviewGeometry(
      {
        path: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        segmentIndex: 0,
        progress: 0.5,
        completed: false,
      },
      viewport,
    );
    const vertical = getRoutePreviewGeometry(
      {
        path: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
        ],
        segmentIndex: 0,
        progress: 0.5,
        completed: false,
      },
      viewport,
    );

    expect(horizontal.marker).toEqual({ x: 126, y: 102 });
    expect(vertical.marker).toEqual({ x: 102, y: 126 });
  });

  it('keeps the marker and visited polyline at the final cell after completion', () => {
    const geometry = getRoutePreviewGeometry(
      {
        path: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
        ],
        segmentIndex: 1,
        progress: 1,
        completed: true,
      },
      viewport,
    );

    expect(geometry.visitedPoints).toEqual([
      { x: 102, y: 102 },
      { x: 150, y: 102 },
      { x: 150, y: 150 },
    ]);
    expect(geometry.marker).toEqual({ x: 150, y: 150 });
  });
});
