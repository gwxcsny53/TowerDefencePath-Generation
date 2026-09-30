import type { CanvasPoint } from './RenderViewport';

const LOCKED_TOWER_OUTLINE = '#667085';

export interface MarkerGlyphMetrics {
  readonly cellSize: number;
  readonly surfaceSize: number;
  readonly circleSurfaceSize: number;
  readonly towerSurfaceSize: number;
  readonly glyphSize: number;
  readonly lineWidth: number;
  readonly outlineWidth: number;
}

/** Keeps marker geometry relative to the existing cell-sized surface. */
export function getMarkerGlyphMetrics(cellSize: number, markerScale: number): MarkerGlyphMetrics {
  const surfaceSize = Math.min(cellSize, Math.max(4, cellSize * markerScale * 2));
  return {
    cellSize,
    surfaceSize,
    circleSurfaceSize: surfaceSize * 0.93,
    towerSurfaceSize: surfaceSize * 0.97,
    glyphSize: surfaceSize * 0.93 * 0.62,
    lineWidth: Math.min(2.25, Math.max(1.25, cellSize * 0.045)),
    outlineWidth: Math.min(2, Math.max(1.25, cellSize * 0.04)),
  };
}

function prepareGlyph(context: CanvasRenderingContext2D, color: string, lineWidth: number): void {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';
}

function drawCircleSurface(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  diameter: number,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number,
  outlineAlpha: number,
): void {
  context.fillStyle = fillColor;
  context.strokeStyle = strokeColor;
  context.lineWidth = strokeWidth;
  context.beginPath();
  context.arc(center.x, center.y, Math.max(0, (diameter - strokeWidth) / 2), 0, Math.PI * 2);
  context.fill();
  context.save();
  context.globalAlpha = outlineAlpha;
  context.stroke();
  context.restore();
}

