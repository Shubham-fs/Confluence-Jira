# Project Technical Walkthrough

This document explains how the Developer Activity Reporting project works in practical technical terms. It is written so you can read it once, understand the architecture, and confidently explain the project to a manager or reviewer without sounding vague.

## 1. What This Project Does

This is a full-stack reporting application for developer activity in Jira Cloud.

The application connects to:

- Confluence Cloud, to read team/member information from a configured page.
- Jira Cloud, to read issues, assignees, workflow statuses, and changelog history.
- Groq, to support natural-language search by converting user prompts into Jira JQL.

The main goal is to generate reports such as:

- Which issues were ever assigned to a developer.
- Which issues moved forward in the workflow while a developer owned them.
- Who performed workflow transitions.
- Team-level analytics such as issue counts, bottlenecks, workload balance, and cycle time.
- Excel exports of report data.

The system does not store Jira data in a database. It reads live data from Jira and Confluence when the user generates a report.

## 2. High-Level Architecture

The project has two main applications:

- Backend: FastAPI service in `Backend/`.
- Frontend: React + Vite + TypeScript app in `Frontend/`.

The backend exposes REST APIs. The frontend calls those APIs and renders the dashboard.

```text
Browser
  |
  | React UI, Axios, React Query
  v
Frontend Vite app
  |
  | HTTP requests to /api/...
  v
FastAPI Backend
  |
  | Service layer
  v
Jira Cloud / Confluence Cloud / Groq
```

In runtime terms:

- Frontend runs at `http://127.0.0.1:5173/`.
- Backend runs at `http://127.0.0.1:8000/`.
- Frontend API base URL defaults to `http://localhost:8000` unless `VITE_API_BASE_URL` is set.

## 3. Folder Structure That Matters

```text
Confluence-Jira/
  Backend/
    app/
      main.py                 FastAPI app setup, CORS, routers, error handlers
      core/config.py          Environment-based settings
      routers/                API route definitions
      clients/                Thin clients for Jira, Confluence, Groq
      services/               Business logic for teams, reports, AI query, Excel
      models/schemas.py       Pydantic response models
    tests/                    Backend unit tests

  Frontend/
    src/
      App.tsx                 App shell, routes, theme provider
      api/                    Axios client and typed API functions
      hooks/                  React Query hooks
      pages/                  Main pages
      components/             Reusable UI and report views
      theme/                  Material UI theme configuration

  pptdoc/                     Presentation-oriented project notes
  prompts/                    Prompt files for slide/script/Q&A generation
```

## 4. Backend Architecture

The backend follows a layered structure.

```text
FastAPI route
  -> dependency provider
  -> service class
  -> external API client
  -> Jira / Confluence / Groq
```

### 4.1 Application Entry Point

The backend starts from `Backend/app/main.py`.

Responsibilities:

- Creates the FastAPI app.
- Loads settings from `.env`.
- Creates one shared Atlassian HTTP client during app lifespan.
- Enables CORS for the frontend.
- Registers routers for health, teams, and reports.
- Converts common exceptions into consistent JSON error responses.

Important behavior:

- Atlassian authentication errors become structured API errors.
- Unbounded JQL errors are converted into a clearer message.
- Unexpected exceptions return a generic `internal_error` message instead of leaking internal details.

### 4.2 Configuration

Configuration is handled in `Backend/app/core/config.py` using `pydantic-settings`.

Important environment variables:

```text
ATLASSIAN_SITE
ATLASSIAN_EMAIL
ATLASSIAN_TOKEN
JIRA_PROJECT_KEY
CONFLUENCE_SPACE_KEY
CORS_ORIGINS
GROQ_API_KEY
GROQ_MODEL
GROQ_BASE_URL
WORKFLOW_STATUSES
```

The backend reads these from `Backend/.env`.

Two important computed settings are:

- `site`: the Atlassian site URL with trailing slash removed.
- `workflow_status_list`: a comma-separated workflow list turned into an ordered list, for example `To Do,Build,Pending QA,Done`.

That workflow order is important because the app uses it to decide whether a status change is a valid forward transition.

### 4.3 Dependency Wiring

Dependency creation is in `Backend/app/routers/deps.py`.

Examples:

