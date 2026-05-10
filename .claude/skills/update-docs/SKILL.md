# /update-docs — Apply Public Docs Updates From a Linear Docs Ticket

disable-model-invocation: true

## Description

Take a "Docs: ..." ticket spawned by `/open-pr` (in the paige repo) and write the public docs updates: read the parent PR's diff, draft MDX changes against the right pages in this paige-docs repo, commit direct to main, and mark the ticket Done.

This skill runs INSIDE paige-docs, not paige. It pushes direct to main, matching the existing paige-docs policy.

## Usage

- `/update-docs <docs-ticket-id>` — full pipeline: ticket → diff → draft → commit → push → Done
- `/update-docs <docs-ticket-id> --dry-run` — produce the proposed MDX edits but do not commit, push, or update Linear

## Prerequisites

1. Linear MCP connected (`mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_comment`, `mcp__linear__list_issue_statuses`).
2. `gh` CLI authenticated (used to read the parent PR's diff).
3. Run from the paige-docs repo root (or any subdirectory thereof).
4. The `mintlify:mintlify` skill is available (used for component reference on demand).

If any prerequisite is missing, stop and tell the user before doing anything else.

## Instructions

When invoked, perform the steps below **in order**. Use `AskUserQuestion` for the approval gate; never ask via plain chat. Use Read/Edit/Bash for file work.

### Step 1 — Read the docs ticket

Call `mcp__linear__get_issue <docs-ticket-id>`. Extract from the description:

- **Title** — must start with `Docs:`. If not, abort: "Ticket `<id>` doesn't look like an /open-pr-spawned docs ticket (title doesn't start with 'Docs:'). Aborting."
- **Parent PR URL** — under the `## Parent PR` heading
- **Branch name** — under the `## Branch` heading (the value in backticks)
- **Likely pages to touch** — the bulleted list under `## Likely pages to touch`
- **Parent ticket ID** — the `[PAI-N]` reference in the opening line; capture both the key and the issue URL

Cache all of this in memory for the rest of the run.

### Step 2 — Pull the parent PR diff

Extract the PR number from the parent PR URL (e.g., `https://github.com/.../pull/42` → `42`). Run:

```bash
gh pr diff <PR#>
```

Cache the diff. If `gh` errors or the diff is empty, abort with the underlying error — there's nothing to document.

### Step 3 — Read the parent feature ticket for voice/context

Call `mcp__linear__get_issue <parent-id>` (the `[PAI-N]` from step 1). Extract:

- Original title
- "Why now" / summary / opening paragraph from the description
- User-facing description if any

This is what gives the docs voice — explain WHY users care about this change, not just WHAT the code does.

### Step 4 — Read candidate paige-docs pages

For each page in the ticket's likely-pages list, Read the MDX file at the repo root. Pages exist directly under the repo root (e.g., `quickstart.mdx`) or under topic folders (`concepts/`, `guides/`, `templates/`).

If the diff strongly suggests a page that isn't on the list (e.g., the diff modifies a billing-credits view but the list only had `concepts/conversations.mdx`), add it. This skill is allowed to widen scope when the diff makes the case obvious.

If a page in the list doesn't exist on disk, drop it from scope and note it — `/open-pr`'s mapping is best-effort, not authoritative.

### Step 5 — Consult mintlify:mintlify on demand

If the change requires a Mintlify component you haven't seen in the existing MDX you Read in step 4 (Card, Tabs, CodeGroup, AccordionGroup, Steps, Frame, Tooltip, Note, Warning, Tip, Info, Check, ParamField, ResponseField, etc.), invoke the `mintlify:mintlify` skill via the `Skill` tool to get the correct syntax. Don't guess component shapes — Mintlify is strict and the build will reject malformed components.

If everything you need is already used elsewhere in the existing pages, skip this step — copy patterns from sibling MDX instead.

### Step 6 — Draft the MDX edits

Produce concrete `Edit` operations for each affected page. Surgical, not rewrites:

- **User-facing voice.** Present tense, second person ("you can …"), no implementation jargon ("the service", "the route handler", "JSON column").
- **Match heading hierarchy.** If the page uses `## Section` then `### Subsection`, mirror that depth. Don't introduce a new H1 mid-page.
- **Screenshot placeholders.** Mark missing images as `<!-- TODO: screenshot of <what> -->` rather than inventing image paths. The user can fill them in later.
- **Examples grounded in the diff.** Code samples must reflect the actual API/UI shape after the parent PR. No speculative parameters.
- **Append a one-liner to `changelog.mdx`** for any user-visible feature. Format: a single bullet under the latest release section (or a new dated section if none matches today).

Do not bundle unrelated changes into a single Edit. One Edit per logical section per page makes the Step 7 review readable.

### Step 6.5 — Self-review the draft

Before showing the user at Step 7, re-read the drafted Edits against the four checks below. This step has no user prompt — silently revise the draft if issues are found, then proceed.

1. **Diff coverage** — every user-visible behavior change in the parent PR diff has a corresponding doc update. If a flag, field, button label, or new page is added in code but unmentioned in the draft, add it.
2. **Voice match** — the new prose tone matches adjacent paragraphs on the same page (user-facing, present tense, no implementation jargon).
3. **Technical accuracy** — every behavioral claim in the draft is grounded in the diff or in code Read during this run. Remove any speculative content (e.g., "this also works with X" when X isn't in the diff).
4. **Changelog** — `changelog.mdx` has a one-liner for any user-visible feature; the entry mentions what users can now do, not internal implementation.

If the draft passes all four, continue. If a check fails, revise the relevant Edit before Step 7.

### Step 7 — Show proposed changes and confirm

Render a summary:

```
Proposed changes for <docs-ticket-id>:
  - guides/billing.mdx (+12, -3) — Add "Auto top-up" subsection under "Buying credits"
  - changelog.mdx (+4) — Release note for PAI-42

Continue? [Approve / Edit / Cancel]
```

`AskUserQuestion` with three options:
- **Approve** → continue to Step 8.
- **Edit** → ask "What should change?", revise the draft based on the answer, re-render, re-confirm. Loop until Approve or Cancel.
- **Cancel** → exit cleanly. No changes applied, no Linear update.

If `--dry-run` was passed on invocation, instead of `AskUserQuestion`, print the proposed Edit operations as unified diffs and exit. Do not apply, do not commit, do not update Linear.

### Step 8 — Apply the edits

Use the `Edit` tool for each drafted change. Use `Read` first if you haven't already (the Edit/Write tool contract). Don't bundle unrelated changes — one Edit per logical section per page.

If an Edit fails (string not found in file because the file was modified between step 4 and step 8 — unlikely but possible), abort cleanly with the error and instruct the user to re-run. Do not partial-apply.

### Step 9 — Commit and push (direct to main)

This repo's policy is direct-to-main. Do NOT create a branch. Skip if `--dry-run`.

1. `git status --porcelain` to confirm only the planned files are dirty. If unexpected files appear, abort and report — don't auto-add.
2. `git add <each file edited>` — explicitly enumerate. Never `git add -A` or `git add .`.
3. Build the commit message and pass via heredoc:
   ```bash
   git commit -m "$(cat <<'EOF'
   docs: <one-line summary, derived from parent ticket title>

   Updates for <PAI-N> — <parent ticket title>.
   Closes <docs-ticket-id>.

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```
4. `git push`. If push fails (branch protection, upstream changed), abort with the git error. Do NOT force-push.
5. Capture the commit SHA from `git rev-parse HEAD` for the Linear update.

### Step 10 — Mark the docs ticket Done

Skip if `--dry-run`.

1. Resolve the "Done" state ID. Read `.claude/skills/update-docs/.states-cache.json` if present. Else call `mcp__linear__list_issue_statuses` for the team, find a state whose name matches "Done" (or closest equivalent like "Completed", "Shipped"), cache it.
2. Call `mcp__linear__save_issue` with `id: <docs-ticket-id>` and `stateId: <done-id>`.
3. Call `mcp__linear__save_comment` on the docs ticket with body:
   ```
   Applied docs updates: <SHA> at <repo-url>/commit/<SHA>.
   Pages touched: <comma-separated list>.
   ```
   Use the actual repo URL from `git remote get-url origin` (strip `.git` suffix; convert SSH form to HTTPS if needed).

If either Linear call fails, log a warning but don't undo the commit — the commit is the source of truth, the Linear update is bookkeeping.

### Step 11 — Report

Print a concise summary:

```
✓ Docs updated for <docs-ticket-id>
  Commit: <SHA>
  Pages:  <comma-separated list>
  Linear: marked Done
```

For `--dry-run`:
```
✓ Dry run for <docs-ticket-id>
  Proposed changes printed above. No commit, no push, no Linear update.
  Re-run without --dry-run to apply.
```

## Hard rules (the skill must NEVER violate)

- Never edit MDX files outside the paige-docs repo.
- Never create a new MDX page without explicit Step 7 approval. New pages affect site nav (`docs.json`) and need the user's call.
- Never modify `docs.json` automatically. If a new page IS approved at Step 7, surface a "nav change needed in docs.json" note in the final report and let the user wire it in — don't auto-edit nav.
- Never `git push --force`.
- Never use `--no-verify` on git commands.
- Never `git add -A` or `git add .` — always enumerate files.
- Never `git commit --amend` — always create a new commit.
- Never skip Step 7's approval gate (unless `--dry-run`, in which case there's nothing to approve).
- Never call any Linear MCP tool that mutates state other than `save_issue` (status update) and `save_comment` (the completion comment).

## Verification (run these manually after first build)

1. **Dry run:** Pick a real "Docs: ..." ticket, run `/update-docs <id> --dry-run`. Expect: proposed Edits printed as diffs, no files changed, no commit, no Linear update.

2. **Happy path:** Run `/update-docs <id>` for the same ticket. Expect: Step 7 approval shown with the same proposed changes; on Approve → edits applied, single `docs:` commit on main, push succeeds, Linear ticket moves to Done with a comment listing the SHA and pages touched.

3. **Cancel at approval:** Run `/update-docs <id>`, click Cancel at Step 7. Expect: no edits applied, working tree unchanged, no commit, no Linear update.

4. **Bad ticket shape:** Manually create a Linear ticket whose title doesn't start with "Docs:". Run `/update-docs <id>`. Expect: aborts in Step 1 with the shape-mismatch message.

5. **Mintlify component path:** For a ticket whose change suggests using a Mintlify component not already in the target page (e.g., first-time `<Steps>` use), observe that the skill consults `mintlify:mintlify` (visible as a Skill invocation) before drafting.

6. **New-page suggestion:** Run on a ticket whose diff would reasonably justify a brand-new page. Expect: Step 7 surfaces the proposed new page as an explicit item, requiring Approve to proceed; on Approve, the file is created but the report flags "nav change needed in docs.json" without touching it.
