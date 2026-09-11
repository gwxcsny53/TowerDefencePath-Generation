import { z } from 'zod';

import { LevelConfigSchema } from './LevelConfigSchema';

export const LevelAddressSchema = z.object({
  chapter: z.number().int().positive(),
  stage: z.number().int().positive(),
});

export const EditorProjectSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    levels: z.array(LevelConfigSchema).min(1),
  })
  .superRefine((project, context) => {
    const addresses = new Set<string>();
    for (const [index, level] of project.levels.entries()) {
      const address = `${level.level.chapter}:${level.level.stage}`;
      if (addresses.has(address)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate level address: ${address}`,
          path: ['levels', index, 'level'],
        });
      }
      addresses.add(address);
    }
  });
