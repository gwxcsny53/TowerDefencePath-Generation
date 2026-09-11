<script setup lang="ts">
import { computed } from 'vue';

import { findProjectLevel } from '@/editor';
import type { EditorProject } from '@/editor';
import type { EditorImportPayload } from '@/io';

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
  <div v-if="open" class="import-dialog-backdrop" role="presentation">
    <section class="import-dialog" role="dialog" aria-modal="true" aria-label="导入">
      <header class="import-dialog-header"><h2>导入</h2></header>
      <div v-if="errorMessage !== null" class="import-dialog-content">
        <h3>无法导入文件</h3>
        <p>{{ errorMessage }}</p>
      </div>
      <div v-else-if="level !== null" class="import-dialog-content">
        <p>文件类型：关卡配置</p>
        <p>第 {{ level.level.chapter }} 章 · 第 {{ level.level.stage }} 关</p>
        <p>地图：{{ level.grid.cols }} × {{ level.grid.rows }}</p>
        <p v-if="levelConflict">该关卡已存在。</p>
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
      <footer class="import-dialog-actions">
        <template v-if="errorMessage !== null">
          <button type="button" @click="emit('close')">关闭</button>
        </template>
        <template v-else-if="level !== null && !levelConflict">
          <button type="button" @click="emit('import-level')">导入关卡</button>
          <button type="button" @click="emit('close')">取消</button>
        </template>
        <template v-else-if="level !== null">
          <button type="button" @click="emit('replace-level')">覆盖现有关卡</button>
          <button type="button" @click="emit('copy-level')">导入为副本</button>
          <button type="button" @click="emit('close')">取消</button>
        </template>
        <template v-else-if="backup !== null">
          <button type="button" @click="emit('replace-project')">替换当前项目</button>
          <button type="button" @click="emit('close')">取消</button>
        </template>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.import-dialog-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 55%);
}

.import-dialog {
  width: min(100%, 30rem);
  overflow: hidden;
  background: var(--color-panel-background);
  border: 1px solid var(--color-panel-border);
  border-radius: 0.5rem;
  box-shadow: 0 20px 40px rgb(15 23 42 / 35%);
}

.import-dialog-header,
.import-dialog-content,
.import-dialog-actions {
  padding: 1rem;
}

.import-dialog-header {
  border-bottom: 1px solid var(--color-panel-border);
}

.import-dialog-header h2,
.import-dialog-content h3,
.import-dialog-content p {
  margin: 0;
}

.import-dialog-content {
  display: grid;
  gap: 0.5rem;
}

.import-dialog-warning {
  color: #b45309;
}

.import-dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid var(--color-panel-border);
}
</style>
