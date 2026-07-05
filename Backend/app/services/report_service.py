"""Reporting logic: assigned issues (Report 1) and Build->Pending QA (Report 2)."""
from __future__ import annotations

from datetime import date, datetime
from typing import Any

from app.clients.jira_client import JiraClient

BUILD_STATUS = "Build"
PENDING_QA_STATUS = "Pending QA"

ISSUE_FIELDS = ["summary", "status", "assignee", "created", "updated", "reporter"]


def _issue_url(site: str, key: str) -> str:
    return f"{site}/browse/{key}"


def _display_name(user: dict[str, Any] | None) -> str | None:
    if not user:
        return None
    return user.get("displayName") or user.get("emailAddress") or user.get("accountId")


def _within_range(
    iso_ts: str | None, from_date: str | None, to_date: str | None
) -> bool:
    """Return True if an ISO timestamp falls within [from_date, to_date].

    Missing bounds are treated as open (no restriction on that side).
    """
    if not iso_ts:
        return False
    try:
        stamp = datetime.fromisoformat(iso_ts.replace("Z", "+00:00")).date()
    except ValueError:
        return False
    if from_date and stamp < date.fromisoformat(from_date):
        return False
    if to_date and stamp > date.fromisoformat(to_date):
        return False
    return True


def find_build_to_qa_transitions(
    changelog_values: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Detect Build -> Pending QA status transitions in a changelog.

    Returns a list of ``{created, author_name, author_id}`` dicts, one per
    matching transition. ``changelog_values`` is the ``values`` array from
    ``GET /rest/api/3/issue/{key}/changelog``.
    """
    transitions: list[dict[str, Any]] = []
    for entry in changelog_values:
        for item in entry.get("items", []):
            if item.get("field") != "status":
                continue
            if (
                item.get("fromString") == BUILD_STATUS
                and item.get("toString") == PENDING_QA_STATUS
            ):
                author = entry.get("author") or {}
                transitions.append(
                    {
                        "created": entry.get("created"),
                        "author_name": _display_name(author),
                        "author_id": author.get("accountId"),
                    }
                )
    return transitions


def infer_roles(issue: dict[str, Any]) -> list[str]:
    """Infer a developer's roles for an issue.

    Assignee -> Developer, Reporter -> Requester. Reviewer/QA detection is a
    TODO hook: it should read a configurable custom field id or be derived from
    workflow transitions. Kept isolated so it is easy to extend later.
    """
    fields = issue.get("fields", {})
    roles: list[str] = []
    if fields.get("assignee"):
        roles.append("Developer")
    if fields.get("reporter"):
        roles.append("Requester")
    # TODO: reviewer/QA role inference from a custom field or transition history.
    return roles


class ReportService:
    def __init__(self, jira: JiraClient, site: str, project_key: str) -> None:
        self._jira = jira
        self._site = site
        self._project_key = project_key

    async def resolve_account_id(self, member: str) -> tuple[str, str]:
        """Resolve a member name/email/accountId to (account_id, display_name).

        If ``member`` already looks like an accountId it is returned as-is.
        """
        # Atlassian account ids are opaque; a name/email query is the safe path.
        users = await self._jira.user_search(member)
        if not users:
            # Fall back to treating the input as an account id directly.
            return member, member

        term = member.strip().lower()

        def name_of(u: dict[str, Any]) -> str:
            return (u.get("displayName") or u.get("emailAddress") or "").lower()

        # Prefer, in order: exact accountId, exact display/email match, a name
        # that starts with the term (e.g. "Kashish" -> "Kashish Roy"), then a
        # name that merely contains the term, otherwise the first result.
        best = (
            next((u for u in users if u.get("accountId") == member), None)
            or next((u for u in users if name_of(u) == term), None)
            or next((u for u in users if name_of(u).startswith(term)), None)
            or next((u for u in users if term in name_of(u)), None)
            or users[0]
        )
        return best.get("accountId", member), _display_name(best) or member

    async def assigned_issues(
        self, member: str, from_date: str | None = None, to_date: str | None = None
    ) -> dict[str, Any]:
        """Report 1: issues assigned to the member.

        When ``from_date``/``to_date`` are provided the results are restricted by
        the issue ``updated`` timestamp; when omitted, all issues assigned to the
        member in the project are returned (the query stays bounded by project).
        """
        account_id, display = await self.resolve_account_id(member)
        clauses = [
            f"project = {self._project_key}",
            f'assignee = "{account_id}"',
        ]
        if from_date:
            clauses.append(f'updated >= "{from_date}"')
        if to_date:
            clauses.append(f'updated <= "{to_date}"')
        jql = " AND ".join(clauses) + " ORDER BY updated DESC"
        raw = await self._jira.search_jql(jql, fields=ISSUE_FIELDS)
        issues = []
        for issue in raw:
            fields = issue.get("fields", {})
            key = issue.get("key")
            issues.append(
                {
                    "key": key,
                    "summary": fields.get("summary"),
                    "status": (fields.get("status") or {}).get("name"),
                    "assignee": _display_name(fields.get("assignee")),
                    "reporter": _display_name(fields.get("reporter")),
                    "created": fields.get("created"),
                    "updated": fields.get("updated"),
                    "url": _issue_url(self._site, key),
                }
            )
        return {
            "member": display,
            "account_id": account_id,
            "from": from_date,
            "to": to_date,
            "count": len(issues),
            "issues": issues,
        }

    async def build_to_qa(
        self,
        member: str,
        from_date: str | None = None,
        to_date: str | None = None,
        rule: str = "assignee",
    ) -> dict[str, Any]:
        """Report 2: issues transitioned Build -> Pending QA.

        ``rule='assignee'`` includes issues where the current assignee is the
        member; ``rule='actor'`` includes issues where the member performed the
        transition. Dates, when provided, restrict the transition timestamp.
        """
        account_id, display = await self.resolve_account_id(member)

        # Candidate issues: everything in the project (optionally in the window).
        # (Bounded JQL is required by the /search/jql endpoint.)
        clauses = [f"project = {self._project_key}"]
        if from_date:
            clauses.append(f'updated >= "{from_date}"')
        if to_date:
            clauses.append(f'updated <= "{to_date}"')
        jql = " AND ".join(clauses) + " ORDER BY updated DESC"
        candidates = await self._jira.search_jql(jql, fields=ISSUE_FIELDS)

        results: list[dict[str, Any]] = []
        for issue in candidates:
            key = issue.get("key")
            fields = issue.get("fields", {})
            assignee = fields.get("assignee") or {}
            assignee_id = assignee.get("accountId")

            changelog = await self._jira.issue_changelog(key)
            transitions = find_build_to_qa_transitions(changelog)
            for tr in transitions:
                if not _within_range(tr["created"], from_date, to_date):
                    continue
                if rule == "actor":
                    if tr["author_id"] != account_id:
                        continue
                else:  # assignee rule (default)
                    if assignee_id != account_id:
                        continue
                results.append(
                    {
                        "key": key,
                        "summary": fields.get("summary"),
                        "transitioned_at": tr["created"],
                        "performed_by": tr["author_name"],
                        "assignee": _display_name(assignee),
                        "from_status": BUILD_STATUS,
                        "to_status": PENDING_QA_STATUS,
                        "url": _issue_url(self._site, key),
                    }
                )
        return {
            "member": display,
            "account_id": account_id,
            "rule": rule,
            "from": from_date,
            "to": to_date,
            "count": len(results),
            "issues": results,
        }
