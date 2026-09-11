import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createJunctionConfig } from '@/editor';
import { useEditorStore } from '@/ui/stores/editorStore';
import { createLevel } from '../core/validation/fixtures';

describe('editor store selection reconciliation', () => {
  beforeEach(() => setActivePinia(createPinia()));
  it('keeps a stale configured junction selected after erasing its path cell', () => {
    const store = useEditorStore();
    const position = { x: 1, y: 1 };
    store.workingLevel = createJunctionConfig(
      createLevel({
        grid: { rows: 4, cols: 4 },
        pathCells: [position, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }],
      }),
      position,
    );
    store.selection = { kind: 'junction', position };
    store.setActiveTool('eraser');
    store.beginStroke(position);
    expect(store.workingLevel.junctions).toHaveLength(1);
    expect(store.selection).toMatchObject({ kind: 'junction' });
  });
});
