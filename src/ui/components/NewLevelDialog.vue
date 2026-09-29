<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { findProjectLevel, isValidNewLevelSpec } from '@/editor';
import type { EditorProject, NewLevelSpec } from '@/editor';
import UiButton from '@/ui/components/base/UiButton.vue';
import UiDialog from '@/ui/components/base/UiDialog.vue';
import UiNumberInput from '@/ui/components/base/UiNumberInput.vue';

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
  <UiDialog :open="open" title="新建关卡" size="sm" @close-request="emit('cancel')">
    <div class="new-level-content">
      <label>
        章节
        <UiNumberInput
          data-autofocus
          min="1"
          step="1"
          :value="chapter"
          @input="updateNumber($event, 'chapter')"
        />
      </label>
      <label>
        关卡
        <UiNumberInput min="1" step="1" :value="stage" @input="updateNumber($event, 'stage')" />
      </label>
      <label>
        宽度（列）
        <UiNumberInput min="1" step="1" :value="cols" @input="updateNumber($event, 'cols')" />
      </label>
      <label>
        高度（行）
        <UiNumberInput min="1" step="1" :value="rows" @input="updateNumber($event, 'rows')" />
      </label>
      <p v-if="!isValid" class="new-level-error">{{ errorMessage }}</p>
    </div>
    <template #footer>
      <UiButton variant="secondary" @click="emit('cancel')">取消</UiButton>
      <UiButton variant="primary" :disabled="!isValid" @click="create">创建</UiButton>
    </template>
  </UiDialog>
</template>

<style scoped>
.new-level-content {
  display: grid;
  gap: var(--space-3);
}

.new-level-content p {
  margin: 0;
}

.new-level-content label {
  display: grid;
  gap: var(--space-1);
  color: var(--text-secondary);
  font-size: var(--font-size-control);
}

.new-level-error {
  color: var(--status-danger);
  font-size: var(--font-size-metadata);
}
</style>
