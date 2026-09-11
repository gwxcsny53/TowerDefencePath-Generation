import { GraphBuilder } from '@/core/graph';
import type { PathGraph } from '@/core/graph';
import { GridMap } from '@/core/grid';
import type { LevelConfig } from '@/core/model';
import type { GridPosition } from '@/core/model';
import type { ValidationIssue } from '@/core/validation';

import { renderGrid } from './GridRenderer';
import { renderJunctions } from './JunctionRenderer';
import { renderNodes } from './NodeRenderer';
import { renderPaths } from './PathRenderer';
import { DEFAULT_RENDER_THEME } from './RenderTheme';
import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';
import { renderSelection } from './SelectionRenderer';
import { renderValidation } from './ValidationRenderer';
import { renderRoutePreview } from './RoutePreviewRenderer';
import type { RoutePreviewRenderState } from './RoutePreviewRenderer';

export interface MapRenderOptions {
  readonly selectedPosition?: Readonly<GridPosition> | null;
  readonly validationIssues?: readonly ValidationIssue[];
  readonly focusedValidationPosition?: Readonly<GridPosition> | null;
  readonly routePreview?: RoutePreviewRenderState | null;
}

/** Builds topology for rendering without letting out-of-bounds paths affect visible candidates. */
export function createRenderGraph(level: LevelConfig): PathGraph {
  const rawGridMap = new GridMap(level.grid, level.pathCells);
  const renderablePathCells = level.pathCells.filter((position) => rawGridMap.isInBounds(position));
  const analysisGridMap = new GridMap(level.grid, renderablePathCells);

  return GraphBuilder.build(analysisGridMap);
}

/** Coordinates the full immediate-mode rendering order for one level. */
export class MapRenderer {
  constructor(private readonly theme: RenderTheme = DEFAULT_RENDER_THEME) {}

  render(
    context: CanvasRenderingContext2D,
    level: LevelConfig,
    viewport: RenderViewport,
    options: MapRenderOptions = {},
  ): void {
    context.clearRect(0, 0, viewport.canvasWidth, viewport.canvasHeight);

    if (!viewport.isValid) {
      return;
    }

    const graph = createRenderGraph(level);

    renderGrid(context, viewport, this.theme);
    renderPaths(context, level.pathCells, viewport, this.theme);
    renderNodes(
      context,
      level.spawnPoints,
      level.endPoints,
      level.towerNodes,
      viewport,
      this.theme,
    );
    renderJunctions(context, graph, level.junctions, viewport, this.theme);
    renderSelection(context, options.selectedPosition, viewport);
    renderValidation(
      context,
      options.validationIssues,
      options.focusedValidationPosition,
      viewport,
      this.theme,
    );
    renderRoutePreview(context, options.routePreview, viewport, this.theme);
  }
}
