<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const rootElement = ref<HTMLElement | null>(null);
const open = ref(false);

function close(): void {
  open.value = false;
}

function toggle(): void {
  open.value = !open.value;
}

function handlePointerDown(event: PointerEvent): void {
  if (rootElement.value?.contains(event.target as Node)) return;
  close();
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') close();
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown);
  document.removeEventListener('keydown', handleKeyDown);
});

defineExpose({ open, close, toggle });
</script>

<template>
  <div ref="rootElement" class="ui-popover">
    <slot name="trigger" :open="open" :toggle="toggle" />
    <div v-if="open" class="ui-popover__content">
      <slot :close="close" />
    </div>
  </div>
</template>
