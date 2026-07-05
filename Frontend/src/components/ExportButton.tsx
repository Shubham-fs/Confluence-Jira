import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadReportExcel, type ReportParams } from '../api/reports';
import { extractErrorMessage } from '../api/client';
import type { ReportType, TransitionRule } from '../api/types';

interface ExportButtonProps {
  type: ReportType;
  params: ReportParams & { rule?: TransitionRule };
  disabled?: boolean;
  onError?: (message: string) => void;
}

export default function ExportButton({
  type,
  params,
  disabled,
  onError,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await downloadReportExcel(type, params);
    } catch (error) {
      onError?.(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      Export to Excel
    </Button>
  );
}
