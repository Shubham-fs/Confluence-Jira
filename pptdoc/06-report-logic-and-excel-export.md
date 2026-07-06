# 06 - Report Logic and Excel Export

## Report 1 - Assigned Issues

### Purpose

The Assigned Issues report shows Jira issues currently assigned to the selected developer.

It answers:

> What tickets does this developer own?

### Inputs

- member: selected team member name
- from: optional start date
- to: optional end date

### Processing Steps

1. Frontend sends member and dates to backend.
2. Backend resolves member name to Jira account ID.
3. Backend builds JQL query.
4. Backend calls Jira search API.
5. Jira returns matching issues.
6. Backend extracts fields and returns clean JSON.
7. Frontend displays a table.

### Important Fields

- key
- summary
- status
- assignee
- reporter
- created
- updated
- url

### Example Output Row

| Key | Summary | Status | Assignee |
|---|---|---|---|
| KAN-5 | Implement user authentication | Pending QA | Shubham |

## Report 2 - Build to Pending QA

### Purpose

The Build to Pending QA report shows issues that moved from Build to Pending QA.

It answers either:

- Whose work reached QA?
- Who moved work to QA?

The selected rule decides which question is answered.

## Why Changelog Is Needed

Current issue status is not enough.

Example:

1. Issue moves from Build to Pending QA.
2. Later it moves from Pending QA to Done.
3. Current status is Done.
4. If we check only current status, we miss the Build to Pending QA event.

Therefore, the app reads Jira changelog, which stores historical transitions.

## Transition Detection Logic

The app loops through Jira changelog entries and checks each changed item.

It accepts only changes where:

```text
field = status
fromString = Build
toString = Pending QA
```

For every match, it captures:

- transition time
- actor name
- actor account ID

## Assignee Rule

Rule value: `assignee`

Meaning:

> Include a transition if the issue is currently assigned to the selected member.

Use this when you want to know whose tickets reached QA.

Example:

- KAN-5 is assigned to Shubham.
- Yash moved KAN-5 to Pending QA.
- In assignee mode for Shubham, KAN-5 appears.

## Actor Rule

Rule value: `actor`

Meaning:

> Include a transition if the selected member performed the transition.

Use this when you want to know who actually moved tickets to QA.

Example:

- KAN-5 is assigned to Shubham.
- Yash moved KAN-5 to Pending QA.
- In actor mode for Yash, KAN-5 appears.
- In actor mode for Shubham, KAN-5 does not appear.

## Date Range Logic

Dates are optional.

If from date exists:

```text
transition date must be >= from
```

If to date exists:

```text
transition date must be <= to
```

If a date is missing, that side is treated as open.

## Report Response Shape

### Assigned Report

```json
{
  "member": "Shubham",
  "account_id": "...",
  "from": "2026-01-01",
  "to": "2026-12-31",
  "count": 2,
  "issues": []
}
```

### Build to Pending QA Report

```json
{
  "member": "Shubham",
  "account_id": "...",
  "rule": "assignee",
  "from": "2026-01-01",
  "to": "2026-12-31",
  "count": 2,
  "issues": []
}
```

## Excel Export

### Purpose

Excel export makes the report easy to share with managers, faculty, or teammates.

### Backend Endpoint

```text
GET /api/reports/export
```

Parameters:

- `type=assigned` or `type=build-to-qa`
- `member=...`
- `from=...` optional
- `to=...` optional
- `rule=assignee|actor` for Build to Pending QA

### Export Flow

1. Frontend sends export request.
2. Backend regenerates the selected report.
3. Backend creates workbook using openpyxl.
4. Backend writes report rows into worksheet.
5. Backend returns workbook bytes.
6. Browser downloads the file.

## Why Regenerate on Export?

The backend regenerates the report during export instead of exporting frontend table state. This ensures:

- Export data is fresh.
- Export logic is centralized.
- Frontend stays simple.
- Excel file matches backend report rules.

## User-Facing Report Meaning

### Assigned Issues

Best for daily workload view.

Questions answered:

- What is assigned to this developer?
- What status are their issues in?
- Which tickets are still open?

### Build to Pending QA

Best for workflow activity view.

Questions answered:

- Which tickets reached QA?
- Who owns the tickets that reached QA?
- Who performed the transition?
- When did work move from development to QA?

## Natural-Language Query Logic

The natural-language feature is an interpretation layer above the two existing
reports, not a third independent report engine.

Processing steps:

1. Read the plain-English text.
2. Match a known member name.
3. Detect whether the request means Assigned Issues or Build to Pending QA.
4. Detect optional rule and date range.
5. Run the matching report service.
6. Return both the interpretation and the report payload.

Example response concept:

```json
{
  "query": "what did Yash move to QA last week",
  "interpretation": {
    "report_type": "build-to-qa",
    "member": "Yash Gupta",
    "from": "2026-06-29",
    "to": "2026-07-05",
    "rule": "actor"
  },
  "build_to_qa": {}
}
```

## Limitations

- The app currently tracks one specific transition: Build to Pending QA.
- It uses current assignee for assignee rule, not historical assignee at transition time.
- Reviewer/QA custom field inference is not fully implemented.
- Confluence parsing expects a simple table format.
- Jira API permissions must allow issue search and changelog reading.

## Future Enhancements

- Replace the rule-based parser with an LLM-backed strategy behind the same parser abstraction, if broader language support is needed.
- Allow configurable source and target statuses.
- Track historical assignee at transition time.
- Add sprint filtering.
- Add project selector.
- Add team-level summary charts.
- Add reviewer/QA role detection from custom fields.
- Add authentication for app users.
- Add deployment to cloud hosting.

## Summary

Report 1 uses current Jira issue fields. Report 2 uses historical Jira changelog. Excel export converts both report types into downloadable files.
