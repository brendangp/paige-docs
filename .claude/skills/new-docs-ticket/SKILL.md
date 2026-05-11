# /new-docs-ticket — Capture Paige Docs Change Requests as Linear Tickets

disable-model-invocation: true

## Description

Create Linear tickets for changes you want made to the paige-docs site. Use this when you're reviewing the public docs and want to capture "this is wrong / this is missing / this should change" as a tracked item to implement later — either via `/update-docs <id>` or by hand.

This skill creates tickets in the same Linear project that `/update-docs` reads from, and uses a body shape that `/update-docs` can tell apart from PR-spawned tickets (no `## Parent PR` section = manual ticket = skip the diff pull).

This skill runs INSIDE paige-docs. It does NOT modify files in the repo or push commits. Its only side-effect is creating Linear issues.

## Usage

Three modes, picked from arguments:

- **One-liner** — `/new-docs-ticket <page-or-area> — <what's wrong / what should change>`
  Example: `/new-docs-ticket projects.mdx — Suspending section is wrong about manual control`

- **Interactive** — `/new-docs-ticket` (no args). Asks for page(s), problem, desired change via `AskUserQuestion`.

- **Batch** — `/new-docs-ticket --batch`. Prompts you to paste a list (one ticket idea per line, numbered or bulleted is fine). Drafts all, shows the full set in one review, creates them on Approve.

All three modes end at the same approval gate before any Linear write happens.

## Prerequisites

1. Linear MCP connected. Required tools: `mcp__linear__save_issue`, `mcp__linear__list_issues`, `mcp__linear__get_issue`, `mcp__linear__list_teams`, `mcp__linear__list_issue_labels`.
2. Run from the paige-docs repo root (or any subdirectory thereof).

If a prerequisite is missing, stop and tell the user before doing anything else.

## Instructions

When invoked, perform the steps below **in order**. Use `AskUserQuestion` for any user prompts; never ask via plain chat.

### Step 1 — Parse the invocation

Inspect the arguments passed to the skill:

- No arguments → **Interactive** mode.
- First argument is `--batch` → **Batch** mode.
- Anything else (page name, free text, em-dash, etc.) → **One-liner** mode. Treat the entire argument string as the user's raw input.

### Step 2 — Resolve Linear team / project / label IDs (cached)

Read `.claude/skills/new-docs-ticket/.cache.json` if present. Expected shape:

```json
{
  "teamId": "...",
  "teamKey": "PAI",
  "projectId": "...",
  "docsLabelId": "..."
}
```

If the cache is present and all four fields are non-empty, use them and skip the rest of this step.

If the cache is missing or incomplete, discover the values:

1. Call `mcp__linear__list_issues` with a filter for issues whose title starts with `Docs:`. Take the most recent hit. Read its `team.id` / `team.key` / `project.id` (if any) / `labels[].id` (find the one named `docs`, case-insensitive).
2. If no `Docs:` ticket exists yet, fall back to `mcp__linear__list_teams`. If there's exactly one team, use it. If there's more than one, ask the user via `AskUserQuestion` which team docs tickets should land in.
3. For the `docs` label: call `mcp__linear__list_issue_labels` on the chosen team. Find one named `docs` (case-insensitive). If none exists, leave `docsLabelId` empty — the skill will create tickets without a label rather than auto-creating one.
4. For the project: if no existing `Docs:` ticket existed to copy from, ask the user via `AskUserQuestion` whether to file these in a specific Linear project or leave them at the team root.
5. Write the result to `.claude/skills/new-docs-ticket/.cache.json` for next time.

Hard rule: do NOT auto-create a Linear label, project, or team. If the discovery fails and the user declines to pick one in a prompt, abort cleanly with an explanation.

### Step 3 — Draft the ticket(s)

The draft format every ticket must use:

- **Title:** `Docs: <short summary, sentence case, no trailing period>`
- **Description:**
  ```
  ## Problem

  <what's wrong / what's missing / what's misleading>

  ## Desired change

  <what should happen instead — be concrete enough that the implementer doesn't have to guess>

  ## Pages

  - <repo-relative path, e.g. concepts/projects.mdx>

  ## Source

  Manually created via /new-docs-ticket on YYYY-MM-DD.
  ```

The `## Source` line and the **absence of `## Parent PR`** are the markers that `/update-docs` uses to recognise a manual ticket. Do not invent a parent PR section. Do not omit the source line.

Mode-specific drafting rules:

**One-liner mode.** Treat the raw input as `<page-or-area> <separator> <description>`. Common separators: ` — `, ` - `, `: `, `, `. Split on the first separator found; left side is the page hint, right side is the description.

- Map the page hint to a real MDX path. If the user wrote `projects.mdx`, search the repo for `**/projects.mdx` and use the match. If multiple match, ask via `AskUserQuestion`. If none match, keep the raw hint and flag at the approval gate.
- Draft a title from the description (first ~70 chars, trimmed, leading verb-form preferred — "Suspending section is wrong about manual control" → `Docs: Fix Suspending section's manual-control framing`).
- Put the description into `## Problem`. Leave `## Desired change` populated with a best-effort rephrasing of what the user said, prefixed with the literal string `(inferred — edit if wrong) ` so the user knows to check it during approval.

**Interactive mode.** Ask via a single `AskUserQuestion` call with up to 4 questions (multiSelect false unless noted):

1. "Which page(s) does this affect?" — accept comma-separated.
2. "What's the problem?" — free text.
3. "What should change?" — free text.
4. "Add a priority?" — options: No priority (default, recommended) / Low / Medium / High / Urgent.

