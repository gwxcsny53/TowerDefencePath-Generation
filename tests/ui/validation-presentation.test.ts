import { describe, expect, it } from 'vitest';
import { VALIDATION_PRESENTATION } from '@/ui/presentation/ValidationPresentation';

describe('validation presentation', () => {
  it('provides non-empty Chinese presentation text for every validation code', () => {
    for (const presentation of Object.values(VALIDATION_PRESENTATION)) {
      expect(presentation.title.trim()).not.toBe('');
      expect(presentation.description.trim()).not.toBe('');
    }
  });
});
