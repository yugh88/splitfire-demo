import type { IncomingMessage, ServerResponse } from "node:http";
import { taskStore } from "../store/taskStore.js";
import { userStore } from "../store/userStore.js";
import { listNotifications } from "../services/notificationService.js";
import { sendJson } from "./respond.js";

export function handleHealth(
  req: IncomingMessage,
  res: ServerResponse,
  segments: string[],
): boolean {
  if (segments[0] !== "health") return false;
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "method_not_allowed", message: "health only supports GET" });
    return true;
  }

  sendJson(res, 200, {
    status: "ok",
    service: "taskly",
    uptimeSeconds: Math.round(process.uptime()),
    counts: { tasks: taskStore.count(), users: userStore.count() },
    notifications: listNotifications(5).length,
  });
  return true;
}
