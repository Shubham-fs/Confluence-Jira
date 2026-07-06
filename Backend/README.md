# Backend — Developer Activity Reporting API

FastAPI service that reads team membership from Confluence Cloud and issue /
workflow data from Jira Cloud, then generates developer activity reports.

It also supports deterministic natural-language queries that interpret a plain
English question and run the matching report.

## Requirements
- Python 3.11+

## Setup & run
```powershell
cd Backend
python -m venv .venv
.venv\Scripts\activate          # Windows (PowerShell)
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
copy .env.example .env          # then fill in the values
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

## Environment variables (`.env`)
| Key | Description |
|-----|-------------|
| `ATLASSIAN_SITE` | Site base URL, e.g. `https://your-site.atlassian.net` |
| `ATLASSIAN_EMAIL` | Atlassian account email |
| `ATLASSIAN_TOKEN` | Atlassian API token |
| `JIRA_PROJECT_KEY` | Jira project key (default `KAN`) |
| `CONFLUENCE_SPACE_KEY` | Confluence space key (default `BT`) |
| `CORS_ORIGINS` | Comma separated allowed origins (default Vite dev origin) |

## Endpoints
- `GET /api/health` → `{ "status": "ok" }`
- `GET /api/teams` → teams + members from Confluence
- `GET /api/teams/{team}/members` → members of a team
- `GET /api/reports/assigned?member=&from=YYYY-MM-DD&to=YYYY-MM-DD` → Report 1
- `GET /api/reports/build-to-qa?member=&from=&to=&rule=assignee|actor` → Report 2
- `GET /api/reports/query?q=what did Yash move to QA last week` → interpret a plain-English query and return the matching report
- `GET /api/reports/export?type=assigned|build-to-qa&member=&from=&to=&rule=` → `.xlsx`

## Natural-language query design
- Parsing is local and deterministic; no external AI service is required.
- Example queries:
	- `issues assigned to Yash this month`
	- `what did Shubham move to QA last week`
	- `tickets for Kashish between 2026-03-01 and 2026-03-31`
- The response includes both the parsed interpretation and the selected report.

## Where SOLID was applied
- `DefaultQueryParser` follows Single Responsibility by only converting text into a `QueryIntent`.
- `TeamMemberDirectory` isolates member retrieval from Confluence-backed services.
- `NlQueryService` depends on abstractions (`QueryParser`, `MemberDirectory`, `ReportGateway`) rather than concrete implementations, which improves testability and follows Dependency Inversion.
- Small detector classes (`PhraseReportTypeDetector`, `PhraseRuleDetector`, `KnownMemberDetector`, `RelativeDateRangeDetector`) keep the parser open for extension without rewriting orchestration code.

## Tests
```powershell
pytest
```
Covers the Confluence table parser, the Build → Pending QA detector, the
natural-language query parser, and the injected-collaborator NLQ service flow.
