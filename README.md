# Developer Activity Reporting (Jira Cloud + Confluence Cloud)

Full-stack web app that automates developer activity reporting. It reads team
membership from **Confluence Cloud**, reads issues and workflow history from
**Jira Cloud**, and generates reports for a selected team member over a date
range.

The user selects a **Team**, a **Team member**, and a **Date range** and gets:

- **Report 1 — Assigned Issues**: all Jira issues assigned to the developer in
  the range.
- **Report 2 — Build → Pending QA**: issues that transitioned from status
  `Build` to `Pending QA`, matched either by the current **assignee** or by the
  **actor** who performed the transition (toggle via `rule=assignee|actor`).
- Both reports can be exported to Excel (`.xlsx`).

## Structure
```
Confluence-Jira/
  Backend/    # FastAPI + httpx + pydantic v2 (see Backend/README.md)
  Frontend/   # React + Vite + TypeScript + MUI (see Frontend/README.md)
```

## Quick start

### 1. Backend
```powershell
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env      # fill in Atlassian site, email, token
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend
```powershell
cd Frontend
npm install
copy .env.example .env      # VITE_API_BASE_URL=http://localhost:8000
npm run dev                 # http://localhost:5173
```

## How to verify
1. **Health**: open http://localhost:8000/api/health → `{ "status": "ok" }`.
2. **Docs**: open http://localhost:8000/docs (interactive Swagger UI).
3. **Teams**: on the dashboard, the Team dropdown lists teams from Confluence.
4. **Members**: selecting a team populates the Member dropdown.
5. **Report 1**: pick a member + date range → **Generate** → Assigned Issues tab.
6. **Report 2**: switch to the Build → Pending QA tab, try both rule toggles.
7. **Export**: click **Export to Excel** on either report to download an `.xlsx`.

## Security notes
- Secrets live only in `Backend/.env` (git-ignored). Never commit real tokens.
- `.env.example` files document the required keys with empty values.

## Tests
```powershell
cd Backend
pytest
```
Covers the Confluence table parser and the Build → Pending QA detector.
