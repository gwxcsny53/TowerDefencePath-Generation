<script setup lang="ts">
import { computed } from 'vue';

import type { EditorTool } from '@/editor';
import UiButton from '@/ui/components/base/UiButton.vue';

const props = defineProps<{
  activeTool: EditorTool;
  cols: number;
  rows: number;
  persistenceStatus: 'loading' | 'saved' | 'saving' | 'error';
  validationStatus: 'not-run' | 'stale' | 'passed' | 'failed';
  errorCount: number;
  warningCount: number;
  validationOpen: boolean;
}>();
const emit = defineEmits<{ 'toggle-validation': [] }>();

const toolLabels: Record<EditorTool, string> = {
  select: '选择',
  path: '路线',
  spawn: '出生点',
  end: '终点',
  tower: '塔位',
  eraser: '橡皮擦',
};
const persistenceLabel = computed(() => {
  if (props.persistenceStatus === 'loading') return '读取中';
  if (props.persistenceStatus === 'saving') return '保存中';
  if (props.persistenceStatus === 'error') return '保存失败';
  return '已保存';
});
const validationLabel = computed(() => {
  if (props.validationStatus === 'not-run') return '尚未校验';
  if (props.validationStatus === 'stale') return '校验已过期';
  if (props.validationStatus === 'failed') {
    const warningSuffix = props.warningCount > 0 ? ` · ${props.warningCount} 条警告` : '';
    return `${props.errorCount} 个错误${warningSuffix}`;
  }
  if (props.warningCount > 0) return `${props.warningCount} 条警告`;
  return '校验通过';
});
</script>

<template>
  <footer class="status-bar" aria-label="编辑器状态">
    <span class="status-bar-item">{{ toolLabels[activeTool] }}</span>
    <span class="status-bar-item status-bar-grid">Grid {{ cols }} × {{ rows }}</span>
    <span class="status-bar-spacer"></span>
    <span class="status-bar-item" :class="`status-bar-persistence--${persistenceStatus}`">
      {{ persistenceLabel }}
    </span>
    <UiButton
      class="status-bar-validation"
      :class="`status-bar-validation--${validationStatus}`"
      variant="ghost"
      size="sm"
      :aria-expanded="validationOpen"
      aria-controls="validation-drawer"
      @click="emit('toggle-validation')"
    >
      {{ validationLabel }}
    </UiButton>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  height: 32px;
  padding: 0 var(--space-3);
  color: var(--text-muted);
  font-size: var(--font-size-metadata);
  background: var(--glass-g1-background);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-panel);
  box-shadow: var(--shadow-panel);
}

.status-bar-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-bar-grid {
  color: var(--text-secondary);
}

.status-bar-spacer {
  flex: 1 1 auto;
}

.status-bar-validation {
  max-width: 50%;
  padding: 0 var(--space-2);
}

.status-bar-validation:hover:not(:disabled) {
  color: var(--text-primary);
}

.status-bar-persistence--error,
.status-bar-validation--failed {
  color: var(--status-danger);
}

.status-bar-validation--passed {
  color: var(--status-success);
}

.status-bar-validation--stale {
  color: var(--status-warning);
}
</style>
