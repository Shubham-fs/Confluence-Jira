"""Team member directory abstraction shared by report/query services."""
from __future__ import annotations

from typing import Protocol

from app.services.team_service import TeamService


class MemberDirectory(Protocol):
    async def get_members(self) -> list[str]: ...


class TeamMemberDirectory:
    """Adapt :class:`TeamService` to the member-directory abstraction."""

    def __init__(self, team_service: TeamService) -> None:
        self._team_service = team_service

    async def get_members(self) -> list[str]:
        teams = await self._team_service.get_teams()
        seen: list[str] = []
        for members in teams.values():
            for name in members:
                if name not in seen:
                    seen.append(name)
        return seen
