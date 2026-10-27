import type { IncomingMessage, ServerResponse } from "node:http";
import type { CreateTaskInput, TaskFilter, UpdateTaskInput } from "../types/index.js";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../services/taskService.js";
import { badRequest } from "../services/errors.js";
import { isRecord, isTaskStatus } from "../utils/validate.js";
import { readJsonBody, sendJson, sendNoContent } from "./respond.js";

/** Fields that only exist on the wire contract, so the route validates them itself. */
interface ScheduleInput {
  dueDate?: string | null;
  emailReminderEnabled?: boolean;
}

/**
 * `dueDate` is an ISO 8601 timestamp, or null to clear it. The original string is
 * kept as-is so callers get back what they sent.
 */
function parseDueDate(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.trim().length === 0) {
    throw badRequest("dueDate must be an ISO 8601 timestamp or null");
  }
  const dueDate = value.trim();
  if (Number.isNaN(Date.parse(dueDate))) {
    throw badRequest(`dueDate is not a valid ISO 8601 timestamp: ${dueDate}`);
  }
  return dueDate;
}

function parseEmailReminder(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw badRequest("emailReminderEnabled must be true or false");
  }
  return value;
}

function parseScheduleInput(body: Record<string, unknown>): ScheduleInput {
  const schedule: ScheduleInput = {};
  if ("dueDate" in body) schedule.dueDate = parseDueDate(body.dueDate);
  if ("emailReminderEnabled" in body) {
    schedule.emailReminderEnabled = parseEmailReminder(body.emailReminderEnabled);
  }
  return schedule;
}

/** Passes non-object bodies through untouched so the service reports the usual error. */
function normalizeTaskInput<T>(body: unknown): T {
  if (!isRecord(body)) return body as T;
  return { ...body, ...parseScheduleInput(body) } as T;
}

function parseFilter(query: URLSearchParams): TaskFilter {
  const filter: TaskFilter = {};
  const status = query.get("status");
  if (status) {
    if (!isTaskStatus(status)) throw badRequest(`unknown status filter: ${status}`);
    filter.status = status;
  }
  const assigneeId = query.get("assigneeId");
  if (assigneeId) filter.assigneeId = assigneeId;
  const search = query.get("search");
  if (search) filter.search = search;
  return filter;
}

export async function handleTasks(
  req: IncomingMessage,
  res: ServerResponse,
  segments: string[],
  query: URLSearchParams,
): Promise<boolean> {
  if (segments[0] !== "tasks") return false;
  const id = segments[1];

  if (id === undefined) {
    if (req.method === "GET") {
      sendJson(res, 200, { data: listTasks(parseFilter(query)) });
      return true;
    }
    if (req.method === "POST") {
      const body = normalizeTaskInput<CreateTaskInput>(await readJsonBody(req));
      sendJson(res, 201, { data: createTask(body) });
      return true;
    }
  } else if (req.method === "GET") {
    sendJson(res, 200, { data: getTask(id) });
    return true;
  } else if (req.method === "PATCH") {
    const body = normalizeTaskInput<UpdateTaskInput>(await readJsonBody(req));
    sendJson(res, 200, { data: updateTask(id, body) });
    return true;
  } else if (req.method === "DELETE") {
    deleteTask(id);
    sendNoContent(res);
    return true;
  }

  sendJson(res, 405, { error: "method_not_allowed", message: `${req.method} is not supported here` });
  return true;
}
