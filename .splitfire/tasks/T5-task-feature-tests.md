# T5 · Test Task Reminders

Repo: yugh88/splitfire-demo @ 8a1f8fe · Branch: `splitfire/task-feature-tests`
Overall feature: Add task due dates and email reminders
Plan: https://splitfire-one.vercel.app/p/08a72ebd59b333cb
Suggested model: fast model (gemma-4-26b-a4b-it) · Estimate: 18 min

## Goal
Add unit and integration tests for due dates and notification triggers.

## Start (run from the repo root)
```sh
git worktree add ../splitfire-demo-task-feature-tests -b splitfire/task-feature-tests
cd ../splitfire-demo-task-feature-tests
```

Work only in this worktree. Every edit, check and commit in this session belongs to this task.

## Files you own (edit only these)
- `tests/taskService.test.ts`

## Context pack (read-only, do not edit)
- `src/services/errors.ts`
- `src/services/notificationService.ts`
- `src/services/taskService.ts`
- `src/services/userService.ts`
- `src/store/taskStore.ts`
- `src/store/userStore.ts`

## Before you start
- Wait for T4 (Implement Reminder Scheduler) to be merged.

## Done when
- [ ] `npx vitest run tests/taskService.test.ts`
- [ ] `git diff --name-only touches only owned files`

## Rules
- Change only the files you own. Other agents are editing the rest of the repo in parallel.
- If you truly need to change a file you do not own, stop and report it instead of editing it.
- Keep the change focused on the goal; no drive-by refactors.
- Commit with a plain message and no AI attribution trailers: no `Co-Authored-By`, no "Generated with" line, no tool names.
- Push the branch: `git push -u origin splitfire/task-feature-tests`. Push `splitfire/task-feature-tests`, do not merge.
