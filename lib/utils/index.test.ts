import { describe, expect, it } from 'vitest';
import { formatMoney, formatDate } from './index';

describe('utils', () => {
  it('formats money', () => {
    expect(formatMoney(12345)).toBe('$123.45');
  });
  it('formats date', () => {
    expect(formatDate('2020-01-01')).toMatch('2020');
  });
});
