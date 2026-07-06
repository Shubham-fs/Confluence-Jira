# 01 - Master PPT Generation Prompt

Create a professional project presentation for a full-stack web app named **Developer Activity Reporting**.

## Project Summary

The app connects to Confluence Cloud, Jira Cloud, and Groq. It reads team membership from Confluence, reads issues and changelog history from Jira, and generates developer activity reports in a React dashboard. It also includes Groq-backed Advanced AI Search that converts a free-form prompt into a structured plan and visible executed JQL.

## Required Slide Deck

Create 12 to 14 slides:

1. Title slide.
2. Problem statement: manual developer reporting is slow and loses history.
3. Solution overview.
4. User-facing features.
5. Architecture diagram: React frontend, FastAPI backend, Confluence, Jira, Groq.
6. Jira and Confluence integration.
7. Assigned Issues report: JQL `assignee WAS` history.
8. Transitions report: changelog replay and one-step forward workflow moves.
9. Build -> Pending QA as a transition filter.
10. Advanced AI Search: Groq prompt to JSON plan to executed JQL.
11. Backend design and SOLID principles.
12. Frontend design and dashboard flow.
13. Setup, testing, and demo plan.
14. Security, limitations, and future scope.

## Must Mention

- Backend endpoints:
  - `GET /api/health`
  - `GET /api/teams`
  - `GET /api/reports/assigned`
  - `GET /api/reports/transitions`
  - `GET /api/reports/ai-query`
  - `GET /api/reports/export`
- The old single Build -> Pending QA report is now generalized into Transitions.
- Build -> Pending QA remains available through `transition=Pending QA`.
- The app does not store Jira history locally.
- Assigned history comes from `assignee WAS`.
- Transition history comes from issue changelogs.
- The UI displays the exact executed JQL for AI search.
- The backend enforces `project = KAN` on custom JQL.
- Names are resolved to Jira account IDs, with a user-directory fallback.
- Secrets live in `.env` and must not be committed or shown.

## Tone

Make the deck suitable for a college/project viva or internal technical demo. Keep slides concise, visual, and technically accurate.