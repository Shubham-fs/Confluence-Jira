import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { aiQueryReports } from '../../api/reports';
import { extractErrorMessage } from '../../api/client';
import type { AiQueryResponse } from '../../api/types';

/**
 * Advanced, LLM-powered search. The prompt is sent to the backend where Groq
 * plans a JQL query; the exact executed JQL and the matching issues are shown.
 */
export default function AiQueryPanel() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiQueryResponse | null>(null);

  const handleRun = async () => {
    const q = prompt.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const data = await aiQueryReports(q);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const copyJql = () => {
    if (result?.executed_jql) {
      void navigator.clipboard.writeText(result.executed_jql);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PsychologyIcon color="secondary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              Advanced AI Search (Groq)
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Ask anything about the project. The LLM turns it into JQL, runs it,
            and shows you the exact query used.
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              multiline
              maxRows={3}
              placeholder="e.g. tickets Kashish ever worked on that are still open, newest first"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRun();
                }
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleRun}
              disabled={loading || !prompt.trim()}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Searching\u2026' : 'Search'}
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Planning and running your query…
              </Typography>
            </Stack>
          )}

          {result && !loading && (
            <Stack spacing={1.5}>
              {result.plan.explanation && (
                <Typography variant="body2" color="text.secondary">
                  {result.plan.explanation}
                </Typography>
              )}

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Executed JQL
                  </Typography>
                  <Tooltip title="Copy JQL">
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon fontSize="small" />}
                      onClick={copyJql}
                      sx={{ minWidth: 0 }}
                    >
                      Copy
                    </Button>
                  </Tooltip>
                  {result.plan.requires_changelog && (
                    <Chip
                      size="small"
                      color="warning"
                      variant="outlined"
                      label="Needs changelog analysis"
                    />
                  )}
                </Stack>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    bgcolor: 'action.hover',
                  }}
                >
                  {result.executed_jql}
                </Paper>
              </Box>

              <Typography variant="subtitle2">
                {result.count} issue{result.count === 1 ? '' : 's'} found
              </Typography>

              {result.count > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Summary</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.issues.map((issue) => (
                        <TableRow key={issue.key} hover>
                          <TableCell>
                            {issue.url ? (
                              <Link
                                href={issue.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {issue.key}
                              </Link>
                            ) : (
                              issue.key
                            )}
                          </TableCell>
                          <TableCell>{issue.summary}</TableCell>
                          <TableCell>{issue.status}</TableCell>
                          <TableCell>{issue.assignee}</TableCell>
                          <TableCell>
                            {issue.updated
                              ? new Date(issue.updated).toLocaleDateString()
                              : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
