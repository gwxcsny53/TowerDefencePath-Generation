import { describe, expect, it } from 'vitest';
import { getValidationRenderItems } from '@/renderer';
import type { ValidationIssue } from '@/core/validation';

function issue(overrides: Partial<ValidationIssue> = {}): ValidationIssue {
  return {
    severity: 'warning',
    code: 'PATH_ISOLATED',
    message: 'path isolated',
    ...overrides,
  };
}

describe('getValidationRenderItems', () => {
  it('ignores issues without a position', () => {
    expect(getValidationRenderItems([issue()], null)).toEqual([]);
  });

  it('deduplicates positions and gives errors priority over warnings', () => {
    const items = getValidationRenderItems(
      [
        issue({ position: { x: 1, y: 2 } }),
        issue({ severity: 'error', code: 'PATH_ISOLATED', position: { x: 1, y: 2 } }),
      ],
      { x: 1, y: 2 },
    );

    expect(items).toEqual([{ position: { x: 1, y: 2 }, severity: 'error', focused: true }]);
  });

  it('retains markers at distinct positions', () => {
    const items = getValidationRenderItems(
      [issue({ position: { x: 1, y: 2 } }), issue({ position: { x: 2, y: 2 } })],
      null,
    );

    expect(items).toHaveLength(2);
    expect(items.every((item) => item.focused === false)).toBe(true);
  });
});
