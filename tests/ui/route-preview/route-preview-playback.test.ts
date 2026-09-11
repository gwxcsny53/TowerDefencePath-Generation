import { describe, expect, it } from 'vitest';

import { getRoutePreviewFrame } from '@/ui/routePreview/RoutePreviewPlayback';

const path = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
];

describe('getRoutePreviewFrame', () => {
  it('completes a one-cell path without generating an invalid frame', () => {
    expect(getRoutePreviewFrame([{ x: 0, y: 0 }], 0)).toEqual({
      segmentIndex: 0,
      progress: 1,
      completed: true,
    });
  });

  it('starts at the first segment and advances through each segment', () => {
    expect(getRoutePreviewFrame(path, 0, 100)).toEqual({
      segmentIndex: 0,
      progress: 0,
      completed: false,
    });
    expect(getRoutePreviewFrame(path, 50, 100)).toEqual({
      segmentIndex: 0,
      progress: 0.5,
      completed: false,
    });
    expect(getRoutePreviewFrame(path, 100, 100)).toEqual({
      segmentIndex: 1,
      progress: 0,
      completed: false,
    });
  });

  it('completes on the last path cell when elapsed time exceeds the route duration', () => {
    expect(getRoutePreviewFrame(path, 250, 100)).toEqual({
      segmentIndex: 1,
      progress: 1,
      completed: true,
    });
  });
});
