# 03 - Speaker Notes And Demo Script Prompt

Create speaker notes and a live demo script for the Developer Activity Reporting app.

## Demo Environment

- Backend: FastAPI on `http://localhost:8000`.
- Frontend: Vite on `http://localhost:5173`.
- Swagger docs: `http://localhost:8000/docs`.
- Jira project key: `KAN`.
- Workflow order: `To Do, Build, Pending QA, Done`.

## Demo Flow

Write a step-by-step spoken script for:

1. Opening the dashboard.
2. Showing Confluence-sourced Team and Member selectors.
3. Generating Assigned Issues.
4. Explaining `assignee WAS` and Jira-side history.
5. Opening the Transitions tab.
6. Explaining one-step forward workflow transitions.
7. Selecting Build -> Pending QA from the Transition dropdown.
8. Toggling By assignee and By actor.
9. Running Advanced AI Search with a prompt.
10. Pointing to the visible executed JQL.
11. Explaining project-scope enforcement and accountId resolution.
12. Exporting to Excel.

## Speaker Notes Must Include

- The app stores no Jira history locally.
- Assigned report uses JQL history: `assignee WAS`.
- Transitions report uses changelog replay.
- Build -> Pending QA is retained as a filter, not removed.
- Groq is used for planning, not direct database access.
- The backend validates and scopes what the LLM proposes.
- Secrets should never appear in slides or screenshots.

## Output Format

Provide:

- Opening script.
- Slide-by-slide speaker notes.
- Live demo narration.
- Backup explanation if Groq is unavailable.
- Closing summary.