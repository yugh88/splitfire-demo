import type { Task, User } from "../types/index.js";
import { newId, nowIso, truncate } from "../utils/ids.js";
import { logger } from "../utils/logger.js";

export type NotificationKind = "task.assigned" | "task.completed";

export interface Notification {
  id: string;
  kind: NotificationKind;
  message: string;
  taskId: string;
  userId: string | null;
  createdAt: string;
}

const MAX_FEED = 50;
const feed: Notification[] = [];

function push(entry: Notification): Notification {
  feed.unshift(entry);
  if (feed.length > MAX_FEED) feed.length = MAX_FEED;
  logger.info("notification queued", { kind: entry.kind, taskId: entry.taskId });
  return entry;
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

export function listNotifications(limit = 20): Notification[] {
  return feed.slice(0, Math.max(0, limit));
}

export function resetNotifications(): void {
  feed.length = 0;
}
