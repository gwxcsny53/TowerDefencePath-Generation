import type { GridPosition } from '@/core/model';

export type ValidationSeverity = 'error' | 'warning';

export type ValidationCode =
  | 'GRID_OUT_OF_RANGE'
  | 'PATH_ISOLATED'
  | 'PATH_DISCONNECTED_COMPONENT'
  | 'SPAWN_NOT_ENDPOINT'
  | 'END_NOT_ENDPOINT'
  | 'TOWER_PATH_CONFLICT'
  | 'JUNCTION_NOT_CONFIGURED'
  | 'JUNCTION_POSITION_INVALID'
  | 'JUNCTION_DUPLICATE_CONFIG'
  | 'JUNCTION_DIRECTION_INVALID'
  | 'JUNCTION_WEIGHT_INVALID'
  | 'JUNCTION_ENTRY_NOT_CONFIGURED'
  | 'SPAWN_CANNOT_REACH_END'
  | 'ROUTE_DEAD_END'
  | 'ROUTE_CYCLE';

export interface ValidationIssue {
  readonly severity: ValidationSeverity;
  readonly code: ValidationCode;
  readonly message: string;
  readonly position?: Readonly<GridPosition>;
}
