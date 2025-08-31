import { describe, it, expect } from 'vitest';
import { renderLetter } from '../lib/pdf';

describe('PDF letter rendering', () => {
  it('produces a non-empty PDF buffer', async () => {
    const buffer = await renderLetter('equifax', {
      consumer: {
        name: 'John Doe',
        address1: '123 Main St',
        address2: 'Town, ST 12345',
      },
      items: [
        { account: 'ABC123', reason: 'Not mine' },
      ],
      exhibits: ['Driver license'],
      detailUrl: 'https://example.com/disputes/1',
    });
    expect(buffer.length).toBeGreaterThan(0);
  });
});
