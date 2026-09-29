<script setup lang="ts">
withDefaults(defineProps<{ label: string; tone?: 'default' | 'danger' }>(), {
  tone: 'default',
});
</script>

<template>
  <section class="inspector-section" :class="{ 'inspector-section--danger': tone === 'danger' }">
    <h3 class="inspector-section__title">{{ label }}</h3>
    <div class="inspector-section__content"><slot /></div>
  </section>
</template>
