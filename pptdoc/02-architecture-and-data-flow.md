# 02 - Architecture and Data Flow

## High-Level Architecture

The project has four major parts:

1. React frontend
2. FastAPI backend
3. Confluence Cloud
4. Jira Cloud

The frontend never talks directly to Jira or Confluence. It talks only to the backend. The backend is responsible for authentication, API calls, data transformation, and Excel generation.

## Why the Backend Is Needed

The backend is important because:

- Atlassian API tokens must not be exposed in browser JavaScript.
- Jira and Confluence APIs require authentication.
- Business logic should be centralized in one place.
- Changelog scanning is easier and safer on the server.
- Excel files can be generated reliably on the backend.
- Error handling can be standardized.

## System Diagram

```text
User Browser
   |
   | opens http://localhost:5173
   v
React + Vite Frontend
   |
   | HTTP requests with axios
   v
FastAPI Backend - http://localhost:8000
   |                         |
   | Confluence REST API      | Jira REST API
   v                         v
Confluence Cloud             Jira Cloud
Team Members page            Issues + changelog
```

## Main Request Flow

### Flow 1 - Loading Teams

1. User opens the dashboard.
2. Team dropdown component asks the backend for teams.
3. Frontend calls `GET /api/teams`.
4. Backend uses `TeamService`.
5. `TeamService` uses `ConfluenceClient`.
6. `ConfluenceClient` resolves the configured Confluence space.
7. It finds the page titled `Team Members`.
8. It downloads the page body in Confluence storage format.
9. `parse_team_table()` extracts team names and members from the HTML table.
10. Backend returns teams to frontend.
11. Frontend fills the Team dropdown.

### Flow 2 - Loading Team Members

1. User selects a team.
2. Member dropdown calls `GET /api/teams/{team}/members`.
3. Backend reads the same Confluence team map.
4. Backend returns members for that selected team.
5. Frontend fills the Member dropdown.

### Flow 3 - Assigned Issues Report

1. User selects member and date range.
2. User clicks Generate.
3. Frontend calls `GET /api/reports/assigned`.
4. Backend resolves the member name to a Jira account ID.
5. Backend creates a bounded JQL query.
6. Jira returns issues assigned to that account.
7. Backend converts Jira issue fields into a clean response model.
8. Frontend displays the rows in a table.

### Flow 4 - Build to Pending QA Report

1. User selects member and date range.
2. User opens Build to Pending QA tab.
3. Frontend calls `GET /api/reports/build-to-qa`.
4. Backend resolves member to Jira account ID.
5. Backend fetches candidate issues from the project.
6. For each candidate issue, backend calls Jira changelog API.
7. Backend scans changelog entries for status changes from Build to Pending QA.
8. Backend applies the selected rule:
   - Assignee rule: issue's current assignee must match selected member.
   - Actor rule: changelog author must match selected member.
9. Backend returns matching transition rows.
10. Frontend displays the report table.

### Flow 5 - Excel Export

1. User clicks Export to Excel.
2. Frontend calls `GET /api/reports/export` with report type and filters.
3. Backend regenerates the report data.
4. Backend uses openpyxl to create an `.xlsx` workbook.
5. Backend returns binary Excel data.
6. Browser downloads the file.

## Backend Layers

The backend is organized into layers:

```text
routers/     HTTP endpoint definitions
services/    Business logic and report building
clients/     Jira and Confluence API wrappers
models/      Pydantic response schemas
core/        Settings and authentication helpers
main.py      FastAPI app setup, CORS, error handlers
```

This separation makes the backend easier to understand:

- Routers answer: Which URL was called?
- Services answer: What business logic should run?
- Clients answer: How do we call external APIs?
- Models answer: What shape should the response have?
- Core answers: How is configuration loaded?

## Frontend Layers

The frontend is organized into:

```text
api/          axios calls and TypeScript API types
hooks/        TanStack Query hooks
components/   reusable UI components
pages/        Dashboard page
Layout/       Navbar and sidebar
theme/        MUI theme and dark/light mode
```

This separation makes the frontend easier to maintain:

- API files know endpoint URLs.
- Hooks manage loading/error/cache states.
- Components display specific UI pieces.
- Pages combine components into a workflow.

## Important Design Decision: Frontend Does Not Store Secrets

The frontend is public browser code. Anything in frontend JavaScript can be inspected by users. Therefore, Atlassian credentials are kept only in `Backend/.env`. The backend uses those credentials to call Jira and Confluence.

## Important Design Decision: Bounded JQL

Jira's search API rejects unbounded queries. The app always includes `project = KAN` in JQL queries. This keeps searches restricted to the configured project and prevents expensive global queries.

## Important Design Decision: Changelog-Based Transition Detection

For Build to Pending QA, the app cannot rely only on current issue status. A ticket may have moved from Build to Pending QA yesterday and then moved to Done today. If the app checked only current status, it would miss that historical transition. Therefore, it reads changelog history.

## End-to-End Example

Example: user selects Team B and Shubham.

1. Frontend sends member `Shubham` to backend.
2. Backend searches Jira users for `Shubham`.
3. Jira returns Shubham's account ID.
4. Assigned report JQL searches issues where assignee equals that account ID.
5. Build to Pending QA report searches project issues and checks changelog.
6. If KAN-5 is currently assigned to Shubham and has a Build to Pending QA changelog entry, it appears in the assignee-based report.
7. If Yash performed that transition, then KAN-5 appears under actor=Yash, not actor=Shubham.

## Summary

The application is a classic full-stack integration project. React handles user interaction. FastAPI handles business logic. Jira and Confluence provide live external data. The app transforms that data into readable developer activity reports.
