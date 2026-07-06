# Frontend — Developer Activity Reporting

React + Vite + TypeScript single-page app for generating developer activity reports from Jira and Confluence data. The UI uses Material UI, TanStack Query, and axios.

## Requirements

- Node.js 18+ LTS

## Setup And Run

```powershell
cd Frontend
npm install
copy .env.example .env
npm run dev
```

The dev server runs at http://localhost:5173.

## Environment Variables

| Key | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL. Defaults to `http://localhost:8000`. |

## Features

- Confluence-backed Team -> Member selectors.
- Date range filters and explicit Generate action.
- Assigned Issues tab for tickets associated with the selected member at any point in time.
- Transitions tab for all one-step forward workflow moves.
- Transition dropdown with All forward transitions plus specific steps such as Build -> Pending QA.
- Assignee/actor toggle for transition matching.
- Advanced AI Search panel powered by Groq.
- Visible executed JQL with copy action.
- Sortable, paginated report tables with Jira issue links.
- Excel export for Assigned and Transitions reports.
- Loading, empty, and error states.
- Light/dark mode toggle.

## App Flow

1. `DashboardPage` loads teams through `useTeams()`.
2. Selecting a team loads members through `useTeamMembers()`.
3. Generate applies the selected member/date filters.
4. `/assigned` renders `AssignedReportView` and calls `/api/reports/assigned`.
5. `/transitions` renders `TransitionReportView` and calls `/api/reports/transitions`.
6. `AiQueryPanel` calls `/api/reports/ai-query` and renders the plan, explanation, executed JQL, and returned issues.

## Advanced AI Search UI

The AI panel is intentionally transparent. It shows the natural-language prompt, the LLM explanation, the report type selected by the backend, whether changelog data is required, the exact JQL executed against Jira, and returned issues in a compact table.

This makes it easier to verify that the LLM did not silently search outside the configured Jira project.

## Transitions UI

The Transitions tab is broader than the original Build -> Pending QA report. It can show every one-step forward workflow move, or a single step selected from the Transition dropdown.

Default workflow steps are derived from the backend response:

- `To Do -> Build`
- `Build -> Pending QA`
- `Pending QA -> Done`

The rule toggle controls which person the report matches:

- **By assignee**: member was assigned at the transition timestamp.
- **By actor**: member performed the transition.

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check and build for production.
- `npm run preview` — preview the production build.

## Validation

```powershell
cd Frontend
& "C:\Program Files\nodejs\node.exe" node_modules\typescript\bin\tsc --noEmit -p tsconfig.json
```

## Security Reminder

Never put real Atlassian tokens or Groq keys in frontend code, docs, screenshots, or generated prompts. The browser should only know the backend URL.