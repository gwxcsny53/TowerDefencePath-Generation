<script setup lang="ts">
import UiButton from '@/ui/components/base/UiButton.vue';
import UiDialog from '@/ui/components/base/UiDialog.vue';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; 'export-game-config': []; 'export-project': [] }>();
</script>

<template>
  <UiDialog :open="open" title="导出" size="md" @close-request="emit('close')">
    <div class="export-dialog-content">
      <section class="export-dialog-action-row">
        <UiButton variant="secondary" @click="emit('export-game-config')">
          导出游戏关卡配置
        </UiButton>
        <p>用于游戏运行时读取，包含当前项目内的全部关卡配置。</p>
      </section>
      <section class="export-dialog-action-row">
        <UiButton variant="secondary" @click="emit('export-project')">导出项目备份</UiButton>
        <p>包含当前项目的全部关卡，用于编辑器备份和恢复。</p>
      </section>
    </div>
    <template #footer>
      <UiButton variant="secondary" @click="emit('close')">取消</UiButton>
    </template>
  </UiDialog>
</template>

<style scoped>
.export-dialog-content {
  display: grid;
  gap: var(--space-4);
}

.export-dialog-action-row {
  display: grid;
  justify-items: start;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--control-background);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-control);
}

.export-dialog-action-row p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-metadata);
  line-height: 1.5;
}
</style>
