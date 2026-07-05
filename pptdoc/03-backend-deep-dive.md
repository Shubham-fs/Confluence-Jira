# 03 - Backend Deep Dive

## Backend Purpose

The backend is the brain of the project. It protects credentials, communicates with Atlassian APIs, converts raw API responses into useful report data, and returns clean JSON or Excel files to the frontend.

## Backend Stack

- FastAPI: creates HTTP APIs.
- Uvicorn: runs the FastAPI server.
- httpx: makes async HTTP requests to Jira and Confluence.
- Pydantic v2: validates response models.
- pydantic-settings: reads `.env` configuration.
- BeautifulSoup and lxml: parse Confluence table HTML.
- openpyxl: generate Excel workbooks.
- pytest and pytest-asyncio: testing.

## Backend Entry Point

The main entry point is `Backend/app/main.py`.

Responsibilities:

- Create the FastAPI app.
- Load settings.
- Create the shared Atlassian HTTP client during lifespan startup.
- Close the HTTP client during shutdown.
- Configure CORS.
- Register routers.
- Register error handlers.

## Lifespan Client

FastAPI lifespan creates one reusable async HTTP client instead of creating a new client for every request. This improves performance because connection pooling can be reused.

Conceptually:

```text
App starts
  -> load settings
  -> create httpx AsyncClient
  -> store it globally for dependencies
Requests happen
  -> services reuse the same client
App stops
  -> close client
```

## Configuration

Configuration is handled in `Backend/app/core/config.py`.

Important settings:

- `ATLASSIAN_SITE`: base Atlassian site URL.
- `ATLASSIAN_EMAIL`: email used for Atlassian API authentication.
- `ATLASSIAN_TOKEN`: API token.
- `JIRA_PROJECT_KEY`: Jira project key, default `KAN`.
- `CONFLUENCE_SPACE_KEY`: Confluence space key, default `BT`.
- `CORS_ORIGINS`: allowed frontend origins.

Real values live in `Backend/.env`. The `.env` file must stay local and should not be pushed to GitHub.

## Routers

Routers define public backend API endpoints.

### Health Router

Endpoint:

```text
GET /api/health
```

Purpose:

- Confirms backend is running.
- Useful for quick debugging.

### Teams Router

Endpoints:

```text
GET /api/teams
GET /api/teams/{team}/members
```

Purpose:

- Return teams parsed from Confluence.
- Return members for one selected team.

### Reports Router

Endpoints:

```text
GET /api/reports/assigned
GET /api/reports/build-to-qa
GET /api/reports/export
```

Purpose:

- Generate assigned issue report.
- Generate Build to Pending QA report.
- Export either report as Excel.

## Dependency Injection

FastAPI dependencies connect routers to services. Instead of creating service objects manually inside every endpoint, dependencies provide configured service instances.

Example idea:

```text
reports router -> get_report_service -> ReportService -> JiraClient
teams router -> get_team_service -> TeamService -> ConfluenceClient
```

This makes testing and maintenance easier.

## Jira Client

File: `Backend/app/clients/jira_client.py`

Responsibilities:

- Verify user with `/rest/api/3/myself`.
- Search issues using `/rest/api/3/search/jql`.
- Fetch issue changelog using `/rest/api/3/issue/{key}/changelog`.
- Search Jira users using `/rest/api/3/user/search`.

The Jira client is intentionally thin. It does not contain report business logic. It only knows how to call Jira and return data.

## Confluence Client

File: `Backend/app/clients/confluence_client.py`

Responsibilities:

- Resolve a space key to a space ID.
- List pages in that space.
- Download a page body in storage format.

The Confluence client also stays thin. It does not decide what a team is. It only fetches Confluence data.

## Team Service

File: `Backend/app/services/team_service.py`

Responsibilities:

1. Use Confluence space key from settings.
2. Find the page titled `Team Members`.
3. Download its storage-format body.
4. Parse the first table.
5. Return a map like:

```json
{
  "Team A": ["Kashish", "Arpita"],
  "Team B": ["Shubham", "Yash", "Ankit"]
}
```

## Confluence Table Format

The parser expects a table like:

| Team | Members |
|---|---|
| Team A | Kashish, Arpita |
| Team B | Shubham, Yash, Ankit |

Members are separated by commas. The parser trims spaces and ignores empty values.

## Report Service

File: `Backend/app/services/report_service.py`

This is the most important business logic file.

Major responsibilities:

- Resolve a human name to Jira account ID.
- Generate assigned issue report.
- Generate Build to Pending QA transition report.
- Detect Build to Pending QA transitions from changelog entries.
- Filter by date.
- Return frontend-friendly JSON.

## Account ID Resolution

Jira Cloud does not reliably use plain names for issue assignment. It uses `accountId`. Therefore, when the frontend sends `Shubham` or `Kashish`, the backend searches Jira users and resolves the best matching account ID.

Resolution order:

1. Exact account ID match.
2. Exact display name/email match.
3. Display name starts with the term.
4. Display name contains the term.
5. First returned user.

This helps when Confluence says `Kashish` but Jira display name is `Kashish Roy`.

## Assigned Issues Logic

The backend builds a JQL query:

```text
project = KAN AND assignee = "ACCOUNT_ID" ORDER BY updated DESC
```

If dates are provided, it adds:

```text
updated >= "YYYY-MM-DD"
updated <= "YYYY-MM-DD"
```

Then it returns issue key, summary, status, assignee, reporter, created date, updated date, and URL.

## Build to Pending QA Logic

The backend searches candidate project issues, fetches changelog for each issue, and looks for status changes:

```text
field == "status"
fromString == "Build"
toString == "Pending QA"
```

For every matching changelog entry, it records:

- transition timestamp
- transition author name
- transition author account ID

Then it applies rule filtering.

## Assignee Rule

Rule `assignee` means:

> Include this transition if the issue is currently assigned to the selected member.

This answers: whose work reached Pending QA?

## Actor Rule

Rule `actor` means:

> Include this transition if the selected member performed the status change.

This answers: who moved work to Pending QA?

## Date Filtering

Date filtering happens in two places:

- Candidate Jira search may be restricted by issue updated date.
- Build to Pending QA transitions are also checked by transition timestamp.

If from/to dates are missing, they are treated as open boundaries.

## Excel Service

File: `Backend/app/services/excel_service.py`

Purpose:

- Convert report JSON into Excel workbook bytes.
- Add headers.
- Add rows.
- Return `.xlsx` content to browser.

The router returns the file with media type:

```text
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

## Error Handling

`main.py` centralizes error handling.

Important cases:

- Atlassian authentication failure returns `atlassian_auth`.
- Atlassian 404 returns `not_found`.
- Validation errors return `validation_error`.
- Unexpected server errors return `internal_error`.
- Unbounded JQL errors are converted into clearer messages.

This gives the frontend consistent error shapes:

```json
{
  "error": {
    "code": "atlassian_auth",
    "message": "..."
  }
}
```

## Backend Security

The backend protects secrets by keeping them in `.env`. The frontend never receives the Atlassian token. The `.gitignore` excludes `.env`, and `.env.example` shows only variable names without real secret values.

## Backend Testing

Tests cover:

- Confluence table parsing.
- Build to Pending QA changelog detection.

Testing is important because these are core data transformation rules.

## Backend Summary

The backend receives clean frontend requests, securely talks to Jira and Confluence, performs the important business logic, and returns report data or Excel files. It is the integration and processing layer of the project.
