"""Thin async wrapper around the Jira Cloud REST v3 API."""
from __future__ import annotations

from typing import Any

import httpx

from app.clients.atlassian import AtlassianError


def _raise_for_status(response: httpx.Response) -> None:
    if response.is_success:
        return
    message = f"Jira request failed ({response.status_code})"
    try:
        payload = response.json()
        # Jira returns errorMessages / errors on failures.
        errors = payload.get("errorMessages") or []
        if errors:
            message = "; ".join(errors)
        elif payload.get("errors"):
            message = "; ".join(f"{k}: {v}" for k, v in payload["errors"].items())
        elif payload.get("message"):
            message = payload["message"]
    except Exception:  # noqa: BLE001 - body may not be JSON
        message = response.text or message
    raise AtlassianError(response.status_code, message)


class JiraClient:
    """Async client covering the endpoints this app needs."""

    def __init__(self, client: httpx.AsyncClient) -> None:
        self._client = client

    async def myself(self) -> dict[str, Any]:
        """Verify authentication and return the current user."""
        resp = await self._client.get("/rest/api/3/myself")
        _raise_for_status(resp)
        return resp.json()

    async def search_jql(
        self,
        jql: str,
        fields: list[str] | None = None,
        max_results: int = 100,
    ) -> list[dict[str, Any]]:
        """Search issues via ``POST /rest/api/3/search/jql``.

        The endpoint rejects unbounded JQL with HTTP 400, so callers must
        always supply a bounded query (e.g. ``project = KAN AND ...``).
        """
        body: dict[str, Any] = {
            "jql": jql,
            "maxResults": max_results,
            "fields": fields
            or ["summary", "status", "assignee", "created", "updated", "reporter"],
        }
        issues: list[dict[str, Any]] = []
        next_token: str | None = None
        # Paginate using the token based cursor the endpoint returns.
        while True:
            if next_token:
                body["nextPageToken"] = next_token
            resp = await self._client.post("/rest/api/3/search/jql", json=body)
            _raise_for_status(resp)
            data = resp.json()
            issues.extend(data.get("issues", []))
            next_token = data.get("nextPageToken")
            if not next_token or data.get("isLast", True):
                break
            if len(issues) >= max_results:
                break
        return issues

    async def issue_changelog(self, issue_key: str) -> list[dict[str, Any]]:
        """Return all changelog entries for an issue (following pagination)."""
        values: list[dict[str, Any]] = []
        start_at = 0
        page_size = 100
        while True:
            resp = await self._client.get(
                f"/rest/api/3/issue/{issue_key}/changelog",
                params={"startAt": start_at, "maxResults": page_size},
            )
            _raise_for_status(resp)
            data = resp.json()
            values.extend(data.get("values", []))
            total = data.get("total", 0)
            start_at += page_size
            if start_at >= total or not data.get("values"):
                break
        return values

    async def user_search(self, query: str) -> list[dict[str, Any]]:
        """Resolve users by name or email via ``/rest/api/3/user/search``."""
        resp = await self._client.get(
            "/rest/api/3/user/search", params={"query": query}
        )
        _raise_for_status(resp)
        return resp.json()
