<script setup lang="ts">
import { computed } from 'vue';

import { findProjectLevel } from '@/editor';
import type { EditorProject } from '@/editor';
import type { EditorImportPayload } from '@/io';
import UiButton from '@/ui/components/base/UiButton.vue';
import UiDialog from '@/ui/components/base/UiDialog.vue';

const props = defineProps<{
  open: boolean;
  project: EditorProject;
  payload: EditorImportPayload | null;
  errorMessage: string | null;
}>();
const emit = defineEmits<{
  close: [];
  'import-level': [];
  'replace-level': [];
  'copy-level': [];
  'replace-project': [];
}>();

const level = computed(() => (props.payload?.kind === 'level' ? props.payload.level : null));
const backup = computed(() =>
  props.payload?.kind === 'project-backup' ? props.payload.backup : null,
);
const levelConflict = computed(
  () => level.value !== null && findProjectLevel(props.project, level.value.level) !== null,
);
</script>

<template>
  <UiDialog :open="open" title="导入" size="lg" @close-request="emit('close')">
    <div v-if="errorMessage !== null" class="import-dialog-content">
      <h3>无法导入文件</h3>
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else-if="level !== null" class="import-dialog-content">
      <p>文件类型：关卡配置</p>
      <p>第 {{ level.level.chapter }} 章 · 第 {{ level.level.stage }} 关</p>
      <p>地图：{{ level.grid.cols }} × {{ level.grid.rows }}</p>
      <p v-if="levelConflict" class="import-dialog-warning">该关卡已存在。</p>
    </div>
    <div v-else-if="backup !== null" class="import-dialog-content">
      <p>项目备份</p>
      <p>项目：{{ backup.project.name }}</p>
      <p>关卡数量：{{ backup.project.levels.length }}</p>
      <p>
        上次关卡：第 {{ backup.activeLevelAddress.chapter }} 章 · 第
        {{ backup.activeLevelAddress.stage }} 关
      </p>
      <p class="import-dialog-warning">导入项目备份将替换当前项目中的全部关卡。</p>
    </div>
    <template #footer>
      <template v-if="errorMessage !== null">
        <UiButton variant="secondary" @click="emit('close')">关闭</UiButton>
      </template>
      <template v-else-if="level !== null && !levelConflict">
        <UiButton variant="secondary" @click="emit('close')">取消</UiButton>
        <UiButton variant="primary" @click="emit('import-level')">导入关卡</UiButton>
      </template>
      <template v-else-if="level !== null">
        <UiButton variant="secondary" @click="emit('close')">取消</UiButton>
        <UiButton variant="secondary" @click="emit('copy-level')">导入为副本</UiButton>
        <UiButton variant="danger" @click="emit('replace-level')">覆盖现有关卡</UiButton>
      </template>
      <template v-else-if="backup !== null">
        <UiButton variant="secondary" @click="emit('close')">取消</UiButton>
        <UiButton variant="danger" @click="emit('replace-project')">替换当前项目</UiButton>
      </template>
    </template>
  </UiDialog>
</template>

<style scoped>
.import-dialog-content h3,
.import-dialog-content p {
  margin: 0;
}

.import-dialog-content {
  display: grid;
  gap: var(--space-2);
}

.import-dialog-content h3 {
  color: var(--text-primary);
  font-size: var(--font-size-panel-title);
}

.import-dialog-warning {
  color: var(--status-warning);
}
</style>
