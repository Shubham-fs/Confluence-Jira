"""Pydantic request/response models shared across the API."""
from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"


class Team(BaseModel):
    name: str
    members: list[str]


class TeamsResponse(BaseModel):
    teams: list[Team]


class MembersResponse(BaseModel):
    team: str
    members: list[str]


class AssignedIssue(BaseModel):
    """A single row in Report 1 (issues assigned to the developer)."""

    key: str
    summary: str | None = None
    status: str | None = None
    assignee: str | None = None
    reporter: str | None = None
    created: str | None = None
    updated: str | None = None
    url: str | None = None


class AssignedReport(BaseModel):
    member: str
    account_id: str | None = None
    from_date: str | None = Field(default=None, alias="from")
    to_date: str | None = Field(default=None, alias="to")
    count: int
    issues: list[AssignedIssue]

    model_config = {"populate_by_name": True}


class TransitionIssue(BaseModel):
    """A single row in Report 2 (one-step forward status transitions)."""

    key: str
    summary: str | None = None
    transitioned_at: str | None = None
    performed_by: str | None = None
    assignee: str | None = None
    from_status: str | None = None
    to_status: str | None = None
    url: str | None = None


class TransitionReport(BaseModel):
    member: str
    account_id: str | None = None
    rule: str
    from_date: str | None = Field(default=None, alias="from")
    to_date: str | None = Field(default=None, alias="to")
    transition: str | None = None
    workflow: list[str] = Field(default_factory=list)
    count: int
    issues: list[TransitionIssue]

    model_config = {"populate_by_name": True}


class AiQueryPlan(BaseModel):
    """The LLM's structured interpretation of a free-form prompt."""

    report_type: str
    members: list[str] = Field(default_factory=list)
    from_date: str | None = Field(default=None, alias="from")
    to_date: str | None = Field(default=None, alias="to")
    requires_changelog: bool = False
    proposed_jql: str = ""
    explanation: str = ""

    model_config = {"populate_by_name": True}


class AiIssue(BaseModel):
    """A single issue row returned by an LLM-planned JQL search."""

    key: str
    summary: str | None = None
    status: str | None = None
    assignee: str | None = None
    reporter: str | None = None
    created: str | None = None
    updated: str | None = None
    url: str | None = None


class AiQueryResponse(BaseModel):
    """Response for the Groq-backed advanced query endpoint."""

    query: str
    plan: AiQueryPlan
    executed_jql: str
    count: int
    issues: list[AiIssue]


class CountItem(BaseModel):
    """A single labelled count used by the analytics charts."""

    label: str
    value: int


class BottleneckIssue(BaseModel):
    """An issue that has stayed in an active workflow status for too long."""

    key: str
    summary: str | None = None
    status: str
    assignee: str | None = None
    age_hours: int
    threshold_hours: int
    url: str | None = None


class WorkloadMember(BaseModel):
    """A developer's active workload and balance status."""

    name: str
    active_issues: int
    difference_from_average: float


class WorkloadBalance(BaseModel):
    """Workload balance insight for active issues in the project."""

    average_active_issues: float
    overloaded: list[WorkloadMember] = Field(default_factory=list)
    available: list[WorkloadMember] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class StandupSummary(BaseModel):
    """A concise team-lead summary generated from analytics signals."""

    headline: str
    highlights: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)


class TeamAnalytics(BaseModel):
    """Aggregated project-wide metrics for the analytics dashboard."""

    from_date: str | None = Field(default=None, alias="from")
    to_date: str | None = Field(default=None, alias="to")
    total: int
    resolved: int
    in_progress: int
    avg_cycle_time_days: float
    by_status: list[CountItem]
    by_assignee: list[CountItem]
    by_priority: list[CountItem]
    bottlenecks: list[BottleneckIssue] = Field(default_factory=list)
    workload_balance: WorkloadBalance
    standup_summary: StandupSummary

    model_config = {"populate_by_name": True}


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
