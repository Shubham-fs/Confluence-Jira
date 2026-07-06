"""Natural-language query support.

Turns a plain-English question (e.g. "issues assigned to Yash last week" or
"what did Shubham move to QA this month") into a structured report intent that
reuses the existing :class:`ReportService`. The parser is deterministic and
network-free so it is fully unit-testable; the service layer resolves team
members from Confluence and runs the matching report.
"""
from __future__ import annotations

import calendar
import re
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any

from app.services.report_service import ReportService
from app.services.team_service import TeamService

# Phrases that indicate Report 2 (Build -> Pending QA transitions).
_BUILD_QA_PHRASES = [
    "build to pending qa",
    "build -> pending qa",
    "build to qa",
    "build -> qa",
    "pending qa",
    "moved to qa",
    "move to qa",
    "moved to pending qa",
    "ready for qa",
    "to qa",
    "transition",
    "transitioned",
]

# Phrases that indicate Report 1 (issues assigned to a developer).
_ASSIGNED_PHRASES = [
    "assigned to",
    "assigned",
    "working on",
    "owns",
    "owned by",
    "issues for",
    "tickets for",
]

# Phrases that mean "the person who performed the transition" (actor rule).
_ACTOR_PHRASES = [
    "who moved",
    "who transitioned",
    "moved by",
    "transitioned by",
    "performed by",
    "did the transition",
    "as actor",
    "by actor",
]

_ISO_DATE = re.compile(r"\d{4}-\d{2}-\d{2}")


@dataclass
class QueryIntent:
    """Structured interpretation of a natural-language query."""

    report_type: str  # "assigned" | "build-to-qa"
    member: str | None
    from_date: str | None
    to_date: str | None
    rule: str  # "assignee" | "actor"
    matched_phrases: list[str] = field(default_factory=list)


def _month_range(year: int, month: int) -> tuple[date, date]:
    last_day = calendar.monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def _detect_report_type(text: str) -> tuple[str, list[str]]:
    matched: list[str] = []
    for phrase in _BUILD_QA_PHRASES:
        if phrase in text:
            matched.append(phrase)
    if matched:
        return "build-to-qa", matched
    for phrase in _ASSIGNED_PHRASES:
        if phrase in text:
            matched.append(phrase)
    # Default to the assigned report when nothing else matches.
    return "assigned", matched


def _detect_rule(text: str) -> tuple[str, list[str]]:
    matched = [p for p in _ACTOR_PHRASES if p in text]
    return ("actor" if matched else "assignee"), matched


def _detect_member(text: str, members: list[str]) -> str | None:
    """Match a known team member by full name or first name (longest first)."""
    lowered = text.lower()
    # Prefer the longest member name so "Kashish Roy" wins over "Kashish".
    for name in sorted(members, key=len, reverse=True):
        if name.lower() in lowered:
            return name
    # Fall back to matching the first token of each member name as a word.
    for name in sorted(members, key=len, reverse=True):
        first = name.split()[0].lower()
        if re.search(rf"\b{re.escape(first)}\b", lowered):
            return name
    return None


