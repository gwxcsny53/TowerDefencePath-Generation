import { z } from 'zod';

import { DIRECTIONS, LEVEL_CONFIG_VERSION } from '@/core/model';

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

export const LevelConfigSchema = z.object({
  version: z.literal(LEVEL_CONFIG_VERSION),
  level: z.object({ chapter: positiveInteger, stage: positiveInteger }),
  grid: z.object({ rows: positiveInteger, cols: positiveInteger }),
  pathCells: z.array(gridPositionSchema),
  spawnPoints: z.array(identifiedGridPositionSchema),
  endPoints: z.array(identifiedGridPositionSchema),
  junctions: z.array(junctionSchema),
  towerNodes: z.array(identifiedGridPositionSchema.extend({ locked: z.boolean() })),
});
