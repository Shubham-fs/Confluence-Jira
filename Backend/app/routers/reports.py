"""Report endpoints (assigned issues, Build -> Pending QA, Excel export)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.models.schemas import AssignedReport, BuildToQaReport, NlQueryResponse
from app.routers.deps import get_nlq_service, get_report_service
from app.services import excel_service
from app.services.nlq_service import NlQueryService
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["reports"])

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


@router.get("/build-to-qa", response_model=BuildToQaReport)
async def build_to_qa(
    member: str = Query(..., description="Name, email or accountId"),
    from_: str | None = Query(None, alias="from", description="YYYY-MM-DD"),
    to: str | None = Query(None, description="YYYY-MM-DD"),
    rule: str = Query("assignee", pattern="^(assignee|actor)$"),
    service: ReportService = Depends(get_report_service),
) -> BuildToQaReport:
    data = await service.build_to_qa(member, from_, to, rule)
    return BuildToQaReport.model_validate(data)


@router.get("/query", response_model=NlQueryResponse)
async def query(
    q: str = Query(..., description="Natural-language question about developer activity"),
    service: NlQueryService = Depends(get_nlq_service),
) -> NlQueryResponse:
    try:
        data = await service.run(q)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return NlQueryResponse.model_validate(data)


@router.get("/export")
async def export(
    type: str = Query(..., pattern="^(assigned|build-to-qa)$"),
    member: str = Query(...),
    from_: str | None = Query(None, alias="from"),
    to: str | None = Query(None),
    rule: str = Query("assignee", pattern="^(assignee|actor)$"),
    service: ReportService = Depends(get_report_service),
) -> Response:
    if type == "assigned":
        data = await service.assigned_issues(member, from_, to)
        content = excel_service.build_assigned_workbook(data)
        filename = f"assigned_{member}_{from_ or 'all'}_{to or 'all'}.xlsx"
    else:
        data = await service.build_to_qa(member, from_, to, rule)
        content = excel_service.build_build_to_qa_workbook(data)
        filename = f"build_to_qa_{member}_{from_ or 'all'}_{to or 'all'}.xlsx"

    return Response(
        content=content,
        media_type=_XLSX_MEDIA,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
