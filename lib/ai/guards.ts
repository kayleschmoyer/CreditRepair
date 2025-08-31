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

export function redactPII<T extends Record<string, any>>(data: T): Partial<T> {
  const clean: Record<string, any> = {};
  for (const key in data) {
    if (!PII_FIELDS.includes(key)) {
      clean[key] = (data as any)[key];
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
