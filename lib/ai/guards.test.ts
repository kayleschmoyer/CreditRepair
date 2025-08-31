import { describe, expect, it, afterEach } from 'vitest';
import { redactPII, requireApiKey, maskAccountNumbers } from './guards';

describe('redactPII', () => {
  it('removes PII fields', () => {
    const input = { name: 'Jane', email: 'jane@example.com', score: 720 };
    const result = redactPII(input);
    expect(result).toEqual({ score: 720 });
  });

  it('strips SSN and masks account numbers', () => {
    const input = {
      ssn: '123-45-6789',
      accountNumber: '123456789',
      note: 'acct 987654321',
    };
    const result = redactPII(input);
    expect(result.ssn).toBeUndefined();
    expect(result.accountNumber).toBe('*****6789');
    expect(result.note).toBe('acct *****4321');
    expect(JSON.stringify(result)).not.toMatch(/\d{5,}/);
  });

  it('masks embedded numbers in strings', () => {
    const masked = maskAccountNumbers('SSN 123-45-6789 and acct 123456789');
    expect(masked).toBe('SSN ***-**-6789 and acct *****6789');
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
