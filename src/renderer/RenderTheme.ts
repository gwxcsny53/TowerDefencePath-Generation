export interface RenderTheme {
  gridBackground: string;
  gridLine: string;
  pathFill: string;
  spawnFill: string;
  spawnGlyph: string;
  endFill: string;
  endGlyph: string;
  towerFill: string;
  towerGlyph: string;
  lockedTowerFill: string;
  lockedTowerGlyph: string;
  lockedTowerAccent: string;
  configuredJunctionFill: string;
  unconfiguredJunctionStroke: string;
  staleJunctionStroke: string;
  selectionStroke: string;
  validationErrorFill: string;
  validationErrorStroke: string;
  validationWarningFill: string;
  validationWarningStroke: string;
  validationFocusStroke: string;
  routePreviewStroke: string;
  routePreviewMarkerFill: string;
  routePreviewMarkerStroke: string;
  gridLineWidth: number;
  pathInset: number;
  markerScale: number;
  validationLineWidth: number;
  routePreviewLineWidth: number;
  routePreviewMarkerScale: number;
}

export const DEFAULT_RENDER_THEME: Readonly<RenderTheme> = {
  gridBackground: '#111923',
  gridLine: '#2a3848',
  pathFill: '#3d78b2',
  spawnFill: '#169c50',
  spawnGlyph: '#dcfce7',
  endFill: '#dc454b',
  endGlyph: '#fee2e2',
  towerFill: '#b97814',
  towerGlyph: '#fff3c4',
  lockedTowerFill: '#4e5968',
  lockedTowerGlyph: '#cbd5e1',
  lockedTowerAccent: '#d8a13a',
  configuredJunctionFill: '#a78bfa',
  unconfiguredJunctionStroke: '#f59e0b',
  staleJunctionStroke: '#f87171',
  selectionStroke: '#76c4ff',
  validationErrorFill: 'rgba(239, 68, 68, 0.20)',
  validationErrorStroke: '#f87171',
  validationWarningFill: 'rgba(245, 158, 11, 0.18)',
  validationWarningStroke: '#fbbf24',
  validationFocusStroke: '#fca5a5',
  routePreviewStroke: 'rgba(73, 217, 232, 0.78)',
  routePreviewMarkerFill: '#49d9e8',
  routePreviewMarkerStroke: '#0e7490',
  gridLineWidth: 1,
  pathInset: 1,
  markerScale: 0.3,
  validationLineWidth: 2,
  routePreviewLineWidth: 3,
  routePreviewMarkerScale: 0.2,
};
