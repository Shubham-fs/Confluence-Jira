# PPT Documentation Pack

This folder explains the complete Developer Activity Reporting Web App in a presentation-friendly way.

Recommended reading order:

1. `01-project-overview.md` - what the project is and why it exists.
2. `02-architecture-and-data-flow.md` - how frontend, backend, Confluence, and Jira communicate.
3. `03-backend-deep-dive.md` - FastAPI backend internals.
4. `04-frontend-deep-dive.md` - React frontend internals.
5. `05-jira-and-confluence-integration.md` - Atlassian API concepts and project-specific integration.
6. `06-report-logic-and-excel-export.md` - how both reports are calculated and exported.
7. `07-setup-run-demo-testing.md` - setup, run commands, demo flow, and testing checklist.
8. `08-presentation-script-and-faq.md` - ready-to-speak script and expected Q&A.

Do not add real `.env` values or API tokens to slides. Show variable names only.

This pack now also documents:

- the natural-language query feature
- the `/api/reports/query` endpoint
- where SOLID principles were applied in the backend NL query design
