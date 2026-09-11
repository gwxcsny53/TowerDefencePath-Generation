import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

import { createEditorProject, createProjectLevel, findProjectLevel } from '@/editor';
import { PROJECT_PERSISTENCE_SCHEMA_VERSION, ProjectPersistenceError } from '@/persistence';
import type { PersistedProjectState, ProjectRepository } from '@/persistence';
import { useEditorStore } from '@/ui/stores/editorStore';

class FakeProjectRepository implements ProjectRepository {
  state: PersistedProjectState | null = null;
  readonly savedStates: PersistedProjectState[] = [];
  loadError: Error | null = null;
  saveError: Error | null = null;

  async load(): Promise<PersistedProjectState | null> {
    if (this.loadError !== null) throw this.loadError;
    return this.state;
  }

  async save(state: PersistedProjectState): Promise<void> {
    if (this.saveError !== null) throw this.saveError;
    this.savedStates.push(state);
  }

  async delete(): Promise<void> {}
}

describe('editor store persistence', () => {
  beforeEach(() => {
    vi.useRealTimers();
    setActivePinia(createPinia());
  });

  it('saves the default project after a missing record', async () => {
    const repository = new FakeProjectRepository();
    const store = useEditorStore();

    await store.initializePersistence(repository);

    expect(store.persistenceReady).toBe(true);
    expect(store.persistenceStatus).toBe('saved');
    expect(repository.savedStates).toHaveLength(1);
    expect(repository.savedStates[0]).toMatchObject({
      schemaVersion: PROJECT_PERSISTENCE_SCHEMA_VERSION,
      project: { id: 'project_01' },
      activeLevelAddress: { chapter: 1, stage: 1 },
    });
  });

  it('restores a persisted project, falls back to the first sorted level, and resets the session', async () => {
    const project = createProjectLevel(createEditorProject(), {
      chapter: 2,
      stage: 1,
      rows: 6,
      cols: 7,
    });
    const repository = new FakeProjectRepository();
    repository.state = {
      schemaVersion: PROJECT_PERSISTENCE_SCHEMA_VERSION,
      project,
      activeLevelAddress: { chapter: 9, stage: 9 },
      updatedAt: 1,
    };
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 1, y: 1 });
    store.endStroke();

    await store.initializePersistence(repository);

    expect(store.activeLevelAddress).toEqual({ chapter: 1, stage: 1 });
    expect(findProjectLevel(store.project, store.activeLevelAddress)).toBe(store.workingLevel);
    expect(store.activeTool).toBe('select');
    expect(store.selection).toBeNull();
    expect(store.canUndo).toBe(false);
    expect(store.validationStatus).toBe('not-run');
    expect(store.routePreviewRun).toBeNull();
  });

  it('does not initialize autosave after a load failure', async () => {
    vi.useFakeTimers();
    const repository = new FakeProjectRepository();
    repository.loadError = new ProjectPersistenceError(
      'invalid-data',
      'Stored project data is invalid.',
    );
    const store = useEditorStore();

    await store.initializePersistence(repository);
    store.setActiveTool('path');
    store.beginStroke({ x: 1, y: 1 });
    store.endStroke();
    await nextTick();
    await vi.runAllTimersAsync();

    expect(store.persistenceReady).toBe(false);
    expect(store.persistenceStatus).toBe('error');
    expect(repository.savedStates).toHaveLength(0);
  });

  it('debounces edits, ignores no-op updates, flushes immediately, and retries after a save failure', async () => {
    vi.useFakeTimers();
    const repository = new FakeProjectRepository();
    const store = useEditorStore();
    await store.initializePersistence(repository);
    expect(repository.savedStates).toHaveLength(1);
    repository.saveError = new ProjectPersistenceError(
      'write-failed',
      'Unable to save project storage.',
    );

    store.setActiveTool('path');
    store.beginStroke({ x: 1, y: 1 });
    store.endStroke();
    await nextTick();
    await vi.advanceTimersByTimeAsync(299);
    expect(repository.savedStates).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(store.persistenceStatus).toBe('error');
    expect(repository.savedStates).toHaveLength(1);

    repository.saveError = null;
    store.beginStroke({ x: 1, y: 1 });
    store.endStroke();
    await nextTick();
    await vi.runAllTimersAsync();
    expect(repository.savedStates).toHaveLength(1);

    store.beginStroke({ x: 2, y: 1 });
    store.endStroke();
    await nextTick();
    await store.flushPersistence();
    expect(store.persistenceStatus).toBe('saved');
    expect(repository.savedStates).toHaveLength(2);
    expect(repository.savedStates[1]?.project.levels[0]?.pathCells).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]);

    store.createLevel({ chapter: 1, stage: 2, rows: 4, cols: 4 });
    await store.flushPersistence();
    expect(repository.savedStates[2]?.activeLevelAddress).toEqual({ chapter: 1, stage: 2 });
  });
});
