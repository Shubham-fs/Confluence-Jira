"""Tests for the team analytics aggregation."""
import pytest

from app.services.report_service import ReportService


class _FakeJira:
    def __init__(self, issues):
        self._issues = issues
        self._changelogs = {}

    async def search_jql(self, jql, fields=None, max_results=100):
        return self._issues

    async def issue_changelog(self, issue_key):
        return self._changelogs.get(issue_key, [])


def _issue(key, status, assignee=None, priority=None, created=None, resolved=None):
    return {
        "key": key,
        "fields": {
            "summary": f"Issue {key}",
            "status": {"name": status},
            "assignee": {"displayName": assignee} if assignee else None,
            "priority": {"name": priority} if priority else None,
            "created": created,
            "updated": created,
            "resolutiondate": resolved,
        },
    }


@pytest.mark.asyncio
async def test_team_analytics_aggregates_counts_and_cycle_time():
    issues = [
        _issue(
            "KAN-1",
            "Done",
            "Yash",
            "High",
            created="2026-03-01T00:00:00.000+0000",
            resolved="2026-03-05T00:00:00.000+0000",
        ),
        _issue("KAN-2", "Build", "Yash", "Medium", created="2026-03-02T00:00:00.000+0000"),
        _issue("KAN-3", "Build", None, "Medium", created="2026-03-03T00:00:00.000+0000"),
    ]
    service = ReportService(_FakeJira(issues), "https://site", "KAN")

    result = await service.team_analytics(to_date="2026-03-10")

    assert result["total"] == 3
    assert result["resolved"] == 1
    assert result["in_progress"] == 2
    assert result["avg_cycle_time_days"] == 4.0

    by_status = {item["label"]: item["value"] for item in result["by_status"]}
    assert by_status == {"Build": 2, "Done": 1}

    by_assignee = {item["label"]: item["value"] for item in result["by_assignee"]}
    assert by_assignee == {"Yash": 2, "Unassigned": 1}

    by_priority = {item["label"]: item["value"] for item in result["by_priority"]}
    assert by_priority == {"Medium": 2, "High": 1}
    assert result["bottlenecks"]
    assert result["workload_balance"]["average_active_issues"] == 1.0
    assert result["standup_summary"]["headline"]
    assert result["standup_summary"]["recommended_actions"]


@pytest.mark.asyncio
async def test_team_analytics_handles_no_issues():
    service = ReportService(_FakeJira([]), "https://site", "KAN")

    result = await service.team_analytics()

    assert result["total"] == 0
    assert result["resolved"] == 0
    assert result["in_progress"] == 0
    assert result["avg_cycle_time_days"] == 0.0
    assert result["by_status"] == []
    assert result["bottlenecks"] == []
    assert result["workload_balance"]["average_active_issues"] == 0.0
    assert result["standup_summary"]["headline"] == "Team workload looks healthy"
