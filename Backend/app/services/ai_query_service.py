"""Advanced natural-language querying backed by the Groq LLM.

Turns a free-form prompt into a Jira JQL plan using an LLM, then executes that
JQL (scope-enforced to the project) and returns the exact query that ran so the
dashboard can display it.
"""
from __future__ import annotations

from datetime import date
from typing import Any, Protocol

from app.clients.groq_client import GroqClient, GroqError
from app.services.member_directory import MemberDirectory, TeamMemberDirectory
from app.services.report_service import ReportService
from app.services.team_service import TeamService

_ALLOWED_REPORT_TYPES = {"assigned", "transitions", "custom-jql"}


class LlmClient(Protocol):
    async def complete_json(
        self, system_prompt: str, user_prompt: str
    ) -> dict[str, Any]: ...


class CustomSearchGateway(Protocol):
    async def search_custom(
        self, jql: str | None, max_results: int = 100
    ) -> dict[str, Any]: ...


def build_system_prompt(project_key: str, members: list[str], today: date) -> str:
    """Construct the strict planning prompt sent to the LLM."""
    member_list = ", ".join(members) if members else "(none discovered)"
    return (
        "You are a Jira query planner for a developer-activity dashboard.\n"
        "Convert the user's request into a single JSON object. Output JSON only.\n\n"
        f"Context:\n"
        f"- Jira project key: {project_key}\n"
        f"- Today's date (ISO): {today.isoformat()}\n"
        f"- Known team members: {member_list}\n\n"
        "Rules:\n"
        f"- Every query MUST be scoped to project = {project_key}.\n"
        "- Express filters as valid Jira Cloud JQL in `proposed_jql`.\n"
        "- Use the `assignee WAS \"Name\"` history operator when the user asks "
        "about anyone who ever worked on / was assigned an issue.\n"
        "- Use `status`, `created`, `updated`, `reporter`, `assignee`, "
        "`resolution`, `priority`, `labels` and text search (`summary ~`) as "
        "needed.\n"
        "- Resolve relative dates (last week, this month, between X and Y) into "
        "concrete YYYY-MM-DD values based on today's date.\n"
        "- Prefer matching a name to the Known team members list.\n"
        "- If the request needs workflow transition history that JQL cannot "
        "express (e.g. who moved an issue one column forward), set "
        "requires_changelog=true and still return the best bounded JQL to "
        "narrow candidates.\n"
        "- Always end proposed_jql with an ORDER BY clause.\n\n"
        "Return exactly this JSON schema:\n"
        "{\n"
        '  "report_type": "assigned" | "transitions" | "custom-jql",\n'
        '  "members": ["..."],\n'
        '  "from_date": "YYYY-MM-DD" | null,\n'
        '  "to_date": "YYYY-MM-DD" | null,\n'
        '  "requires_changelog": true | false,\n'
        '  "proposed_jql": "...",\n'
        '  "explanation": "one short sentence"\n'
        "}"
    )


class AiQueryService:
    """Plan a query with the LLM, execute the JQL, and return both."""

    def __init__(
        self,
        report_service: CustomSearchGateway,
        team_service: TeamService,
        llm: LlmClient,
        project_key: str,
        member_directory: MemberDirectory | None = None,
    ) -> None:
        self._reports = report_service
        self._llm = llm
        self._project_key = project_key
        self._members = member_directory or TeamMemberDirectory(team_service)

    async def run(self, prompt: str, today: date | None = None) -> dict[str, Any]:
        """Interpret ``prompt`` via the LLM and run the resulting JQL.

        Raises :class:`ValueError` for empty prompts and re-raises
        :class:`GroqError` when the LLM call fails.
        """
        text = (prompt or "").strip()
        if not text:
            raise ValueError("Enter a question to search.")

        today = today or date.today()
        members = await self._members.get_members()
        system_prompt = build_system_prompt(self._project_key, members, today)

        plan = await self._llm.complete_json(system_prompt, text)
        normalized = self._normalize_plan(plan)

        result = await self._reports.search_custom(normalized["proposed_jql"])

        return {
            "query": text,
            "plan": normalized,
            "executed_jql": result["executed_jql"],
            "count": result["count"],
            "issues": result["issues"],
        }

    def _normalize_plan(self, plan: dict[str, Any]) -> dict[str, Any]:
        """Coerce the LLM output into a predictable, validated shape."""
        if not isinstance(plan, dict):
            raise GroqError("Groq plan was not a JSON object.")

        report_type = str(plan.get("report_type") or "custom-jql").strip()
        if report_type not in _ALLOWED_REPORT_TYPES:
            report_type = "custom-jql"

        members = plan.get("members") or []
        if not isinstance(members, list):
            members = [str(members)]
        members = [str(m) for m in members if str(m).strip()]

        proposed_jql = str(plan.get("proposed_jql") or "").strip()

        return {
            "report_type": report_type,
            "members": members,
            "from_date": _clean_str(plan.get("from_date")),
            "to_date": _clean_str(plan.get("to_date")),
            "requires_changelog": bool(plan.get("requires_changelog", False)),
            "proposed_jql": proposed_jql,
            "explanation": _clean_str(plan.get("explanation")) or "",
        }


def _clean_str(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None
