import { Chip } from '@mui/material';

const STATUS_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
> = {
  'to do': 'default',
  'in progress': 'info',
  build: 'warning',
  'pending qa': 'secondary',
  done: 'success',
  closed: 'success',
  blocked: 'error',
};

export default function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Chip label="—" size="small" variant="outlined" />;
  const color = STATUS_COLORS[status.toLowerCase()] ?? 'default';
  return <Chip label={status} size="small" color={color} variant="filled" />;
}
