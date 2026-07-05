"""Application settings loaded from environment / .env via pydantic-settings."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly typed application configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Atlassian connection
    atlassian_site: str = ""
    atlassian_email: str = ""
    atlassian_token: str = ""

    # Defaults for the sample data set
    jira_project_key: str = "KAN"
    confluence_space_key: str = "BT"

    # Comma separated list of allowed CORS origins
    cors_origins: str = "http://localhost:5173"

    @property
    def site(self) -> str:
        """Base site URL without a trailing slash."""
        return self.atlassian_site.rstrip("/")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor used as a FastAPI dependency."""
    return Settings()
