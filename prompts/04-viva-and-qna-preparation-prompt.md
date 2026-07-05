# Viva and Q&A Preparation Prompt

Use this to generate expected evaluator questions and answers.

```text
Prepare a viva/interview question bank for a full-stack project named Developer Activity Reporting Web App.

Project summary:
The app uses Confluence Cloud as the team source and Jira Cloud as the issue/workflow source. A FastAPI backend exposes APIs. A React frontend consumes those APIs. The app generates Assigned Issues and Build to Pending QA reports and exports them to Excel.

Create at least 60 questions with answers, grouped by topic:

1. Basic project understanding
2. Jira concepts
3. Confluence concepts
4. Backend architecture
5. Frontend architecture
6. API design
7. Report logic
8. Assignee vs Actor
9. Authentication and security
10. Error handling
11. Testing
12. Deployment possibilities
13. Limitations and future scope

Questions should include:
- What problem does this project solve?
- What is a Jira issue?
- What is a Jira changelog?
- What is JQL?
- Why does Build to Pending QA need changelog data?
- What is the difference between assignee and actor?
- Why use FastAPI?
- Why use React?
- Why use TypeScript?
- Why use TanStack Query?
- How is Excel export generated?
- How are teams fetched from Confluence?
- What happens if Confluence table format is wrong?
- What happens if Jira credentials are wrong?
- Why should `.env` not be committed?
- What are the limitations of the current implementation?

Make answers clear and suitable for students presenting to faculty.
Do not include real credentials or tokens.
```
