import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

import {
  addPathCells,
  createEditorProject,
  createProjectLevel,
  createJunctionConfig,
  deleteProjectLevel,
  duplicateProjectLevel,
  eraseCell,
  findProjectLevel,
  getNextAvailableStage,
  placeEnd,
  placeSpawn,
  placeTower,
  rasterizeOrthogonalSegment,
  replaceProjectLevel,
  removeJunctionConfig,
  setJunctionEntryEnabled,
  setJunctionExitEnabled,
  setJunctionExitWeight,
  selectAt,
  setTowerLocked,
  sortProjectLevels,
} from '@/editor';
import type { LevelAddress, NewLevelSpec } from '@/editor';
import type { Direction, GridPosition, LevelConfig } from '@/core/model';
import { RouteSimulator } from '@/core/simulation';
import type { RouteSimulationResult } from '@/core/simulation';
import { MapValidator } from '@/core/validation';
import type { ValidationIssue } from '@/core/validation';
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
import {
  indexedDbProjectRepository,
  PersistedProjectStateSchema,
  PROJECT_PERSISTENCE_SCHEMA_VERSION,
  ProjectPersistenceError,
} from '@/persistence';
import type { PersistedProjectState, ProjectRepository } from '@/persistence';

interface PendingEditTransaction {
  readonly label: string;
  readonly before: EditorSnapshot;
}

export type ValidationStatus = 'not-run' | 'passed' | 'failed' | 'stale';
export type PersistenceStatus = 'loading' | 'saved' | 'saving' | 'error';

const PERSISTENCE_DEBOUNCE_MS = 300;

export interface ValidationRun {
  readonly level: LevelConfig;
  readonly issues: readonly ValidationIssue[];
}

export interface RoutePreviewRun {
  readonly level: LevelConfig;
  readonly result: RouteSimulationResult;
}

