import type { GridPosition } from '@/core/model';

export const ROUTE_PREVIEW_STEP_DURATION_MS = 300;

export type RoutePreviewPlaybackStatus = 'idle' | 'playing' | 'completed' | 'stopped';

export interface RoutePreviewFrame {
  readonly segmentIndex: number;
  readonly progress: number;
  readonly completed: boolean;
}

export function getRoutePreviewFrame(
  path: readonly Readonly<GridPosition>[],
  elapsedMs: number,
  stepDurationMs = ROUTE_PREVIEW_STEP_DURATION_MS,
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
