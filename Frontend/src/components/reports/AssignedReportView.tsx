import { Link, Stack, Typography } from '@mui/material';
import type { AssignedIssue } from '../../api/types';
import type { ReportParams } from '../../api/reports';
import { useAssignedReport } from '../../hooks/useReports';
import { extractErrorMessage } from '../../api/client';
import ReportTable, { type Column } from '../ReportTable';
import StatusBadge from '../StatusBadge';
import ExportButton from '../ExportButton';
import ErrorState from '../ErrorState';
import { TableSkeleton } from '../LoadingState';
import { formatDate } from '../../utils/format';

interface AssignedReportViewProps {
  params: ReportParams;
  runId?: number;
  enabled: boolean;
  onError: (message: string) => void;
}

const columns: Column<AssignedIssue>[] = [
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
    id: 'status',
    label: 'Status',
    value: (r) => r.status,
    render: (r) => <StatusBadge status={r.status} />,
  },
  { id: 'assignee', label: 'Assignee', value: (r) => r.assignee },
  { id: 'reporter', label: 'Reporter', value: (r) => r.reporter },
  {
    id: 'created',
    label: 'Created',
    value: (r) => r.created,
    render: (r) => formatDate(r.created),
  },
  {
    id: 'updated',
    label: 'Updated',
    value: (r) => r.updated,
    render: (r) => formatDate(r.updated),
  },
];

export default function AssignedReportView({
  params,
  runId,
  enabled,
  onError,
}: AssignedReportViewProps) {
  const query = useAssignedReport({ ...params, runId, enabled });

  if (query.isLoading && query.isFetching) return <TableSkeleton />;
  if (query.isError) {
    return (
      <ErrorState
        message={extractErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }

  const report = query.data;

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Typography color="text.secondary">
          {report ? `${report.count} issue(s) found` : 'Generate a report'}
        </Typography>
        <ExportButton
          type="assigned"
          params={params}
          disabled={!report || report.count === 0}
          onError={onError}
        />
      </Stack>
      <ReportTable
        rows={report?.issues ?? []}
        columns={columns}
        getRowKey={(r) => r.key}
        emptyTitle="No assigned issues"
        emptyDescription="No issues were assigned to this member in the selected range."
      />
    </Stack>
  );
}