- `get_jira_client()` returns a Jira client using the shared Atlassian HTTP client.
- `get_confluence_client()` returns a Confluence client.
- `get_report_service()` creates `ReportService` with Jira client, site URL, project key, and workflow order.
- `get_team_service()` creates `TeamService` with Confluence client and space key.
- `get_ai_query_service()` creates `AiQueryService` with report service, team service, Groq client, and project key.

This keeps route functions small. Routes only parse HTTP parameters and delegate real logic to services.

## 5. External Integrations

### 5.1 Jira Integration

Jira access is wrapped by `Backend/app/clients/jira_client.py`.

Main methods:

- `search_jql(jql, fields, max_results)`: runs Jira JQL through Jira Cloud REST API.
- `issue_changelog(issue_key)`: fetches full changelog history for an issue.
- `user_search(query)`: resolves names/emails to Jira users.

Important implementation details:

- Jira search is paginated with `nextPageToken`.
- Changelog fetch is paginated with `startAt` and `maxResults`.
- User search first calls `/rest/api/3/user/search`.
- If that returns nothing, it falls back to `/rest/api/3/users/search` and filters users locally. This matters because Jira Cloud user visibility can hide search results.

### 5.2 Confluence Integration

Team membership comes from a Confluence page titled `Team Members`.

The relevant logic is in `Backend/app/services/team_service.py`.

Flow:

1. Resolve the configured Confluence space key to a space ID.
2. List pages in that space.
3. Find the page titled `Team Members`.
4. Fetch the page body.
5. Parse the first table into a structure like:

```json
{
  "Team A": ["Kashish", "Arpita"],
  "Team B": ["Shubham", "Yash", "Ankit"]
}
```

The parser expects a table with columns like `Team` and `Members`. Members can be comma-separated in the second column.

### 5.3 Groq Integration

Groq is used only for the advanced AI search feature.

The logic is in `Backend/app/services/ai_query_service.py`.

The app does not let the LLM directly execute anything. Instead:

1. The user enters a natural-language query.
2. The backend builds a strict system prompt.
3. Groq returns a JSON plan.
4. The backend normalizes and validates the plan.
5. The backend enforces Jira project scope on the JQL.
6. The backend resolves user display names in JQL to account IDs.
7. The backend executes the final JQL through Jira.
8. The frontend displays the exact executed JQL.

This design is important because it keeps AI as a planner, not as a trusted executor.

## 6. API Endpoints

Backend routes are mainly defined in `Backend/app/routers/reports.py` and team routes.

### Health

```text
GET /api/health
```

Used to confirm the backend is running.

### Teams

```text
GET /api/teams
GET /api/teams/{team}/members
```

Used by frontend dropdowns to load teams and members from Confluence.

### Assigned Issues Report

```text
GET /api/reports/assigned?member=<name>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
```

Returns all Jira issues that were ever assigned to the selected member in the configured project.

### Transitions Report

```text
GET /api/reports/transitions?member=<name>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>&rule=assignee|actor&transition=<status>
```

Returns one-step forward workflow transitions involving the selected member.

The `rule` parameter controls matching:

- `assignee`: match issues where the selected person was assigned at the transition time.
- `actor`: match issues where the selected person performed the transition.

The optional `transition` parameter narrows results to a destination status, for example `Pending QA`.

### Analytics

```text
GET /api/reports/analytics?from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
```

Returns project-wide metrics:

- total issues
- resolved issues
- in-progress issues
- average cycle time
- counts by status
- counts by assignee
- counts by priority
- bottlenecks
- workload balance
- AI-style standup summary generated by deterministic backend logic

### Advanced AI Query

```text
GET /api/reports/ai-query?q=<prompt>
```

Uses Groq to convert the prompt into a JQL plan, then executes the final safe JQL.

### Excel Export

```text
GET /api/reports/export?type=assigned|transitions&member=<name>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
```

Generates an `.xlsx` file for assigned or transition reports.

The backend sanitizes filename parts before putting them in the `Content-Disposition` response header.

## 7. Main Report Logic

The most important backend class is `ReportService` in `Backend/app/services/report_service.py`.

### 7.1 Member Name Resolution

Users choose human-readable names in the UI, but Jira Cloud JQL works best with Atlassian account IDs.

