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

export function redactPII<T extends Record<string, any>>(data: T): Partial<T> {
  const clean: Partial<T> = {};
  for (const key of Object.keys(data) as Array<keyof T>) {
    if (!PII_FIELDS.includes(key as string)) {
      let value: any = data[key];
      if (typeof value === 'string') {
        value = maskAccountNumbers(value);
      }
      (clean as any)[key] = value;
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
