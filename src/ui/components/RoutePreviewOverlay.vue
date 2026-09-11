<script setup lang="ts">
import { computed } from 'vue';

import type { RouteSimulationResult } from '@/core/simulation';
import { ROUTE_SIMULATION_PRESENTATION } from '@/ui/presentation/RouteSimulationPresentation';
import type {
  RoutePreviewFrame,
  RoutePreviewPlaybackStatus,
} from '@/ui/routePreview/RoutePreviewPlayback';

const props = defineProps<{
  result: RouteSimulationResult;
  frame: RoutePreviewFrame;
  playbackStatus: RoutePreviewPlaybackStatus;
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
</script>

<template>
  <section class="route-preview-overlay" aria-label="路线测试结果">
    <h2>路线测试</h2>
    <p class="route-preview-spawn">出生点：{{ result.spawnId }}</p>
    <p v-if="playbackStatus === 'playing'" class="route-preview-progress">
      进度：{{ progress }} / {{ result.path.length }}
    </p>
    <p class="route-preview-status">状态：{{ playbackTitle }}</p>
    <p v-if="playbackStatus !== 'playing'" class="route-preview-description">
      {{
        playbackStatus === 'stopped' ? `模拟结果：${presentation.title}` : presentation.description
      }}
    </p>
    <p v-if="result.endId !== undefined" class="route-preview-end">
      {{ result.spawnId }} → {{ result.endId }}
    </p>
    <p v-if="playbackStatus !== 'playing'" class="route-preview-steps">
      步数：{{ Math.max(0, result.path.length - 1) }}
    </p>
    <div class="route-preview-actions">
      <button v-if="playbackStatus === 'playing'" type="button" @click="emit('stop')">停止</button>
      <button v-else type="button" @click="emit('replay')">重新测试</button>
      <button type="button" @click="emit('close')">关闭</button>
    </div>
  </section>
</template>

<style scoped>
.route-preview-overlay {
  position: absolute;
  z-index: 1;
  top: 0.75rem;
  right: 0.75rem;
  width: min(16rem, calc(100% - 1.5rem));
  padding: 0.75rem;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #67e8f9;
  border-radius: 0.375rem;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.16);
}

.route-preview-overlay h2,
.route-preview-overlay p {
  margin: 0;
}

.route-preview-overlay h2 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.route-preview-overlay p {
  margin-top: 0.25rem;
  color: #475569;
  font-size: 0.75rem;
}

.route-preview-overlay .route-preview-status {
  color: #0e7490;
  font-weight: 650;
}

.route-preview-actions {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.75rem;
}

.route-preview-actions button {
  padding: 0.25rem 0.5rem;
  color: #155e75;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 0.25rem;
}
</style>