So before running reports, the backend resolves the selected member:

```text
"Yash" -> "712020:...account id..."
```

Resolution order:

1. Exact account ID match.
2. Exact display name or email match.
3. Display name starts with the search term.
4. Display name contains the search term.
5. First returned Jira result.

If no Jira user is found, the backend treats the input as an account ID fallback.

### 7.2 Assigned Issues Report

This report answers:

> Which issues was this developer assigned to at any point?

The backend builds JQL like:

```jql
project = KAN AND assignee WAS "<accountId>" ORDER BY updated DESC
```

If dates are selected, it adds `updated >= "YYYY-MM-DD"` and/or `updated <= "YYYY-MM-DD"`.

The key part is `assignee WAS`, not `assignee =`.

Why this matters:

- `assignee =` only finds currently assigned issues.
- `assignee WAS` finds issues that were assigned to the person at any point in history.

So if a ticket was assigned to Yash last week but is now assigned to Shubham, it can still appear in Yash's assigned report.

Each row includes:

- issue key
- summary
- current status
- current assignee
- reporter
- created date
- updated date
- Jira URL

### 7.3 Forward Transitions Report

This report answers:

> Which workflow steps moved forward for this developer?

Jira JQL alone cannot reliably answer this because it does not easily tell us who owned the ticket at the exact moment of a status transition. The backend therefore uses changelog reconstruction.

Workflow order comes from `WORKFLOW_STATUSES`, for example:

```text
To Do -> Build -> Pending QA -> Done
```

A valid forward transition is only a one-step move:

- `To Do -> Build` is valid.
- `Build -> Pending QA` is valid.
- `Pending QA -> Done` is valid.
- `To Do -> Pending QA` is ignored because it skips a step.
- `Pending QA -> Build` is ignored because it moves backward.

Backend flow:

1. Search candidate issues in the configured Jira project.
2. For each issue, fetch its changelog.
3. Scan changelog entries where `field == "status"`.
4. Keep only one-step forward moves based on workflow order.
5. Reconstruct who was assigned at the transition timestamp.
6. Match either by assignee-at-transition or actor, depending on `rule`.
7. Return report rows.

Each transition row includes:

- issue key
- summary
- transition timestamp
- person who performed the transition
- assignee at that time
- from status
- to status
- Jira URL

### 7.4 Assignee at Transition Time

This is one of the most technical parts of the project.

The current assignee on a Jira issue may not be the same person who owned the ticket when it moved status. For example:

1. Yash owns `KAN-10`.
2. It moves from `Build` to `Pending QA`.
3. Immediately after that, it is reassigned to Shubham.

If we only read the current assignee, we would incorrectly say Shubham owned the transition.

To avoid that, the backend replays assignee changes from the changelog and determines the assignee before the transition timestamp. That reconstructed owner is used for the `rule=assignee` report.

### 7.5 Analytics Dashboard

Analytics uses project-bounded JQL and aggregates the returned issues.

It calculates:

- issue count by status
- issue count by assignee
- issue count by priority
- resolved count
- active count
- average cycle time from created date to resolution date
- bottleneck issues
- workload balance

Bottleneck logic:

- If an issue is in an active workflow status and not in the final status, the backend checks when it entered the current status.
- If it has stayed there for at least 24 hours, it is marked as a bottleneck.

Workload balance logic:

- Count active issues per assignee.
- Calculate team average.
- Mark members above average by 2 or more as overloaded.
- Mark members below average by 2 or more as having capacity.
- Generate simple reassignment suggestions.

The standup summary is deterministic backend logic, not an LLM call. It turns the analytics numbers into short highlights and recommended actions.

## 8. AI Query Flow

The advanced AI search panel lets a user ask things like:

```text
Show issues Kashish worked on this month
```

The backend prompt tells Groq to return JSON with this shape:

```json
{
  "report_type": "assigned",
  "members": ["Kashish"],
  "from_date": "2026-07-01",
  "to_date": "2026-07-31",
  "requires_changelog": false,
  "proposed_jql": "project = KAN AND assignee WAS \"Kashish\" ORDER BY updated DESC",
  "explanation": "Find issues assigned to Kashish this month."
}
```

