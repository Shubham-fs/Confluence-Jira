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


class BuildToQaIssue(BaseModel):
    """A single row in Report 2 (Build -> Pending QA transitions)."""

    key: str
    summary: str | None = None
    transitioned_at: str | None = None
    performed_by: str | None = None
    assignee: str | None = None
    from_status: str = "Build"
    to_status: str = "Pending QA"
    url: str | None = None


class BuildToQaReport(BaseModel):
    member: str
    account_id: str | None = None
    rule: str
    from_date: str | None = Field(default=None, alias="from")
    to_date: str | None = Field(default=None, alias="to")
    count: int
    issues: list[BuildToQaIssue]

    model_config = {"populate_by_name": True}


class QueryInterpretation(BaseModel):
    """How a natural-language query was understood."""

    report_type: str
    member: str | None = None
    from_date: str | None = Field(default=None, alias="from")
    to_date: str | None = Field(default=None, alias="to")
    rule: str
    matched_phrases: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class NlQueryResponse(BaseModel):
    """Response for the natural-language report endpoint."""

    query: str
    interpretation: QueryInterpretation
    assigned: AssignedReport | None = None
    build_to_qa: BuildToQaReport | None = None


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
