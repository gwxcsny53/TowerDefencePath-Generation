import { describe, expect, it } from 'vitest';

import { getMarkerGlyphMetrics } from '@/renderer/MarkerGlyphRenderer';

describe('getMarkerGlyphMetrics', () => {
  it('scales the surface and glyph with the existing marker scale', () => {
    const metrics = getMarkerGlyphMetrics(40, 0.3);

    expect(metrics.surfaceSize).toBe(24);
    expect(metrics.circleSurfaceSize).toBeCloseTo(metrics.surfaceSize * 0.93);
    expect(metrics.towerSurfaceSize).toBeCloseTo(metrics.surfaceSize * 0.97);
    expect(metrics.glyphSize).toBeCloseTo(metrics.circleSurfaceSize * 0.62);
    expect(metrics.lineWidth).toBeCloseTo(1.8);
    expect(metrics.outlineWidth).toBeCloseTo(1.6);
  });

  it('clamps stroke width and keeps a tiny surface inside its cell', () => {
    expect(getMarkerGlyphMetrics(20, 0.3).lineWidth).toBe(1.25);
    expect(getMarkerGlyphMetrics(60, 0.3).lineWidth).toBe(2.25);
    expect(getMarkerGlyphMetrics(20, 0.3).outlineWidth).toBe(1.25);
    expect(getMarkerGlyphMetrics(60, 0.3).outlineWidth).toBe(2);
    expect(getMarkerGlyphMetrics(3, 0.3).surfaceSize).toBe(3);
    expect(getMarkerGlyphMetrics(16, 0.3).glyphSize).toBeLessThan(7);
  });
});
