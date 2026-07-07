import { apiClient } from './client';
import type {
  AiQueryResponse,
  AssignedReport,
  ReportType,
  TeamAnalytics,
  TransitionReport,
  TransitionRule,
} from './types';

export interface ReportParams {
  member: string;
  from?: string;
  to?: string;
}

export async function fetchAssignedReport(
  params: ReportParams,
): Promise<AssignedReport> {
  const { data } = await apiClient.get<AssignedReport>('/api/reports/assigned', {
    params,
  });
  return data;
}

export async function fetchTransitions(
  params: ReportParams & { rule: TransitionRule; transition?: string },
): Promise<TransitionReport> {
  const { data } = await apiClient.get<TransitionReport>(
    '/api/reports/transitions',
    { params },
  );
  return data;
}

/** Run an advanced free-form prompt planned by the Groq LLM into JQL. */
export async function aiQueryReports(q: string): Promise<AiQueryResponse> {
  const { data } = await apiClient.get<AiQueryResponse>('/api/reports/ai-query', {
    params: { q },
  });
  return data;
}

/** Fetch aggregated project-wide metrics for the analytics dashboard. */
export async function fetchAnalytics(
  params: { from?: string; to?: string },
): Promise<TeamAnalytics> {
  const { data } = await apiClient.get<TeamAnalytics>('/api/reports/analytics', {
    params,
  });
  return data;
}

/** Trigger a browser download of the Excel export for a report. */
export async function downloadReportExcel(
  type: ReportType,
  params: ReportParams & { rule?: TransitionRule; transition?: string },
): Promise<void> {
  const response = await apiClient.get('/api/reports/export', {
    params: { type, ...params },
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}_${params.member}_${params.from ?? 'all'}_${
    params.to ?? 'all'
  }.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
