import { describe, expect, it } from 'vitest';

import { createEditorProject, createProjectLevel } from '@/editor';
import {
  EditorProjectSchema,
  LevelConfigSchema,
  PROJECT_PERSISTENCE_SCHEMA_VERSION,
  PersistedProjectStateSchema,
} from '@/persistence';

describe('persistence schemas', () => {
  it('parses a complete valid persisted project state', () => {
    const project = createProjectLevel(createEditorProject(), {
      chapter: 2,
      stage: 1,
      rows: 8,
      cols: 9,
    });

    const result = PersistedProjectStateSchema.safeParse({
      schemaVersion: PROJECT_PERSISTENCE_SCHEMA_VERSION,
      project,
      activeLevelAddress: { chapter: 2, stage: 1 },
      updatedAt: 123,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid directions, non-finite weights, and malformed coordinates', () => {
    const level = createEditorProject().levels[0]!;

    expect(
      LevelConfigSchema.safeParse({
        ...level,
        junctions: [
          {
            id: 'junction_01',
            x: 1,
            y: 1,
            transitions: [{ enterFrom: 'diagonal', exits: [{ exitTo: 'up', weight: 1 }] }],
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      LevelConfigSchema.safeParse({
        ...level,
        junctions: [
          {
            id: 'junction_01',
            x: 1,
            y: 1,
            transitions: [{ enterFrom: 'left', exits: [{ exitTo: 'up', weight: Infinity }] }],
          },
        ],
      }).success,
    ).toBe(false);
    expect(LevelConfigSchema.safeParse({ ...level, pathCells: [{ x: 1.5, y: 0 }] }).success).toBe(
      false,
    );
  });

  it('rejects invalid project addresses and duplicate levels', () => {
    const project = createEditorProject();

    expect(
      EditorProjectSchema.safeParse({ ...project, id: '', levels: project.levels }).success,
    ).toBe(false);
    expect(
      EditorProjectSchema.safeParse({ ...project, levels: [...project.levels, project.levels[0]] })
        .success,
    ).toBe(false);
    expect(
      PersistedProjectStateSchema.safeParse({
        schemaVersion: PROJECT_PERSISTENCE_SCHEMA_VERSION,
        project,
        activeLevelAddress: { chapter: 0, stage: 1 },
        updatedAt: 1,
      }).success,
    ).toBe(false);
  });
});
