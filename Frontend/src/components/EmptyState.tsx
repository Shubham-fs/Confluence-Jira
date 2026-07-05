import { Box, Stack, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'Nothing to show yet',
  description = 'Adjust your filters and generate a report to see results here.',
}: EmptyStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 8 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
        }}
      >
        <InboxIcon fontSize="large" color="disabled" />
      </Box>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" textAlign="center" maxWidth={420}>
        {description}
      </Typography>
    </Stack>
  );
}
