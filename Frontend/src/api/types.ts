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

export interface BuildToQaIssue {
  key: string;
  summary: string | null;
  transitioned_at: string | null;
  performed_by: string | null;
  assignee: string | null;
  from_status: string;
  to_status: string;
  url: string | null;
}

export interface BuildToQaReport {
  member: string;
  account_id: string | null;
  rule: string;
  from: string;
  to: string;
  count: number;
  issues: BuildToQaIssue[];
}

export type TransitionRule = 'assignee' | 'actor';
export type ReportType = 'assigned' | 'build-to-qa';

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
