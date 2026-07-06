"""Tests for build-phase assignee reconstruction (history preservation)."""
from app.services.report_service import (
    assignee_at_transition,
    assignee_changes_from_changelog,
)

# Sequence: Kashish builds, moves ticket to Pending QA, then reassigns to
# Shubham in a SEPARATE later changelog entry.
SEPARATE_ENTRY_CHANGELOG = [
    {
        "created": "2026-03-01T09:00:00.000+0000",
        "author": {"accountId": "kashish", "displayName": "Kashish Roy"},
        "items": [
            {"field": "status", "fromString": "To Do", "toString": "Build"},
        ],
    },
    {
        "created": "2026-03-02T10:00:00.000+0000",
        "author": {"accountId": "kashish", "displayName": "Kashish Roy"},
        "items": [
            {"field": "status", "fromString": "Build", "toString": "Pending QA"},
        ],
    },
    {
        "created": "2026-03-02T10:05:00.000+0000",
        "author": {"accountId": "kashish", "displayName": "Kashish Roy"},
        "items": [
            {
                "field": "assignee",
                "from": "kashish",
                "fromString": "Kashish Roy",
                "to": "shubham",
                "toString": "Shubham",
            },
        ],
    },
]

# Sequence: the reassignment happens in the SAME entry as the status transition
# (e.g. via the transition screen).
SAME_ENTRY_CHANGELOG = [
    {
        "created": "2026-03-02T10:00:00.000+0000",
        "author": {"accountId": "kashish", "displayName": "Kashish Roy"},
        "items": [
            {"field": "status", "fromString": "Build", "toString": "Pending QA"},
            {
                "field": "assignee",
                "from": "kashish",
                "fromString": "Kashish Roy",
                "to": "shubham",
                "toString": "Shubham",
            },
        ],
    },
]

TRANSITION_AT = "2026-03-02T10:00:00.000+0000"


def test_extracts_assignee_changes_in_order():
    changes = assignee_changes_from_changelog(SEPARATE_ENTRY_CHANGELOG)
    assert len(changes) == 1
    assert changes[0]["from_id"] == "kashish"
    assert changes[0]["to_id"] == "shubham"


def test_owner_preserved_when_reassigned_in_separate_entry():
    # Current assignee is now Shubham, but Kashish owned it at the transition.
    owner_id, owner_name = assignee_at_transition(
        SEPARATE_ENTRY_CHANGELOG, TRANSITION_AT, "shubham", "Shubham"
    )
    assert owner_id == "kashish"
    assert owner_name == "Kashish Roy"


def test_owner_preserved_when_reassigned_in_same_entry():
    owner_id, owner_name = assignee_at_transition(
        SAME_ENTRY_CHANGELOG, TRANSITION_AT, "shubham", "Shubham"
    )
    assert owner_id == "kashish"
    assert owner_name == "Kashish Roy"


def test_owner_falls_back_to_current_when_never_reassigned():
    changelog = [
        {
            "created": "2026-03-02T10:00:00.000+0000",
            "author": {"accountId": "yash", "displayName": "Yash Gupta"},
            "items": [
                {"field": "status", "fromString": "Build", "toString": "Pending QA"},
            ],
        }
    ]
    owner_id, owner_name = assignee_at_transition(
        changelog, TRANSITION_AT, "yash", "Yash Gupta"
    )
    assert owner_id == "yash"
    assert owner_name == "Yash Gupta"
