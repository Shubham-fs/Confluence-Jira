"""Shared async httpx client factory + typed error for Atlassian calls."""
from __future__ import annotations

import httpx

from app.core.auth import basic_auth_header
from app.core.config import Settings


class AtlassianError(Exception):
    """Raised when an Atlassian REST call fails.

    Carries the upstream status code and a human readable message so the
    API layer can translate it into a structured error response.
    """

    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message


# A single reused client instance (created on startup, closed on shutdown).
_client: httpx.AsyncClient | None = None


def build_client(settings: Settings) -> httpx.AsyncClient:
    """Create a configured ``httpx.AsyncClient`` for the Atlassian site."""
    transport = httpx.AsyncHTTPTransport(retries=2)
    return httpx.AsyncClient(
        base_url=settings.site,
        headers={
            "Authorization": basic_auth_header(settings),
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        timeout=httpx.Timeout(30.0, connect=10.0),
        transport=transport,
    )


def set_client(client: httpx.AsyncClient | None) -> None:
    global _client
    _client = client


def get_client() -> httpx.AsyncClient:
    """Return the shared client (raises if the app did not initialise it)."""
    if _client is None:
        raise RuntimeError("Atlassian client has not been initialised")
    return _client
