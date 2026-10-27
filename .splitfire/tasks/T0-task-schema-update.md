# T0 · Update Task Types

Repo: yugh88/splitfire-demo @ 8a1f8fe · Branch: `splitfire/task-schema-update`
Overall feature: Add task due dates and email reminders
Plan: https://splitfire-one.vercel.app/p/08a72ebd59b333cb
Suggested model: fast model (gemma-4-26b-a4b-it) · Estimate: 11 min

## Goal
Add dueDate and emailReminderEnabled fields to Task and input types.

## Start (run from the repo root)
```sh
git worktree add ../splitfire-demo-task-schema-update -b splitfire/task-schema-update
cd ../splitfire-demo-task-schema-update
```

Work only in this worktree. Every edit, check and commit in this session belongs to this task.

## Files you own (edit only these)
- `src/types/task.ts`

## Done when
- [ ] `npm run typecheck`
- [ ] `git diff --name-only touches only owned files`

## Rules
- Change only the files you own. Other agents are editing the rest of the repo in parallel.
- If you truly need to change a file you do not own, stop and report it instead of editing it.
- Keep the change focused on the goal; no drive-by refactors.
- Commit with a plain message and no AI attribution trailers: no `Co-Authored-By`, no "Generated with" line, no tool names.
- Push the branch: `git push -u origin splitfire/task-schema-update`. Push `splitfire/task-schema-update`, do not merge.
