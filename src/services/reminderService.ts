import type { Task } from "../types/index.js";
import { taskStore } from "../store/taskStore.js";
import { userStore } from "../store/userStore.js";
import { logger } from "../utils/logger.js";
import { notifyTaskReminder } from "./notificationService.js";
import type { EmailMessage } from "./notificationService.js";

export interface ReminderOptions {
  /** How far ahead of a due date a reminder is sent. Defaults to 24 hours. */
  lookaheadMs?: number;
}

export interface SchedulerOptions extends ReminderOptions {
  /** How often the scheduler scans for upcoming due dates. Defaults to 1 minute. */
  intervalMs?: number;
}

export interface ReminderRunResult {
  /** Tasks with reminders enabled and a due date inside the lookahead window. */
  due: number;
  /** Reminder emails queued during this run. */
  sent: EmailMessage[];
}

const DEFAULT_LOOKAHEAD_MS = 24 * 60 * 60 * 1000;
const DEFAULT_INTERVAL_MS = 60 * 1000;

/** Task id → the due date a reminder was already sent for. */
const reminded = new Map<string, string>();
let timer: NodeJS.Timeout | null = null;

function isUpcoming(task: Task, now: number, lookaheadMs: number): boolean {
  if (task.status === "done" || task.emailReminderEnabled !== true || !task.dueDate) {
    return false;
  }
  const due = Date.parse(task.dueDate);
  if (Number.isNaN(due)) return false;
  return due > now && due <= now + lookaheadMs;
}

/** Forget tasks that were deleted or whose due date changed, so a new date gets its own reminder. */
function pruneReminded(): void {
  for (const [taskId, dueDate] of reminded) {
    if (taskStore.findById(taskId)?.dueDate !== dueDate) reminded.delete(taskId);
  }
}

/**
 * Scans all tasks once and queues an email reminder for each open task that has
 * reminders enabled and is due within the lookahead window. Each task is reminded
 * at most once per due date.
 */
export function runReminderCheck(
  now: Date = new Date(),
  options: ReminderOptions = {},
): ReminderRunResult {
  const lookaheadMs = options.lookaheadMs ?? DEFAULT_LOOKAHEAD_MS;
  const nowMs = now.getTime();
  pruneReminded();

  const result: ReminderRunResult = { due: 0, sent: [] };
  for (const task of taskStore.list()) {
    if (!isUpcoming(task, nowMs, lookaheadMs)) continue;
    result.due += 1;
    if (reminded.get(task.id) === task.dueDate) continue;

    const assignee = task.assigneeId ? userStore.findById(task.assigneeId) : undefined;
    const email = notifyTaskReminder(task, assignee);
    if (email && task.dueDate) {
      reminded.set(task.id, task.dueDate);
      result.sent.push(email);
    }
  }

  if (result.sent.length > 0) {
    logger.info("task reminders sent", { due: result.due, sent: result.sent.length });
  }
  return result;
}

/** Starts the periodic reminder scan. Calling it while already running is a no-op. */
export function startReminderScheduler(options: SchedulerOptions = {}): void {
  if (timer) return;
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const tick = (): void => {
    try {
      runReminderCheck(new Date(), options);
    } catch (error) {
      logger.error("reminder check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
  timer = setInterval(tick, intervalMs);
  // Do not keep the process alive just for reminders.
  timer.unref();
  logger.info("reminder scheduler started", { intervalMs });
  tick();
}

export function stopReminderScheduler(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  logger.info("reminder scheduler stopped");
}

export function isReminderSchedulerRunning(): boolean {
  return timer !== null;
}

/** Stops the scheduler and forgets which reminders were sent (for tests). */
export function resetReminders(): void {
  stopReminderScheduler();
  reminded.clear();
}
