import { describe, expect, it } from 'vitest';

import {
  cloneLevelConfig,
  createEditorProject,
  createJunctionConfig,
  createProjectLevel,
  deleteProjectLevel,
  duplicateProjectLevel,
  findProjectLevel,
  getNextAvailableStage,
  replaceProjectLevel,
  setJunctionEntryEnabled,
  setJunctionExitEnabled,
  sortProjectLevels,
} from '@/editor';

describe('EditorProject', () => {
  it('creates the default project with level 1-1', () => {
    const project = createEditorProject();

    expect(project).toMatchObject({ id: 'project_01', name: '未命名项目' });
    expect(project.levels[0]?.level).toEqual({ chapter: 1, stage: 1 });
  });

  it('creates only valid, unique level addresses and sorts without mutating project levels', () => {
    const project = createEditorProject();
    const withTwoThree = createProjectLevel(project, { chapter: 2, stage: 3, rows: 8, cols: 9 });
    const withOneTen = createProjectLevel(withTwoThree, {
      chapter: 1,
      stage: 10,
      rows: 6,
      cols: 7,
    });

    expect(createProjectLevel(withOneTen, { chapter: 1, stage: 1, rows: 2, cols: 2 })).toBe(
      withOneTen,
    );
    expect(createProjectLevel(withOneTen, { chapter: 0, stage: 1, rows: 2, cols: 2 })).toBe(
      withOneTen,
    );
    expect(createProjectLevel(withOneTen, { chapter: 1, stage: 0, rows: 2, cols: 2 })).toBe(
      withOneTen,
    );
    expect(createProjectLevel(withOneTen, { chapter: 1, stage: 2, rows: 1.5, cols: 2 })).toBe(
      withOneTen,
    );
    expect(createProjectLevel(withOneTen, { chapter: 1, stage: 2, rows: 2, cols: 0 })).toBe(
      withOneTen,
    );
    expect(sortProjectLevels(withOneTen).map((level) => level.level)).toEqual([
      { chapter: 1, stage: 1 },
      { chapter: 1, stage: 10 },
      { chapter: 2, stage: 3 },
    ]);
    expect(withOneTen.levels.map((level) => level.level)).toEqual([
      { chapter: 1, stage: 1 },
      { chapter: 2, stage: 3 },
      { chapter: 1, stage: 10 },
    ]);
  });

  it('finds levels and chooses the first available stage in a chapter', () => {
    const oneThree = createProjectLevel(createEditorProject(), {
      chapter: 1,
      stage: 3,
      rows: 4,
      cols: 4,
    });
    const consecutive = createProjectLevel(
      createProjectLevel(oneThree, { chapter: 1, stage: 2, rows: 4, cols: 4 }),
      { chapter: 1, stage: 4, rows: 4, cols: 4 },
    );

    expect(findProjectLevel(oneThree, { chapter: 1, stage: 3 })?.grid).toEqual({
      rows: 4,
      cols: 4,
    });
    expect(getNextAvailableStage(oneThree, 1)).toBe(2);
    expect(getNextAvailableStage(consecutive, 1)).toBe(5);
  });

  it('deeply clones and duplicates complete level data without shared nested structures', () => {
    const base = createEditorProject();
    const junctionPosition = { x: 1, y: 1 };
    const original = setJunctionExitEnabled(
      setJunctionEntryEnabled(
        createJunctionConfig(
          {
            ...base.levels[0]!,
            pathCells: [
              { x: 1, y: 1 },
              { x: 1, y: 0 },
              { x: 0, y: 1 },
              { x: 2, y: 1 },
            ],
            spawnPoints: [{ id: 'spawn_01', x: 0, y: 1 }],
            endPoints: [{ id: 'end_01', x: 2, y: 1 }],
            towerNodes: [{ id: 'tower_01', x: 3, y: 3, locked: false }],
          },
          junctionPosition,
        ),
        junctionPosition,
        'left',
        true,
      ),
      junctionPosition,
      'left',
      'up',
      true,
    );
    const project = replaceProjectLevel(base, { chapter: 1, stage: 1 }, original);
    const clone = cloneLevelConfig(original);
    const duplicated = duplicateProjectLevel(project, { chapter: 1, stage: 1 });
    const copy = findProjectLevel(duplicated, { chapter: 1, stage: 2 });

    expect(clone).toEqual(original);
    expect(clone.pathCells).not.toBe(original.pathCells);
    expect(clone.junctions[0]?.transitions).not.toBe(original.junctions[0]?.transitions);
    expect(clone.junctions[0]?.transitions[0]?.exits).not.toBe(
      original.junctions[0]?.transitions[0]?.exits,
    );
    expect(copy).not.toBeNull();
    expect(copy?.level).toEqual({ chapter: 1, stage: 2 });
    expect(copy?.pathCells).toEqual(original.pathCells);
    expect(copy?.pathCells).not.toBe(original.pathCells);
    expect(copy?.spawnPoints).toEqual(original.spawnPoints);
    expect(copy?.endPoints).toEqual(original.endPoints);
    expect(copy?.towerNodes).toEqual(original.towerNodes);
    expect(copy?.junctions[0]?.transitions[0]?.exits).not.toBe(
      original.junctions[0]?.transitions[0]?.exits,
    );
  });

  it('replaces only the addressed level and never deletes the last project level', () => {
    const project = createProjectLevel(createEditorProject(), {
      chapter: 1,
      stage: 2,
      rows: 4,
      cols: 4,
    });
    const first = project.levels[0]!;
    const second = project.levels[1]!;
    const replacement = { ...second, pathCells: [{ x: 1, y: 1 }] };
    const replaced = replaceProjectLevel(project, { chapter: 1, stage: 2 }, replacement);
    const deleted = deleteProjectLevel(replaced, { chapter: 1, stage: 2 });

    expect(replaced.levels[0]).toBe(first);
    expect(replaced.levels[1]).toBe(replacement);
    expect(replaceProjectLevel(replaced, { chapter: 1, stage: 2 }, replacement)).toBe(replaced);
    expect(deleted.levels).toEqual([first]);
    expect(deleteProjectLevel(deleted, { chapter: 1, stage: 1 })).toBe(deleted);
    expect(project.levels[1]).toBe(second);
  });
});
