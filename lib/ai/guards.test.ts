import { describe, expect, it, afterEach } from 'vitest';
import { redactPII, requireApiKey } from './guards';

describe('redactPII', () => {
  it('removes PII fields', () => {
    const input = { name: 'Jane', email: 'jane@example.com', score: 720 };
    const result = redactPII(input);
    expect(result).toEqual({ score: 720 });
  });
});

describe('requireApiKey', () => {
  const original = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (original) {
      process.env.OPENAI_API_KEY = original;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it('throws when key missing', () => {
    delete process.env.OPENAI_API_KEY;
    expect(() => requireApiKey()).toThrow();
  });

  it('returns key when present', () => {
    process.env.OPENAI_API_KEY = 'test-key';
    expect(requireApiKey()).toBe('test-key');
  });
});
