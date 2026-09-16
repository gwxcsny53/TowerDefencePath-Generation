import { onBeforeUnmount, ref, watch } from 'vue';
import type { Ref } from 'vue';

import type { RouteSimulationResult } from '@/core/simulation';

import {
  getRoutePreviewFrame,
  type RoutePreviewFrame,
  type RoutePreviewPlaybackStatus,
} from './RoutePreviewPlayback';

export interface RoutePreviewPlaybackSource {
  readonly result: RouteSimulationResult;
  readonly stepDurationMs: number;
}

export function useRoutePreviewPlayback(source: Ref<RoutePreviewPlaybackSource | null>) {
  const frame = ref<RoutePreviewFrame | null>(null);
  const playbackStatus = ref<RoutePreviewPlaybackStatus>('idle');
  let animationFrameId: number | null = null;
  let startedAt = 0;

  function cancelPlaybackFrame(): void {
    if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  function tick(timestamp: number): void {
    const currentSource = source.value;
    if (currentSource === null) return;
    const nextFrame = getRoutePreviewFrame(
      currentSource.result.path,
      timestamp - startedAt,
      currentSource.stepDurationMs,
    );
    frame.value = nextFrame;
    if (nextFrame.completed) {
      playbackStatus.value = 'completed';
      animationFrameId = null;
      return;
    }
    animationFrameId = requestAnimationFrame(tick);
  }
  function start(): void {
    cancelPlaybackFrame();
    const currentSource = source.value;
    if (currentSource === null) {
      frame.value = null;
      playbackStatus.value = 'idle';
      return;
    }
    frame.value = getRoutePreviewFrame(currentSource.result.path, 0, currentSource.stepDurationMs);
    if (frame.value.completed) {
      playbackStatus.value = 'completed';
      return;
    }
    playbackStatus.value = 'playing';
    startedAt = performance.now();
    animationFrameId = requestAnimationFrame(tick);
  }
  function stop(): void {
    cancelPlaybackFrame();
    if (source.value !== null && frame.value !== null && !frame.value.completed)
      playbackStatus.value = 'stopped';
  }

  watch(source, start, { flush: 'sync' });
  onBeforeUnmount(cancelPlaybackFrame);

  return { frame, playbackStatus, start, stop };
}
