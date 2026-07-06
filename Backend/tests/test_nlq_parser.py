"""Tests for the natural-language query parser."""
from datetime import date

from app.services.nlq_service import parse_query

MEMBERS = ["Kashish Roy", "Yash Gupta", "Shubham"]
TODAY = date(2026, 7, 6)  # a Monday


def test_defaults_to_assigned_report():
    intent = parse_query("show issues for Yash", MEMBERS, TODAY)
    assert intent.report_type == "assigned"
    assert intent.member == "Yash Gupta"
    assert intent.rule == "assignee"


def test_detects_build_to_qa_report():
    intent = parse_query("what did Shubham move to QA this month", MEMBERS, TODAY)
    assert intent.report_type == "build-to-qa"
    assert intent.member == "Shubham"


def test_actor_rule_only_applies_to_build_to_qa():
    intent = parse_query("issues moved by Yash to pending QA", MEMBERS, TODAY)
    assert intent.report_type == "build-to-qa"
    assert intent.rule == "actor"


def test_actor_phrase_ignored_for_assigned_report():
    intent = parse_query("issues assigned to Yash performed by him", MEMBERS, TODAY)
    # "assigned to" wins -> assigned report, so the actor rule is dropped.
    assert intent.report_type == "assigned"
    assert intent.rule == "assignee"


def test_matches_member_by_first_name():
    intent = parse_query("tickets for kashish", MEMBERS, TODAY)
    assert intent.member == "Kashish Roy"


def test_member_defaults_to_none_when_unknown():
    intent = parse_query("issues assigned to Nobody", MEMBERS, TODAY)
    assert intent.member is None


def test_relative_this_week():
    intent = parse_query("issues for Yash this week", MEMBERS, TODAY)
    assert intent.from_date == "2026-07-06"  # Monday
    assert intent.to_date == "2026-07-12"    # Sunday


def test_relative_last_week():
    intent = parse_query("issues for Yash last week", MEMBERS, TODAY)
    assert intent.from_date == "2026-06-29"
    assert intent.to_date == "2026-07-05"


def test_relative_this_month():
    intent = parse_query("issues for Yash this month", MEMBERS, TODAY)
    assert intent.from_date == "2026-07-01"
    assert intent.to_date == "2026-07-31"


def test_relative_last_month():
    intent = parse_query("issues for Yash last month", MEMBERS, TODAY)
    assert intent.from_date == "2026-06-01"
    assert intent.to_date == "2026-06-30"


def test_last_month_wraps_to_previous_year_in_january():
    intent = parse_query("issues for Yash last month", MEMBERS, date(2026, 1, 15))
    assert intent.from_date == "2025-12-01"
    assert intent.to_date == "2025-12-31"


def test_last_n_days():
    intent = parse_query("issues for Yash in the last 7 days", MEMBERS, TODAY)
    assert intent.from_date == "2026-06-29"
    assert intent.to_date == "2026-07-06"


def test_today_and_yesterday():
    today = parse_query("issues for Yash today", MEMBERS, TODAY)
    assert today.from_date == today.to_date == "2026-07-06"
    yday = parse_query("issues for Yash yesterday", MEMBERS, TODAY)
    assert yday.from_date == yday.to_date == "2026-07-05"


def test_explicit_between_dates():
    intent = parse_query(
        "issues for Yash between 2026-03-01 and 2026-03-31", MEMBERS, TODAY
    )
    assert intent.from_date == "2026-03-01"
    assert intent.to_date == "2026-03-31"


def test_since_single_date_leaves_end_open():
    intent = parse_query("issues for Yash since 2026-02-15", MEMBERS, TODAY)
    assert intent.from_date == "2026-02-15"
    assert intent.to_date is None


def test_no_date_leaves_range_open():
    intent = parse_query("issues assigned to Yash", MEMBERS, TODAY)
    assert intent.from_date is None
    assert intent.to_date is None


def test_matched_phrases_are_recorded():
    intent = parse_query("what did Shubham move to QA this week", MEMBERS, TODAY)
    assert "this week" in intent.matched_phrases
    assert any("qa" in p for p in intent.matched_phrases)
