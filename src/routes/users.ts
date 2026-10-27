import type { IncomingMessage, ServerResponse } from "node:http";
import type { CreateUserInput } from "../types/index.js";
import { createUser, deleteUser, getUser, listUsers } from "../services/userService.js";
import { readJsonBody, sendJson, sendNoContent } from "./respond.js";

export async function handleUsers(
  req: IncomingMessage,
  res: ServerResponse,
  segments: string[],
): Promise<boolean> {
  if (segments[0] !== "users") return false;
  const id = segments[1];

  if (id === undefined) {
    if (req.method === "GET") {
      sendJson(res, 200, { data: listUsers() });
      return true;
    }
    if (req.method === "POST") {
      const body = (await readJsonBody(req)) as CreateUserInput;
      sendJson(res, 201, { data: createUser(body) });
      return true;
    }
  } else if (req.method === "GET") {
    sendJson(res, 200, { data: getUser(id) });
    return true;
  } else if (req.method === "DELETE") {
    sendJson(res, 200, { data: deleteUser(id) });
    return true;
  }

  sendJson(res, 405, { error: "method_not_allowed", message: `${req.method} is not supported here` });
  return true;
}
