import App from '@/App.vue';
import { describe, expect, it } from 'vitest';

describe('project setup', () => {
  it('runs the test environment', () => {
    expect(App).toBeDefined();
  });
});
