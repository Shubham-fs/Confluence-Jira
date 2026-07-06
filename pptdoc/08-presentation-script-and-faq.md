# 08 - Presentation Script and FAQ

## 1-Minute Opening Script

Good morning/afternoon. Our project is called Developer Activity Reporting Web App. It is a full-stack application that automates developer activity reporting using Jira Cloud and Confluence Cloud.

In many teams, reporting is done manually. A team lead checks Confluence for team members, opens Jira to check assigned tickets, looks at workflow movement, and then prepares reports manually. Our app automates this process.

The user selects a team, a developer, and an optional date range. The app then generates two reports: Assigned Issues and Build to Pending QA transitions. It also allows exporting the result to Excel. The backend is built with FastAPI, and the frontend is built with React, Vite, TypeScript, and Material UI.

We also added a plain-English query box, so a user can ask a question like what did Yash move to QA last week and the app interprets it into the correct report.

## 5-Minute Technical Explanation Script

This project has four main parts: frontend, backend, Confluence, and Jira.

The frontend is a React dashboard. It gives the user dropdowns for team and member selection, date pickers for filtering, report tabs, and an export button. It does not directly talk to Jira or Confluence because that would expose credentials in the browser.

The dashboard also includes a plain-English query box that calls a dedicated backend endpoint. The backend parses the question and maps it to the same report flows already used by the manual filters.

The backend is built using FastAPI. It receives requests from the frontend, reads settings from `.env`, and uses an async HTTP client to communicate with Atlassian APIs. It has separate client classes for Jira and Confluence, service classes for business logic, routers for endpoints, and schemas for response validation.

In the natural-language path, we applied SOLID principles by separating parsing, member lookup, and report execution. The orchestration service depends on abstractions, which made the feature easier to test.

Confluence is used as the source of team membership. The app finds a Confluence page named Team Members, reads its storage-format body, parses the table, and returns teams and members to the frontend.

Jira is used as the source of work activity. For the Assigned Issues report, the backend searches Jira issues using JQL and filters by assignee account ID. For the Build to Pending QA report, the backend reads Jira changelog history for each candidate issue and detects status transitions from Build to Pending QA.

A key concept in this project is the difference between assignee and actor. Assignee is the person currently responsible for the ticket. Actor is the person who performed a specific action, such as moving a ticket from Build to Pending QA. These can be different people, so the app supports both reporting modes.

Finally, the Excel export feature uses openpyxl on the backend. When the user clicks Export, the backend regenerates the report data and returns an `.xlsx` file for download.

## Live Demo Script

### Demo Step 1 - Confluence

Show the Team Members page.

Say:

This Confluence page is the source of team data. It has a simple table with Team and Members columns. Our backend reads this page through the Confluence REST API and parses this table. That is why the app dropdowns are dynamic.

### Demo Step 2 - Jira

Show the Jira Kanban board.

Say:

This Jira project contains the actual issues. Each card is an issue or ticket. Each issue has a key like KAN-5, a summary, status, assignee, reporter, and history. The app uses Jira API to fetch this data.

### Demo Step 3 - App Dashboard

Open `http://localhost:5173`.

Say:

This is our custom dashboard. It connects to the FastAPI backend, not directly to Atlassian. The backend handles credentials and external API calls.

### Demo Step 4 - Select Team and Member

Select Team B and a member such as Shubham.

Say:

When we select the team, the member dropdown is populated from Confluence. When we select the member and click Generate, the backend resolves this member name to a Jira account ID.

### Demo Step 4A - Ask in Plain English

Type `what did Yash move to QA last week`.

Say:

This is our natural-language query feature. The backend interprets the text, detects the member, date range, and report type, then routes the request to the same reporting logic. It does not use a paid AI API; it is deterministic and testable.

### Demo Step 5 - Assigned Issues

Open Assigned Issues tab.

Say:

This report shows tickets currently assigned to the selected developer. It is based on the Jira issue assignee field.

### Demo Step 6 - Build to Pending QA

Open Build to Pending QA tab.

Say:

This report is based on Jira changelog. The backend scans history entries and finds status changes from Build to Pending QA.

### Demo Step 7 - Assignee vs Actor

Switch between By assignee and By actor.

Say:

By assignee means the ticket belongs to the selected developer. By actor means the selected developer personally performed the transition. This distinction is important because one person can own a ticket while another person moves it.

