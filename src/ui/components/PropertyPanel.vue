<script setup lang="ts">
import { computed } from 'vue';
import type { EditorSelection } from '@/editor';
import type { LevelConfig } from '@/core/model';
import JunctionPanel from './JunctionPanel.vue';
import InspectorSection from './InspectorSection.vue';
import PropertyRow from './PropertyRow.vue';
import UiCheckbox from './base/UiCheckbox.vue';
import UiNumberInput from './base/UiNumberInput.vue';

const props = defineProps<{ level: LevelConfig; selection: EditorSelection | null }>();
const emit = defineEmits<{
  'update-tower-locked': [locked: boolean];
  'update-spawn-move-seconds-per-cell': [seconds: number];
  'create-junction-config': [];
  'remove-junction-config': [];
  'junction-entry-enabled': [direction: import('@/core/model').Direction, enabled: boolean];
  'junction-exit-enabled': [
    enterFrom: import('@/core/model').Direction,
    exitTo: import('@/core/model').Direction,
    enabled: boolean,
  ];
  'junction-exit-weight': [
    enterFrom: import('@/core/model').Direction,
    exitTo: import('@/core/model').Direction,
    weight: number,
  ];
}>();
const tower = computed(() => {
  const selected = props.selection;
  if (selected?.kind !== 'tower') return undefined;
  return props.level.towerNodes.find((node) => node.id === selected.id);
});
const spawn = computed(() => {
  const selected = props.selection;
  if (selected?.kind !== 'spawn') return undefined;
  return props.level.spawnPoints.find((node) => node.id === selected.id);
});
const selectionLabel = computed(() => {
  switch (props.selection?.kind) {
    case 'path':
      return '路线';
    case 'spawn':
      return '出生点';
    case 'end':
      return '终点';
    case 'tower':
      return '塔位';
    case 'junction':
      return '路口';
    default:
      return null;
  }
});
function updateTowerLocked(event: Event): void {
  if (event.target instanceof HTMLInputElement) emit('update-tower-locked', event.target.checked);
}
function updateSpawnMoveSecondsPerCell(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return;
  const seconds = event.target.valueAsNumber;
  if (Number.isFinite(seconds) && seconds > 0) {
    emit('update-spawn-move-seconds-per-cell', seconds);
    return;
  }
  event.target.value = spawn.value?.moveSecondsPerCell.toString() ?? '';
}
</script>

<template>
  <section class="inspector-panel">
    <header class="inspector-header">
      <span class="inspector-header__eyebrow">INSPECTOR</span>
      <template v-if="selection">
        <h2 class="inspector-header__title">{{ selectionLabel }}</h2>
        <p class="inspector-header__position">
          X {{ selection.position.x }} · Y {{ selection.position.y }}
        </p>
      </template>
    </header>

    <div class="inspector-content">
      <div v-if="selection === null" class="inspector-empty">
        <p>未选择对象</p>
        <p>选择地图元素后将在此显示属性</p>
      </div>
      <JunctionPanel
        v-else-if="selection.kind === 'junction'"
        :level="level"
        :position="selection.position"
        @create="$emit('create-junction-config')"
        @remove="$emit('remove-junction-config')"
        @entry-enabled="(direction, enabled) => $emit('junction-entry-enabled', direction, enabled)"
        @exit-enabled="
          (enterFrom, exitTo, enabled) => $emit('junction-exit-enabled', enterFrom, exitTo, enabled)
        "
        @exit-weight="
          (enterFrom, exitTo, weight) => $emit('junction-exit-weight', enterFrom, exitTo, weight)
        "
      />
      <template v-else>
        <InspectorSection label="BASIC">
          <PropertyRow label="类型">{{ selectionLabel }}</PropertyRow>
          <PropertyRow v-if="selection.kind !== 'path'" label="ID">{{ selection.id }}</PropertyRow>
          <PropertyRow label="位置">
            X {{ selection.position.x }} · Y {{ selection.position.y }}
          </PropertyRow>
        </InspectorSection>
        <InspectorSection v-if="selection.kind === 'tower' && tower" label="ADVANCED">
          <PropertyRow label="初始锁定">
            <UiCheckbox :checked="tower.locked" aria-label="初始锁定" @change="updateTowerLocked" />
          </PropertyRow>
        </InspectorSection>
        <InspectorSection v-if="selection.kind === 'spawn' && spawn" label="ADVANCED">
          <PropertyRow label="每格耗时">
            <span class="property-input-value">
              <UiNumberInput
                step="any"
                :value="spawn.moveSecondsPerCell"
                aria-label="每格耗时"
                @change="updateSpawnMoveSecondsPerCell"
              />
              秒
            </span>
          </PropertyRow>
        </InspectorSection>
      </template>
    </div>
  </section>
</template>
