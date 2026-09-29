<script setup lang="ts">
import { useId } from 'vue';

defineProps<{
  text: string;
  shortcut?: string;
}>();

const tooltipId = `ui-tooltip-${useId()}`;
</script>

<template>
  <span class="ui-tooltip">
    <slot :tooltip-id="tooltipId" />
    <span :id="tooltipId" class="ui-tooltip__content" role="tooltip">
      <span>{{ text }}</span>
      <span v-if="shortcut" class="ui-tooltip__shortcut">{{ shortcut }}</span>
    </span>
  </span>
</template>
