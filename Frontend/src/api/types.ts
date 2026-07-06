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

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
