# 01 - Project Overview

## Project Name

Developer Activity Reporting Web App

## One-Line Description

A full-stack web application that automatically creates developer activity reports by reading team membership from Confluence Cloud and issue/workflow data from Jira Cloud.

## Problem Statement

In many teams, developer activity reporting is done manually. A team lead may open Confluence to check team membership, open Jira to check assigned issues, inspect workflow status, and manually prepare a report in Excel or PowerPoint. This process is slow, repetitive, error-prone, and difficult to repeat every day or every sprint.

This project solves that problem by connecting directly to Confluence and Jira through APIs. The user selects a team, a team member, and an optional date range. The app then generates activity reports automatically and allows exporting the result to Excel.

## Main Goal

The goal is to build a working reporting tool that demonstrates:

- Real-time data fetching from Confluence Cloud.
- Real-time data fetching from Jira Cloud.
- Workflow transition analysis using Jira changelog history.
- Natural-language query interpretation for common reporting questions.
- A clean React dashboard for report generation.
- Excel export for business-friendly reporting.

## What the User Can Do

The user can:

1. Open the dashboard in the browser.
2. Ask a plain-English question such as `issues assigned to Yash this month`.
3. Select a team from Confluence data.
4. Select a member from the selected team.
5. Choose a date range or leave dates optional.
6. Generate the Assigned Issues report.
7. Generate the Build to Pending QA report.
8. Switch between assignee-based and actor-based transition matching.
9. Export either report to an Excel file.

## Reports Built in This Project

### Report 1 - Assigned Issues

This report answers:

> Which Jira issues are currently assigned to this developer?

It uses Jira issue fields. The most important field is `assignee`, which represents the current owner of the issue.

Example result:

| Issue | Summary | Status | Assignee |
|---|---|---|---|
| KAN-5 | Implement user authentication | Pending QA | Shubham |

### Report 2 - Build to Pending QA

This report answers:

> Which issues moved from Build to Pending QA?

It does not only look at the current status. It reads Jira's changelog/history and searches for status transitions where:

- `fromString` is `Build`
- `toString` is `Pending QA`

This is important because an issue may be in a different status now, but the app still needs to know whether it passed through Build to Pending QA during the selected time period.

## Key Terms

### Jira Issue

An issue is a Jira ticket or work item. It can represent a task, story, bug, epic, or subtask. In this project, examples are `KAN-5`, `KAN-6`, and `KAN-10`.

### Issue Key

The unique identifier of a Jira issue. Example: `KAN-5`.

### Assignee

The person currently responsible for the issue. This comes from `issue.fields.assignee`.

### Actor

The person who performed a particular action, such as moving an issue from Build to Pending QA. This comes from the changelog entry author.

### Status

The current workflow state of the issue, such as To Do, Build, Pending QA, or Done.

### Transition

A movement from one status to another. Example: Build to Pending QA.

### Changelog

Jira's history log. It records what changed, when it changed, and who changed it.

### Confluence Space

A container for pages in Confluence. This project uses a configured Confluence space key.

### Confluence Page

A documentation page. This project reads a page titled `Team Members`.

## Technologies Used

### Backend

- Python
- FastAPI
- httpx
- Pydantic v2
- pydantic-settings
- BeautifulSoup
- lxml
- openpyxl
- pytest

### Frontend

- React 18
- Vite
- TypeScript
- Material UI
- TanStack Query
- axios
- React Router
- Dayjs

### External Systems

- Jira Cloud REST API v3
- Confluence Cloud REST API v2

## Why This Project Is Useful

This project is useful because it connects engineering activity tools and creates meaningful reports automatically. It shows how real software teams can reduce manual reporting effort and increase reporting accuracy.

It also demonstrates practical full-stack development concepts:

- API integration
- Authentication with external services
- Frontend state management
- Backend service layering
- SOLID-oriented refactoring in backend orchestration
- Data transformation
- File export
- Error handling
- Environment-based configuration

## Final Outcome

The final result is a working web app at `http://localhost:5173` with a backend API at `http://localhost:8000`. It reads live data from Atlassian tools and displays reports in a user-friendly dashboard.
