import { GraphBuilder } from '@/core/graph';
import { GridMap } from '@/core/grid';
import type { LevelConfig } from '@/core/model';

import { renderGrid } from './GridRenderer';
import { renderJunctions } from './JunctionRenderer';
import { renderNodes } from './NodeRenderer';
import { renderPaths } from './PathRenderer';
import { DEFAULT_RENDER_THEME } from './RenderTheme';
import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';

/** Coordinates the full immediate-mode rendering order for one level. */
export class MapRenderer {
  constructor(private readonly theme: RenderTheme = DEFAULT_RENDER_THEME) {}

  render(context: CanvasRenderingContext2D, level: LevelConfig, viewport: RenderViewport): void {
    context.clearRect(0, 0, viewport.canvasWidth, viewport.canvasHeight);

    if (!viewport.isValid) {
      return;
    }

    const gridMap = new GridMap(level.grid, level.pathCells);
    const graph = GraphBuilder.build(gridMap);

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
  }
}
