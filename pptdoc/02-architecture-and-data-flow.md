# 02 - Architecture And Data Flow

## High-Level Architecture

```text
React/Vite Frontend
  -> FastAPI Backend
    -> Confluence Cloud API
    -> Jira Cloud API
    -> Groq Chat Completions API
```

The frontend never talks directly to Atlassian or Groq. Secrets stay in the backend `.env` file.

## Backend Layers

- `routers/`: HTTP routes and request validation.
- `services/`: business logic for teams, reports, AI query planning, and exports.
- `clients/`: wrappers for Atlassian REST and Groq REST APIs.
- `models/`: Pydantic response schemas.
- `core/`: config and auth helpers.

## Flow 1: Load Teams

1. Frontend calls `GET /api/teams`.
2. Backend reads the configured Confluence space/page.
3. `TeamService` parses the team-member table.
4. Frontend populates Team and Member dropdowns.

## Flow 2: Assigned Issues

1. User selects member/date filters and clicks Generate.
2. Frontend calls `/api/reports/assigned`.
3. Backend resolves the member name to Jira `accountId`.
4. Backend runs project-scoped JQL with `assignee WAS`.
5. Jira returns issues that person was assigned to historically.
6. Frontend renders the table.

## Flow 3: Transitions

1. Frontend calls `/api/reports/transitions` with `member`, optional dates, `rule`, and optional `transition`.
2. Backend gets candidate issues with project-bounded JQL.
3. Backend fetches each issue changelog.
4. `find_forward_transitions()` keeps only one-step forward status moves.
5. `assignee_at_transition()` reconstructs who was assigned at the transition timestamp.
6. `rule=assignee` matches by owner at the time; `rule=actor` matches by transition author.

## Flow 4: Advanced AI Search

1. User types a free-form prompt in Advanced AI Search.
2. Frontend calls `GET /api/reports/ai-query?q=...`.
3. `AiQueryService` sends a strict JSON-planning prompt to Groq.
4. Backend normalizes the plan.
5. If custom JQL is needed, backend enforces `project = KAN` and resolves user names to account IDs.
6. Backend executes the final JQL or delegates to structured report logic.
7. Frontend displays explanation, requires-changelog flag, executed JQL, and results.

## Flow 5: Excel Export

1. Frontend calls `/api/reports/export` with the same report filters.
2. Backend regenerates report data.
3. `excel_service.py` builds an `.xlsx` workbook.
4. Browser downloads the file.

## Important Design Decisions

- JQL is always project-scoped before execution.
- User-friendly names are resolved to account IDs.
- Jira history is not copied into the app; it is fetched live.
- Build -> Pending QA is a filter under the general Transitions report.
- AI output is transparent because the executed JQL is displayed.