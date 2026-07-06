# Slide-by-Slide Content Expansion Prompt

Use this after creating the first PPT outline.

```text
Expand the following project into a complete slide-by-slide technical presentation.

Project name: Developer Activity Reporting Web App.

Core idea:
The application automates developer activity reporting by connecting to Confluence Cloud for team membership and Jira Cloud for issues and workflow history. The user selects a team, member, and optional date range. The app generates two reports: Assigned Issues and Build to Pending QA transitions. The user can export both reports as Excel files.

The application also includes a natural-language query box that interprets common reporting questions and routes them to the correct backend report.

Please write detailed slide content for these sections:

1. Project introduction
- What the project does
- Why manual reporting is time-consuming
- How automation helps managers/team leads/developers

2. Data sources
- Confluence provides teams and members
- Jira provides issue details
- Jira changelog provides transition history

3. Backend explanation
- FastAPI receives requests from frontend
- Settings are loaded from `.env`
- httpx AsyncClient talks to Atlassian APIs
- JiraClient wraps Jira API calls
- ConfluenceClient wraps Confluence API calls
- TeamService parses Confluence table
- ReportService creates reports
- ExcelService creates .xlsx files

4. Frontend explanation
- React app shows dashboard
- Dashboard includes a plain-English query box
- Team dropdown calls /api/teams
- Member dropdown calls /api/teams/{team}/members
- Date picker creates optional date filters
- Generate button triggers report queries
- Tabs show assigned issues and Build to Pending QA
- Export button downloads Excel

4A. Natural-language query explanation
- Frontend calls `/api/reports/query`
- Backend detects member, date range, report type, and rule
- The returned interpretation auto-fills filters and opens the correct tab
- The feature is deterministic, not dependent on an external AI API

5. Report logic
- Assigned Issues uses JQL: project = KAN AND assignee = accountId
- Build to Pending QA searches project issues, fetches changelog for each issue, finds status transitions from Build to Pending QA
- Assignee rule checks current issue assignee
- Actor rule checks changelog author

6. API endpoints
Explain each endpoint, its purpose, parameters, and response.

Also explain where SOLID principles were applied in the backend NL query implementation.

7. Security
- Real tokens are stored only in Backend/.env
- .env is ignored by git
- .env.example documents required variables without secrets
- CORS allows the local frontend origin

8. Demo flow
- Open Jira board
- Show Confluence Team Members page
- Open app at localhost:5173
- Select Team B and Shubham
- Generate assigned issues
- Generate Build to Pending QA report
- Toggle assignee/actor
- Export Excel

For each slide, include:
- Title
- Main bullets
- Short explanation paragraph
- Suggested screenshot/diagram
- Speaker notes

Make the explanation beginner-friendly but technically accurate.
Do not invent credentials.
Do not include any real tokens.
```
