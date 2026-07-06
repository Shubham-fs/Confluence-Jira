"""Thin async client for the Groq Chat Completions API (OpenAI-compatible)."""
from __future__ import annotations

import json
from typing import Any

import httpx


class GroqError(RuntimeError):
    """Raised when the Groq API call fails or returns an unusable response."""


class GroqClient:
    """Minimal async wrapper around Groq's ``/chat/completions`` endpoint.

    Uses ``response_format=json_object`` so the model is constrained to emit a
    single JSON object, which the caller can parse deterministically.
    """

    def __init__(self, api_key: str, model: str, base_url: str) -> None:
        self._api_key = api_key
        self._model = model
        self._base_url = base_url.rstrip("/")

    async def complete_json(
        self, system_prompt: str, user_prompt: str
    ) -> dict[str, Any]:
        """Send a system+user prompt and return the parsed JSON object."""
        if not self._api_key:
            raise GroqError("GROQ_API_KEY is not configured.")

        payload = {
            "model": self._model,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(
                base_url=self._base_url, timeout=30.0
            ) as client:
                resp = await client.post(
                    "/chat/completions", json=payload, headers=headers
                )
        except httpx.HTTPError as exc:  # network / timeout
            raise GroqError(f"Could not reach Groq: {exc}") from exc

        if not resp.is_success:
            detail = resp.text
            try:
                body = resp.json()
                detail = body.get("error", {}).get("message") or detail
            except Exception:  # noqa: BLE001 - body may not be JSON
                pass
            raise GroqError(f"Groq request failed ({resp.status_code}): {detail}")

        try:
            content = resp.json()["choices"][0]["message"]["content"]
        except (KeyError, IndexError, ValueError) as exc:
            raise GroqError("Groq returned an unexpected response shape.") from exc

        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            raise GroqError("Groq did not return valid JSON.") from exc
