<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { createRenderViewport, MapRenderer } from '@/renderer';
import type { LevelConfig } from '@/core/model';

interface Props {
  level?: LevelConfig | null;
}

const props = defineProps<Props>();
const canvas = ref<HTMLCanvasElement | null>(null);
const host = ref<HTMLElement | null>(null);
const renderer = new MapRenderer();

let context: CanvasRenderingContext2D | null = null;
let resizeObserver: ResizeObserver | null = null;
let canvasWidth = 0;
let canvasHeight = 0;

function renderMap(): void {
  if (context === null) {
    return;
  }

  if (props.level === null || props.level === undefined) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    return;
  }

  const viewport = createRenderViewport(
    { width: canvasWidth, height: canvasHeight },
    props.level.grid,
  );

  renderer.render(context, props.level, viewport);
}

function resizeCanvas(width: number, height: number): void {
  if (canvas.value === null || context === null) {
    return;
  }

  canvasWidth = Math.max(0, width);
  canvasHeight = Math.max(0, height);

  const dpr = window.devicePixelRatio || 1;
  canvas.value.width = Math.round(canvasWidth * dpr);
  canvas.value.height = Math.round(canvasHeight * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  renderMap();
}

onMounted(() => {
  if (canvas.value === null || host.value === null) {
    return;
  }

  context = canvas.value.getContext('2d');
  if (context === null) {
    return;
  }

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry !== undefined) {
      resizeCanvas(entry.contentRect.width, entry.contentRect.height);
    }
  });

  resizeObserver.observe(host.value);
  const bounds = host.value.getBoundingClientRect();
  resizeCanvas(bounds.width, bounds.height);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  context = null;
});

watch(
  () => props.level,
  () => {
    renderMap();
  },
);
</script>

<template>
  <section ref="host" class="map-canvas-host">
    <canvas ref="canvas" aria-label="塔防关卡地图编辑区域"></canvas>
    <div v-if="level === null || level === undefined" class="map-placeholder">
      <p>地图编辑区</p>
      <span>暂无打开的关卡</span>
    </div>
  </section>
</template>

<style scoped>
.map-canvas-host {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #e2e8f0;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  border: 1px solid #cbd5e1;
  background: #e2e8f0;
}

.map-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 0.375rem;
  padding: 1rem;
  color: #64748b;
  text-align: center;
  pointer-events: none;
}

.map-placeholder p,
.map-placeholder span {
  margin: 0;
}

.map-placeholder p {
  color: #475569;
  font-weight: 600;
}

.map-placeholder span {
  font-size: 0.875rem;
}
</style>
