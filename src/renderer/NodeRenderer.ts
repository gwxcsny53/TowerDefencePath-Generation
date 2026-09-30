import type { EndPoint, SpawnPoint, TowerNode } from '@/core/model';

import {
  getMarkerGlyphMetrics,
  renderEndMarker,
  renderSpawnMarker,
  renderTowerMarker,
} from './MarkerGlyphRenderer';
import type { RenderTheme } from './RenderTheme';
import type { RenderViewport } from './RenderViewport';

/** Draws in-bounds spawn points, end points, and tower nodes. */
export function renderNodes(
  context: CanvasRenderingContext2D,
  spawnPoints: readonly SpawnPoint[],
  endPoints: readonly EndPoint[],
  towerNodes: readonly TowerNode[],
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  if (!viewport.isValid) {
    return;
  }

  renderSpawnMarkers(context, spawnPoints, viewport, theme);
  renderEndMarkers(context, endPoints, viewport, theme);
  renderTowerNodes(context, towerNodes, viewport, theme);
}

function renderSpawnMarkers(
  context: CanvasRenderingContext2D,
  spawnPoints: readonly SpawnPoint[],
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  const metrics = getMarkerGlyphMetrics(viewport.cellSize, theme.markerScale);

  for (const position of spawnPoints) {
    if (!viewport.isInBounds(position)) {
      continue;
    }

    const center = viewport.gridCellCenter(position);
    renderSpawnMarker(context, center, metrics, theme.spawnFill, theme.spawnGlyph);
  }
}

function renderEndMarkers(
  context: CanvasRenderingContext2D,
  endPoints: readonly EndPoint[],
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  const metrics = getMarkerGlyphMetrics(viewport.cellSize, theme.markerScale);

  for (const position of endPoints) {
    if (!viewport.isInBounds(position)) {
      continue;
    }

    const center = viewport.gridCellCenter(position);
    renderEndMarker(context, center, metrics, theme.endFill, theme.endGlyph);
  }
}

function renderTowerNodes(
  context: CanvasRenderingContext2D,
  towerNodes: readonly TowerNode[],
  viewport: RenderViewport,
  theme: RenderTheme,
): void {
  const metrics = getMarkerGlyphMetrics(viewport.cellSize, theme.markerScale);

  for (const towerNode of towerNodes) {
    if (!viewport.isInBounds(towerNode)) {
      continue;
    }

    const center = viewport.gridCellCenter(towerNode);
    renderTowerMarker(
      context,
      center,
      metrics,
      towerNode.locked ? theme.lockedTowerFill : theme.towerFill,
      towerNode.locked ? theme.lockedTowerGlyph : theme.towerGlyph,
      towerNode.locked ? theme.lockedTowerAccent : undefined,
    );
  }
}
