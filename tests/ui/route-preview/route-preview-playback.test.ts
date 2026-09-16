import { describe, expect, it } from 'vitest';

import {
  getRoutePreviewFrame,
  getRoutePreviewTiming,
} from '@/ui/routePreview/RoutePreviewPlayback';

const path = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
];

describe('getRoutePreviewFrame', () => {
  it('completes a one-cell path without generating an invalid frame', () => {
    expect(getRoutePreviewFrame([{ x: 0, y: 0 }], 0, 100)).toEqual({
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

  it('uses the supplied step duration instead of a fixed playback speed', () => {
    expect(getRoutePreviewFrame(path, 250, 100).completed).toBe(true);
    expect(getRoutePreviewFrame(path, 250, 500)).toMatchObject({
      segmentIndex: 0,
      progress: 0.5,
      completed: false,
    });
  });

  it('calculates bounded elapsed and total preview timing from path segments', () => {
    expect(
      getRoutePreviewTiming(
        [{ x: 0, y: 0 }],
        { segmentIndex: 0, progress: 1, completed: true },
        0.5,
      ),
    ).toEqual({ elapsedSeconds: 0, totalSeconds: 0 });
    expect(
      getRoutePreviewTiming(
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
        { segmentIndex: 0, progress: 0.5, completed: false },
        0.5,
      ),
    ).toEqual({ elapsedSeconds: 0.25, totalSeconds: 1.5 });
    expect(
      getRoutePreviewTiming(path, { segmentIndex: 1, progress: 0, completed: false }, 0.5),
    ).toEqual({ elapsedSeconds: 0.5, totalSeconds: 1 });
    expect(
      getRoutePreviewTiming(path, { segmentIndex: 1, progress: 1, completed: true }, 0.5),
    ).toEqual({ elapsedSeconds: 1, totalSeconds: 1 });
  });
});
