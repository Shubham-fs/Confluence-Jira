"""Report endpoints (assigned issues, forward transitions, Excel export)."""
from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.clients.groq_client import GroqError
from app.models.schemas import (
    AiQueryResponse,
    AssignedReport,
    TransitionReport,
)
from app.routers.deps import (
    get_ai_query_service,
    get_report_service,
)
from app.services import excel_service
from app.services.ai_query_service import AiQueryService
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _safe_filename_part(value: str) -> str:
    """Reduce a user-supplied value to a filesystem/header-safe token."""
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("_")
    return cleaned or "report"

_XLSX_MEDIA = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.get("/assigned", response_model=AssignedReport)
async def assigned(
    member: str = Query(..., description="Name, email or accountId"),
    from_: str | None = Query(None, alias="from", description="YYYY-MM-DD"),
    to: str | None = Query(None, description="YYYY-MM-DD"),
    service: ReportService = Depends(get_report_service),
) -> AssignedReport:
    data = await service.assigned_issues(member, from_, to)
    return AssignedReport.model_validate(data)


@router.get("/transitions", response_model=TransitionReport)
async def transitions(
    member: str = Query(..., description="Name, email or accountId"),
    from_: str | None = Query(None, alias="from", description="YYYY-MM-DD"),
    to: str | None = Query(None, description="YYYY-MM-DD"),
    rule: str = Query("assignee", pattern="^(assignee|actor)$"),
    transition: str | None = Query(
        None, description="Narrow to a single forward step by destination status"
    ),
    service: ReportService = Depends(get_report_service),
) -> TransitionReport:
    data = await service.transitions(member, from_, to, rule, transition)
    return TransitionReport.model_validate(data)


@router.get("/ai-query", response_model=AiQueryResponse)
async def ai_query(
    q: str = Query(..., description="Advanced free-form prompt (planned via Groq LLM)"),
    service: AiQueryService = Depends(get_ai_query_service),
) -> AiQueryResponse:
    try:
        data = await service.run(q)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except GroqError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return AiQueryResponse.model_validate(data)


@router.get("/export")
async def export(
    type: str = Query(..., pattern="^(assigned|transitions)$"),
    member: str = Query(...),
    from_: str | None = Query(None, alias="from"),
    to: str | None = Query(None),
    rule: str = Query("assignee", pattern="^(assignee|actor)$"),
    transition: str | None = Query(None),
    service: ReportService = Depends(get_report_service),
) -> Response:
    safe_member = _safe_filename_part(member)
    safe_from = _safe_filename_part(from_ or "all")
    safe_to = _safe_filename_part(to or "all")
    if type == "assigned":
        data = await service.assigned_issues(member, from_, to)
        content = excel_service.build_assigned_workbook(data)
        filename = f"assigned_{safe_member}_{safe_from}_{safe_to}.xlsx"
    else:
        data = await service.transitions(member, from_, to, rule, transition)
        content = excel_service.build_transitions_workbook(data)
        filename = f"transitions_{safe_member}_{safe_from}_{safe_to}.xlsx"

    return Response(
        content=content,
        media_type=_XLSX_MEDIA,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
