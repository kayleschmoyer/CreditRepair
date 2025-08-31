export function formatDate(date: string | number | Date) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export function formatMoney(cents: number | null) {
  if (cents == null) return '';
  return `$${(cents / 100).toFixed(2)}`;
}
