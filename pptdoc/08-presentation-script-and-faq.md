# 08 - Presentation Script And FAQ

## One-Minute Opening

This project is a developer activity reporting dashboard built on Jira Cloud and Confluence Cloud. It reads team membership from Confluence, reads ticket and workflow history from Jira, and generates Assigned Issues and Transitions reports for a selected member. It also includes Groq-backed Advanced AI Search, where the app converts a natural-language prompt into structured intent and visible JQL so the user can verify exactly what was run.

## Technical Walkthrough

The frontend is React, Vite, TypeScript, Material UI, and TanStack Query. The backend is FastAPI with service/client layers. Confluence provides team data. Jira provides issue data, JQL search, and changelog history. Groq is used only for query planning; the backend still enforces project scope and resolves user names before executing anything.

Assigned Issues uses Jira's `assignee WAS` operator. Transitions uses Jira changelog replay so we can know the from status, to status, actor, timestamp, and assignee at the time of movement. The Build -> Pending QA report is retained as a filter inside the generalized Transitions tab.

## Demo Talking Points

- “This dropdown is live Confluence team data.”
- “Assigned Issues uses Jira's own assignment history, not our database.”
- “Transitions need changelog because current issue fields do not show who moved a ticket.”
- “Here is the Build -> Pending QA filter; it is now one option under all forward transitions.”
- “The AI feature is transparent because we show the executed JQL.”
- “The backend enforces project scope even if the LLM proposes broad JQL.”

## FAQ

### Does the app store Jira history?

No. It fetches Jira data live. Assignment history comes from `assignee WAS`; transition history comes from issue changelogs.

### Is Build -> Pending QA removed?

No. It is preserved as a transition filter. The app now also supports other one-step forward moves.

### Why use changelog for transitions?

Current issue fields only show the latest status and assignee. Changelog gives historical transitions with timestamp and author.

### What is the difference between assignee and actor?

Assignee means the person owned the issue at the transition time. Actor means the person performed the transition.

### How does Advanced AI Search work?

The backend sends the prompt to Groq with instructions to return JSON. The backend normalizes the plan, enforces project scope, resolves names to account IDs, executes the report or JQL, and returns the executed JQL.

### Can the LLM search outside the Jira project?

The backend prevents that by forcing the configured project key into custom JQL.

### Why show executed JQL?

It makes the AI feature auditable. Users can see exactly what Jira query was executed.

### Why account IDs instead of names?

Jira Cloud identifies users reliably by account ID. Display names can be ambiguous or hidden by privacy settings.

### What happens if Jira user search returns empty?

The backend falls back to the browsable user directory and filters by display name/email.

### What happens if Groq fails?

The backend returns a controlled error. The structured Assigned and Transitions reports still work without the AI query path.

### What should never be shown in a presentation?

Real Atlassian tokens, Groq keys, `.env` contents, or screenshots containing secrets.