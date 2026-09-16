import type { GridPosition } from '@/core/model';

export type RoutePreviewPlaybackStatus = 'idle' | 'playing' | 'completed' | 'stopped';

export interface RoutePreviewFrame {
  readonly segmentIndex: number;
  readonly progress: number;
  readonly completed: boolean;
}

export interface RoutePreviewTiming {
  readonly elapsedSeconds: number;
  readonly totalSeconds: number;
}

export function getRoutePreviewFrame(
  path: readonly Readonly<GridPosition>[],
  elapsedMs: number,
  stepDurationMs: number,
): RoutePreviewFrame {
  const lastSegmentIndex = Math.max(0, path.length - 2);
  if (path.length <= 1) return { segmentIndex: 0, progress: 1, completed: true };

  const safeDuration = Number.isFinite(stepDurationMs) && stepDurationMs > 0 ? stepDurationMs : 1;
  const safeElapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const totalDuration = lastSegmentIndex + 1;
  const elapsedSteps = safeElapsed / safeDuration;

  if (elapsedSteps >= totalDuration)
    return { segmentIndex: lastSegmentIndex, progress: 1, completed: true };

  return {
    segmentIndex: Math.min(lastSegmentIndex, Math.floor(elapsedSteps)),
    progress: elapsedSteps % 1,
    completed: false,
  };
}

export function getRoutePreviewTiming(
  path: readonly Readonly<GridPosition>[],
  frame: RoutePreviewFrame,
  moveSecondsPerCell: number,
): RoutePreviewTiming {
  const totalSegments = Math.max(0, path.length - 1);
  const secondsPerCell =
    Number.isFinite(moveSecondsPerCell) && moveSecondsPerCell > 0 ? moveSecondsPerCell : 0;
  const totalSeconds = totalSegments * secondsPerCell;
  const elapsedSegments = frame.completed
    ? totalSegments
    : Math.min(
        totalSegments,
        Math.max(
          0,
          (Number.isFinite(frame.segmentIndex) ? frame.segmentIndex : 0) +
            (Number.isFinite(frame.progress) ? frame.progress : 0),
        ),
      );

  return { elapsedSeconds: elapsedSegments * secondsPerCell, totalSeconds };
}

export function formatPreviewSeconds(seconds: number): string {
  return `${(Number.isFinite(seconds) ? Math.max(0, seconds) : 0).toFixed(2)} 秒`;
}
