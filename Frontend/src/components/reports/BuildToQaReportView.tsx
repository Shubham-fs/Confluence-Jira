import {
  Link,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import type { BuildToQaIssue, TransitionRule } from '../../api/types';
import type { ReportParams } from '../../api/reports';
import { useBuildToQaReport } from '../../hooks/useReports';
import { extractErrorMessage } from '../../api/client';
import ReportTable, { type Column } from '../ReportTable';
import ExportButton from '../ExportButton';
import ErrorState from '../ErrorState';
import { TableSkeleton } from '../LoadingState';
import { formatDate } from '../../utils/format';

interface BuildToQaReportViewProps {
  params: ReportParams;
  runId?: number;
  rule: TransitionRule;
  onRuleChange: (rule: TransitionRule) => void;
  enabled: boolean;
  onError: (message: string) => void;
}

const columns: Column<BuildToQaIssue>[] = [
  {
    id: 'key',
    label: 'Issue',
    value: (r) => r.key,
    render: (r) =>
      r.url ? (
        <Link href={r.url} target="_blank" rel="noopener" fontWeight={600}>
          {r.key}
        </Link>
      ) : (
        r.key
      ),
  },
  { id: 'summary', label: 'Summary', value: (r) => r.summary },
  {
    id: 'transitioned_at',
    label: 'Transitioned At',
    value: (r) => r.transitioned_at,
    render: (r) => formatDate(r.transitioned_at),
  },
  { id: 'performed_by', label: 'Performed By', value: (r) => r.performed_by },
  { id: 'assignee', label: 'Assignee', value: (r) => r.assignee },
];

export default function BuildToQaReportView({
  params,
  runId,
  rule,
  onRuleChange,
  enabled,
  onError,
}: BuildToQaReportViewProps) {
  const query = useBuildToQaReport({ ...params, rule, runId, enabled });

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Match by current assignee or by who performed the transition">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={rule}
              onChange={(_, v) => v && onRuleChange(v)}
            >
              <ToggleButton value="assignee">By assignee</ToggleButton>
              <ToggleButton value="actor">By actor</ToggleButton>
            </ToggleButtonGroup>
          </Tooltip>
          <Typography color="text.secondary">
            {query.data ? `${query.data.count} transition(s)` : ''}
          </Typography>
        </Stack>
        <ExportButton
          type="build-to-qa"
          params={{ ...params, rule }}
          disabled={!query.data || query.data.count === 0}
          onError={onError}
        />
      </Stack>

      {query.isLoading && query.isFetching ? (
        <TableSkeleton />
      ) : query.isError ? (
        <ErrorState
          message={extractErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : (
        <ReportTable
          rows={query.data?.issues ?? []}
          columns={columns}
          getRowKey={(r) => `${r.key}-${r.transitioned_at}`}
          emptyTitle="No Build → Pending QA transitions"
          emptyDescription="No matching transitions were found for this member in the selected range."
        />
      )}
    </Stack>
  );
}
