import { useQuery } from '@tanstack/react-query';
import {
  fetchAssignedReport,
  fetchBuildToQaReport,
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

export function useBuildToQaReport(
  filters: ReportFilters & { rule: TransitionRule },
) {
  const { enabled, runId, ...params } = filters;
  return useQuery({
    queryKey: [
      'build-to-qa',
      params.member,
      params.from,
      params.to,
      params.rule,
      runId,
    ],
    queryFn: () => fetchBuildToQaReport(params),
    enabled: enabled && Boolean(params.member),
  });
}
