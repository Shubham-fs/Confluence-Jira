# 05 - Jira and Confluence Integration

## Why Atlassian Integration Matters

The core value of this project is that it does not use fake local data. It connects to real Atlassian tools:

- Confluence Cloud for team information.
- Jira Cloud for issue and workflow information.

This makes the reports live and realistic.

## Authentication

The backend authenticates to Atlassian using:

- Atlassian site URL
- Atlassian email
- Atlassian API token

These values are read from `Backend/.env`.

Important: real tokens should never be committed to GitHub or included in PPT screenshots.

## Confluence Integration

### What Confluence Provides

Confluence stores team membership. In this project, the app reads a page named `Team Members`.

The expected table looks like:

| Team | Members |
|---|---|
| Team A | Kashish, Arpita |
| Team B | Shubham, Yash, Ankit |

### Confluence API Steps

1. Resolve configured space key to space ID.
2. List pages in that space.
3. Find the page titled `Team Members`.
4. Download page body in storage format.
5. Parse the table.
6. Return teams and members to frontend.

### What Is Storage Format?

Confluence storage format is an XHTML-like representation of the page content. A table is returned as HTML-like tags such as `<table>`, `<tr>`, `<td>`, and `<p>`.

The backend uses BeautifulSoup and lxml to parse this safely.

### Why Parse Confluence Instead of Hardcoding Teams?

If team membership changes, users can update the Confluence page. The app then automatically reads the updated team list without code changes.

## Jira Integration

### What Jira Provides

Jira provides:

- Issues/tickets
- Issue summaries
- Current statuses
- Assignees
- Reporters
- Created and updated timestamps
- Changelog history
- User account IDs

## Jira Issue

A Jira issue is a work item. It may be a task, story, bug, epic, or subtask.

Example:

```text
KAN-5 - Implement user authentication
```

`KAN-5` is the issue key.

## Jira Status

A status is where the issue currently is in the workflow.

Examples:

- To Do
- Build
- Pending QA
- Done

## Jira Transition

A transition is a movement from one status to another.

Example:

```text
Build -> Pending QA
```

## Jira Changelog

The changelog is Jira's audit/history log. It records every important issue change.

A changelog entry can tell:

- What field changed.
- Old value.
- New value.
- Who changed it.
- When it changed.

This project depends on changelog for Build to Pending QA reporting.

## Jira User Resolution

Confluence may store member names like `Kashish`, but Jira may store the real display name as `Kashish Roy`. Jira Cloud uses `accountId` as the reliable user identifier.

The backend resolves names by calling Jira user search. It then matches the best user and uses that account ID for report queries.

## JQL

JQL means Jira Query Language. It is used to search Jira issues.

Example assigned issues query:

```text
project = KAN AND assignee = "ACCOUNT_ID" ORDER BY updated DESC
```

The app always includes `project = KAN` so the query is bounded and safe.

## Assigned Issues API Logic

To get assigned issues:

1. Resolve selected member to Jira account ID.
2. Build JQL with project and assignee.
3. Add optional updated date filters.
4. Search Jira.
5. Return issue fields to frontend.

## Build to Pending QA API Logic

To find Build to Pending QA transitions:

1. Search candidate issues in the project.
2. For each issue, fetch changelog.
3. Loop through changelog entries.
4. Find items where field is `status`.
5. Check if old status is `Build` and new status is `Pending QA`.
6. Record transition timestamp and author.
7. Apply assignee or actor rule.
8. Return rows to frontend.

## Assignee vs Actor in Jira

### Assignee

The assignee is the current owner of the issue. It comes from issue fields.

### Actor

The actor is the person who performed a specific action. For this project, actor means the changelog author who moved the issue from Build to Pending QA.

### Why They Can Be Different

A ticket can be assigned to Shubham, but Yash can move it to Pending QA. In that case:

- Assignee = Shubham
- Actor = Yash Gupta

This is why the app supports both filtering modes.

## Current Demo Data Concept

The demo uses a Jira project named KAN. It includes issues such as:

- KAN-5 Implement user authentication
- KAN-6 Design dashboard UI
- KAN-7 Set up CI/CD pipeline
- KAN-8 Add global search feature
- KAN-9 Refactor REST API layer
- KAN-10 Fix pagination bug

Some issues are in Pending QA and have real Build to Pending QA transitions. KAN-10 is in Build, so it should not appear in Build to Pending QA transition results.

## Board Column Note

In Jira team-managed projects, board column labels can be separate from status names. A column may display an old label even after the mapped status has been renamed. The app reads issue status and changelog status names from Jira data, not the visual column label.

## Integration Summary

Confluence answers: who is in each team?

Jira answers: what work exists and what happened to it?

The backend combines both sources into reports that are easy for humans to read.

For the natural-language query feature, Confluence also supplies the known
member names that help the parser resolve who the question refers to. Jira still
remains the source of report truth; the NL query layer only chooses which report
to run and with what filters.
