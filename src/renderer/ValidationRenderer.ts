import { toGridPositionKey } from '@/core/grid';
import type { GridPosition } from '@/core/model';
import type { ValidationIssue, ValidationSeverity } from '@/core/validation';

import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';

export interface ValidationRenderItem {
  readonly position: Readonly<GridPosition>;
  readonly severity: ValidationSeverity;
  readonly focused: boolean;
}

export function getValidationRenderItems(
  issues: readonly ValidationIssue[],
  focusedPosition: Readonly<GridPosition> | null | undefined,
): readonly ValidationRenderItem[] {
  const items = new Map<string, ValidationRenderItem>();

  for (const issue of issues) {
    if (issue.position === undefined) continue;
    const key = toGridPositionKey(issue.position);
    const existing = items.get(key);
    const severity =
      existing?.severity === 'error' || issue.severity === 'error' ? 'error' : 'warning';
    items.set(key, {
      position: { ...issue.position },
      severity,
      focused:
        focusedPosition !== null &&
        focusedPosition !== undefined &&
        focusedPosition.x === issue.position.x &&
        focusedPosition.y === issue.position.y,
    });
  }

  return Array.from(items.values());
}

export function renderValidation(
  context: CanvasRenderingContext2D,
  issues: readonly ValidationIssue[] | undefined,
  focusedPosition: Readonly<GridPosition> | null | undefined,
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  for (const item of getValidationRenderItems(issues ?? [], focusedPosition)) {
    if (!viewport.isInBounds(item.position)) continue;
    const cell = viewport.gridToCanvas(item.position);
    const inset = item.focused ? 3 : 4;
    const size = Math.max(0, viewport.cellSize - inset * 2);
    context.fillStyle =
      item.severity === 'error' ? theme.validationErrorFill : theme.validationWarningFill;
    context.fillRect(cell.x + inset, cell.y + inset, size, size);
    context.strokeStyle = item.focused
      ? theme.validationFocusStroke
      : item.severity === 'error'
        ? theme.validationErrorStroke
        : theme.validationWarningStroke;
    context.lineWidth = item.focused ? theme.validationLineWidth + 1 : theme.validationLineWidth;
    context.strokeRect(cell.x + inset, cell.y + inset, size, size);
  }
}
