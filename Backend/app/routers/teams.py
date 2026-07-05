"""Team endpoints backed by Confluence."""
from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import MembersResponse, Team, TeamsResponse
from app.routers.deps import get_team_service
from app.services.team_service import TeamService

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("", response_model=TeamsResponse)
async def list_teams(service: TeamService = Depends(get_team_service)) -> TeamsResponse:
    teams = await service.get_teams()
    return TeamsResponse(
        teams=[Team(name=name, members=members) for name, members in teams.items()]
    )


@router.get("/{team}/members", response_model=MembersResponse)
async def team_members(
    team: str, service: TeamService = Depends(get_team_service)
) -> MembersResponse:
    teams = await service.get_teams()
    if team not in teams:
        raise HTTPException(status_code=404, detail=f"Team '{team}' not found")
    return MembersResponse(team=team, members=teams[team])
