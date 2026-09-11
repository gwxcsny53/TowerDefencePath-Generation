import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import {
  cloneLevelConfig,
  createEditorProject,
  createJunctionConfig,
  createProjectLevel,
  findProjectLevel,
} from '@/editor';
import { PROJECT_BACKUP_FORMAT, PROJECT_BACKUP_SCHEMA_VERSION, serializeLevelConfig } from '@/io';
import { PROJECT_PERSISTENCE_SCHEMA_VERSION } from '@/persistence';
import type { PersistedProjectState, ProjectRepository } from '@/persistence';
import { useEditorStore } from '@/ui/stores/editorStore';

function createImportedLevel(chapter: number, stage: number) {
  const level = cloneLevelConfig(createEditorProject().levels[0]!);
  level.level = { chapter, stage };
  level.pathCells = [{ x: 1, y: 1 }];
  return level;
}

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

describe('editor store import and export', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('imports a unique level, opens it, resets the session, and preserves the active tool', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 1, y: 1 });
    store.endStroke();
    store.selection = { kind: 'path', position: { x: 1, y: 1 } };
    store.runValidation();
    const imported = createImportedLevel(2, 1);

    expect(store.addImportedLevel(imported)).toBe(true);
    expect(store.project.levels).toHaveLength(2);
    expect(store.activeLevelAddress).toEqual({ chapter: 2, stage: 1 });
    expect(findProjectLevel(store.project, { chapter: 2, stage: 1 })).toBe(store.workingLevel);
    expect(store.canUndo).toBe(false);
    expect(store.selection).toBeNull();
    expect(store.validationStatus).toBe('not-run');
    expect(store.routePreviewRun).toBeNull();
    expect(store.activeTool).toBe('path');
  });

  it('replaces a conflicted imported level without duplicates and imports copies independently', () => {
    const store = useEditorStore();
    const conflicting = createImportedLevel(1, 1);
    conflicting.pathCells = [{ x: 3, y: 3 }];

    expect(store.replaceImportedLevel(conflicting)).toBe(true);
    expect(store.project.levels).toHaveLength(1);
    expect(store.workingLevel.pathCells).toEqual([{ x: 3, y: 3 }]);

    const junctionLevel = createImportedLevel(1, 1);
    junctionLevel.pathCells = [
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ];
    const junctionSource = createJunctionConfig(junctionLevel, { x: 1, y: 1 });
    expect(store.addImportedLevelAsCopy(junctionSource)).toBe(true);
    const copy = findProjectLevel(store.project, { chapter: 1, stage: 2 });
    expect(copy).not.toBeNull();
    expect(copy?.junctions).toHaveLength(1);
    expect(copy?.junctions).not.toBe(junctionSource.junctions);
    expect(copy?.junctions[0]?.transitions).not.toBe(junctionSource.junctions[0]?.transitions);
  });

  it('replaces the project backup in the local slot and restores or falls back from its active address', () => {
    const store = useEditorStore();
    store.setActiveTool('tower');
    const backupProject = createProjectLevel(createEditorProject('other-project', '恢复项目'), {
      chapter: 2,
      stage: 1,
      rows: 5,
      cols: 6,
    });

    const backup = {
      format: PROJECT_BACKUP_FORMAT,
      schemaVersion: PROJECT_BACKUP_SCHEMA_VERSION,
      project: backupProject,
      activeLevelAddress: { chapter: 2, stage: 1 },
    } as const;
    store.replaceProjectFromBackup(backup);

    expect(store.project.id).toBe('project_01');
    expect(store.project.name).toBe('恢复项目');
    expect(store.project.levels).toHaveLength(2);
    expect(store.activeLevelAddress).toEqual({ chapter: 2, stage: 1 });

    store.replaceProjectFromBackup({ ...backup, activeLevelAddress: { chapter: 9, stage: 9 } });
    expect(store.activeLevelAddress).toEqual({ chapter: 1, stage: 1 });
    expect(store.canUndo).toBe(false);
    expect(store.selection).toBeNull();
    expect(store.activeTool).toBe('tower');
  });

  it('exports without changing project, selection, or redo state', () => {
    const store = useEditorStore();
    store.setActiveTool('path');
    store.beginStroke({ x: 1, y: 1 });
    store.endStroke();
    store.undo();
    store.setActiveTool('select');
    store.beginStroke({ x: 0, y: 0 });
    const project = store.project;
    const selection = store.selection;

    const levelFile = store.createCurrentLevelExport();
    const backupFile = store.createProjectBackupExport();

    expect(store.project).toBe(project);
    expect(store.selection).toBe(selection);
    expect(store.canRedo).toBe(true);
    expect(JSON.parse(levelFile.content)).not.toHaveProperty('project');
    expect(JSON.parse(backupFile.content)).toMatchObject({
      project: { id: 'project_01' },
      activeLevelAddress: store.activeLevelAddress,
    });
    expect(serializeLevelConfig(store.workingLevel)).toEqual(levelFile);
  });

  it('persists imported structural changes through the existing autosave repository', async () => {
    const repository = new FakeProjectRepository();
    const store = useEditorStore();
    await store.initializePersistence(repository);

    expect(repository.savedStates).toHaveLength(1);
    store.addImportedLevel(createImportedLevel(2, 1));
    await store.flushPersistence();

    expect(repository.savedStates).toHaveLength(2);
    expect(repository.savedStates[1]).toMatchObject({
      schemaVersion: PROJECT_PERSISTENCE_SCHEMA_VERSION,
      activeLevelAddress: { chapter: 2, stage: 1 },
    });
  });
});
