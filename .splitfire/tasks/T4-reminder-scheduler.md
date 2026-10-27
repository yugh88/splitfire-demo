# T4 · Implement Reminder Scheduler

Repo: yugh88/splitfire-demo @ 8a1f8fe · Branch: `splitfire/reminder-scheduler`
Overall feature: Add task due dates and email reminders
Plan: https://splitfire-one.vercel.app/p/08a72ebd59b333cb
Suggested model: strong model (gemma-4-26b-a4b-it) · Estimate: 28 min

## Goal
Create a background process/service to check for upcoming due dates and trigger notifications.

## Start (run from the repo root)
```sh
git worktree add ../splitfire-demo-reminder-scheduler -b splitfire/reminder-scheduler
cd ../splitfire-demo-reminder-scheduler
```

Work only in this worktree. Every edit, check and commit in this session belongs to this task.

## Files you own (edit only these)
- `src/services/reminderService.ts`

## Before you start
- Wait for T1 (Update Task Service) to be merged.
- Wait for T3 (Implement Email Notification Logic) to be merged.

## Done when
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `test -f src/services/reminderService.ts`
- [ ] `git diff --name-only touches only owned files`

## Rules
- Change only the files you own. Other agents are editing the rest of the repo in parallel.
- If you truly need to change a file you do not own, stop and report it instead of editing it.
- Keep the change focused on the goal; no drive-by refactors.
- Commit with a plain message and no AI attribution trailers: no `Co-Authored-By`, no "Generated with" line, no tool names.
- Push the branch: `git push -u origin splitfire/reminder-scheduler`. Push `splitfire/reminder-scheduler`, do not merge.
