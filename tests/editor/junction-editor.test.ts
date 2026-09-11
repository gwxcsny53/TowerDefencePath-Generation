import { describe, expect, it } from 'vitest';
import {
  createJunctionConfig,
  getJunctionEditorState,
  removeJunctionConfig,
  selectAt,
  setJunctionEntryEnabled,
  setJunctionExitEnabled,
  setJunctionExitWeight,
} from '@/editor';
import { createLevel } from '../core/validation/fixtures';

const position = { x: 1, y: 1 };
function candidate() {
  return createLevel({
    grid: { rows: 4, cols: 4 },
    pathCells: [position, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }],
  });
}

describe('junction editor', () => {
  it('recognizes, selects, creates, and removes a candidate config immutably', () => {
    const level = candidate();
    const before = structuredClone(level);
    expect(getJunctionEditorState(level, position).isCandidate).toBe(true);
    expect(selectAt(level, position)).toMatchObject({ kind: 'junction' });
    const created = createJunctionConfig(level, position);
    expect(level).toEqual(before);
    expect(created.junctions[0].id).toBe('junction_01');
    expect(createJunctionConfig(created, position)).toBe(created);
    expect(removeJunctionConfig(created, position).junctions).toHaveLength(0);
  });
  it('allows only physical entries and exits, redistributes weights, and preserves manual weights', () => {
    let level = createJunctionConfig(candidate(), position);
    level = setJunctionEntryEnabled(level, position, 'left', true);
    expect(setJunctionEntryEnabled(level, position, 'down', true)).toBe(level);
    level = setJunctionExitEnabled(level, position, 'left', 'up', true);
    expect(getJunctionEditorState(level, position).transitions[0].exits[0].weight).toBe(1);
    level = setJunctionExitEnabled(level, position, 'left', 'right', true);
    expect(
      getJunctionEditorState(level, position).transitions[0].exits.map((item) => item.weight),
    ).toEqual([0.5, 0.5]);
    expect(setJunctionExitEnabled(level, position, 'left', 'left', true)).toBe(level);
    const manual = setJunctionExitWeight(level, position, 'left', 'up', 0.8);
    expect(
      getJunctionEditorState(manual, position).transitions[0].exits.map((item) => item.weight),
    ).toEqual([0.8, 0.5]);
    expect(setJunctionExitWeight(manual, position, 'left', 'up', 0)).toBe(manual);
  });
  it('keeps stale configs selectable after topology changes', () => {
    const configured = createJunctionConfig(candidate(), position);
    const stale = {
      ...configured,
      pathCells: configured.pathCells.filter((cell) => cell.x !== 2 || cell.y !== 1),
    };
    expect(getJunctionEditorState(stale, position)).toMatchObject({
      isCandidate: false,
      junctionId: 'junction_01',
    });
    expect(selectAt(stale, position)).toMatchObject({ kind: 'junction' });
  });
});
