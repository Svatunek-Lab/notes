export type DateLike = string | Date | undefined | null;

export function toDate(value: DateLike): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value: DateLike): string {
  const date = toDate(value);
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}
