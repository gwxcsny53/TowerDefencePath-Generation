<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ value: number; max: number }>();
const percentage = computed(() => {
  if (!Number.isFinite(props.value) || !Number.isFinite(props.max) || props.max <= 0) return 0;
  return Math.min(100, Math.max(0, (props.value / props.max) * 100));
});
</script>

<template>
  <div
    class="ui-progress-bar"
    role="progressbar"
    :aria-valuenow="percentage"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="ui-progress-bar__fill" :style="{ width: `${percentage}%` }"></div>
  </div>
</template>
