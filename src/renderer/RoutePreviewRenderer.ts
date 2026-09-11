import type { GridPosition } from '@/core/model';

import type { RenderTheme } from './RenderTheme';
import type { CanvasPoint, RenderViewport } from './RenderViewport';

export interface RoutePreviewRenderState {
  readonly path: readonly Readonly<GridPosition>[];
  readonly segmentIndex: number;
  readonly progress: number;
  readonly completed: boolean;
}

export interface RoutePreviewGeometry {
  readonly visitedPoints: readonly CanvasPoint[];
  readonly marker: CanvasPoint | null;
}

export function getRoutePreviewGeometry(
  state: RoutePreviewRenderState,
  viewport: RenderViewport,
): RoutePreviewGeometry {
  if (state.path.length === 0) return { visitedPoints: [], marker: null };
  const lastPathIndex = state.path.length - 1;
  if (state.completed) {
    const visitedPoints = state.path.map((position) => viewport.gridCellCenter(position));
    return { visitedPoints, marker: visitedPoints[lastPathIndex] ?? null };
  }

  const segmentIndex = Math.min(Math.max(0, state.segmentIndex), lastPathIndex - 1);
  const from = viewport.gridCellCenter(state.path[segmentIndex]!);
  const to = viewport.gridCellCenter(state.path[segmentIndex + 1]!);
  const progress = Math.min(1, Math.max(0, Number.isFinite(state.progress) ? state.progress : 0));
  const marker = {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
  const visitedPoints = state.path
    .slice(0, segmentIndex + 1)
    .map((position) => viewport.gridCellCenter(position));
  if (progress > 0) visitedPoints.push(marker);
  return { visitedPoints, marker };
}

export function renderRoutePreview(
  context: CanvasRenderingContext2D,
  state: RoutePreviewRenderState | null | undefined,
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  if (state === null || state === undefined) return;
  const geometry = getRoutePreviewGeometry(state, viewport);
  if (geometry.visitedPoints.length >= 2) {
    context.beginPath();
    context.moveTo(geometry.visitedPoints[0]!.x, geometry.visitedPoints[0]!.y);
    for (const point of geometry.visitedPoints.slice(1)) context.lineTo(point.x, point.y);
    context.strokeStyle = theme.routePreviewStroke;
    context.lineWidth = theme.routePreviewLineWidth;
    context.stroke();
  }
  if (geometry.marker === null) return;
  context.beginPath();
  context.arc(
    geometry.marker.x,
    geometry.marker.y,
    viewport.cellSize * theme.routePreviewMarkerScale,
    0,
    Math.PI * 2,
  );
  context.fillStyle = theme.routePreviewMarkerFill;
  context.fill();
  context.strokeStyle = theme.routePreviewMarkerStroke;
  context.lineWidth = theme.routePreviewLineWidth;
  context.stroke();
}
