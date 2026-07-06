# 07 - Setup, Run, Demo, Testing

## Backend Setup

```powershell
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for Swagger UI.

## Frontend Setup

```powershell
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173.

## Required Environment Values

Backend `.env` needs Atlassian site, email, token, Jira project key, Confluence space key, CORS origins, Groq API key/model, and workflow statuses.

Frontend `.env` needs `VITE_API_BASE_URL=http://localhost:8000` unless using the default.

## Manual Endpoint Checks

```text
GET http://localhost:8000/api/health
GET http://localhost:8000/api/teams
GET http://localhost:8000/api/reports/assigned?member=Kashish
GET http://localhost:8000/api/reports/transitions?member=Kashish
GET http://localhost:8000/api/reports/transitions?member=Kashish&transition=Pending%20QA
GET http://localhost:8000/api/reports/ai-query?q=show%20Kashish%20assigned%20tickets
```

## Live Demo Script

1. Show the Confluence Team Members page.
2. Show the Jira board and statuses.
3. Open the app dashboard.
4. Select a team and member.
5. Generate Assigned Issues and explain `assignee WAS`.
6. Switch to Transitions and explain changelog reconstruction.
7. Use the Transition dropdown to select Build -> Pending QA.
8. Toggle By assignee vs By actor.
9. Run Advanced AI Search with a prompt such as “show tickets Kashish worked on and show the JQL”.
10. Point out the visible executed JQL.
11. Export to Excel.

## Testing

Backend:

```powershell
cd Backend
.\.venv\Scripts\python.exe -m pytest -q
```

Frontend type-check:

```powershell
cd Frontend
& "C:\Program Files\nodejs\node.exe" node_modules\typescript\bin\tsc --noEmit -p tsconfig.json
```

## Troubleshooting

- If assigned/transitions return zero rows, verify Jira user search can resolve the member. The backend has a directory fallback, but permissions still matter.
- If Advanced AI Search fails, check `GROQ_API_KEY` and `GROQ_MODEL`.
- If the frontend cannot call the backend, check `CORS_ORIGINS` and `VITE_API_BASE_URL`.
- If Build -> Pending QA shows no rows, confirm those historical transitions exist in Jira changelog.
- Rotate any credentials that were shown in screenshots or shared sessions.