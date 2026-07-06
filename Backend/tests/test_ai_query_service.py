"""Tests for the Groq-backed advanced query service and JQL scope enforcement."""
from __future__ import annotations

from datetime import date

import pytest

from app.services.ai_query_service import AiQueryService, build_system_prompt
from app.services.report_service import (
    collect_jql_user_names,
    enforce_project_scope,
    rewrite_jql_user_clauses,
)


def test_enforce_scope_prepends_project_when_missing():
    out = enforce_project_scope('assignee WAS "Kashish"', "KAN")
    assert out == 'project = KAN AND (assignee WAS "Kashish")'


def test_enforce_scope_preserves_order_by():
    out = enforce_project_scope('status = Done ORDER BY updated DESC', "KAN")
    assert out == 'project = KAN AND (status = Done) ORDER BY updated DESC'


def test_enforce_scope_leaves_existing_project_clause():
    jql = 'project = KAN AND status = Done ORDER BY created ASC'
    assert enforce_project_scope(jql, "KAN") == jql


def test_enforce_scope_empty_falls_back_to_project_wide():
    assert enforce_project_scope("", "KAN") == "project = KAN ORDER BY updated DESC"


def test_enforce_scope_order_by_only():
    assert (
        enforce_project_scope("ORDER BY updated DESC", "KAN")
        == "project = KAN ORDER BY updated DESC"
    )


def test_system_prompt_includes_context():
    prompt = build_system_prompt("KAN", ["Yash Gupta", "Kashish Roy"], date(2026, 7, 6))
    assert "KAN" in prompt
    assert "2026-07-06" in prompt
    assert "Kashish Roy" in prompt


def test_collect_jql_user_names_finds_names_only():
    jql = (
        'project = KAN AND assignee = "Kashish" AND reporter WAS "Yash Gupta" '
        'AND summary ~ "login bug" ORDER BY updated DESC'
    )
    names = collect_jql_user_names(jql)
    assert names == ["Kashish", "Yash Gupta"]


def test_collect_jql_user_names_ignores_account_ids():
    jql = 'assignee = "712020:abc-123" AND reporter IN ("Kashish")'
    assert collect_jql_user_names(jql) == ["Kashish"]


def test_rewrite_jql_user_clauses_swaps_only_user_fields():
    jql = (
        'project = KAN AND assignee = "Kashish" AND summary ~ "Kashish" '
        "ORDER BY updated DESC"
    )
    out = rewrite_jql_user_clauses(jql, {"Kashish": "acc-1"})
    assert 'assignee = "acc-1"' in out
    # The text-search term must stay untouched.
    assert 'summary ~ "Kashish"' in out


def test_rewrite_jql_user_clauses_handles_in_list():
    jql = 'assignee IN ("Kashish", "Yash Gupta")'
    out = rewrite_jql_user_clauses(jql, {"Kashish": "acc-1", "Yash Gupta": "acc-2"})
    assert out == 'assignee IN ("acc-1", "acc-2")'


class _FakeLlm:
    def __init__(self, plan):
        self._plan = plan
        self.calls: list[tuple[str, str]] = []

    async def complete_json(self, system_prompt, user_prompt):
        self.calls.append((system_prompt, user_prompt))
        return self._plan


class _FakeReports:
    def __init__(self):
        self.received_jql: str | None = None

    async def search_custom(self, jql, max_results=100):
        self.received_jql = jql
        return {
            "executed_jql": jql or "project = KAN ORDER BY updated DESC",
            "count": 1,
            "issues": [{"key": "KAN-1"}],
        }


class _FakeMembers:
    async def get_members(self):
        return ["Yash Gupta", "Kashish Roy"]


async def test_ai_query_runs_proposed_jql():
    llm = _FakeLlm(
        {
            "report_type": "custom-jql",
            "members": ["Kashish Roy"],
            "from_date": "2026-06-01",
            "to_date": "2026-06-30",
            "requires_changelog": False,
            "proposed_jql": 'project = KAN AND assignee WAS "Kashish Roy" ORDER BY updated DESC',
            "explanation": "Issues Kashish worked on in June.",
        }
    )
    reports = _FakeReports()
    service = AiQueryService(reports, None, llm, "KAN", member_directory=_FakeMembers())

    out = await service.run("what did Kashish work on in June", today=date(2026, 7, 6))

    assert out["plan"]["members"] == ["Kashish Roy"]
    assert out["executed_jql"].startswith("project = KAN")
    assert out["count"] == 1
    assert reports.received_jql == out["plan"]["proposed_jql"]


async def test_ai_query_rejects_empty_prompt():
    service = AiQueryService(
        _FakeReports(), None, _FakeLlm({}), "KAN", member_directory=_FakeMembers()
    )
    with pytest.raises(ValueError):
        await service.run("   ")


async def test_ai_query_normalizes_bad_report_type():
    llm = _FakeLlm({"report_type": "nonsense", "proposed_jql": ""})
    service = AiQueryService(
        _FakeReports(), None, llm, "KAN", member_directory=_FakeMembers()
    )
    out = await service.run("show me everything", today=date(2026, 7, 6))
    assert out["plan"]["report_type"] == "custom-jql"
