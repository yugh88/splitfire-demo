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
import { isTaskStatus } from "../utils/validate.js";
import { readJsonBody, sendJson, sendNoContent } from "./respond.js";

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
      const body = (await readJsonBody(req)) as CreateTaskInput;
      sendJson(res, 201, { data: createTask(body) });
      return true;
    }
  } else if (req.method === "GET") {
    sendJson(res, 200, { data: getTask(id) });
    return true;
  } else if (req.method === "PATCH") {
    const body = (await readJsonBody(req)) as UpdateTaskInput;
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
