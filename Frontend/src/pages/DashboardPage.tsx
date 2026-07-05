import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import dayjs, { type Dayjs } from 'dayjs';
import TeamSelect from '../components/TeamSelect';
import MemberSelect from '../components/MemberSelect';
import DateRangePicker from '../components/DateRangePicker';
import AssignedReportView from '../components/reports/AssignedReportView';
import BuildToQaReportView from '../components/reports/BuildToQaReportView';
import type { TransitionRule } from '../api/types';

interface AppliedFilters {
  member: string;
  from?: string;
  to?: string;
  runId: number;
}

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [team, setTeam] = useState('');
  const [member, setMember] = useState('');
  const [from, setFrom] = useState<Dayjs | null>(dayjs().startOf('year'));
  const [to, setTo] = useState<Dayjs | null>(dayjs().endOf('year'));
  // The active tab is driven by the route so the sidebar links stay in sync.
  const tab = location.pathname === '/build-to-qa' ? 1 : 0;
  const handleTabChange = (value: number) =>
    navigate(value === 1 ? '/build-to-qa' : '/assigned');
  const [rule, setRule] = useState<TransitionRule>('assignee');
  const [applied, setApplied] = useState<AppliedFilters | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Date range is optional; only a member is required.
  const canGenerate = Boolean(member);

  const handleTeamChange = (value: string) => {
    setTeam(value);
    setMember('');
    setApplied(null);
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    // Bump runId every click so the report always refetches fresh Jira data
    // (e.g. tickets created after the last run).
    setApplied({
      member,
      from: from ? from.format('YYYY-MM-DD') : undefined,
      to: to ? to.format('YYYY-MM-DD') : undefined,
      runId: Date.now(),
    });
  };

  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h4">Developer Activity Dashboard</Typography>
        <Typography color="text.secondary">
          Select a team, a developer and a date range to generate activity reports.
        </Typography>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TeamSelect value={team} onChange={handleTeamChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <MemberSelect team={team || null} value={member} onChange={setMember} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DateRangePicker
                from={from}
                to={to}
                onFromChange={setFrom}
                onToChange={setTo}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayArrowIcon />}
                disabled={!canGenerate}
                onClick={handleGenerate}
              >
                Generate
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => handleTabChange(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Assigned Issues" />
          <Tab label="Build → Pending QA" />
        </Tabs>
        <CardContent>
          {!applied ? (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
              Choose your filters above and click <strong>Generate</strong> to view
              reports.
            </Typography>
          ) : tab === 0 ? (
            <AssignedReportView
              params={{ member: applied.member, from: applied.from, to: applied.to }}
              runId={applied.runId}
              enabled
              onError={setError}
            />
          ) : (
            <BuildToQaReportView
              params={{ member: applied.member, from: applied.from, to: applied.to }}
              runId={applied.runId}
              rule={rule}
              onRuleChange={setRule}
              enabled
              onError={setError}
            />
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
