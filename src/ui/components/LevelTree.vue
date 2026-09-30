<script setup lang="ts">
import { computed, nextTick, onMounted, onUpdated, ref, watch } from 'vue';

import { getProjectChapters } from '@/editor';
import type { EditorProject, LevelAddress } from '@/editor';
import { Plus } from 'lucide-vue-next';
import DeleteLevelDialog from './DeleteLevelDialog.vue';
import LevelActionsMenu from './LevelActionsMenu.vue';
import UiIconButton from './base/UiIconButton.vue';
import UiLiquidIndicator from './base/UiLiquidIndicator.vue';
import { useLiquidIndicator } from '@/ui/composables/useLiquidIndicator';

const props = defineProps<{
  project: EditorProject;
  activeLevelAddress: LevelAddress;
}>();
const emit = defineEmits<{
  'select-level': [address: LevelAddress];
  'create-level': [];
  'duplicate-current': [];
  'resize-current': [];
  'delete-current': [];
  'delete-dialog-open-change': [open: boolean];
}>();
const chapters = computed(() => getProjectChapters(props.project));
const isDeleteDialogOpen = ref(false);
const canDelete = computed(() => props.project.levels.length > 1);
const content = ref<HTMLElement | null>(null);
const indicator = useLiquidIndicator(content);
const { x, y, width, height, ready, motionRevision } = indicator;
function measureActiveLevel(): void {
  indicator.setTarget(
    content.value?.querySelector<HTMLElement>('.level-panel__row--active') ?? null,
  );
}
onMounted(measureActiveLevel);
onUpdated(measureActiveLevel);
watch(
  () => [props.activeLevelAddress.chapter, props.activeLevelAddress.stage],
  async () => {
    await nextTick();
    measureActiveLevel();
  },
  { flush: 'post' },
);
function isActive(address: LevelAddress): boolean {
  return (
    address.chapter === props.activeLevelAddress.chapter &&
    address.stage === props.activeLevelAddress.stage
  );
}
function selectLevel(address: LevelAddress): void {
  closeDeleteDialog();
  emit('select-level', address);
}
function openDeleteDialog(): void {
  if (!canDelete.value) return;
  isDeleteDialogOpen.value = true;
  emit('delete-dialog-open-change', true);
}
function closeDeleteDialog(): void {
  if (!isDeleteDialogOpen.value) return;
  isDeleteDialogOpen.value = false;
  emit('delete-dialog-open-change', false);
}
function confirmDelete(): void {
  if (!canDelete.value) return;
  closeDeleteDialog();
  emit('delete-current');
}
</script>

<template>
  <section class="level-panel">
    <header class="level-panel__header">
      <h2 class="level-panel__project-name">{{ project.name }}</h2>
      <UiIconButton label="新建关卡" size="compact" @click="emit('create-level')">
        <Plus :size="16" aria-hidden="true" />
      </UiIconButton>
    </header>

    <div ref="content" class="level-panel__content">
      <UiLiquidIndicator
        :x="x"
        :y="y"
        :width="width"
        :height="height"
        :ready="ready"
        :motion-revision="motionRevision"
        variant="level"
      />
      <section v-for="chapter in chapters" :key="chapter.chapter" class="level-panel__chapter">
        <h3>第 {{ chapter.chapter }} 章</h3>
        <div
          v-for="level in chapter.levels"
          :key="`${level.level.chapter}-${level.level.stage}`"
          class="level-panel__row"
          :class="{ 'level-panel__row--active': isActive(level.level) }"
        >
          <button
            type="button"
            class="level-panel__select"
            :aria-current="isActive(level.level) ? 'true' : undefined"
            @click="selectLevel(level.level)"
          >
            <span class="level-panel__active-dot"></span>
            第 {{ level.level.stage }} 关
          </button>
          <LevelActionsMenu
            v-if="isActive(level.level)"
            :can-delete="canDelete"
            @duplicate="emit('duplicate-current')"
            @resize="emit('resize-current')"
            @delete="openDeleteDialog"
          />
        </div>
      </section>
    </div>
    <DeleteLevelDialog
      :open="isDeleteDialogOpen"
      :address="activeLevelAddress"
      @cancel="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </section>
</template>
