<script setup lang="ts">
defineProps<{
  x: number;
  y: number;
  width: number;
  height: number;
  ready: boolean;
  variant: 'tool' | 'level';
  motionRevision: number;
}>();
</script>

<template>
  <span
    class="ui-liquid-indicator"
    :class="[
      `ui-liquid-indicator--${variant}`,
      { 'is-ready': ready, 'is-moving': motionRevision > 0 },
    ]"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate3d(${x}px, ${y}px, 0)`,
    }"
    aria-hidden="true"
  >
    <span
      :key="motionRevision"
      class="ui-liquid-indicator__surface"
      :class="{ 'is-stretching': variant === 'tool' && motionRevision > 0 }"
    ></span>
  </span>
</template>
