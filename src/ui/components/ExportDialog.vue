<script setup lang="ts">
defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; 'export-level': []; 'export-project': [] }>();
</script>

<template>
  <div v-if="open" class="export-dialog-backdrop" role="presentation">
    <section class="export-dialog" role="dialog" aria-modal="true" aria-label="导出">
      <header class="export-dialog-header">
        <h2>导出</h2>
      </header>
      <div class="export-dialog-content">
        <button type="button" @click="emit('export-level')">导出当前关卡 JSON</button>
        <p>用于游戏运行时读取，只包含当前 LevelConfig。</p>
        <button type="button" @click="emit('export-project')">导出项目备份</button>
        <p>包含当前项目的全部关卡，用于编辑器备份和恢复。</p>
      </div>
      <footer class="export-dialog-actions">
        <button type="button" @click="emit('close')">取消</button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.export-dialog-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 55%);
}

.export-dialog {
  width: min(100%, 28rem);
  overflow: hidden;
  background: var(--color-panel-background);
  border: 1px solid var(--color-panel-border);
  border-radius: 0.5rem;
  box-shadow: 0 20px 40px rgb(15 23 42 / 35%);
}

.export-dialog-header,
.export-dialog-content,
.export-dialog-actions {
  padding: 1rem;
}

.export-dialog-header {
  border-bottom: 1px solid var(--color-panel-border);
}

.export-dialog-header h2,
.export-dialog-content p {
  margin: 0;
}

.export-dialog-content {
  display: grid;
  gap: 0.5rem;
}

.export-dialog-content p {
  margin-bottom: 0.75rem;
  color: var(--color-panel-muted);
  font-size: 0.875rem;
}

.export-dialog-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--color-panel-border);
}
</style>
