<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(defineProps<{ checked?: boolean; disabled?: boolean }>(), {
  checked: false,
  disabled: false,
});
</script>

<template>
  <input
    v-bind="$attrs"
    class="ui-checkbox"
    type="checkbox"
    :checked="checked"
    :disabled="disabled"
  />
</template>
