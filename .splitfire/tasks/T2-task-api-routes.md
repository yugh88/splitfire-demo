# T2 · Update Task Routes

Repo: yugh88/splitfire-demo @ 8a1f8fe · Branch: `splitfire/task-api-routes`
Overall feature: Add task due dates and email reminders
Plan: https://splitfire-one.vercel.app/p/08a72ebd59b333cb
Suggested model: fast model (gemma-4-26b-a4b-it) · Estimate: 18 min

## Goal
Expose due date and email reminder settings via the API endpoints.

## Start (run from the repo root)
```sh
git worktree add ../splitfire-demo-task-api-routes -b splitfire/task-api-routes
cd ../splitfire-demo-task-api-routes
```

Work only in this worktree. Every edit, check and commit in this session belongs to this task.

## Files you own (edit only these)
- `src/routes/tasks.ts`

## Context pack (read-only, do not edit)
- `src/routes/respond.ts`
- `src/services/errors.ts`
- `src/services/taskService.ts`
- `src/types/index.ts`
- `src/utils/validate.ts`

## Before you start
- Wait for T0 (Update Task Types) to be merged; build against the shared contracts in `src/types/task.ts`.

## Done when
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `git diff --name-only touches only owned files`

## Rules
- Change only the files you own. Other agents are editing the rest of the repo in parallel.
- If you truly need to change a file you do not own, stop and report it instead of editing it.
- Keep the change focused on the goal; no drive-by refactors.
- Commit with a plain message and no AI attribution trailers: no `Co-Authored-By`, no "Generated with" line, no tool names.
- Push the branch: `git push -u origin splitfire/task-api-routes`. Push `splitfire/task-api-routes`, do not merge.
