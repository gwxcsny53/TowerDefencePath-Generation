<script setup lang="ts">
type UiIconButtonSize = 'compact' | 'normal' | 'tool';

withDefaults(
  defineProps<{
    label: string;
    size?: UiIconButtonSize;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    size: 'normal',
    disabled: false,
    type: 'button',
  },
);
</script>

<template>
  <button
    class="ui-icon-button"
    :class="`ui-icon-button--${size}`"
    :type="type"
    :disabled="disabled"
    :aria-label="label"
  >
    <slot />
  </button>
</template>
