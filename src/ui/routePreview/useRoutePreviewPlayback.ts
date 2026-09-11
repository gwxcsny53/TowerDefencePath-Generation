import { onBeforeUnmount, ref, watch } from 'vue';
import type { Ref } from 'vue';

import type { RouteSimulationResult } from '@/core/simulation';

import {
  getRoutePreviewFrame,
  type RoutePreviewFrame,
  type RoutePreviewPlaybackStatus,
} from './RoutePreviewPlayback';

export function useRoutePreviewPlayback(result: Ref<RouteSimulationResult | null>) {
  const frame = ref<RoutePreviewFrame | null>(null);
  const playbackStatus = ref<RoutePreviewPlaybackStatus>('idle');
  let animationFrameId: number | null = null;
  let startedAt = 0;

  function cancelPlaybackFrame(): void {
    if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  function tick(timestamp: number): void {
    const currentResult = result.value;
    if (currentResult === null) return;
    const nextFrame = getRoutePreviewFrame(currentResult.path, timestamp - startedAt);
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
    const currentResult = result.value;
    if (currentResult === null) {
      frame.value = null;
      playbackStatus.value = 'idle';
      return;
    }
    frame.value = getRoutePreviewFrame(currentResult.path, 0);
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
    if (result.value !== null && frame.value !== null && !frame.value.completed)
      playbackStatus.value = 'stopped';
  }

  watch(result, start, { flush: 'sync' });
  onBeforeUnmount(cancelPlaybackFrame);

  return { frame, playbackStatus, start, stop };
}
