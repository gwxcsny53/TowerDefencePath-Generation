import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { createJunctionConfig } from '@/editor';
import { PROJECT_PERSISTENCE_SCHEMA_VERSION } from '@/persistence';
import type { PersistedProjectState, ProjectRepository } from '@/persistence';
import { useEditorStore } from '@/ui/stores/editorStore';
import { createLevel } from '../core/validation/fixtures';

class FakeProjectRepository implements ProjectRepository {
  readonly savedStates: PersistedProjectState[] = [];

  async load(): Promise<PersistedProjectState | null> {
    return null;
  }

  async save(state: PersistedProjectState): Promise<void> {
    this.savedStates.push(state);
  }

  async delete(): Promise<void> {}
}

function createResizableLevel() {
  return createLevel({
    grid: { rows: 4, cols: 4 },
    pathCells: [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
    ],
    spawnPoints: [{ id: 'spawn_01', x: 3, y: 0 }],
    endPoints: [{ id: 'end_01', x: 3, y: 3 }],
    towerNodes: [{ id: 'tower_01', x: 3, y: 3, locked: false }],
    junctions: [{ id: 'junction_01', x: 3, y: 3, transitions: [] }],
  });
}

describe('editor store grid resize', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('resizes as one undoable command, reconciles cropped selection, and restores it on undo', () => {
    const store = useEditorStore();
    store.replaceImportedLevel(createResizableLevel());
    store.setActiveTool('tower');
    store.selection = { kind: 'tower', id: 'tower_01', position: { x: 3, y: 3 } };
    store.runValidation();

    expect(store.resizeCurrentLevel({ rows: 3, cols: 3 })).toBe(true);
    expect(store.workingLevel.grid).toEqual({ rows: 3, cols: 3 });
    expect(store.workingLevel.pathCells).toEqual([{ x: 0, y: 0 }]);
    expect(store.workingLevel.spawnPoints).toEqual([]);
    expect(store.workingLevel.towerNodes).toEqual([]);
    expect(store.workingLevel.junctions).toEqual([]);
    expect(store.selection).toBeNull();
    expect(store.validationStatus).toBe('stale');
    expect(store.activeTool).toBe('tower');
    expect(store.project.levels[0]).toBe(store.workingLevel);

    store.undo();
    expect(store.workingLevel.grid).toEqual({ rows: 4, cols: 4 });
    expect(store.workingLevel.pathCells).toHaveLength(2);
    expect(store.workingLevel.spawnPoints).toHaveLength(1);
    expect(store.workingLevel.endPoints).toHaveLength(1);
    expect(store.workingLevel.towerNodes).toHaveLength(1);
    expect(store.workingLevel.junctions).toHaveLength(1);
    expect(store.selection).toMatchObject({ kind: 'tower', id: 'tower_01' });
    store.redo();
    expect(store.workingLevel.grid).toEqual({ rows: 3, cols: 3 });
    expect(store.selection).toBeNull();
  });

  it('preserves valid path and stale junction selections while invalidating route preview', () => {
    const store = useEditorStore();
    const position = { x: 1, y: 1 };
    const junctionLevel = createJunctionConfig(
      createLevel({
        grid: { rows: 4, cols: 4 },
        pathCells: [position, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }],
      }),
      position,
    );
    store.replaceImportedLevel(junctionLevel);
    store.selection = { kind: 'junction', position };
    store.routePreviewRun = {
      level: store.workingLevel,
      result: { status: 'reached-end', spawnId: 'spawn_01', path: [] },
    };

    store.resizeCurrentLevel({ rows: 4, cols: 2 });

    expect(store.selection).toMatchObject({ kind: 'junction', position });
    expect(store.workingLevel.junctions).toHaveLength(1);
    expect(store.routePreviewRun).toBeNull();
  });

  it('keeps a selected in-bounds path after resizing', () => {
    const store = useEditorStore();
    store.replaceImportedLevel(createResizableLevel());
    store.selection = { kind: 'path', position: { x: 0, y: 0 } };

    store.resizeCurrentLevel({ rows: 3, cols: 3 });

    expect(store.selection).toEqual({ kind: 'path', position: { x: 0, y: 0 } });
    expect(JSON.parse(store.createCurrentLevelExport().content)).toMatchObject({
      grid: { rows: 3, cols: 3 },
      pathCells: [{ x: 0, y: 0 }],
    });
  });

  it('finishes a pending stroke before recording resize as the next command', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 0, y: 0 });
    store.continueStroke({ x: 2, y: 0 });

    store.resizeCurrentLevel({ rows: 10, cols: 10 });
    store.undo();
    expect(store.workingLevel.grid).toEqual({ rows: 20, cols: 20 });
    expect(store.workingLevel.pathCells).toHaveLength(3);
    store.undo();
    expect(store.workingLevel.pathCells).toEqual([]);
  });

  it('does not create history, project updates, or redo invalidation for a no-op resize', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 0, y: 0 });
    store.endStroke();
    store.undo();
    const project = store.project;

    expect(store.resizeCurrentLevel({ rows: 20, cols: 20 })).toBe(false);
    expect(store.project).toBe(project);
    expect(store.canRedo).toBe(true);
  });

  it('persists resized snapshots through the existing autosave repository', async () => {
    const repository = new FakeProjectRepository();
    const store = useEditorStore();
    await store.initializePersistence(repository);
    store.resizeCurrentLevel({ rows: 10, cols: 12 });
    await store.flushPersistence();

    expect(repository.savedStates).toHaveLength(2);
    expect(repository.savedStates[1]).toMatchObject({
      schemaVersion: PROJECT_PERSISTENCE_SCHEMA_VERSION,
      project: { levels: [{ grid: { rows: 10, cols: 12 } }] },
    });
  });
});