Build the title from the problem field's first sentence.

**Batch mode.** Ask via `AskUserQuestion` for the user to paste their list. Split on newlines, ignore blank lines and pure-bullet/number prefixes. For each non-empty line, run the one-liner-mode drafting logic. Show all drafted tickets in the Step 4 review as a numbered list.

### Step 4 — Show drafts and confirm

Render the draft(s) for review:

```
About to create N ticket(s) in <team key> / <project name or "(no project)">:

1. Docs: Fix Suspending section's manual-control framing
   Pages: concepts/projects.mdx
   Problem: ...
   Desired: (inferred — edit if wrong) ...

2. ...
```

Then `AskUserQuestion` with three options:

- **Approve all** → continue to Step 5.
- **Edit** → ask "Which ticket and what should change?" (number + free-text correction). Apply the correction, re-render, re-confirm. Loop until Approve or Cancel.
- **Cancel** → exit cleanly. No tickets created.

If the user revises a single field on a single ticket, only re-render that ticket's block, not the whole batch.

### Step 5 — Create the tickets in Linear

For each approved draft, call `mcp__linear__save_issue` with:

- `teamId` — from cache
- `projectId` — from cache, only if non-empty
- `title` — the drafted title (must start with `Docs:`)
- `description` — the drafted body
- `labelIds` — `[docsLabelId]` if cached, else omit
- `priority` — only if the user explicitly chose one in interactive mode; never default a priority
- DO NOT set `stateId` — let Linear apply the team's default workflow state (Backlog/Todo)
- DO NOT set `assigneeId`

Capture the returned issue identifier (e.g., `PAI-87`) and URL for each created ticket.

If any single `save_issue` call fails, log the error inline and continue with the remaining drafts. Do not abort the whole batch on a single failure.

### Step 6 — Report

Print a concise summary:

```
Created N docs ticket(s):
  PAI-87  Docs: Fix Suspending section's manual-control framing
          https://linear.app/.../issue/PAI-87
  PAI-88  ...

Next step: implement with `/update-docs PAI-87` (or any of the above).
```

If one or more `save_issue` calls failed, list those separately with the error message and instruct the user to retry just those (`/new-docs-ticket` interactive mode is the fastest path).

## Hard rules (the skill must NEVER violate)

- Never modify any files in the paige-docs repo other than `.claude/skills/new-docs-ticket/.cache.json`.
- Never run `git` commands. This skill is read-only with respect to the working tree.
- Never include a `## Parent PR` section in a ticket body — that's the marker for `/update-docs` to pull a diff, and there is no diff.
- Never auto-create a Linear team, project, or label. Discover or ask, never invent.
- Never set ticket priority by default. Only set it if the user picked one in interactive mode.
- Never set ticket `stateId` or `assigneeId`. Let Linear default the state and leave assignee unset.
- Never abort the entire batch because one ticket failed. Per-ticket failures are reported and the rest proceed.
- Never skip Step 4's approval gate.

## Verification (run these manually after first build)

1. **First-run discovery.** Delete `.claude/skills/new-docs-ticket/.cache.json` if it exists. Run `/new-docs-ticket projects.mdx — test ticket, please ignore`. Expect: skill discovers team/project/label IDs from an existing `Docs:` ticket (or prompts if none), caches them, then drafts the ticket and asks for approval. On Approve, ticket is created.

2. **One-liner happy path.** Run `/new-docs-ticket concepts/flows.mdx — Add a note about flow versioning`. Expect: title drafted from the description, page resolved to the existing MDX path, `(inferred — edit if wrong)` prefix on the desired-change field, approval gate shown.

3. **Interactive happy path.** Run `/new-docs-ticket`. Expect: four `AskUserQuestion` prompts (pages, problem, desired, priority), then a draft preview and approval gate.

4. **Batch mode.** Run `/new-docs-ticket --batch`, paste 3 lines like:
   ```
   1. projects.mdx — Suspending section is wrong about manual control
   2. concepts/bot-code.mdx — Remove remaining named tool references
   3. agents/help-agent.mdx — Replace draft note with real screenshot
   ```
   Expect: 3 drafts shown together, single approval gate, 3 Linear tickets created on Approve.

5. **Edit at approval.** During the approval gate of a batch, choose Edit and revise ticket #2's title. Expect: only #2's block re-renders, full list re-shown, approval gate re-asked.

6. **Cancel at approval.** Choose Cancel. Expect: no Linear writes, working tree clean, no `.cache.json` mutation beyond what Step 2 wrote.

7. **Per-ticket failure isolation.** Manually break one ticket's draft (e.g., have its title not start with `Docs:` by editing the draft mid-flow). Expect: the offending ticket is rejected at Step 5, the remaining tickets in the batch are still created, and the Step 6 report cleanly separates successes from failures.

8. **Shape compatibility with /update-docs.** Create a ticket with this skill, then run `/update-docs <new-id> --dry-run`. Expect (once /update-docs is patched to handle manual tickets): no diff-pull step is attempted, the dry-run proposes edits derived from `## Problem` + `## Desired change` + `## Pages`. Until /update-docs is patched, expect it to abort gracefully with a "no parent PR" message — that's fine for now and confirms the marker works.

## Notes for future work

- A small patch to `.claude/skills/update-docs/SKILL.md` will let it consume tickets created by this skill: when Step 1 doesn't find a `## Parent PR` section, skip Steps 2–3 and draft directly from `## Problem` / `## Desired change` / `## Pages`. Not in scope for this skill, but worth doing once you've used `/new-docs-ticket` enough to validate the body shape.
