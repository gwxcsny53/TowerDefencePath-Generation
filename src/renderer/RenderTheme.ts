export interface RenderTheme {
  gridBackground: string;
  gridLine: string;
  pathFill: string;
  spawnFill: string;
  endFill: string;
  towerFill: string;
  lockedTowerFill: string;
  configuredJunctionFill: string;
  unconfiguredJunctionStroke: string;
  gridLineWidth: number;
  pathInset: number;
  markerScale: number;
}

export const DEFAULT_RENDER_THEME: Readonly<RenderTheme> = {
  gridBackground: '#f8fafc',
  gridLine: '#cbd5e1',
  pathFill: '#93c5fd',
  spawnFill: '#22c55e',
  endFill: '#ef4444',
  towerFill: '#a16207',
  lockedTowerFill: '#a8a29e',
  configuredJunctionFill: '#8b5cf6',
  unconfiguredJunctionStroke: '#f59e0b',
  gridLineWidth: 1,
  pathInset: 1,
  markerScale: 0.3,
};