Then the backend protects execution:

- It ensures the JQL includes `project = KAN`.
- It resolves quoted user names like `"Kashish"` into account IDs.
- It returns the exact `executed_jql` to the frontend.

This makes the feature explainable: the manager can see not only the natural language query, but also the actual Jira query that was run.

## 9. Frontend Architecture

The frontend is a React application using:

- Vite for local development/build.
- TypeScript for type safety.
- Material UI for UI components.
- React Router for page routes.
- TanStack React Query for API state and caching.
- Axios for HTTP requests.

### 9.1 App Shell

`Frontend/src/App.tsx` sets up:

- Material UI theme provider.
- light/dark color mode context.
- Day.js date adapter for date pickers.
- layout wrapper.
- routes.

Routes:

```text
/              Dashboard
/assigned      Dashboard assigned tab
/transitions   Dashboard transitions tab
/analytics     Dashboard analytics tab
/presentation  Presentation page
```

### 9.2 API Layer

`Frontend/src/api/client.ts` creates the Axios client.

Default base URL:

```text
http://localhost:8000
```

`Frontend/src/api/reports.ts` contains typed functions such as:

- `fetchAssignedReport()`
- `fetchTransitions()`
- `fetchAnalytics()`
- `aiQueryReports()`
- `downloadReportExcel()`

These functions keep HTTP details out of UI components.

### 9.3 React Query Hooks

`Frontend/src/hooks/useReports.ts` wraps the API functions with React Query.

Each report has a query key based on filters:

- member
- date range
- rule
- transition filter
- run ID

The `runId` is bumped when the user clicks Generate. This forces React Query to refetch fresh Jira data even if the filters did not change.

### 9.4 Dashboard Page

`Frontend/src/pages/DashboardPage.tsx` is the main user workflow.

The user can:

1. Select a team.
2. Select a member from that team.
3. Select date range.
4. Click Generate.
5. Switch between Assigned Issues, Transitions, and Analytics tabs.
6. Run advanced AI search from the AI panel.

The tab is connected to the route, so sidebar navigation and selected tab stay synchronized.

## 10. End-to-End User Flow

### Example: Assigned Issues

```text
User selects Team B and Yash
  -> Frontend calls /api/teams/Team B/members to populate members
  -> User clicks Generate
  -> Frontend calls /api/reports/assigned?member=Yash&from=...&to=...
  -> Backend resolves Yash to Jira account ID
  -> Backend runs JQL with assignee WAS
  -> Jira returns matching issues
  -> Backend normalizes issue rows
  -> Frontend renders table and export option
```

### Example: Transitions by Assignee

```text
User selects member and opens Transitions tab
  -> Frontend calls /api/reports/transitions with rule=assignee
  -> Backend resolves member to account ID
  -> Backend searches project candidate issues
  -> Backend fetches changelog for each issue
  -> Backend finds one-step forward status transitions
  -> Backend reconstructs assignee at each transition time
  -> Backend keeps rows where reconstructed assignee matches selected member
  -> Frontend renders transition rows
```

### Example: AI Search

```text
User asks a natural-language question
  -> Frontend calls /api/reports/ai-query?q=...
  -> Backend asks Groq for a JSON query plan
  -> Backend normalizes the plan
  -> Backend enforces project scope
  -> Backend resolves user names in JQL
  -> Backend executes Jira query
  -> Frontend shows explanation, executed JQL, and issue results
```

## 11. Why There Is No Database

This project intentionally does not store Jira issue history locally.

Advantages:

- Reports use live Jira data.
- No database setup is needed.
- No synchronization jobs are needed.
- No risk of stale local issue history.

Tradeoff:

- Some reports can be slower because they call Jira live and may fetch changelogs per issue.
- Large Jira projects may need pagination, filtering, caching, or background jobs later.

For a demo or focused team reporting tool, live querying is simpler and easier to explain.

## 12. Security and Safety Points

Important security behaviors:

- Secrets stay in `Backend/.env` and should not be committed.
- The backend uses structured error responses instead of exposing raw stack traces.
- AI-generated JQL is forced into the configured Jira project.
- Display names in JQL are resolved to account IDs to avoid ambiguous Jira user matching.
- Excel filenames are sanitized before being sent in response headers.
- CORS is restricted through `CORS_ORIGINS`.

