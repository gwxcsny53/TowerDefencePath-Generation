<script setup lang="ts">
import { EDITOR_TOOLS } from '@/editor';
import type { EditorTool } from '@/editor';

defineProps<{ activeTool: EditorTool }>();
const emit = defineEmits<{ 'select-tool': [tool: EditorTool] }>();
const toolLabels: Record<EditorTool, string> = {
  select: '选择',
  path: '路线',
  spawn: '出生点',
  end: '终点',
  tower: '塔位',
  eraser: '橡皮擦',
};
</script>

<template>
  <section class="tool-palette" aria-label="编辑工具">
    <span class="tool-palette-label">工具</span>
    <div class="tool-palette-actions">
      <button
        v-for="tool in EDITOR_TOOLS"
        :key="tool"
        :class="{ 'is-active': activeTool === tool }"
        :aria-pressed="activeTool === tool"
        type="button"
        @click="emit('select-tool', tool)"
      >
        {{ toolLabels[tool] }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.tool-palette {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0 1rem;
  overflow: hidden;
  background: var(--color-panel-background);
  border-top: 1px solid var(--color-panel-border);
  border-bottom: 1px solid var(--color-panel-border);
}

.tool-palette-label {
  color: #475569;
  font-size: 0.875rem;
  font-weight: 650;
}

.tool-palette-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  overflow: auto hidden;
}

.tool-palette-actions button {
  flex: 0 0 auto;
  padding: 0.375rem 0.625rem;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
}

.tool-palette-actions button.is-active {
  color: #ffffff;
  background: #2563eb;
  border-color: #1d4ed8;
}
</style>
