# 04 - Viva And Q&A Preparation Prompt

Prepare viva/interview questions and model answers for the Developer Activity Reporting project.

## Project Facts To Use

- React/Vite/TypeScript frontend.
- FastAPI backend.
- Confluence Cloud provides team membership.
- Jira Cloud provides issues, JQL search, and changelog history.
- Groq powers Advanced AI Search.
- Assigned Issues uses `assignee WAS`.
- Transitions uses changelog replay.
- Build -> Pending QA is preserved as a transition filter.
- Custom JQL is project-scoped before execution.
- Display names are resolved to Jira account IDs.
- Excel export is generated backend-side.

## Generate Q&A For These Areas

1. Overall architecture.
2. Why FastAPI and React were chosen.
3. How Confluence teams are parsed.
4. How Jira JQL is used.
5. Why `assignee WAS` is needed.
6. Why changelog is required for transitions.
7. Difference between assignee and actor.
8. How Build -> Pending QA is still available.
9. How Groq AI Search works.
10. Why the UI displays executed JQL.
11. How project-scope enforcement prevents unsafe LLM queries.
12. How names become account IDs.
13. What happens when Jira user search returns empty.
14. Error handling and validation.
15. Testing strategy.
16. Security and secrets handling.
17. Limitations and future improvements.

## Include Strong Answers For

- “Are you storing user history?”
- “Is it using JQL?”
- “How do you know who moved a ticket?”
- “Why not rely only on current issue fields?”
- “Can the LLM access credentials?”
- “Can the LLM query another project?”
- “What if Groq is down?”
- “What if two users have similar names?”
- “How would you scale this for many projects?”

Answers should be concise, technically accurate, and presentation-ready.