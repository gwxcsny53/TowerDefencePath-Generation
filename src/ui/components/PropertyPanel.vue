<script setup lang="ts">
import { computed } from 'vue';
import type { EditorSelection } from '@/editor';
import type { LevelConfig } from '@/core/model';
import JunctionPanel from './JunctionPanel.vue';

const props = defineProps<{ level: LevelConfig; selection: EditorSelection | null }>();
const emit = defineEmits<{
  'update-tower-locked': [locked: boolean];
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
function updateTowerLocked(event: Event): void {
  if (event.target instanceof HTMLInputElement) emit('update-tower-locked', event.target.checked);
}
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <h2 class="panel-title">属性</h2>
    </header>

    <div class="panel-content">
      <div v-if="selection === null" class="empty-state">
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
      <dl v-else class="property-list">
        <template v-if="selection.kind === 'path'"
          ><dt>类型</dt>
          <dd>路线</dd></template
        >
        <template v-else
          ><dt>类型</dt>
          <dd>
            {{ selection.kind === 'spawn' ? '出生点' : selection.kind === 'end' ? '终点' : '塔位' }}
          </dd>
          <dt>ID</dt>
          <dd>{{ selection.id }}</dd></template
        >
        <dt>X</dt>
        <dd>{{ selection.position.x }}</dd>
        <dt>Y</dt>
        <dd>{{ selection.position.y }}</dd>
        <template v-if="selection.kind === 'tower' && tower"
          ><dt>初始锁定</dt>
          <dd><input type="checkbox" :checked="tower.locked" @change="updateTowerLocked" /></dd
        ></template>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.property-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.625rem 0.75rem;
  margin: 0;
  padding: 1rem;
  color: #475569;
}
.property-list dt {
  font-weight: 600;
}
.property-list dd {
  margin: 0;
}
</style>
