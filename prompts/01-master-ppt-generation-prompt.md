# Master PPT Generation Prompt

Copy and paste this prompt into a presentation AI tool.

```text
Create a detailed technical PowerPoint presentation for a project named "Developer Activity Reporting Web App".

The project is a full-stack application that integrates Confluence Cloud and Jira Cloud. It reads team membership from a Confluence page named "Team Members", reads Jira issues and changelog history from a Jira project named KAN, and generates developer activity reports in a React dashboard. It has a FastAPI backend and a React + Vite + TypeScript frontend.

Audience:
- College project evaluators, teammates, and beginner developers.
- Assume the audience understands basic web development but not Jira/Confluence APIs.

Tone:
- Clear, technical, practical, and presentation-ready.
- Explain every important term: issue, assignee, actor, changelog, transition, JQL, API, backend, frontend, CORS, environment variables, Excel export.

Required slide deck structure:
1. Title slide
2. Problem statement
3. Why this project is useful
4. Main objectives
5. Technologies used
6. High-level architecture
7. User workflow
8. Confluence integration: team fetching
9. Jira integration: issue fetching
10. Jira changelog integration: Build to Pending QA detection
11. Report 1: Assigned Issues
12. Report 2: Build to Pending QA
13. Assignee vs Actor explanation
14. Backend architecture
15. Frontend architecture
16. API endpoints
17. Data flow sequence
18. Excel export feature
19. Security and environment variables
20. Error handling and validation
21. Live demo plan
22. Testing and verification
23. Limitations
24. Future enhancements
25. Conclusion
26. Q&A slide

Project details to include:
- Backend framework: FastAPI.
- Backend language: Python.
- Backend HTTP client: httpx async client.
- Backend validation: Pydantic v2 and pydantic-settings.
- Backend Excel export: openpyxl.
- Backend Confluence parsing: BeautifulSoup + lxml.
- Frontend framework: React 18.
- Frontend build tool: Vite.
- Frontend language: TypeScript.
- UI library: Material UI.
- Data fetching: TanStack Query and axios.
- Date handling: Dayjs.
- Routing: React Router.
- Backend port: 8000.
- Frontend port: 5173.

Important backend endpoints:
- GET /api/health
- GET /api/teams
- GET /api/teams/{team}/members
- GET /api/reports/assigned?member=...&from=...&to=...
- GET /api/reports/build-to-qa?member=...&from=...&to=...&rule=assignee|actor
- GET /api/reports/export?type=assigned|build-to-qa&member=...

Explain the reports:
- Assigned Issues report shows Jira issues currently assigned to the selected developer.
- Build to Pending QA report scans each issue changelog and finds status changes where fromString is "Build" and toString is "Pending QA".
- Rule = assignee means include the issue if the current assignee is the selected member.
- Rule = actor means include the transition if the changelog author is the selected member.

Explain Jira terms:
- Issue means a ticket/work item.
- Issue key means unique ID like KAN-5.
- Status means workflow state such as To Do, Build, Pending QA, Done.
- Transition means moving an issue from one status to another.
- Changelog means Jira's history log of who changed what and when.
- Assignee means who owns the ticket.
- Actor means who performed a specific action.

Explain Confluence terms:
- Space means a knowledge/documentation area.
- Page means a document inside a space.
- Storage format means Confluence's internal XHTML-like body format.
- The app parses a table with columns Team and Members.

For each slide, provide:
- Slide title
- 4-6 bullet points
- Suggested visual diagram or screenshot
- Speaker notes of 80-120 words

Make the deck detailed enough that a teammate can present the project even if they did not build it.
Do not include real API tokens or credentials.
```
