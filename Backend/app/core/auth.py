"""Helpers for building the Atlassian HTTP Basic auth header."""
import base64

from app.core.config import Settings


def basic_auth_header(settings: Settings) -> str:
    """Return an ``Authorization: Basic base64(email:token)`` header value."""
    raw = f"{settings.atlassian_email}:{settings.atlassian_token}".encode("utf-8")
    encoded = base64.b64encode(raw).decode("ascii")
    return f"Basic {encoded}"
