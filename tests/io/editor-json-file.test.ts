import { describe, expect, it } from 'vitest';

import { createEditorProject, createProjectLevel } from '@/editor';
import {
  EditorImportError,
  parseEditorImportText,
  PROJECT_BACKUP_FORMAT,
  PROJECT_BACKUP_SCHEMA_VERSION,
  ProjectBackupFileSchema,
  sanitizeFilename,
  serializeLevelConfig,
  serializeProjectBackup,
} from '@/io';
import { LevelConfigSchema } from '@/persistence';

describe('editor JSON files', () => {
  it('serializes a runtime level as only LevelConfig with a deterministic filename', () => {
    const level = createEditorProject().levels[0]!;
    level.level = { chapter: 1, stage: 3 };

    const file = serializeLevelConfig(level);
    const parsed = JSON.parse(file.content) as unknown;

    expect(file.filename).toBe('level-c1-s3.json');
    expect(LevelConfigSchema.safeParse(parsed).success).toBe(true);
    expect(parsed).not.toHaveProperty('project');
    expect(file.content.endsWith('\n')).toBe(true);
  });

  it('serializes a versioned project backup with its active level', () => {
    const project = createProjectLevel(createEditorProject('project_01', '未命名项目'), {
      chapter: 2,
      stage: 1,
      rows: 6,
      cols: 7,
    });
    const file = serializeProjectBackup(project, { chapter: 2, stage: 1 });
    const parsed = JSON.parse(file.content) as unknown;

    expect(file.filename).toBe('未命名项目.tdpe-project.json');
    expect(ProjectBackupFileSchema.safeParse(parsed).success).toBe(true);
    expect(parsed).toMatchObject({
      format: PROJECT_BACKUP_FORMAT,
      schemaVersion: PROJECT_BACKUP_SCHEMA_VERSION,
      activeLevelAddress: { chapter: 2, stage: 1 },
    });
  });

  it('round-trips valid level and project backup files into typed plain payloads', () => {
    const level = createEditorProject().levels[0]!;
    const levelPayload = parseEditorImportText(serializeLevelConfig(level).content);
    const projectPayload = parseEditorImportText(
      serializeProjectBackup(createEditorProject(), { chapter: 1, stage: 1 }).content,
    );

    expect(levelPayload).toMatchObject({ kind: 'level', level });
    expect(projectPayload).toMatchObject({
      kind: 'project-backup',
      backup: { format: PROJECT_BACKUP_FORMAT },
    });
    expect(levelPayload.kind === 'level' && levelPayload.level).not.toBe(level);
  });

  it('rejects a project backup with duplicate level addresses', () => {
    const project = createEditorProject();
    const text = JSON.stringify({
      format: PROJECT_BACKUP_FORMAT,
      schemaVersion: PROJECT_BACKUP_SCHEMA_VERSION,
      project: { ...project, levels: [...project.levels, project.levels[0]] },
      activeLevelAddress: { chapter: 1, stage: 1 },
    });

    expect(() => parseEditorImportText(text)).toThrowError(EditorImportError);
    try {
      parseEditorImportText(text);
    } catch (error) {
      expect((error as EditorImportError).code).toBe('invalid-project-backup');
    }
  });

  it('sanitizes project backup filenames and supplies a fallback name', () => {
    expect(sanitizeFilename(' A<B>:"C/D\\E|F?G* ')).toBe('A_B___C_D_E_F_G_');
    expect(sanitizeFilename('   ')).toBe('tower-defense-project');
  });

  it.each([
    ['{', 'invalid-json'],
    ['{}', 'invalid-level'],
    ['{"version":2}', 'unsupported-version'],
    [
      JSON.stringify({ format: PROJECT_BACKUP_FORMAT, schemaVersion: 1, project: {} }),
      'invalid-project-backup',
    ],
    [JSON.stringify({ format: PROJECT_BACKUP_FORMAT, schemaVersion: 2 }), 'unsupported-version'],
  ])('rejects invalid import text with %s', (text, code) => {
    try {
      parseEditorImportText(text);
      throw new Error('Expected import parsing to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(EditorImportError);
      expect((error as EditorImportError).code).toBe(code);
    }
  });
});
