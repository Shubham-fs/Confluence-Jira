"""Team membership service: parse the Confluence "Team Members" table."""
from __future__ import annotations

from bs4 import BeautifulSoup

from app.clients.confluence_client import ConfluenceClient

TEAM_PAGE_TITLE = "Team Members"


def parse_team_table(storage_html: str) -> dict[str, list[str]]:
    """Parse a Confluence storage-format table into a ``{team: [members]}`` map.

    The expected table has two columns (Team | Members). Each members cell may
    contain a comma separated list of names which are split and trimmed. The
    header row (``Team``/``Members``) is skipped.
    """
    soup = BeautifulSoup(storage_html or "", "lxml")
    table = soup.find("table")
    if table is None:
        return {}

    teams: dict[str, list[str]] = {}
    for row in table.find_all("tr"):
        cells = row.find_all(["td", "th"])
        if len(cells) < 2:
            continue
        team = cells[0].get_text(strip=True)
        members_raw = cells[1].get_text(separator=",", strip=True)
        if not team or team.lower() == "team":
            # Skip empty rows and the header row.
            continue
        members = [m.strip() for m in members_raw.split(",") if m.strip()]
        if members:
            teams[team] = members
    return teams


class TeamService:
    """Reads team membership from the Confluence space configured in settings."""

    def __init__(self, confluence: ConfluenceClient, space_key: str) -> None:
        self._confluence = confluence
        self._space_key = space_key

    async def get_teams(self) -> dict[str, list[str]]:
        """Return the ``{team: [members]}`` map from the Team Members page."""
        space_id = await self._confluence.get_space_id(self._space_key)
        if not space_id:
            return {}
        pages = await self._confluence.list_pages(space_id)
        page = next(
            (p for p in pages if p.get("title") == TEAM_PAGE_TITLE),
            None,
        )
        if page is None:
            return {}
        body = await self._confluence.get_page_body(str(page["id"]))
        return parse_team_table(body)
