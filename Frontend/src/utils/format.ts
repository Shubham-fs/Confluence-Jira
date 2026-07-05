import dayjs from 'dayjs';

/** Format an ISO timestamp for display; returns an em dash if empty/invalid. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format('DD MMM YYYY, HH:mm') : '—';
}
