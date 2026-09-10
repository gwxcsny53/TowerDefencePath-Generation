import type { GridPosition } from '@/core/model';

export type RouteSimulationStatus =
  'reached-end' | 'dead-end' | 'junction-not-configured' | 'cycle' | 'step-limit' | 'invalid-spawn';

export type RandomSource = () => number;

export interface RouteSimulationOptions {
  readonly random?: RandomSource;
  readonly maxSteps?: number;
}

export interface RouteSimulationResult {
  readonly status: RouteSimulationStatus;
  readonly spawnId: string;
  readonly path: readonly Readonly<GridPosition>[];
  readonly endId?: string;
  readonly finalPosition?: Readonly<GridPosition>;
}