export function renderSpawnMarker(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  metrics: MarkerGlyphMetrics,
  surfaceColor: string,
  glyphColor: string,
): void {
  context.save();
  context.globalAlpha = 1;
  drawCircleSurface(
    context,
    center,
    metrics.circleSurfaceSize,
    surfaceColor,
    glyphColor,
    metrics.outlineWidth,
    0.52,
  );

  const size = metrics.glyphSize;
  if (size >= 7) {
    prepareGlyph(context, glyphColor, metrics.lineWidth);
    const x = center.x;
    const y = center.y;
    context.beginPath();
    context.moveTo(x, y + size * 0.48);
    context.bezierCurveTo(
      x - size * 0.17,
      y + size * 0.2,
      x - size * 0.34,
      y - size * 0.08,
      x - size * 0.3,
      y - size * 0.26,
    );
    context.bezierCurveTo(
      x - size * 0.22,
      y - size * 0.52,
      x + size * 0.22,
      y - size * 0.52,
      x + size * 0.3,
      y - size * 0.26,
    );
    context.bezierCurveTo(
      x + size * 0.34,
      y - size * 0.08,
      x + size * 0.17,
      y + size * 0.2,
      x,
      y + size * 0.48,
    );
    context.stroke();
    context.beginPath();
    context.arc(x, y - size * 0.16, size * 0.1, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
}

export function renderEndMarker(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  metrics: MarkerGlyphMetrics,
  surfaceColor: string,
  glyphColor: string,
): void {
  context.save();
  context.globalAlpha = 1;
  drawCircleSurface(
    context,
    center,
    metrics.circleSurfaceSize,
    surfaceColor,
    glyphColor,
    metrics.outlineWidth,
    0.52,
  );

  const size = metrics.glyphSize;
  if (size >= 7) {
    prepareGlyph(context, glyphColor, metrics.lineWidth);
    const x = center.x - size * 0.025;
    const y = center.y;
    const poleX = x - size * 0.28;
    context.beginPath();
    context.moveTo(poleX, y + size * 0.45);
    context.lineTo(poleX, y - size * 0.45);
    context.lineTo(x + size * 0.43, y - size * 0.45);
    context.lineTo(x + size * 0.37, y - size * 0.02);
    context.lineTo(poleX, y - size * 0.08);
    context.stroke();
  }
  context.restore();
}

function drawRoundedSquareSurface(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  side: number,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number,
  outlineAlpha: number,
): void {
  const pathSide = Math.max(0, side - strokeWidth);
  const left = center.x - pathSide / 2;
  const top = center.y - pathSide / 2;
  const right = left + pathSide;
  const bottom = top + pathSide;
  const radius = pathSide * 0.18;
  context.fillStyle = fillColor;
  context.strokeStyle = strokeColor;
  context.lineWidth = strokeWidth;
  context.beginPath();
  context.moveTo(left + radius, top);
  context.lineTo(right - radius, top);
  context.quadraticCurveTo(right, top, right, top + radius);
  context.lineTo(right, bottom - radius);
  context.quadraticCurveTo(right, bottom, right - radius, bottom);
  context.lineTo(left + radius, bottom);
  context.quadraticCurveTo(left, bottom, left, bottom - radius);
  context.lineTo(left, top + radius);
  context.quadraticCurveTo(left, top, left + radius, top);
  context.closePath();
  context.fill();
  context.save();
  context.globalAlpha = outlineAlpha;
  context.stroke();
  context.restore();
}

function strokeTower(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  size: number,
): void {
  const x = center.x;
  const y = center.y;
  context.beginPath();
  context.moveTo(x - size * 0.42, y - size * 0.16);
  context.lineTo(x - size * 0.42, y - size * 0.44);
  context.lineTo(x - size * 0.16, y - size * 0.44);
  context.lineTo(x - size * 0.16, y - size * 0.28);
  context.lineTo(x + size * 0.16, y - size * 0.28);
  context.lineTo(x + size * 0.16, y - size * 0.44);
  context.lineTo(x + size * 0.42, y - size * 0.44);
  context.lineTo(x + size * 0.42, y - size * 0.16);
  context.moveTo(x - size * 0.3, y - size * 0.16);
  context.lineTo(x - size * 0.3, y + size * 0.44);
  context.lineTo(x + size * 0.3, y + size * 0.44);
  context.lineTo(x + size * 0.3, y - size * 0.16);
  context.stroke();

  if (size >= 9) {
    context.beginPath();
    context.moveTo(x - size * 0.09, y + size * 0.44);
    context.quadraticCurveTo(x, y + size * 0.04, x + size * 0.09, y + size * 0.44);
    context.stroke();
  }
}

function strokeLock(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  side: number,
  lineWidth: number,
  color: string,
): void {
  const size = side * 0.18;
  const x = center.x + side * 0.2;
  const y = center.y - side * 0.2;
  const bodyWidth = size * 0.68;
  const bodyHeight = size * 0.48;
  prepareGlyph(context, color, Math.min(lineWidth, Math.max(1, size * 0.18)));
  context.beginPath();
  context.moveTo(x - size * 0.22, y - size * 0.04);
  context.lineTo(x - size * 0.22, y - size * 0.24);
  context.quadraticCurveTo(x, y - size * 0.46, x + size * 0.22, y - size * 0.24);
  context.lineTo(x + size * 0.22, y - size * 0.04);
  context.stroke();
  context.strokeRect(x - bodyWidth / 2, y - size * 0.04, bodyWidth, bodyHeight);
}

export function renderTowerMarker(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  metrics: MarkerGlyphMetrics,
  surfaceColor: string,
  glyphColor: string,
  lockAccent?: string,
): void {
  context.save();
  context.globalAlpha = 1;
  drawRoundedSquareSurface(
    context,
    center,
    metrics.towerSurfaceSize,
    surfaceColor,
    lockAccent === undefined ? glyphColor : LOCKED_TOWER_OUTLINE,
    metrics.outlineWidth,
    lockAccent === undefined ? 0.42 : 0.38,
  );

  const glyphSize = metrics.towerSurfaceSize * 0.7;
  if (glyphSize >= 6) {
    prepareGlyph(context, glyphColor, metrics.lineWidth);
    strokeTower(context, center, glyphSize);
    if (lockAccent !== undefined && metrics.cellSize >= 32) {
      strokeLock(context, center, metrics.towerSurfaceSize, metrics.lineWidth, lockAccent);
    }
  }
  if (lockAccent !== undefined && metrics.cellSize >= 28 && metrics.cellSize < 32) {
    context.fillStyle = lockAccent;
    context.beginPath();
    context.arc(
      center.x + metrics.towerSurfaceSize * 0.2,
      center.y - metrics.towerSurfaceSize * 0.2,
      metrics.towerSurfaceSize * 0.048,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.restore();
}
