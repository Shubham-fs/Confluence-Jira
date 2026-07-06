"""Tests for the one-step forward status transition detector."""
from app.services.report_service import DEFAULT_STATUS_ORDER, find_forward_transitions

CHANGELOG = [
    {
        "created": "2026-03-01T10:00:00.000+0000",
        "author": {"accountId": "acc-1", "displayName": "Shubham"},
        "items": [
            {"field": "status", "fromString": "To Do", "toString": "Build"},
        ],
    },
    {
        "created": "2026-03-02T12:30:00.000+0000",
        "author": {"accountId": "acc-2", "displayName": "Yash"},
        "items": [
            {"field": "status", "fromString": "Build", "toString": "Pending QA"},
        ],
    },
    {
        "created": "2026-03-03T09:00:00.000+0000",
        "author": {"accountId": "acc-1", "displayName": "Shubham"},
        "items": [
            {"field": "assignee", "fromString": "A", "toString": "B"},
        ],
    },
]


def test_detects_all_one_step_forward_transitions():
    transitions = find_forward_transitions(CHANGELOG, DEFAULT_STATUS_ORDER)
    assert len(transitions) == 2
    assert transitions[0]["from_status"] == "To Do"
    assert transitions[0]["to_status"] == "Build"
    assert transitions[0]["author_name"] == "Shubham"
    assert transitions[1]["from_status"] == "Build"
    assert transitions[1]["to_status"] == "Pending QA"
    assert transitions[1]["author_id"] == "acc-2"


def test_ignores_multi_step_forward_jumps():
    changelog = [
        {
            "created": "2026-03-04T00:00:00.000+0000",
            "author": {"accountId": "acc-1", "displayName": "Shubham"},
            "items": [
                {"field": "status", "fromString": "Build", "toString": "Done"},
            ],
        }
    ]
    assert find_forward_transitions(changelog, DEFAULT_STATUS_ORDER) == []


def test_ignores_backward_transitions():
    changelog = [
        {
            "created": "2026-03-04T00:00:00.000+0000",
            "author": {"accountId": "acc-1", "displayName": "Shubham"},
            "items": [
                {"field": "status", "fromString": "Pending QA", "toString": "Build"},
            ],
        }
    ]
    assert find_forward_transitions(changelog, DEFAULT_STATUS_ORDER) == []


def test_detects_pending_qa_to_done():
    changelog = [
        {
            "created": "2026-03-05T00:00:00.000+0000",
            "author": {"accountId": "acc-3", "displayName": "Kashish"},
            "items": [
                {"field": "status", "fromString": "Pending QA", "toString": "Done"},
            ],
        }
    ]
    out = find_forward_transitions(changelog, DEFAULT_STATUS_ORDER)
    assert len(out) == 1
    assert out[0]["from_status"] == "Pending QA"
    assert out[0]["to_status"] == "Done"


def test_empty_changelog_returns_empty():
    assert find_forward_transitions([], DEFAULT_STATUS_ORDER) == []
