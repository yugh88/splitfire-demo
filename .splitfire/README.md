# Splitfire plan: Add task due dates and email reminders

Repo: yugh88/splitfire-demo @ 8a1f8fe · https://splitfire-one.vercel.app/p/08a72ebd59b333cb

Serial 2h 01m → 1h 25m with 3 agents (1.4×) · collision score 0 · est. cost $0.000

Run each wave in parallel, one agent per task, each on its own `splitfire/<task id>` branch.
Start a wave when every task it waits for is merged. Every file has exactly one owner.

| Task | Wave | Kind | Title | Files | Waits for | Model | Estimate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T0 | 1 | contract | Update Task Types | 1 | — | fast | 11 min |
| T1 | 2 | feature | Update Task Service | 1 | T0 | fast | 18 min |
| T2 | 2 | feature | Update Task Routes | 1 | T0 | fast | 18 min |
| T3 | 2 | feature | Implement Email Notification Logic | 1 | T0 | strong | 28 min |
| T4 | 3 | feature | Implement Reminder Scheduler | 1 | T1, T3 | strong | 28 min |
| T5 | 4 | test | Test Task Reminders | 1 | T4 | fast | 18 min |

Prompts for each task are in `tasks/`. The full plan is in `plan.json`.

## How done-checks work

This pack includes `.github/workflows/splitfire-gates.yml`. Commit it next to `.splitfire/`.
Push a task branch named `splitfire/<task id>` (the id in the table above) and the workflow:

- validates the id against `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` and finds that task in `plan.json`;
- turns the task's acceptance list into commands, accepting known tools (npm, pnpm, yarn,
  npx, vitest, playwright, pytest, tsc, go, cargo) and file-exists checks only;
- runs those commands and reports a check run named after the branch on the pushed commit,
  with `success` or `failure` and a short summary.

Checks the parser cannot run (for example `git diff touches only owned files`) are listed as
manual in the summary and never executed. Commands only ever come from `plan.json`; commit
messages and branch names are never executed.
