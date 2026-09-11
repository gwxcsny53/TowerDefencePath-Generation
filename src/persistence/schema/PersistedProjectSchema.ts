import { z } from 'zod';

import { PROJECT_PERSISTENCE_SCHEMA_VERSION } from '../ProjectPersistence';
import { EditorProjectSchema, LevelAddressSchema } from './EditorProjectSchema';

export const PersistedProjectStateSchema = z.object({
  schemaVersion: z.literal(PROJECT_PERSISTENCE_SCHEMA_VERSION),
  project: EditorProjectSchema,
  activeLevelAddress: LevelAddressSchema,
  updatedAt: z.number().finite(),
});
