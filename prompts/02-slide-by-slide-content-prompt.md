# 02 - Slide By Slide Content Prompt

Expand the Developer Activity Reporting deck into detailed slide content.

Use this current implementation:

- Frontend: React, Vite, TypeScript, Material UI, TanStack Query, axios.
- Backend: FastAPI, pydantic-settings, httpx, openpyxl.
- Integrations: Confluence Cloud, Jira Cloud, Groq Chat Completions API.
- Reports: Assigned Issues, Transitions, Advanced AI Search, Excel export.

## Required Details By Topic

### Assigned Issues

Explain that the backend resolves a member to Jira `accountId` and runs:

```jql
project = KAN AND assignee WAS "accountId" ORDER BY updated DESC
```

Clarify that this finds tickets assigned to the person at any point in time.

### Transitions

Explain that transitions are calculated from Jira changelog entries, not just current fields. Include:

- `from_status`
- `to_status`
- `transitioned_at`
- `performed_by`
- `assignee` at transition time

Mention the default workflow: `To Do, Build, Pending QA, Done`.

Mention valid one-step moves: `To Do -> Build`, `Build -> Pending QA`, `Pending QA -> Done`.

Mention that Build -> Pending QA is preserved as a filter.

### Advanced AI Search

Explain the flow:

1. User enters a prompt.
2. Backend sends a strict planning prompt to Groq.
3. Groq returns JSON with report type, members, date range, proposed JQL, explanation, and requires-changelog flag.
4. Backend enforces project scope and resolves names to account IDs.
5. Frontend displays the executed JQL.

### Backend Design

Highlight:

- routers as thin HTTP boundaries,
- services for business logic,
- clients for external APIs,
- Pydantic schemas for response validation,
- dependency injection through `deps.py`,
- controlled Groq errors.

### Frontend Design

Highlight:

- dashboard filters,
- route-backed tabs,
- `AiQueryPanel`,
- `AssignedReportView`,
- `TransitionReportView`,
- transition dropdown,
- export button,
- error/loading/empty states.

### Security

Mention:

- no secrets in frontend,
- `.env` is gitignored,
- rotate exposed tokens,
- never paste real API keys into external AI tools or slides.

Generate polished slide titles, bullet content, speaker hints, and suggested visuals for each slide.