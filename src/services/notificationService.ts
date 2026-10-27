import type { Task, User } from "../types/index.js";
import { newId, nowIso, truncate } from "../utils/ids.js";
import { logger } from "../utils/logger.js";

export type NotificationKind = "task.assigned" | "task.completed" | "task.reminder";

export interface Notification {
  id: string;
  kind: NotificationKind;
  message: string;
  taskId: string;
  userId: string | null;
  createdAt: string;
}

export interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  body: string;
  kind: NotificationKind;
  taskId: string;
  userId: string | null;
  createdAt: string;
}

/** Transport used to leave the process; the default one only logs. */
export interface EmailTransport {
  send(message: EmailMessage): void | Promise<void>;
}

const MAX_FEED = 50;
const MAX_OUTBOX = 50;
const feed: Notification[] = [];
const outbox: EmailMessage[] = [];

const defaultTransport: EmailTransport = {
  send(message) {
    logger.info("email reminder dispatched", { taskId: message.taskId, to: message.to });
  },
};

let transport: EmailTransport = defaultTransport;

function push(entry: Notification): Notification {
  feed.unshift(entry);
  if (feed.length > MAX_FEED) feed.length = MAX_FEED;
  logger.info("notification queued", { kind: entry.kind, taskId: entry.taskId });
  return entry;
}

function parseDueDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDueDate(date: Date): string {
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

function deliverEmail(message: EmailMessage): void {
  outbox.unshift(message);
  if (outbox.length > MAX_OUTBOX) outbox.length = MAX_OUTBOX;
  try {
    void Promise.resolve(transport.send(message)).catch((error: unknown) => {
      logger.error("email delivery failed", {
        taskId: message.taskId,
        to: message.to,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  } catch (error) {
    logger.error("email delivery failed", {
      taskId: message.taskId,
      to: message.to,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Replace the outbound email transport; pass null to restore the logging default. */
export function setEmailTransport(next: EmailTransport | null): void {
  transport = next ?? defaultTransport;
}

export function notifyTaskAssigned(task: Task, assignee: User): Notification {
  return push({
    id: newId("ntf"),
    kind: "task.assigned",
    message: `${assignee.name} was assigned "${truncate(task.title)}"`,
    taskId: task.id,
    userId: assignee.id,
    createdAt: nowIso(),
  });
}

export function notifyTaskCompleted(task: Task, assignee?: User): Notification {
  return push({
    id: newId("ntf"),
    kind: "task.completed",
    message: assignee
      ? `${assignee.name} completed "${truncate(task.title)}"`
      : `"${truncate(task.title)}" was completed`,
    taskId: task.id,
    userId: assignee?.id ?? null,
    createdAt: nowIso(),
  });
}

/**
 * Queues an email reminder for a task that is approaching its due date.
 * Returns the queued email, or null when the task is not eligible: reminders are
 * disabled, there is no due date, or there is no assignee with an email address.
 */
export function notifyTaskReminder(task: Task, assignee?: User): EmailMessage | null {
  if (task.emailReminderEnabled !== true) return null;
  if (!task.dueDate) return null;
  if (!assignee?.email) return null;

  const due = parseDueDate(task.dueDate);
  if (!due) {
    logger.warn("task has an invalid due date; reminder skipped", {
      taskId: task.id,
      dueDate: task.dueDate,
    });
    return null;
  }

  const dueLabel = formatDueDate(due);
  const subject = `Reminder: "${truncate(task.title, 80)}" is due ${dueLabel}`;
  const message = newId("eml");
  const createdAt = nowIso();

  push({
    id: newId("ntf"),
    kind: "task.reminder",
    message: `Reminder sent to ${assignee.email} for "${truncate(task.title)}" (due ${dueLabel})`,
    taskId: task.id,
    userId: assignee.id,
    createdAt,
  });

  const email: EmailMessage = {
    id: message,
    to: assignee.email,
    subject,
    body: [
      `Hi ${assignee.name},`,
      "",
      `This is a reminder that "${task.title}" is due on ${dueLabel}.`,
      `Priority: ${task.priority}. Status: ${task.status}.`,
      "",
      "Taskly",
    ].join("\n"),
    kind: "task.reminder",
    taskId: task.id,
    userId: assignee.id,
    createdAt,
  };
  deliverEmail(email);
  return email;
}

export function listNotifications(limit = 20): Notification[] {
  return feed.slice(0, Math.max(0, limit));
}

export function listEmails(limit = 20): EmailMessage[] {
  return outbox.slice(0, Math.max(0, limit));
}

export function resetNotifications(): void {
  feed.length = 0;
  outbox.length = 0;
}