### Demo Step 8 - Export

Click Export to Excel.

Say:

The backend creates an Excel file from the report data and the browser downloads it. This makes the report easy to share.

## Backup Demo If Internet Fails

If live Atlassian APIs fail during presentation, use screenshots and explain:

- Confluence screenshot proves team source.
- Jira screenshot proves issue source.
- App screenshot proves dashboard behavior.
- Swagger screenshot proves backend endpoints.
- Excel screenshot proves export output.

Say:

The project depends on live cloud APIs, so internet and token permissions are required. The architecture and code are still valid, and the backup screenshots show the expected behavior.

## Team Speaking Division

### Speaker 1 - Introduction and Problem

Covers:

- Project title
- Problem statement
- Why automation is useful
- Technologies overview

### Speaker 2 - Backend and Integrations

Covers:

- FastAPI backend
- Confluence API
- Jira API
- Changelog logic
- Security

### Speaker 3 - Frontend and Demo

Covers:

- React dashboard
- User workflow
- Reports
- Excel export
- Live demo

## Frequently Asked Questions

### 1. What problem does this project solve?

It automates developer activity reporting by combining team data from Confluence and issue/workflow data from Jira.

### 2. What is a Jira issue?

A Jira issue is a ticket or work item. It may represent a task, story, bug, epic, or subtask.

### 3. What is an issue key?

An issue key is the unique ID of a Jira issue, such as KAN-5.

### 4. What is an assignee?

The assignee is the current owner or responsible person for a Jira issue.

### 5. What is an actor?

The actor is the person who performed a particular action, such as moving a ticket from Build to Pending QA.

### 6. Why can assignee and actor be different?

Because one person can own a ticket, but another person can move it in the workflow.

### 7. What is a Jira changelog?

It is the history log of an issue. It records what changed, when it changed, and who changed it.

### 8. Why does Build to Pending QA need changelog data?

Because the report is about a historical transition, not only the current status.

### 9. What is JQL?

JQL means Jira Query Language. It is used to search Jira issues.

### 10. Why use FastAPI?

FastAPI is fast, modern, supports async operations, and provides automatic API documentation.

### 11. Why use React?

React makes it easy to build interactive dashboards using reusable components.

### 12. Why use TypeScript?

TypeScript catches mistakes early by adding type checking to JavaScript.

### 13. Why use Material UI?

Material UI provides professional ready-made components such as forms, cards, tabs, and tables.

### 14. Why use TanStack Query?

It manages server data, loading states, errors, caching, and refetching.

### 15. Why use axios?

axios is a simple HTTP client for calling backend APIs from the frontend.

### 16. Why are credentials stored in backend `.env`?

Because frontend code is visible in the browser. Secrets must stay on the server.

### 17. What happens if Confluence page format changes?

The parser may fail or return empty teams. A future improvement would make table mapping configurable.

### 18. What happens if Jira credentials are wrong?

The backend returns an Atlassian authentication error and the frontend shows an error message.

### 19. Can this support multiple Jira projects?

Currently it uses one configured project key. It can be extended with a project selector.

### 20. Can this support other transitions?

Currently it detects Build to Pending QA. Future work can allow configurable source and target statuses.

### 21. Why is Excel export generated on backend?

Backend generation keeps export logic centralized and avoids exposing business rules to the browser.

### 22. Is the app using live data?

Yes, it reads live Confluence and Jira data through Atlassian APIs.

### 23. What are the main limitations?

It depends on correct Atlassian permissions, expects a specific Confluence table format, and currently tracks one workflow transition.

### 24. What are future improvements?

Charts, sprint filtering, multi-project support, configurable transitions, app login, deployment, and more detailed QA/reviewer role detection.

### 25. Does the app support natural-language queries?

Yes. A user can type a plain-English reporting question, and the backend interprets it into structured filters and the appropriate report.

### 26. Where were SOLID principles applied?

Mainly in the backend NL query design. Parsing, member lookup, and report execution were separated into smaller collaborators, and the orchestration service depends on abstractions instead of hard-coded concrete classes.

## Closing Script

To conclude, this project demonstrates a practical full-stack integration between Confluence, Jira, FastAPI, and React. It reduces manual reporting work, shows live developer activity, supports two report types, and exports results to Excel. The project also teaches important real-world concepts like API integration, secure configuration, changelog analysis, frontend state management, and backend service design.
