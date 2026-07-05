"""FastAPI application entry point: lifespan, CORS, routers, error handling."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.clients.atlassian import AtlassianError, build_client, set_client
from app.core.config import get_settings
from app.routers import health, reports, teams


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    client = build_client(settings)
    set_client(client)
    try:
        yield
    finally:
        await client.aclose()
        set_client(None)


app = FastAPI(
    title="Developer Activity Reporting API",
    version="1.0.0",
    description="Reads teams from Confluence and issues/workflow data from Jira.",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _error(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
    )


@app.exception_handler(AtlassianError)
async def atlassian_error_handler(_: Request, exc: AtlassianError) -> JSONResponse:
    code = "atlassian_error"
    message = exc.message
    if exc.status_code == 400 and "unbounded" in message.lower():
        code = "unbounded_jql"
        message = (
            "Unbounded JQL is not allowed. The query must be restricted "
            "(e.g. by project and date range)."
        )
    elif exc.status_code in (401, 403):
        code = "atlassian_auth"
    elif exc.status_code == 404:
        code = "not_found"
    return _error(exc.status_code, code, message)


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    return _error(exc.status_code, "http_error", str(exc.detail))


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    return _error(422, "validation_error", str(exc.errors()))


@app.exception_handler(Exception)
async def unhandled_error_handler(_: Request, exc: Exception) -> JSONResponse:
    return _error(500, "internal_error", "An unexpected error occurred.")


app.include_router(health.router)
app.include_router(teams.router)
app.include_router(reports.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": "Developer Activity Reporting API", "docs": "/docs"}
