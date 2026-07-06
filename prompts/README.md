# Prompts Pack For Project PPT

This folder contains prompts for generating presentation material from the current Developer Activity Reporting project.

Use them in order:

1. `01-master-ppt-generation-prompt.md` - full deck structure.
2. `02-slide-by-slide-content-prompt.md` - expanded slide content.
3. `03-speaker-notes-and-demo-script-prompt.md` - spoken notes and live demo.
4. `04-viva-and-qna-preparation-prompt.md` - viva/interview Q&A.

Important rules:

- Do not paste real Atlassian tokens, Groq keys, or `.env` values into any AI tool.
- Describe credentials only as environment variables.
- Use screenshots from the running app and Jira board only after hiding secrets.

The prompts now cover:

- Groq-backed Advanced AI Search.
- Visible executed JQL.
- Project-scope enforcement for AI-proposed JQL.
- Assigned history via Jira `assignee WAS`.
- Transition history via Jira changelog replay.
- Build -> Pending QA preserved as a transition filter.
- Name-to-accountId fallback.
- Excel export and setup/testing workflow.