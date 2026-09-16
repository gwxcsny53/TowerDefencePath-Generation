import { describe, expect, it } from 'vitest';

import { DEFAULT_SPAWN_MOVE_SECONDS_PER_CELL } from '@/core/model';
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

  it('defaults legacy spawn timing and rejects invalid timing values', () => {
    const level = createEditorProject().levels[0]!;
    const legacyLevel = {
      ...level,
      spawnPoints: [{ id: 'spawn_01', x: 0, y: 0 }],
    };
    const parsed = LevelConfigSchema.parse(legacyLevel);

    expect(parsed.spawnPoints[0]?.moveSecondsPerCell).toBe(DEFAULT_SPAWN_MOVE_SECONDS_PER_CELL);
    expect(
      LevelConfigSchema.safeParse({
        ...level,
        spawnPoints: [{ id: 'spawn_01', x: 0, y: 0, moveSecondsPerCell: 0.8 }],
      }).success,
    ).toBe(true);
    for (const moveSecondsPerCell of [0, -0.1, Infinity, Number.NaN]) {
      expect(
        LevelConfigSchema.safeParse({
          ...level,
          spawnPoints: [{ id: 'spawn_01', x: 0, y: 0, moveSecondsPerCell }],
        }).success,
      ).toBe(false);
    }

    const project = { ...createEditorProject(), levels: [legacyLevel] };
    expect(EditorProjectSchema.safeParse(project).success).toBe(true);
    expect(
      PersistedProjectStateSchema.safeParse({
        schemaVersion: PROJECT_PERSISTENCE_SCHEMA_VERSION,
        project,
        activeLevelAddress: { chapter: 1, stage: 1 },
        updatedAt: 1,
      }).data?.project.levels[0]?.spawnPoints[0]?.moveSecondsPerCell,
    ).toBe(DEFAULT_SPAWN_MOVE_SECONDS_PER_CELL);
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