Important limitation:

- If someone exposes `ATLASSIAN_TOKEN` or `GROQ_API_KEY`, those credentials must be rotated.

## 13. How to Run Locally

### Backend

```powershell
cd Confluence-Jira\Backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Backend health check:

```text
http://127.0.0.1:8000/api/health
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```powershell
cd Confluence-Jira\Frontend
& "C:\Program Files\nodejs\node.exe" node_modules\vite\bin\vite.js --host 127.0.0.1
```

Frontend URL:

```text
http://127.0.0.1:5173/
```

## 14. How to Test

### Backend tests

```powershell
cd Confluence-Jira\Backend
.\.venv\Scripts\python.exe -m pytest -q
```

Backend tests cover logic such as:

- Confluence team table parsing.
- forward transition detection.
- assignee reconstruction at transition time.
- JQL scope enforcement.
- user-name rewriting in JQL.
- AI query orchestration with fake LLM clients.

### Frontend type check

```powershell
cd Confluence-Jira\Frontend
& "C:\Program Files\nodejs\node.exe" node_modules\typescript\bin\tsc --noEmit -p tsconfig.json
```

## 15. What to Say If Your Manager Asks

### Short explanation

This is a full-stack reporting dashboard that connects to Confluence for team membership and Jira for live issue/workflow data. The backend exposes FastAPI endpoints that resolve members to Jira account IDs, query Jira with bounded JQL, reconstruct workflow transitions from changelogs, and return normalized report data. The React frontend provides filters, report tabs, analytics, AI-assisted JQL search, and Excel export.

### Technical explanation

The architecture is split into a React frontend and a FastAPI backend. The frontend does not talk directly to Jira or Confluence. It calls our backend APIs. The backend has a service layer where the actual reporting logic lives. Jira and Confluence access is isolated inside client classes, which makes routes thin and keeps external API handling separate from business rules.

For assigned issue reporting, the backend uses Jira's `assignee WAS` history operator so it can find tickets a developer owned in the past, even if the current assignee has changed. For workflow reporting, JQL is not enough, so the backend fetches each issue changelog and scans status changes. It only counts one-step forward transitions based on the configured workflow order. It also reconstructs who was assigned at the exact transition time by replaying assignee changes from the changelog.

The AI search feature is controlled: Groq produces a JSON plan, but the backend validates it, enforces project scope, resolves display names to account IDs, and only then executes the JQL. The frontend shows the executed JQL so the result is explainable.

### Business value explanation

The project reduces manual reporting effort. Instead of checking Jira tickets and history manually, a manager can select a developer and date range to see assignment history, workflow movement, bottlenecks, workload balance, and exportable reports. It gives more accurate history than simple current-assignee filters because it uses Jira changelog and history operators.

## 16. Strengths of the Current Design

- Clear separation between frontend, routes, services, and external clients.
- No direct Jira credentials in frontend.
- Reports are based on live Jira data.
- Historical assignment reporting uses `assignee WAS`, which is more accurate than current assignee filtering.
- Transition reporting uses changelog reconstruction, which handles reassignment after status changes.
- AI query execution is constrained by backend validation and project-scope enforcement.
- Backend tests cover important logic-heavy functions.

## 17. Current Limitations and Future Improvements

Current limitations:

- No database or caching, so large Jira projects may be slower.
- Transition reports fetch changelogs per issue, which can be expensive at scale.
- Team membership depends on a Confluence page format.
- Reviewer/QA role inference is currently a future extension hook.
- AI quality depends on Groq response quality, although execution is still backend-controlled.

Possible improvements:

- Add caching for team membership and user lookup.
- Add background jobs for large project analytics.
- Add stricter date validation and default report windows for very large projects.
- Add configurable custom fields for reviewer/QA ownership.
- Add authentication/authorization for production use.
- Add frontend end-to-end tests for main dashboard workflows.

## 18. One-Line Summary

This project is a Jira/Confluence reporting dashboard where FastAPI safely gathers and reconstructs live Jira history, and React presents that data as developer activity reports, workflow transition insights, analytics, AI-assisted search, and Excel exports.