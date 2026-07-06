import { useState } from 'react';
import {
  Link,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import type { TransitionIssue, TransitionRule } from '../../api/types';
import type { ReportParams } from '../../api/reports';
import { useTransitionsReport } from '../../hooks/useReports';
import { extractErrorMessage } from '../../api/client';
import ReportTable, { type Column } from '../ReportTable';
import ExportButton from '../ExportButton';
import ErrorState from '../ErrorState';
import { TableSkeleton } from '../LoadingState';
import { formatDate } from '../../utils/format';

interface TransitionReportViewProps {
  params: ReportParams;
  runId?: number;
  rule: TransitionRule;
  onRuleChange: (rule: TransitionRule) => void;
  enabled: boolean;
  onError: (message: string) => void;
}

const columns: Column<TransitionIssue>[] = [
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
  { id: 'from_status', label: 'From', value: (r) => r.from_status },
  { id: 'to_status', label: 'To', value: (r) => r.to_status },
  {
    id: 'transitioned_at',
    label: 'Transitioned At',
    value: (r) => r.transitioned_at,
    render: (r) => formatDate(r.transitioned_at),
  },
  { id: 'performed_by', label: 'Performed By', value: (r) => r.performed_by },
  { id: 'assignee', label: 'Assignee', value: (r) => r.assignee },
];

const DEFAULT_WORKFLOW = ['To Do', 'Build', 'Pending QA', 'Done'];

/** Build the list of one-step forward moves from an ordered workflow. */
function forwardSteps(workflow: string[]): { value: string; label: string }[] {
  const steps: { value: string; label: string }[] = [];
  for (let i = 0; i < workflow.length - 1; i += 1) {
    const to = workflow[i + 1];
    steps.push({ value: to, label: `${workflow[i]} → ${to}` });
  }
  return steps;
}

export default function TransitionReportView({
  params,
  runId,
  rule,
  onRuleChange,
  enabled,
  onError,
}: TransitionReportViewProps) {
  const [transition, setTransition] = useState('');
  const query = useTransitionsReport({
    ...params,
    rule,
    transition: transition || undefined,
    runId,
    enabled,
  });

  const workflow =
    query.data?.workflow && query.data.workflow.length > 1
      ? query.data.workflow
      : DEFAULT_WORKFLOW;
  const steps = forwardSteps(workflow);

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Tooltip title="Match by the assignee at the transition or by who performed it">
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
          <TextField
            select
            size="small"
            label="Transition"
            value={transition}
            onChange={(e) => setTransition(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All forward transitions</MenuItem>
            {steps.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <Typography color="text.secondary">
            {query.data ? `${query.data.count} transition(s)` : ''}
          </Typography>
        </Stack>
        <ExportButton
          type="transitions"
          params={{ ...params, rule, transition: transition || undefined }}
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
          getRowKey={(r, i) =>
            `${r.key}-${r.from_status}-${r.to_status}-${r.transitioned_at}-${i}`
          }
          emptyTitle="No forward transitions"
          emptyDescription="No one-step forward status transitions were found for this member in the selected range."
        />
      )}
    </Stack>
  );
}
