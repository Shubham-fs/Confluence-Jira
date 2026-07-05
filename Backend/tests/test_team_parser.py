"""Tests for the Confluence Team Members table parser."""
from app.services.team_service import parse_team_table

SAMPLE_TABLE = """
<table>
  <tbody>
    <tr><th>Team</th><th>Members</th></tr>
    <tr><td>Team A</td><td>Kashish, Arpita</td></tr>
    <tr><td>Team B</td><td>Shubham, Yash</td></tr>
  </tbody>
</table>
"""


def test_parse_team_table_extracts_teams_and_members():
    result = parse_team_table(SAMPLE_TABLE)
    assert result == {
        "Team A": ["Kashish", "Arpita"],
        "Team B": ["Shubham", "Yash"],
    }


def test_parse_team_table_skips_header_row():
    result = parse_team_table(SAMPLE_TABLE)
    assert "Team" not in result


def test_parse_team_table_handles_empty_body():
    assert parse_team_table("") == {}
    assert parse_team_table("<p>no table here</p>") == {}


def test_parse_team_table_trims_whitespace():
    html = (
        "<table><tr><th>Team</th><th>Members</th></tr>"
        "<tr><td> Team C </td><td>  Alice ,  Bob  </td></tr></table>"
    )
    assert parse_team_table(html) == {"Team C": ["Alice", "Bob"]}
