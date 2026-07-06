# 06 - Report Logic And Excel Export

## Report 1: Assigned Issues

Input:

- member
- optional from date
- optional to date

Processing:

1. Resolve member to account ID.
2. Build project-scoped JQL with `assignee WAS`.
3. Add date filters using issue `updated` if provided.
4. Return issue rows.

Output includes key, summary, status, current assignee, reporter, created, updated, and Jira URL.

## Report 2: Transitions

Input:

- member
- optional date range
- `rule=assignee|actor`
- optional `transition` destination status

Processing:

1. Search candidate issues in the Jira project.
2. Fetch changelog for each issue.
3. Extract one-step forward status transitions.
4. Reconstruct assignee at the transition timestamp.
5. Filter by assignee or actor rule.
6. Filter to a specific destination when `transition` is provided.

Output includes key, summary, from status, to status, transitioned at, performed by, assignee at transition time, and Jira URL.

## Report 3: Advanced AI Search

Input:

- free-form prompt

Processing:

1. Send prompt and team context to Groq.
2. Receive structured JSON plan.
3. Normalize report type, dates, members, JQL, and explanation.
4. Enforce project scope on custom JQL.
5. Resolve names to account IDs.
6. Execute the report/JQL.

Output includes the plan, explanation, executed JQL, and issue rows.

## Why Changelog Is Needed

Current Jira fields only show the current status and current assignee. Transition reports need historical facts:

- when the status changed,
- who performed the change,
- who was assigned at that moment.

That information comes from Jira changelog entries.

## Excel Export

The backend supports:

- `type=assigned`
- `type=transitions`

Exports regenerate report data using the submitted filters. This avoids trusting stale frontend table state. Filenames are sanitized before they are written into response headers.

## Limitations

- Results depend on Jira API permissions and available changelog history.
- Groq must return valid JSON for AI query planning.
- Workflow order must match the Jira board statuses for transition detection to be meaningful.