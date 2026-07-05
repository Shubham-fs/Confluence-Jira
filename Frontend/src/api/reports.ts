import { apiClient } from './client';
import type {
  AssignedReport,
  BuildToQaReport,
  ReportType,
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

export async function fetchBuildToQaReport(
  params: ReportParams & { rule: TransitionRule },
): Promise<BuildToQaReport> {
  const { data } = await apiClient.get<BuildToQaReport>(
    '/api/reports/build-to-qa',
    { params },
  );
  return data;
}

/** Trigger a browser download of the Excel export for a report. */
export async function downloadReportExcel(
  type: ReportType,
  params: ReportParams & { rule?: TransitionRule },
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
