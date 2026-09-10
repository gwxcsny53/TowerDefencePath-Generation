import { describe, expect, it } from 'vitest';
import {
  addPath,
  addPathCells,
  createNextEntityId,
  eraseCell,
  placeEnd,
  placeSpawn,
  placeTower,
  selectAt,
  setTowerLocked,
} from '@/editor';
import { createLevel } from '../core/validation/fixtures';

describe('level editor operations', () => {
  it('adds paths immutably and ignores duplicate paths', () => {
    const original = createLevel();
    const before = structuredClone(original);
    const updated = addPath(original, { x: 1, y: 1 });
    expect(original).toEqual(before);
    expect(updated).not.toBe(original);
    expect(addPath(updated, { x: 1, y: 1 })).toBe(updated);
  });
  it('does not add paths over towers and places unlocked towers only off path', () => {
    const withTower = placeTower(createLevel(), { x: 1, y: 1 });
    expect(addPath(withTower, { x: 1, y: 1 })).toBe(withTower);
    const withPath = addPath(createLevel(), { x: 1, y: 1 });
    expect(placeTower(withPath, { x: 1, y: 1 })).toBe(withPath);
    expect(withTower.towerNodes[0].locked).toBe(false);
  });
  it('erases path-related entities and towers without deleting junction configs', () => {
    const level = createLevel({
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn_01', x: 0, y: 0 }],
      endPoints: [{ id: 'end_01', x: 1, y: 0 }],
      towerNodes: [{ id: 'tower_01', x: 2, y: 2, locked: false }],
      junctions: [{ id: 'junction_01', x: 1, y: 1, transitions: [] }],
    });
    const erasedPath = eraseCell(level, { x: 0, y: 0 });
    expect(erasedPath.pathCells).toHaveLength(1);
    expect(erasedPath.spawnPoints).toHaveLength(0);
    expect(erasedPath.junctions).toEqual(level.junctions);
    expect(eraseCell(level, { x: 2, y: 2 }).towerNodes).toHaveLength(0);
    expect(eraseCell(level, { x: 1, y: 0 }).endPoints).toHaveLength(0);
  });
  it('places spawn and end only on current endpoint paths', () => {
    const path = addPathCells(createLevel(), [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
    expect(placeSpawn(path, { x: 0, y: 0 }).spawnPoints).toHaveLength(1);
    expect(placeEnd(path, { x: 2, y: 0 }).endPoints).toHaveLength(1);
    expect(placeSpawn(path, { x: 1, y: 0 })).toBe(path);
    expect(placeEnd(path, { x: 4, y: 4 })).toBe(path);
  });
  it('updates tower locked immutably and selects entities by priority', () => {
    const level = createLevel({
      pathCells: [{ x: 1, y: 1 }],
      spawnPoints: [{ id: 'spawn_01', x: 1, y: 1 }],
      endPoints: [{ id: 'end_01', x: 1, y: 1 }],
      towerNodes: [{ id: 'tower_01', x: 1, y: 1, locked: false }],
    });
    expect(selectAt(level, { x: 1, y: 1 })).toMatchObject({ kind: 'tower', id: 'tower_01' });
    expect(selectAt(level, { x: 4, y: 4 })).toBeNull();
    expect(setTowerLocked(level, 'tower_01', true).towerNodes[0].locked).toBe(true);
  });
  it('selects path, spawn, and end cells when no higher-priority entity exists', () => {
    const level = createLevel({
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      spawnPoints: [{ id: 'spawn_01', x: 0, y: 0 }],
      endPoints: [{ id: 'end_01', x: 2, y: 0 }],
    });
    expect(selectAt(level, { x: 0, y: 0 })).toMatchObject({ kind: 'spawn' });
    expect(selectAt(level, { x: 1, y: 0 })).toMatchObject({ kind: 'path' });
    expect(selectAt(level, { x: 2, y: 0 })).toMatchObject({ kind: 'end' });
  });
  it('generates non-conflicting readable ids', () => {
    expect(createNextEntityId('spawn', ['spawn_01', 'custom', 'spawn_03'])).toBe('spawn_02');
  });
});
