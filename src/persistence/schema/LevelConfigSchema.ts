import { z } from 'zod';

import {
  DEFAULT_SPAWN_MOVE_SECONDS_PER_CELL,
  DIRECTIONS,
  LEVEL_CONFIG_VERSION,
} from '@/core/model';

const positiveInteger = z.number().int().positive();
const gridPositionSchema = z.object({ x: z.number().int(), y: z.number().int() });
const identifiedGridPositionSchema = gridPositionSchema.extend({ id: z.string().min(1) });
const directionSchema = z.enum(DIRECTIONS);

const junctionExitSchema = z.object({
  exitTo: directionSchema,
  weight: z.number().finite(),
});

const junctionTransitionSchema = z.object({
  enterFrom: directionSchema,
  exits: z.array(junctionExitSchema),
});

const junctionSchema = identifiedGridPositionSchema.extend({
  transitions: z.array(junctionTransitionSchema),
});
const spawnPointSchema = identifiedGridPositionSchema.extend({
  moveSecondsPerCell: z.number().finite().positive().default(DEFAULT_SPAWN_MOVE_SECONDS_PER_CELL),
});

export const LevelConfigSchema = z.object({
  version: z.literal(LEVEL_CONFIG_VERSION),
  level: z.object({ chapter: positiveInteger, stage: positiveInteger }),
  grid: z.object({ rows: positiveInteger, cols: positiveInteger }),
  pathCells: z.array(gridPositionSchema),
  spawnPoints: z.array(spawnPointSchema),
  endPoints: z.array(identifiedGridPositionSchema),
  junctions: z.array(junctionSchema),
  towerNodes: z.array(identifiedGridPositionSchema.extend({ locked: z.boolean() })),
});
