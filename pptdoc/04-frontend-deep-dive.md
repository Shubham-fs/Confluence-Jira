# 04 - Frontend Deep Dive

## Stack

- React + TypeScript.
- Vite development server.
- Material UI components and theme.
- TanStack Query for data fetching/cache.
- axios API client.

## Routing

- `/` and `/assigned` show the dashboard with Assigned Issues active.
- `/transitions` shows the dashboard with Transitions active.

The old dedicated Build -> Pending QA route is replaced by the Transitions route and dropdown filter.

## Dashboard State

`DashboardPage` controls:

- selected team,
- selected member,
- date range,
- active tab,
- transition matching rule,
- generate/run id,
- snackbar errors.

## API Layer

- `api/client.ts`: shared axios client.
- `api/teams.ts`: team/member endpoints.
- `api/reports.ts`: assigned, transitions, AI query, and export calls.
- `api/types.ts`: TypeScript response models.

## Hooks

- `useTeams()` loads teams.
- `useTeamMembers()` loads members for one team.
- `useAssignedReport()` wraps `/api/reports/assigned`.
- `useTransitionsReport()` wraps `/api/reports/transitions` and includes `rule` plus optional `transition` in the query key.

## Assigned Report View

Shows issue key, summary, status, assignee, reporter, created, updated, and Jira link. It supports export to Excel.

## Transitions Report View

Shows issue key, summary, from status, to status, transition time, performer, assignee at transition time, and Jira link.

Controls:

- `By assignee` / `By actor` toggle.
- Transition dropdown: All forward transitions or one specific step such as Build -> Pending QA.
- Excel export using the same filters.

## Advanced AI Search Panel

`AiQueryPanel` submits free-form text to `/api/reports/ai-query`. It displays:

- LLM explanation.
- Report type.
- Requires-changelog indicator.
- Executed JQL.
- Copy-JQL action.
- Result table.

## UX Notes

The frontend keeps the AI path transparent. Users see both the natural-language prompt and the concrete JQL/result shape, which helps explain and audit the LLM behavior during demos.