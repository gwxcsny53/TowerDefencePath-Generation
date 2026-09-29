<script setup lang="ts">
import { useId } from 'vue';

type UiTooltipPlacement = 'top' | 'bottom';

withDefaults(
  defineProps<{
    text: string;
    shortcut?: string;
    placement?: UiTooltipPlacement;
  }>(),
  {
    shortcut: undefined,
    placement: 'top',
  },
);

const tooltipId = `ui-tooltip-${useId()}`;
</script>

<template>
  <span class="ui-tooltip">
    <slot :tooltip-id="tooltipId" />
    <span
      :id="tooltipId"
      class="ui-tooltip__content"
      :class="`ui-tooltip__content--${placement}`"
      role="tooltip"
    >
      <span>{{ text }}</span>
      <span v-if="shortcut" class="ui-tooltip__shortcut">{{ shortcut }}</span>
    </span>
  </span>
</template>
