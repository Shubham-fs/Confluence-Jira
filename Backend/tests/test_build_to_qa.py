"""Tests for the Build -> Pending QA changelog detector."""
from app.services.report_service import find_build_to_qa_transitions

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


def test_detects_build_to_pending_qa_transition():
    transitions = find_build_to_qa_transitions(CHANGELOG)
    assert len(transitions) == 1
    tr = transitions[0]
    assert tr["author_name"] == "Yash"
    assert tr["author_id"] == "acc-2"
    assert tr["created"] == "2026-03-02T12:30:00.000+0000"


def test_ignores_non_status_and_other_status_changes():
    changelog = [
        {
            "created": "2026-03-04T00:00:00.000+0000",
            "author": {"accountId": "acc-1", "displayName": "Shubham"},
            "items": [
                {"field": "status", "fromString": "Build", "toString": "Done"},
            ],
        }
    ]
    assert find_build_to_qa_transitions(changelog) == []


def test_empty_changelog_returns_empty():
    assert find_build_to_qa_transitions([]) == []
