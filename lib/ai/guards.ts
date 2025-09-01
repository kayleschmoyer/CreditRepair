export const PII_FIELDS = [
  'name',
  'firstName',
  'lastName',
  'address',
  'address_line1',
  'address_line2',
  'city',
  'state',
  'postal_code',
  'email',
  'phone',
  'ssn',
  'socialSecurityNumber',
  'dob',
  'dateOfBirth',
];

export function maskAccountNumbers(str: string): string {
  return str.replace(/(\d[\d- ]{4,}\d)/g, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length < 5) return match;
    const masked = '*'.repeat(digits.length - 4) + digits.slice(-4);
    let i = 0;
    return match.replace(/\d/g, () => masked[i++]);
  });
}

/**
 * Removes known personally identifiable information (PII) fields from an
 * object and masks any account numbers found in string values.
 *
 * @param data Arbitrary record of values potentially containing PII.
 * @returns    A shallow copy of {@link data} with PII fields removed and
 *              account numbers masked.
 */
export function redactPII<T extends Record<string, unknown>>(data: T): Partial<T> {
  const clean: Partial<T> = {};
  for (const key of Object.keys(data) as Array<keyof T>) {
    if (!PII_FIELDS.includes(key as string)) {
      const rawValue = data[key];
      const value =
        typeof rawValue === 'string' ? maskAccountNumbers(rawValue) : rawValue;
      clean[key] = value as T[typeof key];
    }
  }
  return clean;
}

export function requireApiKey(env = process.env): string {
  const key = env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return key;
}
