import type { CreateTaskInput, Task, TaskFilter, UpdateTaskInput } from "../types/index.js";
import { taskStore } from "../store/taskStore.js";
import { userStore } from "../store/userStore.js";
import { newId, nowIso } from "../utils/ids.js";
import { logger } from "../utils/logger.js";
import { validateCreateTask, validateTaskPatch } from "../utils/validate.js";
import { badRequest, notFound } from "./errors.js";
import { notifyTaskAssigned, notifyTaskCompleted } from "./notificationService.js";

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
  const check = validateTaskPatch(patch);
  if (!check.ok) {
    throw badRequest(`invalid task patch: ${check.errors.join("; ")}`, check.errors);
  }

  if (patch.assigneeId) {
    if (!userStore.findById(patch.assigneeId)) {
      throw notFound(`assignee ${patch.assigneeId} was not found`);
    }
  }

  const next: Task = {
    ...existing,
    ...patch,
    assigneeId: patch.assigneeId === undefined ? existing.assigneeId : patch.assigneeId,
    updatedAt: nowIso(),
  };
  taskStore.save(next);
  logger.info("task updated", { taskId: id, status: next.status });

  if (patch.status === "done" && existing.status !== "done") {
    const assignee = next.assigneeId ? userStore.findById(next.assigneeId) : undefined;
    notifyTaskCompleted(next, assignee);
  }
  return next;
}

export function deleteTask(id: string): void {
  if (!taskStore.delete(id)) throw notFound(`task ${id} was not found`);
  logger.info("task deleted", { taskId: id });
}
