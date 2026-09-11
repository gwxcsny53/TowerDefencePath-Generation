<script setup lang="ts">
defineProps<{ canUndo: boolean; canRedo: boolean }>();
const emit = defineEmits<{ undo: []; redo: [] }>();
</script>

<template>
  <header class="top-toolbar">
    <h1 class="top-toolbar-title">Tower Defense Path Editor</h1>

    <nav class="top-toolbar-actions" aria-label="编辑器操作">
      <button type="button" disabled>项目</button>
      <button type="button" disabled>导入</button>
      <button type="button" disabled>导出</button>
      <button type="button" :disabled="!canUndo" title="撤销（Ctrl/Cmd+Z）" @click="emit('undo')">
        撤销
      </button>
      <button
        type="button"
        :disabled="!canRedo"
        title="重做（Ctrl/Cmd+Y 或 Ctrl/Cmd+Shift+Z）"
        @click="emit('redo')"
      >
        重做
      </button>
      <button type="button" disabled>校验</button>
      <button type="button" disabled>测试路线</button>
    </nav>
  </header>
</template>

<style scoped>
.top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
  padding: 0 1rem;
  color: var(--color-toolbar-text);
  background: var(--color-toolbar-background);
}

.top-toolbar-title {
  margin: 0;
  overflow: hidden;
  font-size: 1rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.375rem;
  min-width: 0;
  overflow: hidden;
}

.top-toolbar-actions button {
  padding: 0.375rem 0.5rem;
  color: var(--color-toolbar-muted);
  background: transparent;
  border: 1px solid #334155;
  border-radius: 0.25rem;
  white-space: nowrap;
}

.top-toolbar-actions button:disabled {
  opacity: 0.8;
}
</style>
