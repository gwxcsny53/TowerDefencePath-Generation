<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue';

type UiDialogSize = 'compact' | 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    size?: UiDialogSize;
    closeOnEscape?: boolean;
  }>(),
  {
    size: 'md',
    closeOnEscape: true,
  },
);
const emit = defineEmits<{ 'close-request': [] }>();
const slots = useSlots();
const dialogElement = ref<HTMLElement | null>(null);
const titleId = `ui-dialog-title-${useId()}`;
let previousFocus: HTMLElement | null = null;

function focusDialogEntry(): void {
  const dialog = dialogElement.value;
  if (dialog === null) return;
  const target = dialog.querySelector<HTMLElement>(
    '[data-autofocus], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
  );
  (target ?? dialog).focus({ preventScroll: true });
}

function handleKeyDown(event: KeyboardEvent): void {
  if (!props.open || !props.closeOnEscape || event.key !== 'Escape') return;
  event.preventDefault();
  emit('close-request');
}

watch(
  () => props.open,
  async (open, wasOpen) => {
    if (open) {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      await nextTick();
      focusDialogEntry();
      return;
    }
    if (wasOpen && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  },
  { immediate: true },
);

onMounted(() => window.addEventListener('keydown', handleKeyDown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown));
</script>

<template>
  <div v-if="open" class="ui-dialog-backdrop" role="presentation">
    <section
      ref="dialogElement"
      class="ui-dialog"
      :class="`ui-dialog--${size}`"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
    >
      <header class="ui-dialog__header">
        <slot name="header">
          <h2 :id="titleId" class="ui-dialog__title">{{ title }}</h2>
        </slot>
      </header>
      <div class="ui-dialog__content">
        <slot />
      </div>
      <footer v-if="slots.footer" class="ui-dialog__footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>
