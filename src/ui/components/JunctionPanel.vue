<script setup lang="ts">
import { computed } from 'vue';
import { DIRECTIONS } from '@/core/model';
import type { Direction, LevelConfig } from '@/core/model';
import { getJunctionEditorState } from '@/editor';
import type { GridPosition } from '@/core/model';
const props = defineProps<{ level: LevelConfig; position: Readonly<GridPosition> }>();
const emit = defineEmits<{
  create: [];
  remove: [];
  'entry-enabled': [direction: Direction, enabled: boolean];
  'exit-enabled': [enterFrom: Direction, exitTo: Direction, enabled: boolean];
  'exit-weight': [enterFrom: Direction, exitTo: Direction, weight: number];
}>();
const state = computed(() => getJunctionEditorState(props.level, props.position));
const label: Record<Direction, string> = { up: '↑ 上', down: '↓ 下', left: '← 左', right: '→ 右' };
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
    <p>类型：路口</p>
    <p>X: {{ state.position.x }} Y: {{ state.position.y }}</p>
    <p>
      物理方向：{{
        state.physicalDirections.map((direction) => label[direction]).join('、') || '无'
      }}
    </p>
    <p v-if="!state.isCandidate && state.junctionId">当前已不是路口候选</p>
    <button
      v-if="state.junctionId === null && state.isCandidate"
      type="button"
      @click="emit('create')"
    >
      创建路口配置</button
    ><template v-else-if="state.junctionId"
      ><p>ID: {{ state.junctionId }}</p>
      <button type="button" @click="emit('remove')">删除路口配置</button>
      <div v-for="direction in DIRECTIONS" :key="direction">
        <label
          ><input
            type="checkbox"
            :checked="state.transitions.some((item) => item.enterFrom === direction)"
            :disabled="
              !state.physicalDirections.includes(direction) &&
              !state.transitions.some((item) => item.enterFrom === direction)
            "
            @change="entry($event, direction)"
          />入口 {{ label[direction] }}</label
        >
        <div
          v-for="transition in state.transitions.filter((item) => item.enterFrom === direction)"
          :key="transition.enterFrom"
        >
          <div v-for="exitDirection in DIRECTIONS" :key="exitDirection">
            <label
              ><input
                type="checkbox"
                :checked="transition.exits.some((item) => item.exitTo === exitDirection)"
                :disabled="
                  exitDirection === direction ||
                  (!state.physicalDirections.includes(exitDirection) &&
                    !transition.exits.some((item) => item.exitTo === exitDirection))
                "
                @change="toggleExit($event, direction, exitDirection)"
              />出口 {{ label[exitDirection] }}</label
            ><input
              v-for="junctionExit in transition.exits.filter(
                (item) => item.exitTo === exitDirection,
              )"
              :key="junctionExit.exitTo"
              type="number"
              min="0.01"
              max="1"
              step="0.01"
              :value="junctionExit.weight"
              @change="weight($event, direction, exitDirection)"
            />
          </div>
        </div></div
    ></template>
  </section>
</template>
<style scoped>
.junction-panel {
  padding: 1rem;
  color: #475569;
}
.junction-panel p {
  margin: 0.25rem 0;
}
.junction-panel button {
  margin: 0.25rem 0;
}
.junction-panel div {
  margin: 0.375rem 0;
}
.junction-panel input[type='number'] {
  width: 4rem;
  margin-left: 0.5rem;
}
</style>
