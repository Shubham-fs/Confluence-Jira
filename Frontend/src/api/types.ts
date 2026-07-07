/** Shared API types mirroring the backend pydantic models. */

export interface Team {
  name: string;
  members: string[];
}

export interface TeamsResponse {
  teams: Team[];
}

export interface MembersResponse {
  team: string;
  members: string[];
}

export interface AssignedIssue {
  key: string;
  summary: string | null;
  status: string | null;
  assignee: string | null;
  reporter: string | null;
  created: string | null;
  updated: string | null;
  url: string | null;
}

export interface AssignedReport {
  member: string;
  account_id: string | null;
  from: string;
  to: string;
  count: number;
  issues: AssignedIssue[];
}

export interface TransitionIssue {
  key: string;
  summary: string | null;
  transitioned_at: string | null;
  performed_by: string | null;
  assignee: string | null;
  from_status: string | null;
  to_status: string | null;
  url: string | null;
}

export interface TransitionReport {
  member: string;
  account_id: string | null;
  rule: string;
  from: string;
  to: string;
  transition: string | null;
  workflow: string[];
  count: number;
  issues: TransitionIssue[];
}

export type TransitionRule = 'assignee' | 'actor';
export type ReportType = 'assigned' | 'transitions';

export interface AiQueryPlan {
  report_type: string;
  members: string[];
  from: string | null;
  to: string | null;
  requires_changelog: boolean;
  proposed_jql: string;
  explanation: string;
}

export interface AiIssue {
  key: string;
  summary: string | null;
  status: string | null;
  assignee: string | null;
  reporter: string | null;
  created: string | null;
  updated: string | null;
  url: string | null;
}

export interface AiQueryResponse {
  query: string;
  plan: AiQueryPlan;
  executed_jql: string;
  count: number;
  issues: AiIssue[];
}

export interface CountItem {
  label: string;
  value: number;
}

export interface BottleneckIssue {
  key: string;
  summary: string | null;
  status: string;
  assignee: string | null;
  age_hours: number;
  threshold_hours: number;
  url: string | null;
}

export interface WorkloadMember {
  name: string;
  active_issues: number;
  difference_from_average: number;
}

export interface WorkloadBalance {
  average_active_issues: number;
  overloaded: WorkloadMember[];
  available: WorkloadMember[];
  suggestions: string[];
}

export interface StandupSummary {
  headline: string;
  highlights: string[];
  recommended_actions: string[];
}

export interface TeamAnalytics {
  from: string | null;
  to: string | null;
  total: number;
  resolved: number;
  in_progress: number;
  avg_cycle_time_days: number;
  by_status: CountItem[];
  by_assignee: CountItem[];
  by_priority: CountItem[];
  bottlenecks: BottleneckIssue[];
  workload_balance: WorkloadBalance;
  standup_summary: StandupSummary;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
