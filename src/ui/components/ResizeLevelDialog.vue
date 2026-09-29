<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { analyzeLevelResize, isValidGridResizeTarget } from '@/editor';
import type { GridResizeTarget, LevelResizeImpact } from '@/editor';
import type { LevelConfig } from '@/core/model';
import UiButton from '@/ui/components/base/UiButton.vue';
import UiDialog from '@/ui/components/base/UiDialog.vue';
import UiNumberInput from '@/ui/components/base/UiNumberInput.vue';

const props = defineProps<{ open: boolean; level: LevelConfig }>();
const emit = defineEmits<{ resize: [target: GridResizeTarget]; cancel: [] }>();
const rows = ref(props.level.grid.rows);
const cols = ref(props.level.grid.cols);
const target = computed<GridResizeTarget>(() => ({ rows: rows.value, cols: cols.value }));
const isTargetValid = computed(() => isValidGridResizeTarget(target.value));
const isSameSize = computed(
  () =>
    isTargetValid.value &&
    rows.value === props.level.grid.rows &&
    cols.value === props.level.grid.cols,
);
const isShrink = computed(
  () =>
    isTargetValid.value &&
    (rows.value < props.level.grid.rows || cols.value < props.level.grid.cols),
);
const impact = computed<LevelResizeImpact>(() => analyzeLevelResize(props.level, target.value));
const growthDescription = computed(() => {
  if (!isTargetValid.value || isShrink.value || isSameSize.value) return null;
  if (cols.value > props.level.grid.cols && rows.value > props.level.grid.rows)
    return '新增区域将出现在地图右侧和底部，现有坐标不会改变。';
  if (cols.value > props.level.grid.cols) return '新增区域将出现在地图右侧，现有坐标不会改变。';
  return '新增区域将出现在地图底部，现有坐标不会改变。';
});

watch(
  [() => props.level, () => props.open],
  () => {
    if (!props.open) return;
    rows.value = props.level.grid.rows;
    cols.value = props.level.grid.cols;
  },
  { immediate: true },
);

function updateRows(event: Event): void {
  rows.value = (event.target as HTMLInputElement).valueAsNumber;
}

function updateCols(event: Event): void {
  cols.value = (event.target as HTMLInputElement).valueAsNumber;
}

function applyResize(): void {
  if (!isTargetValid.value || isSameSize.value) return;
  emit('resize', target.value);
}
</script>

<template>
  <UiDialog :open="open" title="调整地图尺寸" size="md" @close-request="emit('cancel')">
    <div class="resize-dialog-content">
      <p>当前尺寸：{{ level.grid.cols }} × {{ level.grid.rows }}</p>
      <label>
        宽度（列）
        <UiNumberInput
          data-autofocus
          min="1"
          step="1"
          :value="cols"
          :aria-invalid="!isTargetValid"
          @input="updateCols"
        />
      </label>
      <label>
        高度（行）
        <UiNumberInput
          min="1"
          step="1"
          :value="rows"
          :aria-invalid="!isTargetValid"
          @input="updateRows"
        />
      </label>
      <p v-if="!isTargetValid" class="resize-dialog-warning">请输入大于 0 的整数尺寸。</p>
      <p v-else-if="growthDescription !== null">{{ growthDescription }}</p>
      <template v-else-if="isShrink">
        <p>缩小地图会从右侧和/或底部裁切网格。</p>
        <p>保留在范围内的路口配置不会自动修改；裁切路线后可能需要重新校验路口配置。</p>
        <p v-if="impact.hasDataLoss" class="resize-dialog-warning">
          调整尺寸将删除超出新地图范围的数据。
        </p>
        <ul v-if="impact.hasDataLoss" class="resize-dialog-impact">
          <li v-if="impact.removedPathCellCount > 0">路线格：{{ impact.removedPathCellCount }}</li>
          <li v-if="impact.removedSpawnCount > 0">出生点：{{ impact.removedSpawnCount }}</li>
          <li v-if="impact.removedEndCount > 0">终点：{{ impact.removedEndCount }}</li>
          <li v-if="impact.removedTowerCount > 0">塔位：{{ impact.removedTowerCount }}</li>
          <li v-if="impact.removedJunctionCount > 0">
            路口配置：{{ impact.removedJunctionCount }}
          </li>
        </ul>
        <p v-else>被裁切区域当前没有地图内容。</p>
      </template>
    </div>
    <template #footer>
      <UiButton variant="secondary" @click="emit('cancel')">取消</UiButton>
      <UiButton
        :variant="impact.hasDataLoss ? 'danger' : 'primary'"
        :disabled="!isTargetValid || isSameSize"
        @click="applyResize"
      >
        {{ impact.hasDataLoss ? '确认裁切并调整' : '应用尺寸' }}
      </UiButton>
    </template>
  </UiDialog>
</template>

<style scoped>
.resize-dialog-content p {
  margin: 0;
}

.resize-dialog-content {
  display: grid;
  gap: var(--space-3);
}

.resize-dialog-content label {
  display: grid;
  gap: var(--space-1);
  color: var(--text-secondary);
  font-size: var(--font-size-control);
}

.resize-dialog-warning {
  color: var(--status-warning);
  font-weight: var(--font-weight-semibold);
}

.resize-dialog-impact {
  display: grid;
  gap: var(--space-1);
  margin: 0;
  padding-left: var(--space-6);
  color: var(--text-secondary);
  font-size: var(--font-size-control);
}
</style>
