import type { LevelConfig } from '@/core/model';

export interface LevelAddress {
  readonly chapter: number;
  readonly stage: number;
}

export interface EditorProject {
  readonly id: string;
  readonly name: string;
  readonly levels: readonly LevelConfig[];
}

export interface NewLevelSpec {
  readonly chapter: number;
  readonly stage: number;
  readonly rows: number;
  readonly cols: number;
}

export interface ProjectChapter {
  readonly chapter: number;
  readonly levels: readonly LevelConfig[];
}
