import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createJunctionConfig, findProjectLevel } from '@/editor';
import { useEditorStore } from '@/ui/stores/editorStore';
import { createLevel } from '../core/validation/fixtures';

describe('editor store selection reconciliation', () => {
  beforeEach(() => setActivePinia(createPinia()));
  it('keeps a stale configured junction selected after erasing its path cell', () => {
    const store = useEditorStore();
    const position = { x: 1, y: 1 };
    store.workingLevel = createJunctionConfig(
      createLevel({
        grid: { rows: 4, cols: 4 },
        pathCells: [position, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }],
      }),
      position,
    );
    store.selection = { kind: 'junction', position };
    store.setActiveTool('eraser');
    store.beginStroke(position);
    expect(store.workingLevel.junctions).toHaveLength(1);
    expect(store.selection).toMatchObject({ kind: 'junction' });
  });

  it('records a whole path drag as one command and restores it with undo and redo', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 0, y: 0 });
    store.continueStroke({ x: 5, y: 0 });
    store.continueStroke({ x: 5, y: 5 });
    store.endStroke();

    expect(store.canUndo).toBe(true);
    expect(store.workingLevel.pathCells).toHaveLength(11);
    store.undo();
    expect(store.workingLevel.pathCells).toHaveLength(0);
    expect(store.canRedo).toBe(true);
    store.redo();
    expect(store.workingLevel.pathCells).toHaveLength(11);
  });

  it('records a whole eraser drag and restores all erased cells', () => {
    const store = useEditorStore();
    store.workingLevel = createLevel({
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    });
    store.setActiveTool('eraser');
    store.beginStroke({ x: 0, y: 0 });
    store.continueStroke({ x: 2, y: 0 });
    store.endStroke();

    expect(store.workingLevel.pathCells).toHaveLength(0);
    store.undo();
    expect(store.workingLevel.pathCells).toHaveLength(3);
  });

  it('restores tower selection and lock state through undo and redo', () => {
    const store = useEditorStore();
    store.setActiveTool('tower');
    store.beginStroke({ x: 1, y: 1 });
    expect(store.selection).toMatchObject({ kind: 'tower', id: 'tower_01' });
    store.undo();
    expect(store.selection).toBeNull();
    expect(store.workingLevel.towerNodes).toHaveLength(0);
    store.redo();
    expect(store.selection).toMatchObject({ kind: 'tower', id: 'tower_01' });

    store.setSelectedTowerLocked(true);
    expect(store.workingLevel.towerNodes[0]?.locked).toBe(true);
    store.undo();
    expect(store.workingLevel.towerNodes[0]?.locked).toBe(false);
    store.redo();
    expect(store.workingLevel.towerNodes[0]?.locked).toBe(true);
  });

  it('undoes and redoes endpoint placement without recording invalid edits', () => {
    const store = useEditorStore();
    store.workingLevel = createLevel({
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    });
    store.setActiveTool('spawn');
    store.beginStroke({ x: 0, y: 0 });
    expect(store.workingLevel.spawnPoints).toHaveLength(1);
    store.undo();
    expect(store.workingLevel.spawnPoints).toHaveLength(0);
    expect(store.canRedo).toBe(true);

    store.beginStroke({ x: 1, y: 1 });
    expect(store.canRedo).toBe(true);
    store.redo();
    expect(store.workingLevel.spawnPoints).toHaveLength(1);

    store.setActiveTool('end');
    store.beginStroke({ x: 1, y: 0 });
    expect(store.workingLevel.endPoints).toHaveLength(1);
    store.undo();
    expect(store.workingLevel.endPoints).toHaveLength(0);
    store.redo();
    expect(store.workingLevel.endPoints).toHaveLength(1);
  });

  it('records each junction edit and restores the selection with a deleted stale config', () => {
    const store = useEditorStore();
    const position = { x: 1, y: 1 };
    store.workingLevel = createLevel({
      grid: { rows: 4, cols: 4 },
      pathCells: [position, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }],
    });
    store.selection = { kind: 'junction', position };
    store.createSelectedJunctionConfig();
    expect(store.workingLevel.junctions).toHaveLength(1);
    store.undo();
    expect(store.workingLevel.junctions).toHaveLength(0);
    store.redo();
    expect(store.workingLevel.junctions).toHaveLength(1);
    const configured = store.workingLevel;
    store.setSelectedJunctionEntryEnabled('left', true);
    store.setSelectedJunctionExitEnabled('left', 'up', true);
    store.setSelectedJunctionExitEnabled('left', 'right', true);
    expect(
      store.workingLevel.junctions[0]?.transitions[0]?.exits.map((exit) => exit.weight),
    ).toEqual([0.5, 0.5]);
    store.undo();
    expect(store.workingLevel.junctions[0]?.transitions[0]?.exits).toHaveLength(1);
    store.redo();
    store.setSelectedJunctionExitWeight('left', 'up', 0.8);
    expect(store.workingLevel.junctions[0]?.transitions[0]?.exits[0]?.weight).toBe(0.8);
    store.undo();
    expect(store.workingLevel.junctions[0]?.transitions[0]?.exits[0]?.weight).toBe(0.5);

    store.workingLevel = {
      ...configured,
      pathCells: configured.pathCells.filter((cell) => cell.x !== 2 || cell.y !== 1),
    };
    store.selection = { kind: 'junction', position };
    store.clearHistory();
    store.removeSelectedJunctionConfig();
    expect(store.selection).toMatchObject({ kind: 'path' });
    store.undo();
    expect(store.workingLevel.junctions).toHaveLength(1);
    expect(store.selection).toMatchObject({ kind: 'junction' });
  });

  it('does not record selections or tool switches and invalidates redo only after a real edit', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 0, y: 0 });
    store.endStroke();
    store.undo();
    expect(store.canRedo).toBe(true);

    store.setActiveTool('select');
    store.beginStroke({ x: 2, y: 2 });
    store.setActiveTool('tower');
    store.beginStroke({ x: 20, y: 0 });
    expect(store.canRedo).toBe(true);

    store.setActiveTool('path');
    store.beginStroke({ x: 1, y: 0 });
    store.endStroke();
    expect(store.canRedo).toBe(false);
    expect(store.activeTool).toBe('path');
  });

  it('runs validation without affecting history and focuses positioned issues', () => {
    const store = useEditorStore();
    store.workingLevel = createLevel({ pathCells: [{ x: 1, y: 1 }] });
    store.setActiveTool('tower');

    store.runValidation();

    expect(store.validationStatus).toBe('failed');
    expect(store.currentValidationIssues.map((issue) => issue.code)).toContain('PATH_ISOLATED');
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);
    expect(store.activeTool).toBe('tower');

    const isolatedIssue = store.currentValidationIssues.find(
      (issue) => issue.code === 'PATH_ISOLATED',
    );
    expect(isolatedIssue).toBeDefined();
    if (isolatedIssue === undefined) throw new Error('Expected isolated path issue.');
    store.focusValidationIssue(isolatedIssue);
    expect(store.focusedValidationIssue).toBe(isolatedIssue);
    expect(store.selection).toMatchObject({ kind: 'path', position: { x: 1, y: 1 } });
  });

  it('makes validation stale after an edit and restores the prior result through undo', () => {
    const store = useEditorStore();
    const validatedLevel = createLevel({ pathCells: [{ x: 1, y: 1 }] });
    store.workingLevel = validatedLevel;
    store.runValidation();
    const isolatedIssue = store.currentValidationIssues[0];
    if (isolatedIssue === undefined) throw new Error('Expected validation issue.');
    store.focusValidationIssue(isolatedIssue);

    store.setActiveTool('path');
    store.beginStroke({ x: 2, y: 1 });
    store.endStroke();

    expect(store.validationStatus).toBe('stale');
    expect(store.currentValidationIssues).toEqual([]);
    expect(store.focusedValidationPosition).toBeNull();
    store.undo();
    expect(store.validationStatus).toBe('failed');
    expect(store.currentValidationIssues).toHaveLength(1);

    store.runValidation();
    expect(store.focusedValidationIssue).toBeNull();
  });

  it('does not clear redo when validation runs', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 0, y: 0 });
    store.endStroke();
    store.undo();
    expect(store.canRedo).toBe(true);

    store.runValidation();

    expect(store.canRedo).toBe(true);
    expect(store.validationStatus).toBe('passed');
  });

  it('gates route preview on current validation and a resolved spawn', () => {
    const store = useEditorStore();
    store.workingLevel = createLevel({
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn_01', x: 0, y: 0 }],
      endPoints: [{ id: 'end_01', x: 2, y: 0 }],
    });

    expect(store.canTestRoute).toBe(false);
    expect(store.routePreviewDisabledReason).toBe('尚未校验地图');
    store.workingLevel = createLevel({ pathCells: [{ x: 1, y: 1 }] });
    store.runValidation();
    expect(store.validationStatus).toBe('failed');
    expect(store.canTestRoute).toBe(false);

    store.workingLevel = createLevel({
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn_01', x: 0, y: 0 }],
      endPoints: [{ id: 'end_01', x: 2, y: 0 }],
    });
    expect(store.validationStatus).toBe('stale');
    expect(store.canTestRoute).toBe(false);
    store.runValidation();
    expect(store.validationStatus).toBe('passed');
    expect(store.canTestRoute).toBe(true);

    store.setActiveTool('path');
    store.beginStroke({ x: 3, y: 0 });
    store.endStroke();
    expect(store.validationStatus).toBe('stale');
    expect(store.canTestRoute).toBe(false);
  });

  it('requires an explicit selected spawn when the map has multiple spawns', () => {
    const store = useEditorStore();
    store.workingLevel = createLevel({
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
      spawnPoints: [
        { id: 'spawn_01', x: 0, y: 0 },
        { id: 'spawn_02', x: 0, y: 2 },
      ],
      endPoints: [
        { id: 'end_01', x: 2, y: 0 },
        { id: 'end_02', x: 2, y: 2 },
      ],
    });
    store.runValidation();

    expect(store.canTestRoute).toBe(false);
    expect(store.routePreviewDisabledReason).toBe('存在多个出生点，请先选择一个出生点');
    store.setActiveTool('select');
    store.beginStroke({ x: 0, y: 2 });
    expect(store.canTestRoute).toBe(true);

    store.startRoutePreview();
    expect(store.routePreviewRun?.result.spawnId).toBe('spawn_02');
    store.beginStroke({ x: 1, y: 2 });
    expect(store.canTestRoute).toBe(false);
  });

  it('keeps editor state and redo intact while previewing, then invalidates on an edit', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 0, y: 0 });
    store.endStroke();
    store.undo();
    expect(store.canRedo).toBe(true);

    store.workingLevel = createLevel({
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn_01', x: 0, y: 0 }],
      endPoints: [{ id: 'end_01', x: 2, y: 0 }],
    });
    store.selection = { kind: 'path', position: { x: 1, y: 0 } };
    store.runValidation();
    const before = store.workingLevel;
    const tool = store.activeTool;

    store.startRoutePreview();
    expect(store.routePreviewRun?.level).toBe(before);
    expect(store.workingLevel).toBe(before);
    expect(store.activeTool).toBe(tool);
    expect(store.canRedo).toBe(true);

    store.setActiveTool('select');
    store.beginStroke({ x: 1, y: 0 });
    expect(store.routePreviewRun).not.toBeNull();

    store.setActiveTool('path');
    store.beginStroke({ x: 3, y: 0 });
    store.endStroke();
    expect(store.routePreviewRun).toBeNull();
    store.closeRoutePreview();
    expect(store.selection).toMatchObject({ kind: 'path' });
  });

  it('starts with project_01 level 1-1 and synchronizes edits through undo and redo', () => {
    const store = useEditorStore();

    expect(store.project).toMatchObject({ id: 'project_01', name: '未命名项目' });
    expect(store.activeLevelAddress).toEqual({ chapter: 1, stage: 1 });
    expect(findProjectLevel(store.project, store.activeLevelAddress)).toBe(store.workingLevel);

    store.setActiveTool('path');
    store.beginStroke({ x: 1, y: 1 });
    store.endStroke();
    expect(findProjectLevel(store.project, { chapter: 1, stage: 1 })).toBe(store.workingLevel);
    expect(store.workingLevel.pathCells).toEqual([{ x: 1, y: 1 }]);

    store.undo();
    expect(findProjectLevel(store.project, { chapter: 1, stage: 1 })).toBe(store.workingLevel);
    expect(store.workingLevel.pathCells).toEqual([]);
    store.redo();
    expect(findProjectLevel(store.project, { chapter: 1, stage: 1 })).toBe(store.workingLevel);
    expect(store.workingLevel.pathCells).toEqual([{ x: 1, y: 1 }]);
  });

  it('creates isolated levels, clears the session on switch, and retains the active tool', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 0, y: 0 });
    store.continueStroke({ x: 2, y: 0 });
    store.endStroke();
    store.setActiveTool('spawn');
    store.beginStroke({ x: 0, y: 0 });
    store.setActiveTool('end');
    store.beginStroke({ x: 2, y: 0 });
    store.runValidation();
    store.startRoutePreview();
    store.selection = { kind: 'path', position: { x: 1, y: 0 } };
    store.setActiveTool('path');
    expect(store.routePreviewRun).not.toBeNull();

    store.createLevel({ chapter: 1, stage: 2, rows: 6, cols: 7 });
    expect(store.activeLevelAddress).toEqual({ chapter: 1, stage: 2 });
    expect(store.workingLevel.grid).toEqual({ rows: 6, cols: 7 });
    expect(store.selection).toBeNull();
    expect(store.validationStatus).toBe('not-run');
    expect(store.routePreviewRun).toBeNull();
    expect(store.canUndo).toBe(false);
    expect(store.activeTool).toBe('path');

    store.beginStroke({ x: 2, y: 2 });
    store.endStroke();
    store.openLevel({ chapter: 1, stage: 1 });
    expect(store.workingLevel.pathCells).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
    expect(store.canUndo).toBe(false);
    store.openLevel({ chapter: 1, stage: 2 });
    expect(store.workingLevel.pathCells).toEqual([{ x: 2, y: 2 }]);
  });

  it('finishes a pending stroke before structural operations and duplicates independently', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 0, y: 0 });

    store.duplicateCurrentLevel();
    expect(store.activeLevelAddress).toEqual({ chapter: 1, stage: 2 });
    expect(findProjectLevel(store.project, { chapter: 1, stage: 1 })?.pathCells).toEqual([
      { x: 0, y: 0 },
    ]);
    store.beginStroke({ x: 1, y: 0 });
    store.endStroke();
    store.openLevel({ chapter: 1, stage: 1 });
    expect(store.workingLevel.pathCells).toEqual([{ x: 0, y: 0 }]);
    store.openLevel({ chapter: 1, stage: 2 });
    expect(store.workingLevel.pathCells).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  it('deletes the current level by selecting the next, then previous, sorted level', () => {
    const store = useEditorStore();
    store.createLevel({ chapter: 1, stage: 2, rows: 5, cols: 5 });
    store.createLevel({ chapter: 2, stage: 1, rows: 5, cols: 5 });

    store.openLevel({ chapter: 1, stage: 2 });
    store.deleteCurrentLevel();
    expect(store.activeLevelAddress).toEqual({ chapter: 2, stage: 1 });
    store.deleteCurrentLevel();
    expect(store.activeLevelAddress).toEqual({ chapter: 1, stage: 1 });
    store.deleteCurrentLevel();
    expect(store.project.levels).toHaveLength(1);
    expect(store.activeLevelAddress).toEqual({ chapter: 1, stage: 1 });
  });
});
