<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <div class="property-row">
    <span class="property-row__label">{{ label }}</span>
    <span class="property-row__value"><slot /></span>
  </div>
</template>
