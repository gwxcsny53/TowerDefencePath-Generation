import type { CanvasPoint } from './RenderViewport';

export interface MarkerGlyphMetrics {
  readonly cellSize: number;
  readonly surfaceSize: number;
  readonly glyphSize: number;
  readonly lineWidth: number;
}

/** Keeps marker geometry relative to the existing cell-sized surface. */
export function getMarkerGlyphMetrics(cellSize: number, markerScale: number): MarkerGlyphMetrics {
  const surfaceSize = Math.min(cellSize, Math.max(4, cellSize * markerScale * 2));
  return {
    cellSize,
    surfaceSize,
    glyphSize: surfaceSize * 0.52,
    lineWidth: Math.min(2.25, Math.max(1.25, cellSize * 0.045)),
  };
}

function prepareGlyph(context: CanvasRenderingContext2D, color: string, lineWidth: number): void {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';
}

function fillCircle(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  radius: number,
  color: string,
): void {
  context.fillStyle = color;
  context.beginPath();
  context.arc(center.x, center.y, radius, 0, Math.PI * 2);
  context.fill();
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
  fillCircle(context, center, metrics.surfaceSize / 2, surfaceColor);

  const size = metrics.glyphSize;
  if (size >= 6) {
    prepareGlyph(context, glyphColor, metrics.lineWidth);
    const x = center.x;
    const y = center.y - size * 0.02;
    context.beginPath();
    context.moveTo(x, y - size * 0.36);
    context.bezierCurveTo(
      x + size * 0.24,
      y - size * 0.36,
      x + size * 0.28,
      y - size * 0.15,
      x + size * 0.28,
      y + size * 0.01,
    );
    context.bezierCurveTo(x + size * 0.28, y + size * 0.17, x, y + size * 0.38, x, y + size * 0.38);
    context.bezierCurveTo(
      x,
      y + size * 0.38,
      x - size * 0.28,
      y + size * 0.17,
      x - size * 0.28,
      y + size * 0.01,
    );
    context.bezierCurveTo(
      x - size * 0.28,
      y - size * 0.15,
      x - size * 0.24,
      y - size * 0.36,
      x,
      y - size * 0.36,
    );
    context.stroke();
    context.beginPath();
    context.arc(x, y - size * 0.11, size * 0.1, 0, Math.PI * 2);
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
  fillCircle(context, center, metrics.surfaceSize / 2, surfaceColor);

  const size = metrics.glyphSize;
  if (size >= 6) {
    prepareGlyph(context, glyphColor, metrics.lineWidth);
    const x = center.x - size * 0.025;
    const y = center.y;
    const poleX = x - size * 0.18;
    context.beginPath();
    context.moveTo(poleX, y + size * 0.32);
    context.lineTo(poleX, y - size * 0.32);
    context.lineTo(x + size * 0.27, y - size * 0.32);
    context.lineTo(x + size * 0.22, y - size * 0.02);
    context.lineTo(poleX, y - size * 0.06);
    context.stroke();
  }
  context.restore();
}

function fillRoundedSquare(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  side: number,
  color: string,
): void {
  const left = center.x - side / 2;
  const top = center.y - side / 2;
  const right = left + side;
  const bottom = top + side;
  const radius = side * 0.2;
  context.fillStyle = color;
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
}

function strokeCastle(
  context: CanvasRenderingContext2D,
  center: Readonly<CanvasPoint>,
  size: number,
): void {
  const x = center.x;
  const y = center.y;
  context.beginPath();
  context.moveTo(x - size * 0.3, y + size * 0.3);
  context.lineTo(x - size * 0.3, y - size * 0.3);
  context.lineTo(x - size * 0.18, y - size * 0.3);
  context.lineTo(x - size * 0.18, y - size * 0.16);
  context.lineTo(x - size * 0.08, y - size * 0.16);
  context.lineTo(x - size * 0.08, y - size * 0.3);
  context.lineTo(x + size * 0.08, y - size * 0.3);
  context.lineTo(x + size * 0.08, y - size * 0.16);
  context.lineTo(x + size * 0.18, y - size * 0.16);
  context.lineTo(x + size * 0.18, y - size * 0.3);
  context.lineTo(x + size * 0.3, y - size * 0.3);
  context.lineTo(x + size * 0.3, y + size * 0.3);
  context.lineTo(x - size * 0.3, y + size * 0.3);
  context.stroke();

  if (size >= 9) {
    context.beginPath();
    context.moveTo(x - size * 0.07, y + size * 0.3);
    context.lineTo(x - size * 0.07, y + size * 0.12);
    context.quadraticCurveTo(x, y + size * 0.03, x + size * 0.07, y + size * 0.12);
    context.lineTo(x + size * 0.07, y + size * 0.3);
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
  const size = side * 0.27;
  const x = center.x + side * 0.2;
  const y = center.y + side * 0.18;
  const bodyWidth = size * 0.68;
  const bodyHeight = size * 0.48;
  prepareGlyph(context, color, Math.min(lineWidth, size * 0.18));
  context.beginPath();
  context.moveTo(x - size * 0.22, y - size * 0.06);
  context.lineTo(x - size * 0.22, y - size * 0.25);
  context.quadraticCurveTo(x, y - size * 0.47, x + size * 0.22, y - size * 0.25);
  context.lineTo(x + size * 0.22, y - size * 0.06);
  context.stroke();
  context.strokeRect(x - bodyWidth / 2, y - size * 0.06, bodyWidth, bodyHeight);
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
  fillRoundedSquare(context, center, metrics.surfaceSize, surfaceColor);

  const glyphSize = metrics.glyphSize * 1.04;
  if (glyphSize >= 6) {
    prepareGlyph(context, glyphColor, metrics.lineWidth);
    strokeCastle(context, center, glyphSize);
    if (lockAccent !== undefined && metrics.cellSize >= 28) {
      strokeLock(context, center, metrics.surfaceSize, metrics.lineWidth, lockAccent);
    }
  }
  context.restore();
}
