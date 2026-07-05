import { Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';

interface DateRangePickerProps {
  from: Dayjs | null;
  to: Dayjs | null;
  onFromChange: (value: Dayjs | null) => void;
  onToChange: (value: Dayjs | null) => void;
}

export default function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangePickerProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
      <DatePicker
        label="From"
        value={from}
        onChange={onFromChange}
        maxDate={to ?? undefined}
        slotProps={{
          textField: { size: 'small', fullWidth: true },
          field: { clearable: true },
        }}
      />
      <DatePicker
        label="To"
        value={to}
        onChange={onToChange}
        minDate={from ?? undefined}
        slotProps={{
          textField: { size: 'small', fullWidth: true },
          field: { clearable: true },
        }}
      />
    </Stack>
  );
}
