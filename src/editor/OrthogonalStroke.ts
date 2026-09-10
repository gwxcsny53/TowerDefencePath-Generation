import type { GridPosition } from '@/core/model';

/** Rasterizes a pointer segment into a deterministic four-connected grid stroke. */
export function rasterizeOrthogonalSegment(from: GridPosition, to: GridPosition): GridPosition[] {
  const positions: GridPosition[] = [{ x: from.x, y: from.y }];
  let currentX = from.x;
  let currentY = from.y;

  while (currentX !== to.x) {
    currentX += Math.sign(to.x - currentX);
    positions.push({ x: currentX, y: currentY });
  }

  while (currentY !== to.y) {
    currentY += Math.sign(to.y - currentY);
    positions.push({ x: currentX, y: currentY });
  }

  return positions;
}
