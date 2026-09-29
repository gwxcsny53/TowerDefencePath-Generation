<script setup lang="ts">
import { computed } from 'vue';

import type { RouteSimulationResult } from '@/core/simulation';
import { ROUTE_SIMULATION_PRESENTATION } from '@/ui/presentation/RouteSimulationPresentation';
import type {
  RoutePreviewFrame,
  RoutePreviewPlaybackStatus,
} from '@/ui/routePreview/RoutePreviewPlayback';
import {
  formatPreviewSeconds,
  getRoutePreviewTiming,
} from '@/ui/routePreview/RoutePreviewPlayback';
import UiButton from '@/ui/components/base/UiButton.vue';
import UiProgressBar from '@/ui/components/base/UiProgressBar.vue';

const props = defineProps<{
  result: RouteSimulationResult;
  frame: RoutePreviewFrame;
  playbackStatus: RoutePreviewPlaybackStatus;
  moveSecondsPerCell: number;
}>();
const emit = defineEmits<{ stop: []; replay: []; close: [] }>();
const presentation = computed(() => ROUTE_SIMULATION_PRESENTATION[props.result.status]);
const playbackTitle = computed(() => {
  if (props.playbackStatus === 'playing') return '播放中';
  if (props.playbackStatus === 'stopped') return '已停止';
  return presentation.value.title;
});
const progress = computed(() =>
  Math.min(props.result.path.length, props.frame.segmentIndex + (props.frame.completed ? 2 : 1)),
);
const timing = computed(() =>
  getRoutePreviewTiming(props.result.path, props.frame, props.moveSecondsPerCell),
);
</script>

<template>
  <section class="route-preview-overlay" aria-label="路线测试结果">
    <h2 class="route-preview-overlay__title">路线测试</h2>
    <dl class="route-preview-overlay__details">
      <div>
        <dt>出生点</dt>
        <dd>{{ result.spawnId }}</dd>
      </div>
      <div>
        <dt>目标</dt>
        <dd>{{ result.endId ?? '—' }}</dd>
      </div>
      <div>
        <dt>状态</dt>
        <dd class="route-preview-overlay__status">{{ playbackTitle }}</dd>
      </div>
      <div>
        <dt>每格耗时</dt>
        <dd>{{ formatPreviewSeconds(moveSecondsPerCell) }}</dd>
      </div>
      <div>
        <dt>时间</dt>
        <dd>
          {{ formatPreviewSeconds(timing.elapsedSeconds) }} /
          {{ formatPreviewSeconds(timing.totalSeconds) }}
        </dd>
      </div>
      <div v-if="playbackStatus === 'playing'">
        <dt>进度</dt>
        <dd>{{ progress }} / {{ result.path.length }}</dd>
      </div>
      <div v-else>
        <dt>步数</dt>
        <dd>{{ Math.max(0, result.path.length - 1) }}</dd>
      </div>
    </dl>
    <UiProgressBar :value="timing.elapsedSeconds" :max="timing.totalSeconds" />
    <p v-if="playbackStatus !== 'playing'" class="route-preview-overlay__description">
      {{
        playbackStatus === 'stopped' ? `模拟结果：${presentation.title}` : presentation.description
      }}
    </p>
    <div class="route-preview-overlay__actions">
      <UiButton
        v-if="playbackStatus === 'playing'"
        variant="secondary"
        size="sm"
        @click="emit('stop')"
        >停止</UiButton
      >
      <UiButton v-else variant="primary" size="sm" @click="emit('replay')">重新测试</UiButton>
      <UiButton variant="ghost" size="sm" @click="emit('close')">关闭</UiButton>
    </div>
  </section>
</template>
