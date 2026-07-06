# 07 - Setup, Run, Demo, and Testing

## Project Folder Structure

```text
Confluence-Jira/
  Backend/
    app/
    requirements.txt
    .env.example
  Frontend/
    src/
    package.json
    .env.example
  prompts/
  pptdoc/
  README.md
```

## Backend Setup

Open PowerShell in the `Backend` folder.

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Then fill `.env` with local values:

```text
ATLASSIAN_SITE=https://your-site.atlassian.net
ATLASSIAN_EMAIL=your-email@example.com
ATLASSIAN_TOKEN=your-api-token
JIRA_PROJECT_KEY=KAN
CONFLUENCE_SPACE_KEY=BT
CORS_ORIGINS=http://localhost:5173
```

Never commit `.env` to GitHub.

## Run Backend

```powershell
uvicorn app.main:app --reload --port 8000
```

Backend URL:

```text
http://localhost:8000
```

Swagger docs:

```text
http://localhost:8000/docs
```

Natural-language query endpoint:

```text
http://localhost:8000/api/reports/query?q=what%20did%20Yash%20move%20to%20QA%20last%20week
```

Health check:

```text
http://localhost:8000/api/health
```

Expected result:

```json
{"status":"ok"}
```

## Frontend Setup

Open PowerShell in the `Frontend` folder.

```powershell
npm install
copy .env.example .env
```

Frontend `.env` should point to backend:

```text
VITE_API_BASE_URL=http://localhost:8000
```

## Run Frontend

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Windows Notes

On some Windows systems, Node or Python may not be available in PATH. If needed, use full paths or add them to PATH.

PowerShell may block npm scripts. Temporary fix:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

## Demo Preparation Checklist

Before presentation:

- Backend is running on port 8000.
- Frontend is running on port 5173.
- Jira credentials are valid.
- Confluence page exists and has Team/Members table.
- Jira project has issues assigned to demo users.
- Some issues have Build to Pending QA changelog transitions.
- Browser is logged in to Atlassian.
- Excel export works.
- Screenshots are ready as backup.

## Live Demo Script

### Step 1 - Show Confluence Team Members

Open the Confluence page. Explain:

- This is the source of team data.
- The app reads this table automatically.
- Changing this table changes dropdown data in the app.

### Step 2 - Show Jira Board

Open Jira board. Explain:

- Each card is a Jira issue.
- Status columns represent workflow stages.
- Assignee avatar shows who owns each issue.
- Issues have history/changelog behind the scenes.

### Step 3 - Open App

Open:

```text
http://localhost:5173
```

Explain:

- This dashboard is custom-built.
- It combines Confluence team data and Jira issue data.

### Step 4 - Select Team

Choose a team, for example Team B.

Explain:

- Team list came from Confluence.
- Members are loaded dynamically for the selected team.

### Step 4A - Ask in Plain English

Type a question such as:

```text
what did Yash move to QA last week
```

Explain:

- The frontend sends this text to `/api/reports/query`.
- The backend interprets the member, dates, and report type.
- The dashboard auto-fills the filters and opens the correct tab.

### Step 5 - Select Member

Choose Shubham or Yash.

Explain:

- Backend resolves this name to Jira account ID.
- Jira account ID is used for accurate searching.

### Step 6 - Generate Assigned Issues

Click Generate and open Assigned Issues tab.

Explain:

- Backend sends JQL to Jira.
- Results show issues assigned to selected member.

### Step 7 - Generate Build to Pending QA

Open Build to Pending QA tab.

Explain:

- Backend checks Jira changelog for Build to Pending QA transitions.
- This is historical activity, not just current status.

### Step 8 - Explain Assignee vs Actor

Toggle between By assignee and By actor.

Explain:

- Assignee means ticket owner.
- Actor means person who moved the ticket.
- They can be different people.

### Step 9 - Export Excel

Click Export to Excel.

Explain:

- Backend generates an .xlsx file using openpyxl.
- This can be shared outside the app.

## Testing Backend

From Backend folder:

```powershell
pytest
```

Tests cover:

- Confluence table parsing.
- Build to Pending QA transition detection.
- Natural-language query parsing.
- NLQ service orchestration through injected abstractions.

## Manual Verification

Use these checks:

1. Open `/api/health`.
2. Open `/api/teams`.
3. Open `/api/reports/assigned?member=Shubham`.
4. Open `/api/reports/build-to-qa?member=Shubham`.
5. Open `/api/reports/query?q=issues%20assigned%20to%20Yash%20this%20month`.
6. Try Excel export.
7. Confirm frontend displays same data.

## Common Problems

### Backend not starting

Possible causes:

- Virtual environment not activated.
- Dependencies not installed.
- Wrong Python version.
- `.env` missing.

### Frontend not loading

Possible causes:

- npm packages not installed.
- Vite server not running.
- Wrong backend URL.

### Empty teams

Possible causes:

- Confluence space key wrong.
- Page title not exactly `Team Members`.
- Table format incorrect.
- Token lacks permission.

### Empty reports

Possible causes:

- Member does not exist in Jira.
- No assigned issues.
- Date range excludes results.
- No Build to Pending QA transitions in changelog.

### Export not downloading

Possible causes:

- Backend error.
- Browser popup/download restriction.
- Invalid report params.

## GitHub Safety

Before pushing:

```powershell
git status
git ls-files | Select-String -Pattern "\.env"
```

Only `.env.example` should be tracked, not `.env`.

## Summary

To run the project, start backend first, then frontend. The demo should show Confluence data, Jira board data, dashboard reports, assignee vs actor toggle, and Excel export.
