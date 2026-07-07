import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAnalytics } from '../../hooks/useReports';
import { TableSkeleton } from '../LoadingState';
import ErrorState from '../ErrorState';
import EmptyState from '../EmptyState';
import { extractErrorMessage } from '../../api/client';
import type {
  BottleneckIssue,
  CountItem,
  StandupSummary,
  WorkloadBalance,
} from '../../api/types';

interface AnalyticsDashboardProps {
  from?: string;
  to?: string;
  runId?: number;
  enabled: boolean;
}

const statusColors = ['#2563eb', '#f97316', '#14b8a6', '#e11d48', '#8b5cf6'];
const workloadColors = ['#0ea5e9', '#f59e0b', '#ec4899', '#22c55e', '#6366f1'];
const priorityColors = ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#8b5cf6'];

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, height: '100%', borderTop: `4px solid ${accent}` }}
    >
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function CountSummary({ items, colors }: { items: CountItem[]; colors: string[] }) {
  return (
    <Stack spacing={0.75} sx={{ mt: 1.5 }}>
      {items.map((item, index) => (
        <Stack
          key={item.label}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: colors[index % colors.length],
                display: 'inline-block',
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
          </Stack>
          <Typography variant="body2" fontWeight={700}>
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function DonutSummary({ items, colors }: { items: CountItem[]; colors: string[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const segments = total
    ? items.map((item, index) => {
        const start = cursor;
        const end = cursor + (item.value / total) * 360;
        cursor = end;
        return `${colors[index % colors.length]} ${start}deg ${end}deg`;
      })
    : ['#e5e7eb 0deg 360deg'];

  return (
    <Box
      sx={{
        height: 240,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        sx={{
          width: 190,
          height: 190,
          borderRadius: '50%',
          background: `conic-gradient(${segments.join(', ')})`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 112,
            height: 112,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'grid',
            placeItems: 'center',
            boxShadow: 1,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {total}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function HorizontalBars({ items, colors }: { items: CountItem[]; colors: string[] }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <Stack spacing={1.25} sx={{ minHeight: 240, justifyContent: 'center' }}>
      {items.map((item, index) => (
        <Stack key={item.label} spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {item.value}
            </Typography>
          </Stack>
          <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'action.hover' }}>
            <Box
              sx={{
                width: `${(item.value / maxValue) * 100}%`,
                height: '100%',
                borderRadius: 999,
                bgcolor: colors[index % colors.length],
              }}
            />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function StandupSummaryPanel({ summary }: { summary: StandupSummary }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderTop: '4px solid #8b5cf6',
        background:
          'linear-gradient(135deg, rgba(139, 92, 246, 0.10), rgba(14, 165, 233, 0.06))',
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeIcon color="secondary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              AI Daily Standup Summary
            </Typography>
          </Stack>
          <Typography variant="h6">{summary.headline}</Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Key signals
              </Typography>
              <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
                {summary.highlights.map((highlight) => (
                  <Typography component="li" variant="body2" key={highlight}>
                    {highlight}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Recommended actions
              </Typography>
              <Stack component="ol" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
                {summary.recommended_actions.map((action) => (
                  <Typography component="li" variant="body2" key={action}>
                    {action}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

function BottleneckPanel({ issues }: { issues: BottleneckIssue[] }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderTop: '4px solid #ef4444' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                At-risk bottlenecks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Issues staying longer than expected in active workflow stages.
              </Typography>
            </Box>
            <Chip
              color={issues.length ? 'error' : 'success'}
              label={`${issues.length} at risk`}
              variant="outlined"
            />
          </Stack>

          {issues.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No bottlenecks detected for the selected range.
            </Typography>
          ) : (
            <Grid container spacing={1.5}>
              {issues.slice(0, 6).map((issue) => (
                <Grid item xs={12} md={6} key={issue.key}>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 1.5,
                      height: '100%',
                    }}
                  >
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        {issue.url ? (
                          <Link href={issue.url} target="_blank" rel="noopener noreferrer">
                            {issue.key}
                          </Link>
                        ) : (
                          <Typography fontWeight={700}>{issue.key}</Typography>
                        )}
                        <Chip
                          size="small"
                          color="warning"
                          label={`${issue.age_hours}h in ${issue.status}`}
                        />
                      </Stack>
                      <Typography variant="body2">{issue.summary}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Owner: {issue.assignee || 'Unassigned'} | Limit:{' '}
                        {issue.threshold_hours} hours
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function WorkloadBalancePanel({ balance }: { balance: WorkloadBalance }) {
  const hasRisk = balance.overloaded.length > 0;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderTop: '4px solid #0ea5e9' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Workload balance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compares active issue ownership against the team average.
              </Typography>
            </Box>
            <Chip
              color={hasRisk ? 'warning' : 'success'}
              label={hasRisk ? `${balance.overloaded.length} overloaded` : 'Balanced'}
              variant="outlined"
            />
          </Stack>

          <Typography variant="body2">
            Team average: <strong>{balance.average_active_issues}</strong> active
            issue{balance.average_active_issues === 1 ? '' : 's'} per developer.
          </Typography>

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Overloaded
                </Typography>
                {balance.overloaded.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No developer is above the overload threshold.
                  </Typography>
                ) : (
                  <Stack spacing={0.75}>
                    {balance.overloaded.map((member) => (
                      <Stack
                        key={member.name}
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Typography variant="body2">{member.name}</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {member.active_issues} issues (+
                          {member.difference_from_average})
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  Has capacity
                </Typography>
                {balance.available.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No clear low-load developer found.
                  </Typography>
                ) : (
                  <Stack spacing={0.75}>
                    {balance.available.map((member) => (
                      <Stack
                        key={member.name}
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Typography variant="body2">{member.name}</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {member.active_issues} issues ({member.difference_from_average})
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>
            </Grid>
          </Grid>

          {balance.suggestions.length > 0 && (
            <Stack spacing={0.75}>
              {balance.suggestions.map((suggestion) => (
                <Typography key={suggestion} variant="body2" color="text.secondary">
                  {suggestion}
                </Typography>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard({
  from,
  to,
  runId,
  enabled,
}: AnalyticsDashboardProps) {
  const query = useAnalytics({ from, to, runId, enabled });

  if (query.isLoading) return <TableSkeleton />;
  if (query.isError)
    return (
      <ErrorState
        message={extractErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );

  const data = query.data;
  if (!data) return null;
  if (data.total === 0)
    return (
      <EmptyState
        title="No issues in range"
        description="No issues were found for the selected date range."
      />
    );

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <StatCard label="Total issues" value={data.total} accent="#2563eb" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Resolved" value={data.resolved} accent="#16a34a" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="In progress" value={data.in_progress} accent="#f97316" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Avg cycle time (days)"
            value={data.avg_cycle_time_days}
            accent="#8b5cf6"
          />
        </Grid>
      </Grid>

      <StandupSummaryPanel summary={data.standup_summary} />

      <BottleneckPanel issues={data.bottlenecks} />

      <WorkloadBalancePanel balance={data.workload_balance} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Issues by status
              </Typography>
              <DonutSummary items={data.by_status} colors={statusColors} />
              <CountSummary items={data.by_status} colors={statusColors} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Workload by member
              </Typography>
              <HorizontalBars items={data.by_assignee} colors={workloadColors} />
              <CountSummary items={data.by_assignee} colors={workloadColors} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Issues by priority
              </Typography>
              <HorizontalBars items={data.by_priority} colors={priorityColors} />
              <CountSummary items={data.by_priority} colors={priorityColors} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