export const useEditorStore = defineStore('editor', () => {
  const project = ref(createEditorProject());
  const activeLevelAddress = ref<LevelAddress>({ chapter: 1, stage: 1 });
  const initialLevel = findProjectLevel(project.value, activeLevelAddress.value);
  if (initialLevel === null) throw new Error('Default editor project must contain level 1-1.');
  const workingLevel = ref(initialLevel);
  const activeTool = ref<EditorTool>('select');
  const selection = ref<EditorSelection | null>(null);
  const history = ref(createEditorHistory());
  const validationRun = ref<ValidationRun | null>(null);
  const routePreviewRun = ref<RoutePreviewRun | null>(null);
  const focusedValidationIssue = ref<ValidationIssue | null>(null);
  const lastStrokeCell = ref<GridPosition | null>(null);
  const persistenceStatus = ref<PersistenceStatus>('loading');
  const persistenceError = ref<string | null>(null);
  const persistenceReady = ref(false);
  const canUndo = computed(() => canUndoEditorHistory(history.value));
  const canRedo = computed(() => canRedoEditorHistory(history.value));
  const isValidationCurrent = computed(
    () => validationRun.value !== null && validationRun.value.level === workingLevel.value,
  );
  const validationStatus = computed<ValidationStatus>(() => {
    if (validationRun.value === null) return 'not-run';
    if (!isValidationCurrent.value) return 'stale';
    return validationRun.value.issues.some((issue) => issue.severity === 'error')
      ? 'failed'
      : 'passed';
  });
  const validationIssues = computed(() => validationRun.value?.issues ?? []);
  const currentValidationIssues = computed(() =>
    isValidationCurrent.value ? (validationRun.value?.issues ?? []) : [],
  );
  const validationErrorCount = computed(
    () => currentValidationIssues.value.filter((issue) => issue.severity === 'error').length,
  );
  const validationWarningCount = computed(
    () => currentValidationIssues.value.filter((issue) => issue.severity === 'warning').length,
  );
  const focusedValidationPosition = computed(() =>
    isValidationCurrent.value ? (focusedValidationIssue.value?.position ?? null) : null,
  );
  const isRoutePreviewCurrent = computed(
    () => routePreviewRun.value !== null && routePreviewRun.value.level === workingLevel.value,
  );
  const resolvedPreviewSpawn = computed(() => {
    const spawnPoints = workingLevel.value.spawnPoints;
    if (spawnPoints.length === 1) return spawnPoints[0] ?? null;
    if (spawnPoints.length === 0 || selection.value?.kind !== 'spawn') return null;
    const selectedSpawnId = selection.value.id;
    return spawnPoints.find((spawnPoint) => spawnPoint.id === selectedSpawnId) ?? null;
  });
  const canTestRoute = computed(
    () => validationStatus.value === 'passed' && resolvedPreviewSpawn.value !== null,
  );
  const routePreviewDisabledReason = computed(() => {
    if (validationStatus.value === 'not-run') return '尚未校验地图';
    if (validationStatus.value === 'failed') return '地图存在校验错误';
    if (validationStatus.value === 'stale') return '校验结果已过期';
    if (workingLevel.value.spawnPoints.length === 0) return '当前地图没有出生点';
    if (resolvedPreviewSpawn.value === null) return '存在多个出生点，请先选择一个出生点';
    return '测试路线';
  });
  let pendingStroke: PendingEditTransaction | null = null;
  let activeProjectRepository: ProjectRepository = indexedDbProjectRepository;
  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let persistenceGeneration = 0;

  // Project synchronization stays explicit in setWorkingLevel; this watcher only persists it.
  watch([project, activeLevelAddress], () => schedulePersistence(), { flush: 'sync' });

  function setWorkingLevel(level: LevelConfig): void {
    if (level === workingLevel.value) return;
    project.value = replaceProjectLevel(project.value, activeLevelAddress.value, level);
    workingLevel.value = level;
    if (routePreviewRun.value !== null && routePreviewRun.value.level !== level)
      routePreviewRun.value = null;
  }
  function resetLevelSession(): void {
    history.value = clearEditorHistory();
    selection.value = null;
    validationRun.value = null;
    focusedValidationIssue.value = null;
    routePreviewRun.value = null;
    lastStrokeCell.value = null;
  }
  function schedulePersistence(): void {
    if (!persistenceReady.value) return;
    if (autosaveTimer !== null) clearTimeout(autosaveTimer);
    const generation = ++persistenceGeneration;
    autosaveTimer = setTimeout(() => {
      autosaveTimer = null;
      void savePersistence(generation);
    }, PERSISTENCE_DEBOUNCE_MS);
  }
  async function savePersistence(generation: number): Promise<void> {
    if (!persistenceReady.value) return;
    persistenceStatus.value = 'saving';
    try {
      const state = createPersistedProjectState();
      await activeProjectRepository.save(state);
      if (generation === persistenceGeneration) {
        persistenceStatus.value = 'saved';
        persistenceError.value = null;
      }
    } catch (error) {
      if (generation === persistenceGeneration) {
        persistenceStatus.value = 'error';
        persistenceError.value = getPersistenceErrorMessage(error);
      }
    }
  }
  function createPersistedProjectState(): PersistedProjectState {
    return PersistedProjectStateSchema.parse({
      schemaVersion: PROJECT_PERSISTENCE_SCHEMA_VERSION,
      project: project.value,
      activeLevelAddress: activeLevelAddress.value,
      updatedAt: Date.now(),
    });
  }
  async function flushPersistence(): Promise<void> {
    if (!persistenceReady.value) return;
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    await savePersistence(++persistenceGeneration);
  }
  async function initializePersistence(
    repository: ProjectRepository = indexedDbProjectRepository,
  ): Promise<void> {
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    persistenceReady.value = false;
    persistenceStatus.value = 'loading';
    persistenceError.value = null;
    activeProjectRepository = repository;
    try {
      const persisted = await activeProjectRepository.load(project.value.id);
      if (persisted === null) {
        persistenceReady.value = true;
        await flushPersistence();
        return;
      }
      const activeLevel =
        findProjectLevel(persisted.project, persisted.activeLevelAddress) ??
        sortProjectLevels(persisted.project)[0];
      if (activeLevel === undefined) throw new Error('Persisted project must contain a level.');
      project.value = persisted.project;
      activeLevelAddress.value = { ...activeLevel.level };
      workingLevel.value = activeLevel;
      pendingStroke = null;
      resetLevelSession();
      activeTool.value = 'select';
      persistenceReady.value = true;
      persistenceStatus.value = 'saved';
    } catch (error) {
      persistenceReady.value = false;
      persistenceStatus.value = 'error';
      persistenceError.value = getPersistenceErrorMessage(error);
    }
  }

  function captureSnapshot(): EditorSnapshot {
    return createEditorSnapshot(workingLevel.value, selection.value);
  }
  function restoreSnapshot(snapshot: EditorSnapshot): void {
    setWorkingLevel(snapshot.level);
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
    setWorkingLevel(updated);
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
      setWorkingLevel(addPathCells(workingLevel.value, positions));
    }
    if (activeTool.value === 'eraser') {
      let updated = workingLevel.value;
      for (const cell of positions) updated = eraseCell(updated, cell);
      setWorkingLevel(updated);
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
  function runValidation(): void {
    finishStrokeTransaction();
    const level = workingLevel.value;
    validationRun.value = { level, issues: MapValidator.validate(level) };
    focusedValidationIssue.value = null;
  }
  function focusValidationIssue(issue: ValidationIssue): void {
    if (!isValidationCurrent.value) return;
    focusedValidationIssue.value = issue;
    if (issue.position !== undefined)
      selection.value = selectAt(workingLevel.value, issue.position);
  }
  function startRoutePreview(): void {
    finishStrokeTransaction();
    const spawn = resolvedPreviewSpawn.value;
    if (!canTestRoute.value || spawn === null) return;
    const level = workingLevel.value;
    routePreviewRun.value = {
      level,
      result: RouteSimulator.simulate(level, spawn.id),
    };
  }
  function closeRoutePreview(): void {
    routePreviewRun.value = null;
  }
  function openLevel(address: LevelAddress): void {
    finishStrokeTransaction();
    const level = findProjectLevel(project.value, address);
    if (level === null) return;
    activeLevelAddress.value = { ...address };
    workingLevel.value = level;
    resetLevelSession();
  }
  function createLevel(spec: NewLevelSpec): void {
    finishStrokeTransaction();
    const nextProject = createProjectLevel(project.value, spec);
    if (nextProject === project.value) return;
    project.value = nextProject;
    openLevel({ chapter: spec.chapter, stage: spec.stage });
  }
  function duplicateCurrentLevel(): void {
    finishStrokeTransaction();
    const chapter = activeLevelAddress.value.chapter;
    const stage = getNextAvailableStage(project.value, chapter);
    const nextProject = duplicateProjectLevel(project.value, activeLevelAddress.value);
    if (nextProject === project.value) return;
    project.value = nextProject;
    openLevel({ chapter, stage });
  }
  function deleteCurrentLevel(): void {
    finishStrokeTransaction();
    const sortedLevels = sortProjectLevels(project.value);
    const currentIndex = sortedLevels.findIndex(
      (level) =>
        level.level.chapter === activeLevelAddress.value.chapter &&
        level.level.stage === activeLevelAddress.value.stage,
    );
    const nextProject = deleteProjectLevel(project.value, activeLevelAddress.value);
    if (nextProject === project.value || currentIndex < 0) return;
    const nextLevel = sortedLevels[currentIndex + 1] ?? sortedLevels[currentIndex - 1];
    if (nextLevel === undefined) return;
    project.value = nextProject;
    openLevel(nextLevel.level);
  }
  function applyToolAt(position: GridPosition): void {
    if (activeTool.value === 'select') {
      selection.value = selectAt(workingLevel.value, position);
      return;
    }
    if (activeTool.value === 'path') {
      setWorkingLevel(addPathCells(workingLevel.value, [position]));
      return;
    }
    if (activeTool.value === 'eraser') {
      setWorkingLevel(eraseCell(workingLevel.value, position));
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
    project,
    activeLevelAddress,
    workingLevel,
    activeTool,
    selection,
    persistenceStatus,
    persistenceError,
    persistenceReady,
    canUndo,
    canRedo,
    validationRun,
    validationStatus,
    validationIssues,
    currentValidationIssues,
    validationErrorCount,
    validationWarningCount,
    focusedValidationIssue,
    focusedValidationPosition,
    routePreviewRun,
    isRoutePreviewCurrent,
    resolvedPreviewSpawn,
    canTestRoute,
    routePreviewDisabledReason,
    setActiveTool,
    beginStroke,
    continueStroke,
    endStroke,
    undo,
    redo,
    clearHistory,
    runValidation,
    focusValidationIssue,
    startRoutePreview,
    closeRoutePreview,
    initializePersistence,
    flushPersistence,
    openLevel,
    createLevel,
    duplicateCurrentLevel,
    deleteCurrentLevel,
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

function getPersistenceErrorMessage(error: unknown): string {
  if (error instanceof ProjectPersistenceError) return error.message;
  return error instanceof Error ? error.message : 'Unable to persist project data.';
}
