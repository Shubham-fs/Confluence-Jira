"""Thin async wrapper around the Confluence Cloud REST v2 API."""
from __future__ import annotations

from typing import Any

import httpx

from app.clients.atlassian import AtlassianError


def _raise_for_status(response: httpx.Response) -> None:
    if response.is_success:
        return
    message = f"Confluence request failed ({response.status_code})"
    try:
        payload = response.json()
        errors = payload.get("errors")
        if errors and isinstance(errors, list):
            message = "; ".join(e.get("title", str(e)) for e in errors)
        elif payload.get("message"):
            message = payload["message"]
    except Exception:  # noqa: BLE001 - body may not be JSON
        message = response.text or message
    raise AtlassianError(response.status_code, message)


class ConfluenceClient:
    """Async client covering the space/page endpoints this app needs."""

    def __init__(self, client: httpx.AsyncClient) -> None:
        self._client = client

    async def get_space_id(self, space_key: str) -> str | None:
        """Resolve a space key to its numeric id."""
        resp = await self._client.get(
            "/wiki/api/v2/spaces", params={"keys": space_key}
        )
        _raise_for_status(resp)
        results = resp.json().get("results", [])
        return str(results[0]["id"]) if results else None

    async def list_pages(self, space_id: str, limit: int = 50) -> list[dict[str, Any]]:
        """List pages within a space."""
        resp = await self._client.get(
            f"/wiki/api/v2/spaces/{space_id}/pages", params={"limit": limit}
        )
        _raise_for_status(resp)
        return resp.json().get("results", [])

    async def get_page_body(self, page_id: str) -> str:
        """Return the raw Confluence 'storage' (XHTML) body of a page."""
        resp = await self._client.get(
            f"/wiki/api/v2/pages/{page_id}", params={"body-format": "storage"}
        )
        _raise_for_status(resp)
        data = resp.json()
        return data.get("body", {}).get("storage", {}).get("value", "")
