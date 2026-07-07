"""Reporting logic: assigned issues (Report 1) and Build->Pending QA (Report 2)."""
from __future__ import annotations

import re
from datetime import date, datetime
from typing import Any

from app.clients.jira_client import JiraClient

# Ordered board columns ("swimlanes"). A forward transition is a move from one
# status to the status immediately after it in this list.
DEFAULT_STATUS_ORDER = ["To Do", "Build", "Pending QA", "Done"]

ISSUE_FIELDS = ["summary", "status", "assignee", "created", "updated", "reporter"]
BOTTLENECK_THRESHOLD_HOURS = 24


def _issue_url(site: str, key: str) -> str:
    return f"{site}/browse/{key}"


def _display_name(user: dict[str, Any] | None) -> str | None:
    if not user:
        return None
    return user.get("displayName") or user.get("emailAddress") or user.get("accountId")


def _parse_ts(iso_ts: str | None) -> datetime | None:
    """Parse a Jira ISO timestamp into a ``datetime`` (or ``None`` on failure)."""
    if not iso_ts:
        return None
    try:
        return datetime.fromisoformat(iso_ts.replace("Z", "+00:00"))
    except ValueError:
        return None


def _within_range(
    iso_ts: str | None, from_date: str | None, to_date: str | None
) -> bool:
    """Return True if an ISO timestamp falls within [from_date, to_date].

    Missing bounds are treated as open (no restriction on that side).
    """
    stamp_dt = _parse_ts(iso_ts)
    if stamp_dt is None:
        return False
    stamp = stamp_dt.date()
    if from_date and stamp < date.fromisoformat(from_date):
        return False
    if to_date and stamp > date.fromisoformat(to_date):
        return False
    return True


