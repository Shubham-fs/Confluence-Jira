# 05 - Jira And Confluence Integration

## Confluence

The app reads a Confluence page containing a Team Members table. The backend parses that page into team names and member lists. The frontend uses this data for cascading Team -> Member dropdowns.

## Jira Concepts Used

- **Issue fields**: summary, status, assignee, reporter, created, updated.
- **JQL**: query language for searching issues.
- **Changelog**: chronological issue history, including status and assignee changes.
- **Account ID**: stable Jira Cloud user identifier.
- **Status workflow**: configured order such as `To Do,Build,Pending QA,Done`.

## Assigned History

Assigned Issues uses Jira's history-aware JQL operator:

```jql
assignee WAS "accountId"
```

This finds tickets that were assigned to the person at any time. The app does not need to store this assignment history.

## Transition History

Jira JQL can find issues, but it does not directly return every status movement with actor and assignee-at-that-time. For this, the backend fetches each issue changelog and scans status changes.

The report keeps only adjacent forward moves. With `To Do,Build,Pending QA,Done`, the accepted transitions are:

- `To Do -> Build`
- `Build -> Pending QA`
- `Pending QA -> Done`

## Build -> Pending QA

Build -> Pending QA is not removed. It is a specific transition filter in the Transitions report:

```text
transition=Pending QA
```

## Name To Account ID

Users can type/select names such as `Kashish`. The backend resolves names to Jira account IDs before building JQL. If Jira's query user search returns empty, the backend falls back to the browsable user directory and filters locally.

## Security Boundary

The browser never sees Atlassian or Groq secrets. All external API calls go through the FastAPI backend.