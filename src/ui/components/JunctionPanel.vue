<script setup lang="ts">
import { computed } from 'vue';
import { DIRECTIONS } from '@/core/model';
import type { Direction, LevelConfig } from '@/core/model';
import { getJunctionEditorState } from '@/editor';
import type { GridPosition } from '@/core/model';
import InspectorSection from './InspectorSection.vue';
import PropertyRow from './PropertyRow.vue';
import UiButton from './base/UiButton.vue';
import UiCheckbox from './base/UiCheckbox.vue';
import UiNumberInput from './base/UiNumberInput.vue';
const props = defineProps<{ level: LevelConfig; position: Readonly<GridPosition> }>();
const emit = defineEmits<{
  create: [];
  remove: [];
  'entry-enabled': [direction: Direction, enabled: boolean];
  'exit-enabled': [enterFrom: Direction, exitTo: Direction, enabled: boolean];
  'exit-weight': [enterFrom: Direction, exitTo: Direction, weight: number];
}>();
const state = computed(() => getJunctionEditorState(props.level, props.position));
const sideLabel: Record<Direction, string> = {
  up: '上侧',
  down: '下侧',
  left: '左侧',
  right: '右侧',
};
function entryLabel(direction: Direction): string {
  return `允许从${sideLabel[direction]}进入`;
}
function exitLabel(direction: Direction): string {
  return `向${sideLabel[direction]}离开`;
}
function isEntryEnabled(direction: Direction): boolean {
  return state.value.transitions.some((transition) => transition.enterFrom === direction);
}
function isExitEnabled(enterFrom: Direction, exitTo: Direction): boolean {
  return (
    state.value.transitions
      .find((transition) => transition.enterFrom === enterFrom)
      ?.exits.some((exit) => exit.exitTo === exitTo) ?? false
  );
}
function entryDisabled(direction: Direction): boolean {
  return (
    !isEntryEnabled(direction) &&
    (!state.value.physicalDirections.includes(direction) ||
      state.value.exitDirections.includes(direction))
  );
}
function exitDisabled(enterFrom: Direction, exitTo: Direction): boolean {
  return (
    !isExitEnabled(enterFrom, exitTo) &&
    (exitTo === enterFrom ||
      !state.value.physicalDirections.includes(exitTo) ||
      state.value.entryDirections.includes(exitTo))
  );
}
function disabledReason(enterFrom: Direction, exitTo?: Direction): string | null {
  const direction = exitTo ?? enterFrom;
  if (exitTo === undefined && state.value.exitDirections.includes(direction)) {
    return '该方向已被用作离开方向';
  }
  if (exitTo !== undefined && state.value.entryDirections.includes(direction)) {
    return '该方向已被用作进入方向';
  }
  if (!state.value.physicalDirections.includes(direction)) return '该方向没有物理连接';
  if (exitTo === enterFrom) return '不能原路返回';
  return null;
}
function weightSum(enterFrom: Direction): number {
  return (
    state.value.transitions
      .find((transition) => transition.enterFrom === enterFrom)
      ?.exits.reduce((sum, exit) => sum + exit.weight, 0) ?? 0
  );
}
function isWeightSumValid(enterFrom: Direction): boolean {
  return Math.abs(weightSum(enterFrom) - 1) < 1e-6;
}
function weight(event: Event, enterFrom: Direction, exitTo: Direction): void {
  if (event.target instanceof HTMLInputElement && Number.isFinite(event.target.valueAsNumber))
    emit('exit-weight', enterFrom, exitTo, event.target.valueAsNumber);
}
function entry(event: Event, direction: Direction): void {
  if (event.target instanceof HTMLInputElement)
    emit('entry-enabled', direction, event.target.checked);
}
function toggleExit(event: Event, enterFrom: Direction, exitTo: Direction): void {
  if (event.target instanceof HTMLInputElement)
    emit('exit-enabled', enterFrom, exitTo, event.target.checked);
}
</script>
<template>
  <section class="junction-panel">
    <InspectorSection label="BASIC">
      <PropertyRow label="位置">X {{ state.position.x }} · Y {{ state.position.y }}</PropertyRow>
      <PropertyRow v-if="state.junctionId" label="ID">{{ state.junctionId }}</PropertyRow>
      <PropertyRow label="当前连接">
        {{ state.physicalDirections.map((direction) => sideLabel[direction]).join('、') || '无' }}
      </PropertyRow>
    </InspectorSection>
    <p v-if="!state.isCandidate && state.junctionId" class="junction-notice">
      当前已不是路口候选；可删除过期配置。
    </p>
    <p v-if="state.conflictingDirections.length > 0" class="junction-warning">
      方向角色冲突：{{
        state.conflictingDirections.map((direction) => sideLabel[direction]).join('、')
      }}
      同时被用作进入和离开方向。已启用项仍可关闭以修复配置。
    </p>
    <UiButton
      v-if="state.junctionId === null && state.isCandidate"
      variant="primary"
      size="sm"
      @click="emit('create')"
    >
      创建路口配置
    </UiButton>
    <template v-else-if="state.junctionId">
      <InspectorSection label="CONNECTIONS">
        <div class="junction-connection-label">允许进入方向</div>
        <article v-for="direction in DIRECTIONS" :key="direction" class="junction-entry-rule">
          <label class="junction-rule-label">
            <UiCheckbox
              :checked="isEntryEnabled(direction)"
              :disabled="entryDisabled(direction)"
              @change="entry($event, direction)"
            />
            {{ entryLabel(direction) }}
          </label>
          <p v-if="entryDisabled(direction)" class="junction-disabled-reason">
            {{ disabledReason(direction) }}
          </p>
          <template v-if="isEntryEnabled(direction)">
            <div class="junction-exits">
              <div class="junction-exits-header">
                <span>可离开方向</span>
                <span :class="{ 'junction-warning-text': !isWeightSumValid(direction) }">
                  权重和：{{ weightSum(direction).toFixed(2) }}
                </span>
              </div>
              <p v-if="weightSum(direction) === 0" class="junction-warning-text">
                请至少启用一个离开方向。
              </p>
              <p v-else-if="!isWeightSumValid(direction)" class="junction-warning-text">
                离开方向权重和必须为 1。
              </p>
              <div
                v-for="exitDirection in DIRECTIONS"
                :key="exitDirection"
                class="junction-exit-row"
              >
                <label class="junction-rule-label">
                  <UiCheckbox
                    :checked="isExitEnabled(direction, exitDirection)"
                    :disabled="exitDisabled(direction, exitDirection)"
                    @change="toggleExit($event, direction, exitDirection)"
                  />
                  {{ exitLabel(exitDirection) }}
                </label>
                <UiNumberInput
                  v-if="isExitEnabled(direction, exitDirection)"
                  class="junction-weight-input"
                  min="0.01"
                  max="1"
                  step="0.01"
                  :value="
                    state.transitions
                      .find((transition) => transition.enterFrom === direction)
                      ?.exits.find((exit) => exit.exitTo === exitDirection)?.weight
                  "
                  aria-label="离开权重"
                  @change="weight($event, direction, exitDirection)"
                />
                <span
                  v-else-if="exitDisabled(direction, exitDirection)"
                  class="junction-disabled-reason"
                >
                  {{ disabledReason(direction, exitDirection) }}
                </span>
              </div>
            </div>
          </template>
        </article>
      </InspectorSection>
      <InspectorSection label="DANGER ZONE" tone="danger">
        <UiButton variant="danger" size="sm" @click="emit('remove')">删除路口配置</UiButton>
      </InspectorSection>
    </template>
  </section>
</template>
