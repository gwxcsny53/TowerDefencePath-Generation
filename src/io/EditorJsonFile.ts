import { z } from 'zod';

import { LEVEL_CONFIG_VERSION } from '@/core/model';
import type { LevelConfig } from '@/core/model';
import { EditorProjectSchema, LevelAddressSchema, LevelConfigSchema } from '@/persistence';
import type { EditorProject, LevelAddress } from '@/editor';

export const PROJECT_BACKUP_FORMAT = 'tower-defense-path-editor-project' as const;
export const PROJECT_BACKUP_SCHEMA_VERSION = 1 as const;

export interface ProjectBackupFile {
  readonly format: typeof PROJECT_BACKUP_FORMAT;
  readonly schemaVersion: typeof PROJECT_BACKUP_SCHEMA_VERSION;
  readonly project: EditorProject;
  readonly activeLevelAddress: LevelAddress;
}

export interface JsonExportFile {
  readonly filename: string;
  readonly content: string;
}

export type EditorImportPayload =
  | { readonly kind: 'level'; readonly level: LevelConfig }
  | { readonly kind: 'project-backup'; readonly backup: ProjectBackupFile };

export type EditorImportErrorCode =
  'invalid-json' | 'invalid-level' | 'invalid-project-backup' | 'unsupported-version';

export class EditorImportError extends Error {
  constructor(
    readonly code: EditorImportErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'EditorImportError';
  }
}

export const ProjectBackupFileSchema = z.object({
  format: z.literal(PROJECT_BACKUP_FORMAT),
  schemaVersion: z.literal(PROJECT_BACKUP_SCHEMA_VERSION),
  project: EditorProjectSchema,
  activeLevelAddress: LevelAddressSchema,
});

export function serializeLevelConfig(level: LevelConfig): JsonExportFile {
  const parsedLevel = LevelConfigSchema.parse(level);
  return {
    filename: `level-c${parsedLevel.level.chapter}-s${parsedLevel.level.stage}.json`,
    content: toJson(parsedLevel),
  };
}

export function serializeProjectBackup(
  project: EditorProject,
  activeLevelAddress: LevelAddress,
): JsonExportFile {
  const backup = ProjectBackupFileSchema.parse({
    format: PROJECT_BACKUP_FORMAT,
    schemaVersion: PROJECT_BACKUP_SCHEMA_VERSION,
    project,
    activeLevelAddress,
  });
  return {
    filename: `${sanitizeFilename(backup.project.name)}.tdpe-project.json`,
    content: toJson(backup),
  };
}

export function parseEditorImportText(text: string): EditorImportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new EditorImportError('invalid-json', 'JSON 文件格式无效。', error);
  }
  if (isProjectBackupCandidate(parsed)) return parseProjectBackup(parsed);
  const level = LevelConfigSchema.safeParse(parsed);
  if (!level.success) {
    const code =
      isRecord(parsed) && parsed.version !== undefined && parsed.version !== LEVEL_CONFIG_VERSION
        ? 'unsupported-version'
        : 'invalid-level';
    const message =
      code === 'unsupported-version' ? '当前编辑器不支持该文件版本。' : '关卡文件结构无效。';
    throw new EditorImportError(code, message, level.error);
  }
  return { kind: 'level', level: level.data };
}

export function sanitizeFilename(name: string): string {
  const sanitized = name.replace(/[<>:"/\\|?*]/g, '_').trim();
  return sanitized === '' ? 'tower-defense-project' : sanitized;
}

function parseProjectBackup(candidate: Record<string, unknown>): EditorImportPayload {
  if ('schemaVersion' in candidate && candidate.schemaVersion !== PROJECT_BACKUP_SCHEMA_VERSION)
    throw new EditorImportError('unsupported-version', '当前编辑器不支持该文件版本。');
  const backup = ProjectBackupFileSchema.safeParse(candidate);
  if (!backup.success)
    throw new EditorImportError('invalid-project-backup', '项目备份文件结构无效。', backup.error);
  return { kind: 'project-backup', backup: backup.data };
}

function isProjectBackupCandidate(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && value.format === PROJECT_BACKUP_FORMAT;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
