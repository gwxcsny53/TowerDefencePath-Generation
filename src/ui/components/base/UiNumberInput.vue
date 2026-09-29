<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    value?: string | number;
    disabled?: boolean;
  }>(),
  {
    value: '',
    disabled: false,
  },
);
</script>

<template>
  <input
    v-bind="$attrs"
    class="ui-number-input"
    type="number"
    :value="value"
    :disabled="disabled"
  />
</template>
