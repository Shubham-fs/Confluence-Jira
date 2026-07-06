# Developer Activity Reporting (Jira Cloud + Confluence Cloud)

Full-stack web app that automates developer activity reporting. It reads team membership from **Confluence Cloud**, reads issue and workflow history from **Jira Cloud**, and gives a dashboard for member-specific activity over an optional date range.

The app does not store Jira history locally. It fetches current data and reconstructs history live from Jira by using JQL history operators and issue changelogs.

## What The App Shows

- **Assigned Issues**: all Jira issues that were associated with a selected person at any point in time. This uses Jira JQL with `assignee WAS "accountId"`, so reassigned tickets still appear.
- **Transitions**: all one-step forward workflow moves for the selected person. Examples with the default workflow are `To Do -> Build`, `Build -> Pending QA`, and `Pending QA -> Done`.
- **Build -> Pending QA option**: preserved as a selectable transition filter inside the broader Transitions report.
- **Advanced AI Search (Groq)**: a free-form prompt is planned by Groq into structured report intent and JQL. The dashboard shows the exact executed JQL so the user can see what Jira was queried.
- **Excel export**: Assigned and Transitions reports can be downloaded as `.xlsx` files.

## Structure

```text
Confluence-Jira/
  Backend/    # FastAPI + httpx + pydantic v2 + Groq client
  Frontend/   # React + Vite + TypeScript + Material UI
  pptdoc/     # presentation-ready project documentation
  prompts/    # prompts for generating PPT/script/Q&A material
```

## Quick Start

### 1. Backend

```powershell
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Required backend environment values:

- `ATLASSIAN_SITE`
- `ATLASSIAN_EMAIL`
- `ATLASSIAN_TOKEN`
- `JIRA_PROJECT_KEY`
- `CONFLUENCE_SPACE_KEY`
- `CORS_ORIGINS`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `WORKFLOW_STATUSES`

### 2. Frontend

```powershell
cd Frontend
npm install
copy .env.example .env
npm run dev
```

The frontend runs at http://localhost:5173 and calls the backend at `VITE_API_BASE_URL` or `http://localhost:8000` by default.

## Main Backend Endpoints

- `GET /api/health`
- `GET /api/teams`
- `GET /api/teams/{team}/members`
- `GET /api/reports/assigned?member=&from=&to=`
- `GET /api/reports/transitions?member=&from=&to=&rule=assignee|actor&transition=`
- `GET /api/reports/ai-query?q=`
- `GET /api/reports/export?type=assigned|transitions&member=&from=&to=&rule=&transition=`

## How History Is Fetched

### Assigned Issues

The backend resolves a display name to an Atlassian `accountId`, then runs JQL like:

```jql
project = KAN AND assignee WAS "712020:..." ORDER BY updated DESC
```

Jira evaluates `assignee WAS` against its own server-side history. The app only reads the result.

### Transitions

JQL cannot fully answer “who moved this issue from Build to Pending QA and who was assigned at that moment.” The backend therefore:

1. Runs bounded JQL to get candidate issues in the project.
2. Fetches each issue changelog from Jira.
3. Keeps only status changes where the destination is exactly one step ahead in `WORKFLOW_STATUSES`.
4. Replays assignee changes up to the transition timestamp to reconstruct the assignee at that moment.

The `rule` parameter controls matching:

- `rule=assignee`: selected person was assigned at the transition time.
- `rule=actor`: selected person performed the transition.

The optional `transition` parameter narrows to one destination status. For example, `transition=Pending QA` shows the Build -> Pending QA step.

### Advanced AI Search

The Groq-backed AI feature plans a free-form prompt into a structured JSON plan:

- report type: `assigned`, `transitions`, or `custom-jql`
- selected members/date range when inferable
- proposed JQL
- explanation
- whether changelog data is needed

The backend always enforces Jira project scope before executing JQL and resolves quoted assignee/reporter names to account IDs. The frontend displays the executed JQL.

## Name Resolution

Jira Cloud usually requires account IDs in user JQL. The backend resolves names by:

1. Calling Jira user search.
2. Falling back to scanning the browsable user directory when query search returns empty.
3. Picking the best exact, prefix, or contains match.

This is why prompts can say “Kashish” while the executed JQL uses an account ID.

## How To Verify

1. Open http://localhost:8000/api/health and confirm `{ "status": "ok" }`.
2. Open http://localhost:8000/docs for Swagger UI.
3. Open http://localhost:5173.
4. Select a team and member from Confluence-sourced dropdowns.
5. Generate Assigned Issues.
6. Open Transitions and try both `By assignee` and `By actor`.
7. Use the Transition dropdown to compare All forward transitions with Build -> Pending QA.
8. Run an Advanced AI Search and inspect the visible executed JQL.
9. Export a report to Excel.

## Tests

```powershell
cd Backend
.\.venv\Scripts\python.exe -m pytest -q

cd ..\Frontend
& "C:\Program Files\nodejs\node.exe" node_modules\typescript\bin\tsc --noEmit -p tsconfig.json
```

Backend tests cover team parsing, AI query planning helpers, JQL scope/name rewriting, assignee reconstruction, and forward-transition detection.

## Security Notes

- Real Atlassian and Groq secrets must stay in `Backend/.env` only.
- Never paste real `.env` values into slides, prompt files, screenshots, or external AI tools.
- Rotate exposed Atlassian tokens and Groq keys.
- Confirm `.env` remains ignored by git before committing.