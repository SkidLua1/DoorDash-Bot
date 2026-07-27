import { format } from 'date-fns';

/**
 * Safely format a date string. Returns a fallback if the value is missing or invalid.
 */
export function safeFormat(
  date: string | null | undefined,
  formatStr: string,
  fallback = 'N/A'
): string {
  if (!date) return fallback;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
}
