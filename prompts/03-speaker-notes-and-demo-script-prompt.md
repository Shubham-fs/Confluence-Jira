# Speaker Notes and Demo Script Prompt

Use this to prepare what each teammate should say during presentation and demo.

```text
Create a complete speaker script and demo script for a project presentation.

Project: Developer Activity Reporting Web App.

The project integrates:
- React + Vite + TypeScript frontend
- FastAPI backend
- Confluence Cloud team page
- Jira Cloud KAN project
- Excel export

Create:
1. Opening speech of 1 minute.
2. Technical explanation speech of 5-7 minutes.
3. Live demo script of 4-5 minutes.
4. Backup explanation if the live demo internet/API fails.
5. Closing speech of 30 seconds.
6. Division of speaking parts among 3 team members.

Demo script must include these steps:
- Show Confluence Team Members page and explain team source.
- Show Jira Kanban board and explain issue/status/assignee.
- Open frontend at http://localhost:5173.
- Select a team.
- Select a member.
- Explain date range filtering.
- Click Generate.
- Show Assigned Issues report.
- Open Build to Pending QA report.
- Explain Assignee vs Actor toggle.
- Export one report to Excel.
- Mention backend API docs at http://localhost:8000/docs.

Important explanations:
- Issue = Jira ticket/work item.
- Assignee = current owner of issue.
- Actor = person who performed a transition in changelog.
- Changelog = history of changes in Jira.
- Build to Pending QA = workflow transition detected by code.

Make the script natural, not robotic. Use simple words but keep technical correctness.
Do not include secrets or API tokens.
```
