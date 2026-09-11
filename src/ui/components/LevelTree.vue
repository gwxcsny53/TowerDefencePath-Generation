<script setup lang="ts">
import { computed, ref } from 'vue';

import { getProjectChapters } from '@/editor';
import type { EditorProject, LevelAddress } from '@/editor';

const props = defineProps<{
  project: EditorProject;
  activeLevelAddress: LevelAddress;
}>();
const emit = defineEmits<{
  'select-level': [address: LevelAddress];
  'create-level': [];
  'duplicate-current': [];
  'delete-current': [];
}>();
const chapters = computed(() => getProjectChapters(props.project));
const deleteConfirmationPending = ref(false);
const canDelete = computed(() => props.project.levels.length > 1);
function isActive(address: LevelAddress): boolean {
  return (
    address.chapter === props.activeLevelAddress.chapter &&
    address.stage === props.activeLevelAddress.stage
  );
}
function selectLevel(address: LevelAddress): void {
  deleteConfirmationPending.value = false;
  emit('select-level', address);
}
function requestDelete(): void {
  if (!canDelete.value) return;
  if (deleteConfirmationPending.value) {
    deleteConfirmationPending.value = false;
    emit('delete-current');
  } else {
    deleteConfirmationPending.value = true;
  }
}
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <h2 class="panel-title">{{ project.name }}</h2>
      <div class="level-tree-actions" aria-label="关卡操作">
        <button type="button" @click="emit('create-level')">新建</button>
        <button type="button" @click="emit('duplicate-current')">复制</button>
        <button
          type="button"
          :disabled="!canDelete"
          :title="canDelete ? undefined : '项目至少需要保留一个关卡'"
          @click="requestDelete"
        >
          {{ deleteConfirmationPending ? '确认删除' : '删除' }}
        </button>
        <button
          v-if="deleteConfirmationPending"
          type="button"
          @click="deleteConfirmationPending = false"
        >
          取消
        </button>
      </div>
    </header>

    <div class="panel-content level-tree-content">
      <section v-for="chapter in chapters" :key="chapter.chapter" class="level-tree-chapter">
        <h3>第 {{ chapter.chapter }} 章</h3>
        <button
          v-for="level in chapter.levels"
          :key="`${level.level.chapter}-${level.level.stage}`"
          type="button"
          class="level-tree-row"
          :class="{ 'level-tree-row--active': isActive(level.level) }"
          :aria-current="isActive(level.level) ? 'true' : undefined"
          @click="selectLevel(level.level)"
        >
          第 {{ level.level.stage }} 关
        </button>
      </section>
    </div>
  </section>
</template>

<style scoped>
.level-tree-actions {
  display: flex;
  gap: 0.25rem;
}

.level-tree-actions button,
.level-tree-row {
  padding: 0.25rem 0.375rem;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.level-tree-content {
  padding: 0.75rem;
}
.level-tree-chapter + .level-tree-chapter {
  margin-top: 0.75rem;
}
.level-tree-chapter h3 {
  margin: 0 0 0.25rem;
  color: #475569;
  font-size: 0.8125rem;
}
.level-tree-row {
  display: block;
  width: 100%;
  margin-top: 0.125rem;
  color: #475569;
  text-align: left;
  cursor: pointer;
}
.level-tree-row:hover {
  background: #e0f2fe;
}
.level-tree-row--active {
  color: #075985;
  background: #bae6fd;
  border-color: #38bdf8;
}
</style>
