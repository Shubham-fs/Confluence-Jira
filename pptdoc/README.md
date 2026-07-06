# PPT Documentation Pack

This folder contains presentation-ready documentation for the Developer Activity Reporting Web App.

Read in this order:

1. `01-project-overview.md` - problem, solution, features, and terminology.
2. `02-architecture-and-data-flow.md` - frontend/backend/Atlassian/Groq flow.
3. `03-backend-deep-dive.md` - FastAPI internals and service design.
4. `04-frontend-deep-dive.md` - React dashboard, routes, views, and API layer.
5. `05-jira-and-confluence-integration.md` - Jira JQL, changelog, Confluence teams, and account IDs.
6. `06-report-logic-and-excel-export.md` - report calculations and workbook export.
7. `07-setup-run-demo-testing.md` - setup, run commands, live demo, and validation.
8. `08-presentation-script-and-faq.md` - ready-to-speak script and viva Q&A.

This pack documents the current implementation:

- Groq-backed Advanced AI Search.
- Visible executed JQL.
- Project-scoped JQL enforcement.
- Assigned-history reporting via `assignee WAS`.
- Transition-history reporting via Jira changelog replay.
- All one-step forward transitions, with Build -> Pending QA retained as a filter.
- Name-to-accountId resolution with a Jira directory fallback.
- Excel export for assigned and transitions reports.

Do not put real `.env` values, API tokens, Groq keys, screenshots with secrets, or account credentials into slides or prompt tools.