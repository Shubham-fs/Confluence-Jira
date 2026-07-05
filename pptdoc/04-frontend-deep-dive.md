# 04 - Frontend Deep Dive

## Frontend Purpose

The frontend is the user-facing dashboard. It lets the user select a team, select a team member, choose dates, generate reports, switch between report tabs, and export results to Excel.

The frontend does not directly call Jira or Confluence. It only calls the FastAPI backend.

## Frontend Stack

- React 18: component-based UI framework.
- Vite: development server and build tool.
- TypeScript: type safety.
- Material UI: ready-made UI components.
- TanStack Query: server-state fetching and caching.
- axios: HTTP client.
- React Router: sidebar routes and tab navigation.
- Dayjs: date formatting.

## Frontend Entry Point

The frontend starts from `Frontend/src/main.tsx`. It mounts the React application into the browser DOM.

`Frontend/src/App.tsx` sets up:

- Material UI theme provider.
- Date picker localization provider.
- Layout wrapper.
- Routes.

Routes:

```text
/              Dashboard default
/assigned      Dashboard with Assigned Issues tab
/build-to-qa   Dashboard with Build to Pending QA tab
```

## Layout

The app layout contains:

- Navbar at top.
- Sidebar on the left.
- Main content area.

The sidebar has links for:

- Dashboard
- Assigned Issues
- Build to Pending QA

The active sidebar item is based on the current route.

## Dashboard Page

File: `Frontend/src/pages/DashboardPage.tsx`

This is the main user workflow page.

State values:

- `team`: selected team name.
- `member`: selected member name.
- `from`: selected start date.
- `to`: selected end date.
- `rule`: Build to Pending QA matching mode, either `assignee` or `actor`.
- `applied`: filters that were applied when Generate was clicked.
- `error`: current error message.

The app separates selected filters from applied filters. This means the user can change dropdowns without immediately refetching until they click Generate.

## Why `runId` Exists

The dashboard adds `runId: Date.now()` when Generate is clicked. This is used in React Query keys so clicking Generate again forces a fresh fetch from Jira even if the selected filters are the same.

This is useful because Jira data may change after the last report run.

## Team Dropdown

Component: `TeamSelect`

Purpose:

- Calls backend `/api/teams`.
- Shows teams from Confluence.
- When the user selects a team, member selection resets.

## Member Dropdown

Component: `MemberSelect`

Purpose:

- Calls `/api/teams/{team}/members` after a team is selected.
- Shows only members from the selected team.

## Date Range Picker

Component: `DateRangePicker`

Purpose:

- Lets the user choose from and to dates.
- Dates are optional/clearable.
- Dates are formatted as `YYYY-MM-DD` before being sent to backend.

## Report Tabs

The dashboard has two tabs:

1. Assigned Issues
2. Build to Pending QA

The active tab is controlled by route:

- `/assigned` shows Assigned Issues.
- `/build-to-qa` shows Build to Pending QA.

This makes sidebar navigation and tab navigation stay synchronized.

## Assigned Report View

Component: `AssignedReportView`

Purpose:

- Calls the assigned issues hook.
- Displays loading, error, empty, or table state.
- Provides export button.

## Build to QA Report View

Component: `BuildToQaReportView`

Purpose:

- Calls Build to Pending QA hook.
- Shows rule toggle: By assignee / By actor.
- Displays transition rows.
- Provides export button.

## Report Table

Component: `ReportTable`

Purpose:

- Displays report rows in a consistent table.
- Provides readable rows with issue key, summary, dates, assignee, performer, etc.

## API Layer

Frontend API files are in `Frontend/src/api`.

### `client.ts`

Creates the axios client. It uses the backend base URL from frontend environment settings.

### `teams.ts`

Functions:

- `fetchTeams()` calls `/api/teams`.
- `fetchTeamMembers(team)` calls `/api/teams/{team}/members`.

### `reports.ts`

Functions:

- `fetchAssignedReport(params)` calls `/api/reports/assigned`.
- `fetchBuildToQaReport(params)` calls `/api/reports/build-to-qa`.
- `downloadReportExcel(type, params)` calls `/api/reports/export` and triggers browser download.

## Hooks Layer

Hooks are in `Frontend/src/hooks`.

Purpose:

- Wrap API calls with TanStack Query.
- Manage loading states.
- Manage error states.
- Cache fetched data.
- Refetch when query keys change.

## Error Handling in UI

If an API request fails, the app shows an error snackbar. This gives the user feedback without crashing the page.

Typical errors:

- Backend not running.
- Atlassian credentials invalid.
- Jira or Confluence API failure.
- Network issue.

## Excel Download Flow

When the user clicks Export:

1. Frontend calls backend export endpoint.
2. Backend returns a binary Excel blob.
3. Frontend creates a temporary object URL.
4. Frontend creates an anchor tag.
5. Browser downloads the `.xlsx` file.
6. Temporary object URL is revoked.

## Why TypeScript Helps

TypeScript helps by defining report shapes and API response types. It catches mistakes during development, such as using a missing field or passing wrong params.

## Why Material UI Helps

Material UI provides professional components:

- Buttons
- Cards
- Tabs
- Selects
- Tables
- Date pickers
- Icons
- Snackbar alerts

This lets the project focus on business logic instead of building every UI element manually.

## Frontend Summary

The frontend provides a clean workflow over complex backend/API logic. Users do not need to know Jira API or Confluence API. They simply select filters, generate reports, and export results.
