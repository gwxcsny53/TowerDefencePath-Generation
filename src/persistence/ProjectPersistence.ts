import type { EditorProject, LevelAddress } from '@/editor';

export const PROJECT_PERSISTENCE_SCHEMA_VERSION = 1 as const;

export interface PersistedProjectState {
  readonly schemaVersion: typeof PROJECT_PERSISTENCE_SCHEMA_VERSION;
  readonly project: EditorProject;
  readonly activeLevelAddress: LevelAddress;
  readonly updatedAt: number;
}

export interface ProjectRepository {
  load(projectId: string): Promise<PersistedProjectState | null>;
  save(state: PersistedProjectState): Promise<void>;
  delete(projectId: string): Promise<void>;
}

export type ProjectPersistenceErrorCode =
  'open-failed' | 'read-failed' | 'write-failed' | 'invalid-data' | 'unsupported-version';

export class ProjectPersistenceError extends Error {
  constructor(
    readonly code: ProjectPersistenceErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ProjectPersistenceError';
  }
}
