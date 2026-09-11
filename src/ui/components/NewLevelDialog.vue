<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { findProjectLevel, isValidNewLevelSpec } from '@/editor';
import type { EditorProject, NewLevelSpec } from '@/editor';

const props = defineProps<{
  open: boolean;
  project: EditorProject;
  defaults: NewLevelSpec;
}>();
const emit = defineEmits<{ create: [spec: NewLevelSpec]; cancel: [] }>();
const chapter = ref(1);
const stage = ref(1);
const cols = ref(20);
const rows = ref(20);
const spec = computed<NewLevelSpec>(() => ({
  chapter: chapter.value,
  stage: stage.value,
  cols: cols.value,
  rows: rows.value,
}));
const isDuplicate = computed(() => findProjectLevel(props.project, spec.value) !== null);
const isValid = computed(() => isValidNewLevelSpec(spec.value) && !isDuplicate.value);
const errorMessage = computed(() => {
  if (isDuplicate.value) return `第 ${chapter.value} 章第 ${stage.value} 关已存在`;
  return '章节、关卡、宽度和高度必须是正整数。';
});
watch(
  () => props.open,
  (open) => {
    if (!open) return;
    chapter.value = props.defaults.chapter;
    stage.value = props.defaults.stage;
    cols.value = props.defaults.cols;
    rows.value = props.defaults.rows;
  },
);
function updateNumber(event: Event, target: 'chapter' | 'stage' | 'cols' | 'rows'): void {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  if (target === 'chapter') chapter.value = value;
  if (target === 'stage') stage.value = value;
  if (target === 'cols') cols.value = value;
  if (target === 'rows') rows.value = value;
}
function create(): void {
  if (isValid.value) emit('create', spec.value);
}
</script>

<template>
  <div v-if="open" class="new-level-backdrop" role="presentation">
    <section class="new-level-dialog" role="dialog" aria-modal="true" aria-label="新建关卡">
      <h2>新建关卡</h2>
      <label
        >章节<input
          type="number"
          min="1"
          step="1"
          :value="chapter"
          @input="updateNumber($event, 'chapter')"
      /></label>
      <label
        >关卡<input
          type="number"
          min="1"
          step="1"
          :value="stage"
          @input="updateNumber($event, 'stage')"
      /></label>
      <label
        >宽度（列）<input
          type="number"
          min="1"
          step="1"
          :value="cols"
          @input="updateNumber($event, 'cols')"
      /></label>
      <label
        >高度（行）<input
          type="number"
          min="1"
          step="1"
          :value="rows"
          @input="updateNumber($event, 'rows')"
      /></label>
      <p v-if="!isValid" class="new-level-error">{{ errorMessage }}</p>
      <div class="new-level-actions">
        <button type="button" :disabled="!isValid" @click="create">创建</button>
        <button type="button" @click="emit('cancel')">取消</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.new-level-backdrop {
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.35);
}
.new-level-dialog {
  display: grid;
  gap: 0.625rem;
  width: min(24rem, calc(100vw - 2rem));
  padding: 1rem;
  color: #0f172a;
  background: #fff;
  border-radius: 0.375rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.24);
}
.new-level-dialog h2,
.new-level-dialog p {
  margin: 0;
}
.new-level-dialog label {
  display: grid;
  gap: 0.25rem;
  color: #475569;
  font-size: 0.8125rem;
}
.new-level-dialog input {
  padding: 0.375rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
}
.new-level-error {
  color: #b91c1c;
  font-size: 0.75rem;
}
.new-level-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
