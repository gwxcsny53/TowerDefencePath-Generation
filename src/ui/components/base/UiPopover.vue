<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{ placement?: 'bottom' | 'top' | 'auto' }>(), {
  placement: 'bottom',
});

const rootElement = ref<HTMLElement | null>(null);
const contentElement = ref<HTMLElement | null>(null);
const open = ref(false);
const resolvedPlacement = ref<'bottom' | 'top'>('bottom');

function close(): void {
  open.value = false;
}

function toggle(): void {
  open.value = !open.value;
  if (open.value) void resolvePlacement();
}

async function resolvePlacement(): Promise<void> {
  resolvedPlacement.value = props.placement === 'top' ? 'top' : 'bottom';
  if (props.placement !== 'auto') return;
  await nextTick();
  const trigger = rootElement.value;
  const content = contentElement.value;
  if (!open.value || trigger === null || content === null) return;

  let scrollParent = trigger.parentElement;
  while (scrollParent !== null && !/(auto|scroll)/.test(getComputedStyle(scrollParent).overflowY)) {
    scrollParent = scrollParent.parentElement;
  }
  const bounds = scrollParent?.getBoundingClientRect() ?? {
    top: 0,
    bottom: window.innerHeight,
  };
  const triggerBounds = trigger.getBoundingClientRect();
  const gap = 8;
  const spaceBelow = bounds.bottom - triggerBounds.bottom - gap;
  const spaceAbove = triggerBounds.top - bounds.top - gap;
  if (spaceBelow < content.offsetHeight && spaceAbove > spaceBelow) {
    resolvedPlacement.value = 'top';
  }
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
    <div
      v-if="open"
      ref="contentElement"
      class="ui-popover__content"
      :class="{ 'ui-popover__content--top': resolvedPlacement === 'top' }"
    >
      <slot :close="close" />
    </div>
  </div>
</template>
