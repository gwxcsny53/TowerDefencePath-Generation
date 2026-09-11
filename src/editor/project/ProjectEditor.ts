import type { LevelConfig } from '@/core/model';

import { createEmptyLevelConfig } from '../LevelEditor';
import type { EditorProject, LevelAddress, NewLevelSpec, ProjectChapter } from './EditorProject';

export function createEditorProject(id = 'project_01', name = '未命名项目'): EditorProject {
  return { id, name, levels: [createEmptyLevelConfig(1, 1, 20, 20)] };
}

export function findProjectLevel(
  project: EditorProject,
  address: LevelAddress,
): LevelConfig | null {
  return (
    project.levels.find(
      (level) => level.level.chapter === address.chapter && level.level.stage === address.stage,
    ) ?? null
  );
}

export function sortProjectLevels(project: EditorProject): readonly LevelConfig[] {
  return [...project.levels].sort(compareLevels);
}

export function getProjectChapters(project: EditorProject): readonly ProjectChapter[] {
  const chapters = new Map<number, LevelConfig[]>();
  for (const level of sortProjectLevels(project)) {
    const chapter = chapters.get(level.level.chapter);
    if (chapter === undefined) chapters.set(level.level.chapter, [level]);
    else chapter.push(level);
  }
  return Array.from(chapters, ([chapter, levels]) => ({ chapter, levels }));
}

export function createProjectLevel(project: EditorProject, spec: NewLevelSpec): EditorProject {
  if (!isValidNewLevelSpec(spec) || findProjectLevel(project, spec) !== null) return project;
  return {
    ...project,
    levels: [
      ...project.levels,
      createEmptyLevelConfig(spec.chapter, spec.stage, spec.rows, spec.cols),
    ],
  };
}

export function addProjectLevel(project: EditorProject, level: LevelConfig): EditorProject {
  if (findProjectLevel(project, level.level) !== null) return project;
  return { ...project, levels: [...project.levels, level] };
}

export function getNextAvailableStage(project: EditorProject, chapter: number): number {
  const stages = new Set(
    project.levels
      .filter((level) => level.level.chapter === chapter)
      .map((level) => level.level.stage),
  );
  let stage = 1;
  while (stages.has(stage)) stage += 1;
  return stage;
}

export function cloneLevelConfig(level: LevelConfig): LevelConfig {
  return {
    ...level,
    level: { ...level.level },
    grid: { ...level.grid },
    pathCells: level.pathCells.map((position) => ({ ...position })),
    spawnPoints: level.spawnPoints.map((spawnPoint) => ({ ...spawnPoint })),
    endPoints: level.endPoints.map((endPoint) => ({ ...endPoint })),
    towerNodes: level.towerNodes.map((towerNode) => ({ ...towerNode })),
    junctions: level.junctions.map((junction) => ({
      ...junction,
      transitions: junction.transitions.map((transition) => ({
        ...transition,
        exits: transition.exits.map((exit) => ({ ...exit })),
      })),
    })),
  };
}

export function duplicateProjectLevel(
  project: EditorProject,
  address: LevelAddress,
): EditorProject {
  const source = findProjectLevel(project, address);
  if (source === null) return project;
  const stage = getNextAvailableStage(project, source.level.chapter);
  const copy = cloneLevelConfig(source);
  copy.level = { chapter: source.level.chapter, stage };
  return { ...project, levels: [...project.levels, copy] };
}

export function deleteProjectLevel(project: EditorProject, address: LevelAddress): EditorProject {
  if (project.levels.length <= 1 || findProjectLevel(project, address) === null) return project;
  return {
    ...project,
    levels: project.levels.filter(
      (level) => level.level.chapter !== address.chapter || level.level.stage !== address.stage,
    ),
  };
}

export function replaceProjectLevel(
  project: EditorProject,
  address: LevelAddress,
  replacement: LevelConfig,
): EditorProject {
  const currentLevel = findProjectLevel(project, address);
  if (
    currentLevel === null ||
    currentLevel === replacement ||
    replacement.level.chapter !== address.chapter ||
    replacement.level.stage !== address.stage
  )
    return project;
  return {
    ...project,
    levels: project.levels.map((level) =>
      level.level.chapter === address.chapter && level.level.stage === address.stage
        ? replacement
        : level,
    ),
  };
}

export function isValidNewLevelSpec(spec: NewLevelSpec): boolean {
  return [spec.chapter, spec.stage, spec.rows, spec.cols].every(
    (value) => Number.isFinite(value) && Number.isInteger(value) && value > 0,
  );
}

function compareLevels(left: LevelConfig, right: LevelConfig): number {
  return left.level.chapter - right.level.chapter || left.level.stage - right.level.stage;
}
