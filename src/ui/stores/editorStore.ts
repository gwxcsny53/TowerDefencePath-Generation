import { defineStore } from 'pinia';
import { ref } from 'vue';

import {
  addPathCells,
  createEmptyLevelConfig,
  createJunctionConfig,
  eraseCell,
  placeEnd,
  placeSpawn,
  placeTower,
  rasterizeOrthogonalSegment,
  removeJunctionConfig,
  setJunctionEntryEnabled,
  setJunctionExitEnabled,
  setJunctionExitWeight,
  selectAt,
  setTowerLocked,
} from '@/editor';
import type { EditorSelection, EditorTool } from '@/editor';
import type { GridPosition } from '@/core/model';

export const useEditorStore = defineStore('editor', () => {
  const workingLevel = ref(createEmptyLevelConfig());
  const activeTool = ref<EditorTool>('select');
  const selection = ref<EditorSelection | null>(null);
  const lastStrokeCell = ref<GridPosition | null>(null);
  function setActiveTool(tool: EditorTool): void {
    activeTool.value = tool;
  }
  function beginStroke(position: GridPosition): void {
    applyToolAt(position);
    lastStrokeCell.value =
      activeTool.value === 'path' || activeTool.value === 'eraser' ? position : null;
  }
  function continueStroke(position: GridPosition): void {
    if (lastStrokeCell.value === null) return;
    const positions = rasterizeOrthogonalSegment(lastStrokeCell.value, position);
    if (activeTool.value === 'path')
      workingLevel.value = addPathCells(workingLevel.value, positions);
    if (activeTool.value === 'eraser') {
      for (const cell of positions) workingLevel.value = eraseCell(workingLevel.value, cell);
      if (
        selection.value !== null &&
        positions.some((cell) => samePosition(cell, selection.value!.position))
      )
        reconcileSelectionAtCurrentPosition();
    }
    lastStrokeCell.value = position;
  }
  function endStroke(): void {
    lastStrokeCell.value = null;
  }
  function applyToolAt(position: GridPosition): void {
    if (activeTool.value === 'select') {
      selection.value = selectAt(workingLevel.value, position);
      return;
    }
    if (activeTool.value === 'path') {
      workingLevel.value = addPathCells(workingLevel.value, [position]);
      return;
    }
    if (activeTool.value === 'eraser') {
      workingLevel.value = eraseCell(workingLevel.value, position);
      if (selection.value !== null && samePosition(selection.value.position, position))
        reconcileSelectionAtCurrentPosition();
      return;
    }
    const previous = workingLevel.value;
    const updated =
      activeTool.value === 'spawn'
        ? placeSpawn(previous, position)
        : activeTool.value === 'end'
          ? placeEnd(previous, position)
          : placeTower(previous, position);
    workingLevel.value = updated;
    if (updated !== previous) selection.value = selectAt(updated, position);
  }
  function setSelectedTowerLocked(locked: boolean): void {
    if (selection.value?.kind !== 'tower') return;
    workingLevel.value = setTowerLocked(workingLevel.value, selection.value.id, locked);
  }
  function reconcileSelectionAtCurrentPosition(): void {
    if (selection.value !== null)
      selection.value = selectAt(workingLevel.value, selection.value.position);
  }
  function withSelectedJunction(update: (position: GridPosition) => void): void {
    if (selection.value?.kind === 'junction') update(selection.value.position);
  }
  function createSelectedJunctionConfig(): void {
    withSelectedJunction((position) => {
      workingLevel.value = createJunctionConfig(workingLevel.value, position);
    });
  }
  function removeSelectedJunctionConfig(): void {
    withSelectedJunction((position) => {
      const updated = removeJunctionConfig(workingLevel.value, position);
      workingLevel.value = updated;
      if (selectAt(updated, position)?.kind !== 'junction')
        selection.value = selectAt(updated, position);
    });
  }
  function setSelectedJunctionEntryEnabled(
    direction: import('@/core/model').Direction,
    enabled: boolean,
  ): void {
    withSelectedJunction((position) => {
      workingLevel.value = setJunctionEntryEnabled(
        workingLevel.value,
        position,
        direction,
        enabled,
      );
    });
  }
  function setSelectedJunctionExitEnabled(
    enterFrom: import('@/core/model').Direction,
    exitTo: import('@/core/model').Direction,
    enabled: boolean,
  ): void {
    withSelectedJunction((position) => {
      workingLevel.value = setJunctionExitEnabled(
        workingLevel.value,
        position,
        enterFrom,
        exitTo,
        enabled,
      );
    });
  }
  function setSelectedJunctionExitWeight(
    enterFrom: import('@/core/model').Direction,
    exitTo: import('@/core/model').Direction,
    weight: number,
  ): void {
    withSelectedJunction((position) => {
      workingLevel.value = setJunctionExitWeight(
        workingLevel.value,
        position,
        enterFrom,
        exitTo,
        weight,
      );
    });
  }
  return {
    workingLevel,
    activeTool,
    selection,
    setActiveTool,
    beginStroke,
    continueStroke,
    endStroke,
    setSelectedTowerLocked,
    createSelectedJunctionConfig,
    removeSelectedJunctionConfig,
    setSelectedJunctionEntryEnabled,
    setSelectedJunctionExitEnabled,
    setSelectedJunctionExitWeight,
  };
});

function samePosition(left: GridPosition, right: GridPosition): boolean {
  return left.x === right.x && left.y === right.y;
}