def _detect_date_range(
    text: str, today: date
) -> tuple[str | None, str | None, list[str]]:
    """Resolve a date range from relative or explicit expressions."""
    matched: list[str] = []

    # Explicit ISO dates take precedence: "between X and Y", "X to Y", "since X".
    iso = _ISO_DATE.findall(text)
    if "since" in text and iso:
        matched.append(f"since {iso[0]}")
        return iso[0], None, matched
    if len(iso) >= 2:
        matched.append(f"{iso[0]}..{iso[1]}")
        return iso[0], iso[1], matched
    if len(iso) == 1:
        matched.append(iso[0])
        return iso[0], iso[0], matched

    # "last/past N days".
    days = re.search(r"(?:last|past)\s+(\d+)\s+days?", text)
    if days:
        n = int(days.group(1))
        start = today - timedelta(days=n)
        matched.append(f"last {n} days")
        return start.isoformat(), today.isoformat(), matched

    if "today" in text:
        matched.append("today")
        return today.isoformat(), today.isoformat(), matched

    if "yesterday" in text:
        matched.append("yesterday")
        y = today - timedelta(days=1)
        return y.isoformat(), y.isoformat(), matched

    if "last week" in text:
        matched.append("last week")
        this_monday = today - timedelta(days=today.weekday())
        start = this_monday - timedelta(days=7)
        end = start + timedelta(days=6)
        return start.isoformat(), end.isoformat(), matched

    if "this week" in text:
        matched.append("this week")
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        return start.isoformat(), end.isoformat(), matched

    if "last month" in text:
        matched.append("last month")
        year = today.year - 1 if today.month == 1 else today.year
        month = 12 if today.month == 1 else today.month - 1
        start, end = _month_range(year, month)
        return start.isoformat(), end.isoformat(), matched

    if "this month" in text:
        matched.append("this month")
        start, end = _month_range(today.year, today.month)
        return start.isoformat(), end.isoformat(), matched

    if "last year" in text:
        matched.append("last year")
        year = today.year - 1
        return date(year, 1, 1).isoformat(), date(year, 12, 31).isoformat(), matched

    if "this year" in text:
        matched.append("this year")
        return (
            date(today.year, 1, 1).isoformat(),
            date(today.year, 12, 31).isoformat(),
            matched,
        )

    return None, None, matched


def parse_query(text: str, members: list[str], today: date) -> QueryIntent:
    """Parse a natural-language query into a :class:`QueryIntent`.

    ``members`` is the list of known team member names (used to resolve who the
    query is about). ``today`` anchors relative date expressions so the function
    stays deterministic and testable.
    """
    lowered = (text or "").lower()

    report_type, type_phrases = _detect_report_type(lowered)
    rule, rule_phrases = _detect_rule(lowered)
    member = _detect_member(lowered, members)
    from_date, to_date, date_phrases = _detect_date_range(lowered, today)

    # The actor rule only makes sense for the transition report.
    if report_type != "build-to-qa":
        rule = "assignee"
        rule_phrases = []

    return QueryIntent(
        report_type=report_type,
        member=member,
        from_date=from_date,
        to_date=to_date,
        rule=rule,
        matched_phrases=type_phrases + rule_phrases + date_phrases,
    )


class NlQueryService:
    """Resolves team members from Confluence and runs the interpreted report."""

    def __init__(self, report_service: ReportService, team_service: TeamService) -> None:
        self._reports = report_service
        self._teams = team_service

    async def _all_members(self) -> list[str]:
        teams = await self._teams.get_teams()
        seen: list[str] = []
        for members in teams.values():
            for name in members:
                if name not in seen:
                    seen.append(name)
        return seen

    async def run(self, query: str, today: date | None = None) -> dict[str, Any]:
        """Interpret ``query`` and return the interpretation plus the report.

        Raises ``ValueError`` when no team member can be identified in the query.
        """
        today = today or date.today()
        members = await self._all_members()
        intent = parse_query(query, members, today)

        if not intent.member:
            raise ValueError(
                "Could not identify a team member in the query. "
                "Mention a developer by name, e.g. 'issues assigned to Yash'."
            )

        interpretation = {
            "report_type": intent.report_type,
            "member": intent.member,
            "from": intent.from_date,
            "to": intent.to_date,
            "rule": intent.rule,
            "matched_phrases": intent.matched_phrases,
        }

        result: dict[str, Any] = {
            "query": query,
            "interpretation": interpretation,
            "assigned": None,
            "build_to_qa": None,
        }

        if intent.report_type == "build-to-qa":
            result["build_to_qa"] = await self._reports.build_to_qa(
                intent.member, intent.from_date, intent.to_date, intent.rule
            )
        else:
            result["assigned"] = await self._reports.assigned_issues(
                intent.member, intent.from_date, intent.to_date
            )
        return result
