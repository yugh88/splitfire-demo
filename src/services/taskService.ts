import type { CreateTaskInput, Task, TaskFilter, UpdateTaskInput } from "../types/index.js";
import { taskStore } from "../store/taskStore.js";
import { userStore } from "../store/userStore.js";
import { newId, nowIso } from "../utils/ids.js";
import { logger } from "../utils/logger.js";
import { validateCreateTask, validateTaskPatch } from "../utils/validate.js";
import { badRequest, notFound } from "./errors.js";
import { notifyTaskAssigned, notifyTaskCompleted } from "./notificationService.js";

/**
 * Accepts a timestamp string or null and stores it in canonical ISO 8601 form so
 * that reminders can compare due dates without parsing quirks.
 */
function normalizeDueDate(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest("dueDate must be an ISO 8601 timestamp or null", ["invalid field: dueDate"]);
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw badRequest(`dueDate is not a valid timestamp: ${value}`, ["invalid field: dueDate"]);
  }
  return new Date(parsed).toISOString();
}

function normalizeEmailReminder(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw badRequest("emailReminderEnabled must be a boolean", [
      "invalid field: emailReminderEnabled",
    ]);
  }
  return value;
}

function pickDueDateFields(input: {
  dueDate?: string | null;
  emailReminderEnabled?: boolean;
}): {
  dueDate?: string | null;
  emailReminderEnabled?: boolean;
} {
  const picked: { dueDate?: string | null; emailReminderEnabled?: boolean } = {};
  if (input.dueDate !== undefined) picked.dueDate = normalizeDueDate(input.dueDate);
  if (input.emailReminderEnabled !== undefined) {
    picked.emailReminderEnabled = normalizeEmailReminder(input.emailReminderEnabled);
  }
  return picked;
}

export function listTasks(filter: TaskFilter = {}): Task[] {
  return taskStore.query(filter);
}

export function getTask(id: string): Task {
  const task = taskStore.findById(id);
  if (!task) throw notFound(`task ${id} was not found`);
  return task;
}

export function createTask(input: CreateTaskInput): Task {
  const check = validateCreateTask(input);
  if (!check.ok) {
    throw badRequest(`invalid task payload: ${check.errors.join("; ")}`, check.errors);
  }

  const dueFields = pickDueDateFields(input);
  const assigneeId = input.assigneeId ?? null;
  const assignee = assigneeId ? userStore.findById(assigneeId) : undefined;
  if (assigneeId && !assignee) throw notFound(`assignee ${assigneeId} was not found`);

  const timestamp = nowIso();
  const task: Task = {
    id: newId("tsk"),
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    status: "todo",
    priority: input.priority ?? "medium",
    assigneeId,
    dueDate: dueFields.dueDate ?? null,
    emailReminderEnabled: dueFields.emailReminderEnabled ?? false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  taskStore.save(task);
  logger.info("task created", { taskId: task.id });
  if (assignee) notifyTaskAssigned(task, assignee);
  return task;
}

export function updateTask(id: string, patch: UpdateTaskInput): Task {
  const existing = getTask(id);

  const { dueDate, emailReminderEnabled, ...core } = patch;
  const hasDueFields = dueDate !== undefined || emailReminderEnabled !== undefined;
  if (!hasDueFields || Object.keys(core).length > 0) {
    const check = validateTaskPatch(core);
    if (!check.ok) {
      throw badRequest(`invalid task patch: ${check.errors.join("; ")}`, check.errors);
    }
  }

  if (core.assigneeId) {
    if (!userStore.findById(core.assigneeId)) {
      throw notFound(`assignee ${core.assigneeId} was not found`);
    }
  }

  const dueFields = pickDueDateFields({ dueDate, emailReminderEnabled });
  const next: Task = {
    ...existing,
    ...core,
    assigneeId: core.assigneeId === undefined ? existing.assigneeId : core.assigneeId,
    dueDate: dueFields.dueDate === undefined ? existing.dueDate ?? null : dueFields.dueDate,
    emailReminderEnabled:
      dueFields.emailReminderEnabled ?? existing.emailReminderEnabled ?? false,
    updatedAt: nowIso(),
  };
  taskStore.save(next);
  logger.info("task updated", { taskId: id, status: next.status });

  if (core.status === "done" && existing.status !== "done") {
    const assignee = next.assigneeId ? userStore.findById(next.assigneeId) : undefined;
    notifyTaskCompleted(next, assignee);
  }
  return next;
}

export function deleteTask(id: string): void {
  if (!taskStore.delete(id)) throw notFound(`task ${id} was not found`);
  logger.info("task deleted", { taskId: id });
}
