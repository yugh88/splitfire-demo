import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleHealth } from "./routes/health.js";
import { handleTasks } from "./routes/tasks.js";
import { handleUsers } from "./routes/users.js";
import { parseRequest, sendJson } from "./routes/respond.js";
import { ServiceError } from "./services/errors.js";
import { logger } from "./utils/logger.js";

const PORT = Number(process.env.PORT ?? 3000);

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { segments, query } = parseRequest(req);

  if (segments.length === 0) {
    sendJson(res, 200, {
      name: "Taskly",
      description: "A tiny task tracker API. Demo repo for Splitfire.",
      health: "/health",
      resources: ["/tasks", "/users"],
    });
    return;
  }
  if (handleHealth(req, res, segments)) return;
  if (await handleTasks(req, res, segments, query)) return;
  if (await handleUsers(req, res, segments)) return;

  sendJson(res, 404, { error: "not_found", message: `no route for ${req.method} ${req.url}` });
}

function handleError(error: unknown, res: ServerResponse): void {
  if (res.headersSent) {
    res.end();
    return;
  }
  if (error instanceof ServiceError) {
    sendJson(res, error.status, {
      error: error.code,
      message: error.message,
      details: error.details,
    });
    return;
  }
  logger.error("unhandled error", {
    message: error instanceof Error ? error.message : String(error),
  });
  sendJson(res, 500, { error: "internal_error", message: "something went wrong" });
}

export const server = createServer((req, res) => {
  route(req, res).catch((error: unknown) => handleError(error, res));
});

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => logger.info("taskly listening", { port: PORT }));
}
