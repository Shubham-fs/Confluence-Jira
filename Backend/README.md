# Backend — Developer Activity Reporting API

FastAPI service that integrates Confluence Cloud, Jira Cloud, and Groq to generate developer activity reports.

The backend is responsible for loading teams and members from Confluence, resolving human names to Jira account IDs, running project-scoped JQL, reconstructing workflow history from Jira changelogs, planning advanced prompts through Groq, and exporting report data to Excel.

## Requirements

- Python 3.11+

## Setup And Run

```powershell
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

## Environment Variables

| Key | Description |
| --- | --- |
| `ATLASSIAN_SITE` | Jira/Confluence Cloud site base URL, for example `https://your-site.atlassian.net` |
| `ATLASSIAN_EMAIL` | Atlassian account email used with the API token |
| `ATLASSIAN_TOKEN` | Atlassian API token |
| `JIRA_PROJECT_KEY` | Jira project key, default `KAN` |
| `CONFLUENCE_SPACE_KEY` | Confluence space key, default `BT` |
| `CORS_ORIGINS` | Comma-separated frontend origins, default Vite origins |
| `GROQ_API_KEY` | Groq API key for Advanced AI Search |
| `GROQ_MODEL` | Groq model, default `llama-3.3-70b-versatile` |
| `GROQ_BASE_URL` | OpenAI-compatible Groq base URL |
| `WORKFLOW_STATUSES` | Ordered workflow statuses used for one-step transition detection, e.g. `To Do,Build,Pending QA,Done` |

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Health check |
| `GET /api/teams` | Teams and members parsed from Confluence |
| `GET /api/teams/{team}/members` | Members for one Confluence team |
| `GET /api/reports/assigned?member=&from=&to=` | Issues ever assigned to a member, using Jira history |
| `GET /api/reports/transitions?member=&from=&to=&rule=&transition=` | One-step forward status transitions from Jira changelog |
| `GET /api/reports/ai-query?q=` | Groq-planned advanced search with visible executed JQL |
| `GET /api/reports/export?type=assigned|transitions&member=&from=&to=&rule=&transition=` | Excel export |

## Report Logic

### Assigned Issues

`ReportService.assigned_issues()` resolves `member` to an Atlassian `accountId`, then runs JQL using Jira's history operator:

```jql
project = KAN AND assignee WAS "712020:..." ORDER BY updated DESC
```

This returns issues the person was assigned to at any time, including tickets later reassigned to someone else. The row's `assignee` field shows the current assignee.

### Transitions

`ReportService.transitions()` uses a two-stage approach:

1. Search candidate issues with bounded project JQL.
2. Fetch each issue changelog and scan status field changes.

`find_forward_transitions()` only keeps one-step forward moves in `WORKFLOW_STATUSES`. With the default workflow, valid moves are `To Do -> Build`, `Build -> Pending QA`, and `Pending QA -> Done`. Backward moves and jumps such as `To Do -> Pending QA` are ignored.

The report supports two matching rules:

- `rule=assignee`: selected member was assigned at the transition timestamp.
- `rule=actor`: selected member performed the transition.

The optional `transition` query parameter filters by destination status. For example, `transition=Pending QA` preserves the original Build -> Pending QA view inside the broader transitions report.

### Assignee At Transition Time

`assignee_at_transition()` replays assignee changes from the changelog and uses the latest assignee change before the transition timestamp. This prevents a reassignment immediately after a status move from hiding who owned the ticket during the move.

### Advanced AI Search

`AiQueryService` sends the user's prompt to Groq through `GroqClient.complete_json()`. The model must return JSON containing `report_type`, `members`, `from`, `to`, `requires_changelog`, `proposed_jql`, and `explanation`.

Before executing custom JQL, the backend forces the query into `JIRA_PROJECT_KEY`, resolves quoted assignee/reporter names to account IDs, and returns the exact executed JQL to the frontend.

## Jira User Resolution

Jira Cloud user JQL is safest with account IDs. `JiraClient.user_search()` first calls `/rest/api/3/user/search?query=...`. Some sites return no matches due to user visibility settings, so the client falls back to `/rest/api/3/users/search` and filters the browsable directory locally. `ReportService.resolve_account_id()` then selects the best exact, prefix, or contains match.

## Confluence Integration

`TeamService` reads a configured Confluence page, parses the team table, and exposes teams/members through the `/api/teams` routes. The frontend dropdowns depend on this data.

## Excel Export

`excel_service.py` builds workbooks for assigned and transitions reports. The backend regenerates report data on export, so exported rows match the current filters. Filenames sanitize user-controlled values before writing the `Content-Disposition` header.

## Design Notes

- Routers are thin and delegate to services.
- `ReportService` owns Jira report logic.
- `AiQueryService` owns LLM planning and delegates execution.
- `GroqClient` isolates Groq API calls.
- `MemberDirectory` keeps AI planning independent from the concrete team service.
- `JiraClient` and `ConfluenceClient` isolate Atlassian REST calls.

## Tests

```powershell
cd Backend
.\.venv\Scripts\python.exe -m pytest -q
```

Coverage includes Confluence team parsing, forward-transition detection, assignee-at-transition reconstruction, JQL project-scope enforcement, JQL user-name collection/rewrite, and AI query orchestration with fake LLMs.

## Security

- Do not commit `.env`.
- Rotate any exposed Atlassian or Groq keys.
- Do not paste real credentials into prompts, slide docs, or screenshots.