def _hours_since(iso_ts: str | None, now: datetime | None = None) -> int | None:
    stamp = _parse_ts(iso_ts)
    if stamp is None:
        return None
    current = now or datetime.now(stamp.tzinfo)
    return max(int((current - stamp).total_seconds() // 3600), 0)


def _status_entered_at(
    current_status: str | None, changelog_values: list[dict[str, Any]]
) -> str | None:
    if not current_status:
        return None
    latest: str | None = None
    for entry in changelog_values:
        for item in entry.get("items", []):
            if item.get("field") == "status" and item.get("toString") == current_status:
                latest = entry.get("created")
    return latest


def _workload_balance(active_counts: dict[str, int]) -> dict[str, Any]:
    named_counts = {
        name: count
        for name, count in active_counts.items()
        if name and name != "Unassigned"
    }
    if not named_counts:
        return {
            "average_active_issues": 0.0,
            "overloaded": [],
            "available": [],
            "suggestions": [],
        }

    average = round(sum(named_counts.values()) / len(named_counts), 1)

    def _member(name: str, count: int) -> dict[str, Any]:
        return {
            "name": name,
            "active_issues": count,
            "difference_from_average": round(count - average, 1),
        }

    overloaded = [
        _member(name, count)
        for name, count in named_counts.items()
        if count >= average + 2
    ]
    available = [
        _member(name, count)
        for name, count in named_counts.items()
        if count <= average - 2
    ]
    overloaded.sort(key=lambda item: item["difference_from_average"], reverse=True)
    available.sort(key=lambda item: item["difference_from_average"])

    suggestions: list[str] = []
    for overloaded_member, available_member in zip(overloaded, available):
        move_count = min(
            int(overloaded_member["difference_from_average"]),
            int(abs(available_member["difference_from_average"])),
        )
        if move_count > 0:
            suggestions.append(
                f"Consider moving {move_count} issue(s) from "
                f"{overloaded_member['name']} to {available_member['name']}."
            )

    return {
        "average_active_issues": average,
        "overloaded": overloaded,
        "available": available,
        "suggestions": suggestions,
    }


def _standup_summary(
    total: int,
    resolved: int,
    bottlenecks: list[dict[str, Any]],
    workload_balance: dict[str, Any],
) -> dict[str, Any]:
    highlights = [
        f"{total} issue(s) are in scope; {resolved} resolved and {total - resolved} still active."
    ]
    recommended_actions: list[str] = []

    if bottlenecks:
        top = bottlenecks[0]
        highlights.append(
            f"{len(bottlenecks)} issue(s) are at risk after crossing the 24-hour active-stage limit."
        )
        highlights.append(
            f"Highest attention: {top['key']} is in {top['status']} for {top['age_hours']} hours."
        )
        recommended_actions.append(
            f"Review {top['key']} first and unblock its {top['status']} stage."
        )
    else:
        highlights.append("No workflow-stage bottlenecks are currently detected.")

    overloaded = workload_balance.get("overloaded", [])
    available = workload_balance.get("available", [])
    suggestions = workload_balance.get("suggestions", [])
    if overloaded:
        lead = overloaded[0]
        highlights.append(
            f"{lead['name']} is carrying the highest load with {lead['active_issues']} active issue(s)."
        )
    if available:
        capacity = available[0]
        highlights.append(
            f"{capacity['name']} has available capacity with {capacity['active_issues']} active issue(s)."
        )
    recommended_actions.extend(suggestions)

    if not recommended_actions:
        recommended_actions.append("Continue monitoring active issues and keep the current assignment plan.")

    headline = "Team needs attention" if bottlenecks or overloaded else "Team workload looks healthy"
    return {
        "headline": headline,
        "highlights": highlights,
        "recommended_actions": recommended_actions,
    }


def enforce_project_scope(jql: str | None, project_key: str) -> str:
    """Guarantee an LLM-proposed JQL stays bound to the configured project.

    The model may omit (or be told to omit) the project filter. To avoid
    accidentally querying issues outside the intended project, this always
    prepends ``project = <key>`` when no ``project`` clause is present, while
    preserving any trailing ``ORDER BY`` clause. Empty input falls back to a
    project-wide query.
    """
    text = (jql or "").strip().rstrip(";").strip()
    if not text:
        return f"project = {project_key} ORDER BY updated DESC"

    if re.search(r"\bproject\b", text, re.IGNORECASE):
        return text

    order_match = re.search(r"\border\s+by\b.*$", text, re.IGNORECASE)
    if order_match:
        head = text[: order_match.start()].strip()
        order = order_match.group(0)
        if head:
            return f"project = {project_key} AND ({head}) {order}"
        return f"project = {project_key} {order}"
    return f"project = {project_key} AND ({text})"


# Matches ``assignee``/``reporter`` clauses and captures the value segment
# (a single quoted string or a parenthesised list) so quoted display names can
# be swapped for account ids before the query runs.
_USER_FIELD_RE = re.compile(
    r"\b(assignee|reporter)\b\s*"
    r"(=|!=|WAS\s+NOT|WAS|NOT\s+IN|IN)\s*"
    r"(\([^)]*\)|\"[^\"]*\"|'[^']*')",
    re.IGNORECASE,
)
_QUOTED_RE = re.compile(r"\"([^\"]*)\"|'([^']*)'")


def _jql_name_needs_resolution(value: str) -> bool:
    """True when a quoted user value looks like a display name, not an id.

    Atlassian account ids contain digits/colons/hyphens; a value that is purely
    alphabetic or contains a space is treated as a name that must be resolved.
    """
    v = value.strip()
    if not v:
        return False
    if " " in v:
        return True
    return v.isalpha()


def collect_jql_user_names(jql: str) -> list[str]:
    """Return the distinct display names used in assignee/reporter clauses."""
    names: list[str] = []
    for match in _USER_FIELD_RE.finditer(jql):
        for quoted in _QUOTED_RE.finditer(match.group(3)):
            name = quoted.group(1) if quoted.group(1) is not None else quoted.group(2)
            if name and _jql_name_needs_resolution(name) and name not in names:
                names.append(name)
    return names


def rewrite_jql_user_clauses(jql: str, mapping: dict[str, str]) -> str:
    """Replace quoted names inside assignee/reporter clauses with account ids.

    Only the value segments of user-field clauses are rewritten, so quoted text
    elsewhere (e.g. ``summary ~ "..."``) is left untouched.
    """

    def _replace_quoted(quoted: re.Match[str]) -> str:
        name = quoted.group(1) if quoted.group(1) is not None else quoted.group(2)
        if name in mapping:
            return f'"{mapping[name]}"'
        return quoted.group(0)

    def _replace_clause(match: re.Match[str]) -> str:
        full = match.group(0)
        value_offset = match.start(3) - match.start()
        head = full[:value_offset]
        value_segment = full[value_offset:]
        return head + _QUOTED_RE.sub(_replace_quoted, value_segment)

    return _USER_FIELD_RE.sub(_replace_clause, jql)


def assignee_changes_from_changelog(
    changelog_values: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Extract assignee changes from a changelog, sorted oldest -> newest.

    Each element is ``{created, from_id, from_name, to_id, to_name}``.
    """
    changes: list[dict[str, Any]] = []
    for entry in changelog_values:
        created = entry.get("created")
        for item in entry.get("items", []):
            if item.get("field") == "assignee":
                changes.append(
                    {
                        "created": created,
                        "from_id": item.get("from"),
                        "from_name": item.get("fromString"),
                        "to_id": item.get("to"),
                        "to_name": item.get("toString"),
                    }
                )
    changes.sort(key=lambda c: _parse_ts(c["created"]) or datetime.min)
    return changes


def assignee_at_transition(
    changelog_values: list[dict[str, Any]],
    transition_created: str | None,
    current_assignee_id: str | None,
    current_assignee_name: str | None,
) -> tuple[str | None, str | None]:
    """Reconstruct who was the assignee at the moment of a status transition.

    This preserves the history of the person who actually owned the ticket when
    it moved forward, even if it was reassigned to someone else immediately
    afterwards. Only assignee changes that happened strictly *before* the
    transition are applied, so a reassignment done as part of (or after) the
    hand-off does not overwrite the owner. When the ticket was never reassigned,
    the current assignee is returned unchanged.
    """
    changes = assignee_changes_from_changelog(changelog_values)
    if not changes:
        return current_assignee_id, current_assignee_name

    transition_dt = _parse_ts(transition_created)
    # Before the first recorded change, the assignee was that change's ``from``.
    state_id, state_name = changes[0]["from_id"], changes[0]["from_name"]
    for change in changes:
        change_dt = _parse_ts(change["created"])
        if transition_dt is not None and change_dt is not None and change_dt < transition_dt:
            state_id, state_name = change["to_id"], change["to_name"]
        else:
            break
    return state_id, state_name


def find_forward_transitions(
    changelog_values: list[dict[str, Any]],
    status_order: list[str],
) -> list[dict[str, Any]]:
    """Detect all one-step forward status transitions in a changelog.

    A transition qualifies when the ``from``/``to`` statuses are adjacent in
    ``status_order`` and the move is forward (``to`` is exactly one position
    after ``from``). Backward moves and multi-step jumps are ignored.

    Returns a list of ``{created, author_name, author_id, from_status,
    to_status}`` dicts. ``changelog_values`` is the ``values`` array from
    ``GET /rest/api/3/issue/{key}/changelog``.
    """
    index = {status: i for i, status in enumerate(status_order)}
    transitions: list[dict[str, Any]] = []
    for entry in changelog_values:
        for item in entry.get("items", []):
            if item.get("field") != "status":
                continue
            from_status = item.get("fromString")
            to_status = item.get("toString")
            from_idx = index.get(from_status)
            to_idx = index.get(to_status)
            if from_idx is None or to_idx is None:
                continue
            if to_idx != from_idx + 1:
                continue
            author = entry.get("author") or {}
            transitions.append(
                {
                    "created": entry.get("created"),
                    "author_name": _display_name(author),
                    "author_id": author.get("accountId"),
                    "from_status": from_status,
                    "to_status": to_status,
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
    def __init__(
        self,
        jira: JiraClient,
        site: str,
        project_key: str,
        status_order: list[str] | None = None,
    ) -> None:
        self._jira = jira
        self._site = site
        self._project_key = project_key
        self._status_order = status_order or DEFAULT_STATUS_ORDER

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
        """Report 1: issues associated with the member at any point in time.

        Uses Jira's ``assignee WAS`` history operator so the report includes
        every ticket the member was assigned to at any point, not just the ones
        currently assigned to them (a ticket reassigned to someone else still
        shows up). The ``assignee`` field in each row reflects the *current*
        assignee, which may differ from the queried member.

        When ``from_date``/``to_date`` are provided the results are restricted by
        the issue ``updated`` timestamp; when omitted, all issues ever assigned
        to the member in the project are returned (the query stays bounded by
        project).
        """
        account_id, display = await self.resolve_account_id(member)
        clauses = [
            f"project = {self._project_key}",
            f'assignee WAS "{account_id}"',
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

    async def search_custom(
        self, jql: str | None, max_results: int = 100
    ) -> dict[str, Any]:
        """Run an LLM-proposed JQL query, forced to stay within the project.

        Returns the exact JQL that was executed (after scope enforcement) plus
        the matching issue rows, so the dashboard can surface the query that
        actually ran against Jira.
        """
        final_jql = enforce_project_scope(jql, self._project_key)
        final_jql = await self._resolve_jql_users(final_jql)
        raw = await self._jira.search_jql(final_jql, fields=ISSUE_FIELDS, max_results=max_results)
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
            "executed_jql": final_jql,
            "count": len(issues),
            "issues": issues,
        }

    async def team_analytics(
        self, from_date: str | None = None, to_date: str | None = None
    ) -> dict[str, Any]:
        """Aggregate project-wide metrics for the analytics dashboard.

        Returns issue counts grouped by status, assignee and priority, plus a
        resolved/in-progress split and the average cycle time (created ->
        resolved, in days) over the resolved issues in scope. The query stays
        bounded by project and, when provided, by the ``updated`` window.
        """
        clauses = [f"project = {self._project_key}"]
        if from_date:
            clauses.append(f'updated >= "{from_date}"')
        if to_date:
            clauses.append(f'updated <= "{to_date}"')
        jql = " AND ".join(clauses) + " ORDER BY updated DESC"
        fields = ISSUE_FIELDS + ["resolutiondate", "priority"]
        raw = await self._jira.search_jql(jql, fields=fields, max_results=200)

        by_status: dict[str, int] = {}
        by_assignee: dict[str, int] = {}
        by_priority: dict[str, int] = {}
        active_by_assignee: dict[str, int] = {}
        cycle_times: list[float] = []
        bottlenecks: list[dict[str, Any]] = []
        resolved = 0

        for issue in raw:
            fields_data = issue.get("fields", {})
            status = (fields_data.get("status") or {}).get("name") or "Unknown"
            by_status[status] = by_status.get(status, 0) + 1
            assignee = _display_name(fields_data.get("assignee")) or "Unassigned"
            by_assignee[assignee] = by_assignee.get(assignee, 0) + 1
            priority = (fields_data.get("priority") or {}).get("name") or "None"
            by_priority[priority] = by_priority.get(priority, 0) + 1

            resolution = fields_data.get("resolutiondate")
            if resolution:
                resolved += 1
                created_dt = _parse_ts(fields_data.get("created"))
                resolved_dt = _parse_ts(resolution)
                if created_dt and resolved_dt:
                    cycle_times.append(
                        (resolved_dt - created_dt).total_seconds() / 86400
                    )
            else:
                active_by_assignee[assignee] = active_by_assignee.get(assignee, 0) + 1

            if status in self._status_order and status != self._status_order[-1]:
                entered_at = await self._issue_status_entered_at(issue, status)
                age_hours = _hours_since(entered_at)
                if age_hours is not None and age_hours >= BOTTLENECK_THRESHOLD_HOURS:
                    bottlenecks.append(
                        {
                            "key": issue.get("key"),
                            "summary": fields_data.get("summary"),
                            "status": status,
                            "assignee": assignee,
                            "age_hours": age_hours,
                            "threshold_hours": BOTTLENECK_THRESHOLD_HOURS,
                            "url": _issue_url(self._site, issue.get("key")),
                        }
                    )

        avg_cycle = (
            round(sum(cycle_times) / len(cycle_times), 1) if cycle_times else 0.0
        )

        def _items(counts: dict[str, int]) -> list[dict[str, Any]]:
            return [
                {"label": label, "value": value}
                for label, value in sorted(counts.items(), key=lambda kv: -kv[1])
            ]

        bottlenecks = sorted(
            bottlenecks, key=lambda item: item["age_hours"], reverse=True
        )
        workload_balance = _workload_balance(active_by_assignee)

        return {
            "from": from_date,
            "to": to_date,
            "total": len(raw),
            "resolved": resolved,
            "in_progress": len(raw) - resolved,
            "avg_cycle_time_days": avg_cycle,
            "by_status": _items(by_status),
            "by_assignee": _items(by_assignee),
            "by_priority": _items(by_priority),
            "bottlenecks": bottlenecks,
            "workload_balance": workload_balance,
            "standup_summary": _standup_summary(
                len(raw), resolved, bottlenecks, workload_balance
            ),
        }

    async def _issue_status_entered_at(
        self, issue: dict[str, Any], status: str | None
    ) -> str | None:
        key = issue.get("key")
        fields = issue.get("fields", {})
        if not key or not hasattr(self._jira, "issue_changelog"):
            return fields.get("updated") or fields.get("created")
        changelog = await self._jira.issue_changelog(key)
        return _status_entered_at(status, changelog) or fields.get("updated") or fields.get("created")

    async def _resolve_jql_users(self, jql: str) -> str:
        """Swap quoted display names in assignee/reporter clauses for ids.

        Jira JQL matches users by account id (or an exact identifier), so a
        friendly name the LLM emitted (e.g. ``assignee = "Kashish"``) usually
        returns nothing. Each distinct name is resolved via the same lookup the
        structured reports use, then substituted back into the query.
        """
        names = collect_jql_user_names(jql)
        if not names:
            return jql
        mapping: dict[str, str] = {}
        for name in names:
            account_id, _ = await self.resolve_account_id(name)
            if account_id and account_id != name:
                mapping[name] = account_id
        if not mapping:
            return jql
        return rewrite_jql_user_clauses(jql, mapping)

    async def transitions(
        self,
        member: str,
        from_date: str | None = None,
        to_date: str | None = None,
        rule: str = "assignee",
        transition: str | None = None,
    ) -> dict[str, Any]:
        """Report 2: every one-step forward status transition for a member.

        Covers all adjacent forward moves in the configured workflow (e.g.
        To Do -> Build, Build -> Pending QA, Pending QA -> Done), not just a
        single stage. Each row records the from/to statuses, when it moved, who
        performed it, and the assignee at that moment (reconstructed from history
        so a reassignment right after the move does not hide the real owner).

        ``rule='assignee'`` matches on the person assigned at the transition;
        ``rule='actor'`` matches on the person who performed it. Dates, when
        provided, restrict the transition timestamp. ``transition``, when set to
        a destination status (e.g. ``"Pending QA"`` for the Build -> Pending QA
        step), narrows the report to just that one forward move.
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
            # Current assignee is only a fallback for reconstructing the owner at
            # a transition when the ticket was never reassigned.
            current_assignee_id = assignee.get("accountId")
            current_assignee_name = _display_name(assignee)

            changelog = await self._jira.issue_changelog(key)
            forward = find_forward_transitions(changelog, self._status_order)
            for tr in forward:
                if not _within_range(tr["created"], from_date, to_date):
                    continue

                # Optional narrowing to a single forward step (by destination).
                if transition and tr["to_status"] != transition:
                    continue

                # Who was assigned at the moment of this transition.
                owner_id, owner_name = assignee_at_transition(
                    changelog, tr["created"], current_assignee_id, current_assignee_name
                )

                if rule == "actor":
                    if tr["author_id"] != account_id:
                        continue
                else:  # assignee rule (default): owner at the transition
                    if owner_id != account_id:
                        continue

                results.append(
                    {
                        "key": key,
                        "summary": fields.get("summary"),
                        "transitioned_at": tr["created"],
                        "performed_by": tr["author_name"],
                        "assignee": owner_name,
                        "from_status": tr["from_status"],
                        "to_status": tr["to_status"],
                        "url": _issue_url(self._site, key),
                    }
                )
        return {
            "member": display,
            "account_id": account_id,
            "rule": rule,
            "from": from_date,
            "to": to_date,
            "transition": transition,
            "workflow": list(self._status_order),
            "count": len(results),
            "issues": results,
        }
