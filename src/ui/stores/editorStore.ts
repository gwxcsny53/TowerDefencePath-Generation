import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

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
import type { Direction, GridPosition, LevelConfig } from '@/core/model';
import {
  canRedoEditorHistory,
  canUndoEditorHistory,
  clearEditorHistory,
  cloneEditorSelection,
  createEditorHistory,
  createEditorSnapshot,
  recordEditorCommand,
  redoEditorHistory,
  undoEditorHistory,
} from '@/editor/history';
import type { EditorSnapshot } from '@/editor/history';
import type { EditorSelection, EditorTool } from '@/editor';

interface PendingEditTransaction {
  readonly label: string;
  readonly before: EditorSnapshot;
}

export const useEditorStore = defineStore('editor', () => {
  const workingLevel = ref(createEmptyLevelConfig());
  const activeTool = ref<EditorTool>('select');
  const selection = ref<EditorSelection | null>(null);
  const history = ref(createEditorHistory());
  const lastStrokeCell = ref<GridPosition | null>(null);
  const canUndo = computed(() => canUndoEditorHistory(history.value));
  const canRedo = computed(() => canRedoEditorHistory(history.value));
  let pendingStroke: PendingEditTransaction | null = null;

  function captureSnapshot(): EditorSnapshot {
    return createEditorSnapshot(workingLevel.value, selection.value);
  }
  function restoreSnapshot(snapshot: EditorSnapshot): void {
    workingLevel.value = snapshot.level;
    selection.value = cloneEditorSelection(snapshot.selection);
    lastStrokeCell.value = null;
  }
  function executeEdit(
    label: string,
    update: (level: LevelConfig) => LevelConfig,
    nextSelection?: (level: LevelConfig) => EditorSelection | null,
  ): void {
    const before = captureSnapshot();
    const updated = update(before.level);
    if (updated === before.level) return;
    workingLevel.value = updated;
    if (nextSelection !== undefined) selection.value = nextSelection(updated);
    history.value = recordEditorCommand(history.value, {
      label,
      before,
      after: captureSnapshot(),
    });
  }
  function beginStrokeTransaction(label: string): void {
    finishStrokeTransaction();
    pendingStroke = { label, before: captureSnapshot() };
  }
  function finishStrokeTransaction(): void {
    const transaction = pendingStroke;
    pendingStroke = null;
    lastStrokeCell.value = null;
    if (transaction === null || transaction.before.level === workingLevel.value) return;
    history.value = recordEditorCommand(history.value, {
      label: transaction.label,
      before: transaction.before,
      after: captureSnapshot(),
    });
  }
  function setActiveTool(tool: EditorTool): void {
    finishStrokeTransaction();
    activeTool.value = tool;
  }
  function beginStroke(position: GridPosition): void {
    if (activeTool.value === 'path' || activeTool.value === 'eraser') {
      beginStrokeTransaction(activeTool.value === 'path' ? '绘制路线' : '擦除');
      applyToolAt(position);
      lastStrokeCell.value = position;
      return;
    }
    applyToolAt(position);
  }
  function continueStroke(position: GridPosition): void {
    if (lastStrokeCell.value === null) return;
    const positions = rasterizeOrthogonalSegment(lastStrokeCell.value, position);
    if (activeTool.value === 'path') {
      workingLevel.value = addPathCells(workingLevel.value, positions);
    }
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
    finishStrokeTransaction();
  }
  function undo(): void {
    finishStrokeTransaction();
    const operation = undoEditorHistory(history.value);
    history.value = operation.history;
    if (operation.snapshot !== null) restoreSnapshot(operation.snapshot);
  }
  function redo(): void {
    finishStrokeTransaction();
    const operation = redoEditorHistory(history.value);
    history.value = operation.history;
    if (operation.snapshot !== null) restoreSnapshot(operation.snapshot);
  }
  function clearHistory(): void {
    history.value = clearEditorHistory();
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
    const label =
      activeTool.value === 'spawn'
        ? '放置出生点'
        : activeTool.value === 'end'
          ? '放置终点'
          : '放置塔位';
    executeEdit(
      label,
      (level) =>
        activeTool.value === 'spawn'
          ? placeSpawn(level, position)
          : activeTool.value === 'end'
            ? placeEnd(level, position)
            : placeTower(level, position),
      (level) => selectAt(level, position),
    );
  }
  function setSelectedTowerLocked(locked: boolean): void {
    if (selection.value?.kind !== 'tower') return;
    const towerId = selection.value.id;
    executeEdit('修改塔位锁定', (level) => setTowerLocked(level, towerId, locked));
  }
  function reconcileSelectionAtCurrentPosition(): void {
    if (selection.value !== null)
      selection.value = selectAt(workingLevel.value, selection.value.position);
  }
  function withSelectedJunction(
    label: string,
    update: (level: LevelConfig, position: GridPosition) => LevelConfig,
    nextSelection?: (level: LevelConfig, position: GridPosition) => EditorSelection | null,
  ): void {
    if (selection.value?.kind !== 'junction') return;
    const position = selection.value.position;
    executeEdit(
      label,
      (level) => update(level, position),
      (level) => (nextSelection === undefined ? selection.value : nextSelection(level, position)),
    );
  }
  function createSelectedJunctionConfig(): void {
    withSelectedJunction('创建路口配置', createJunctionConfig);
  }
  function removeSelectedJunctionConfig(): void {
    withSelectedJunction('删除路口配置', removeJunctionConfig, selectAt);
  }
  function setSelectedJunctionEntryEnabled(direction: Direction, enabled: boolean): void {
    withSelectedJunction('修改路口入口', (level, position) =>
      setJunctionEntryEnabled(level, position, direction, enabled),
    );
  }
  function setSelectedJunctionExitEnabled(
    enterFrom: Direction,
    exitTo: Direction,
    enabled: boolean,
  ): void {
    withSelectedJunction('修改路口出口', (level, position) =>
      setJunctionExitEnabled(level, position, enterFrom, exitTo, enabled),
    );
  }
  function setSelectedJunctionExitWeight(
    enterFrom: Direction,
    exitTo: Direction,
    weight: number,
  ): void {
    withSelectedJunction('修改路口权重', (level, position) =>
      setJunctionExitWeight(level, position, enterFrom, exitTo, weight),
    );
  }

  return {
    workingLevel,
    activeTool,
    selection,
    canUndo,
    canRedo,
    setActiveTool,
    beginStroke,
    continueStroke,
    endStroke,
    undo,
    redo,
    clearHistory,
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
