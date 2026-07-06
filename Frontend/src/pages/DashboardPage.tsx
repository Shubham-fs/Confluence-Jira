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
  TextField,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import dayjs, { type Dayjs } from 'dayjs';
import TeamSelect from '../components/TeamSelect';
import MemberSelect from '../components/MemberSelect';
import DateRangePicker from '../components/DateRangePicker';
import AssignedReportView from '../components/reports/AssignedReportView';
import BuildToQaReportView from '../components/reports/BuildToQaReportView';
import { queryReports } from '../api/reports';
import { extractErrorMessage } from '../api/client';
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
  const [nlText, setNlText] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlInfo, setNlInfo] = useState<string | null>(null);

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

  const handleAsk = async () => {
    const q = nlText.trim();
    if (!q) return;
    setNlLoading(true);
    try {
      const { interpretation } = await queryReports(q);
      const resolvedMember = interpretation.member ?? '';
      setMember(resolvedMember);
      setFrom(interpretation.from ? dayjs(interpretation.from) : null);
      setTo(interpretation.to ? dayjs(interpretation.to) : null);
      setRule(interpretation.rule);
      navigate(interpretation.report_type === 'build-to-qa' ? '/build-to-qa' : '/assigned');
      setApplied({
        member: resolvedMember,
        from: interpretation.from ?? undefined,
        to: interpretation.to ?? undefined,
        runId: Date.now(),
      });
      const label =
        interpretation.report_type === 'build-to-qa'
          ? 'Build \u2192 Pending QA'
          : 'Assigned Issues';
      setNlInfo(`Interpreted as ${label} for ${resolvedMember}.`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setNlLoading(false);
    }
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
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesomeIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Ask in plain English
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. what did Yash move to QA last week"
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAsk();
                }}
              />
              <Button
                variant="contained"
                onClick={handleAsk}
                disabled={nlLoading || !nlText.trim()}
                sx={{ minWidth: 120 }}
              >
                {nlLoading ? 'Asking\u2026' : 'Ask'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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

      <Snackbar
        open={Boolean(nlInfo)}
        autoHideDuration={5000}
        onClose={() => setNlInfo(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" onClose={() => setNlInfo(null)} variant="filled">
          {nlInfo}
        </Alert>
      </Snackbar>
    </Box>
  );
}
