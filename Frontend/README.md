# Frontend — Developer Activity Reporting

React + Vite + TypeScript single-page app for generating developer activity
reports. Uses Material UI, TanStack Query and axios.

## Requirements
- Node.js 18+ (LTS recommended)

## Setup & run
```powershell
cd Frontend
npm install
copy .env.example .env     # set VITE_API_BASE_URL=http://localhost:8000
npm run dev                # http://localhost:5173
```

## Environment variables (`.env`)
| Key | Description |
|-----|-------------|
| `VITE_API_BASE_URL` | Base URL of the backend API (default `http://localhost:8000`) |

## Features
- Cascading Team → Member selectors sourced from Confluence.
- Date range picker and a **Generate** action.
- Two report tabs: **Assigned Issues** and **Build → Pending QA** (with an
  assignee/actor rule toggle).
- Sortable, paginated, searchable tables with colored status badges and Jira links.
- Loading skeletons, empty states and error toasts.
- Export each report to Excel.
- Light/dark mode toggle.

## Scripts
- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
