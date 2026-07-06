"""FastAPI dependency providers for clients and services."""
from __future__ import annotations

from app.clients.atlassian import get_client
from app.clients.confluence_client import ConfluenceClient
from app.clients.groq_client import GroqClient
from app.clients.jira_client import JiraClient
from app.core.config import Settings, get_settings
from app.services.ai_query_service import AiQueryService
from app.services.report_service import ReportService
from app.services.team_service import TeamService


def get_jira_client() -> JiraClient:
    return JiraClient(get_client())


def get_confluence_client() -> ConfluenceClient:
    return ConfluenceClient(get_client())


def get_team_service() -> TeamService:
    settings: Settings = get_settings()
    return TeamService(get_confluence_client(), settings.confluence_space_key)


def get_report_service() -> ReportService:
    settings: Settings = get_settings()
    return ReportService(
        get_jira_client(),
        settings.site,
        settings.jira_project_key,
        settings.workflow_status_list,
    )


def get_groq_client() -> GroqClient:
    settings: Settings = get_settings()
    return GroqClient(
        settings.groq_api_key, settings.groq_model, settings.groq_base_url
    )


def get_ai_query_service() -> AiQueryService:
    settings: Settings = get_settings()
    return AiQueryService(
        get_report_service(),
        get_team_service(),
        get_groq_client(),
        settings.jira_project_key,
    )
