# 03 - Backend Deep Dive

## Entry Point

`app/main.py` creates the FastAPI app, configures CORS, registers routers, and exposes Swagger documentation at `/docs`.

## Configuration

`app/core/config.py` loads `.env` values through Pydantic settings:

- Atlassian site/email/token.
- Jira project key.
- Confluence space key.
- CORS origins.
- Groq API key/model/base URL.
- Ordered workflow statuses.

## Clients

### JiraClient

Handles:

- JQL search with pagination.
- Issue changelog retrieval.
- Current user check.
- User search with fallback to the full browsable user directory.

The fallback matters because some Jira sites return empty results from `/user/search?query=...` even when `/users/search` can list people.

### ConfluenceClient

Reads Confluence content used by `TeamService` to parse team membership.

### GroqClient

Calls Groq's OpenAI-compatible chat completions endpoint and expects a JSON object response. It raises controlled errors for missing API key, network errors, bad HTTP status, and invalid JSON.

## Services

### TeamService

Parses the Confluence Team Members table and exposes teams/members for the frontend dropdowns.

### ReportService

Owns report calculation:

- `assigned_issues()` uses `assignee WAS` JQL.
- `transitions()` searches candidate issues and scans changelog history.
- `search_custom()` executes AI-proposed JQL after project-scope enforcement and user-name resolution.
- `resolve_account_id()` maps user-facing names to Jira account IDs.

### AiQueryService

Builds a system prompt for Groq, normalizes the JSON plan, and routes execution to Assigned, Transitions, or custom JQL. It depends on abstractions for the LLM and member directory, which keeps it testable.

### Excel Service

Builds assigned and transitions workbooks with openpyxl.

## Routers

- `health.py`: health check.
- `teams.py`: Confluence team endpoints.
- `reports.py`: assigned, transitions, AI query, and export endpoints.
- `deps.py`: dependency construction for settings, clients, and services.

## Report Correctness Highlights

- `enforce_project_scope()` prevents AI-generated JQL from searching outside the configured project.
- `collect_jql_user_names()` and `rewrite_jql_user_clauses()` only rewrite quoted assignee/reporter clauses, not free-text summary searches.
- `find_forward_transitions()` only accepts adjacent forward moves in the configured workflow.
- `assignee_at_transition()` uses strict earlier assignee changes so ownership is reconstructed at the correct moment.

## Testing Focus

Backend tests cover parsing, JQL rewriting, AI orchestration, assignee history reconstruction, and transition detection.