import { useQuery } from '@tanstack/react-query';
import {
  fetchAssignedReport,
  fetchTransitions,
  type ReportParams,
} from '../api/reports';
import type { TransitionRule } from '../api/types';

export interface ReportFilters extends ReportParams {
  enabled: boolean;
  /** Bumped on each "Generate" so the query always refetches fresh data. */
  runId?: number;
}

export function useAssignedReport(filters: ReportFilters) {
  const { enabled, runId, ...params } = filters;
  return useQuery({
    queryKey: ['assigned', params.member, params.from, params.to, runId],
    queryFn: () => fetchAssignedReport(params),
    enabled: enabled && Boolean(params.member),
  });
}

export function useTransitionsReport(
  filters: ReportFilters & { rule: TransitionRule; transition?: string },
) {
  const { enabled, runId, ...params } = filters;
  return useQuery({
    queryKey: [
      'transitions',
      params.member,
      params.from,
      params.to,
      params.rule,
      params.transition,
      runId,
    ],
    queryFn: () => fetchTransitions(params),
    enabled: enabled && Boolean(params.member),
  });
}
