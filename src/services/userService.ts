import type { CreateUserInput, User } from "../types/index.js";
import { taskStore } from "../store/taskStore.js";
import { userStore } from "../store/userStore.js";
import { newId, nowIso } from "../utils/ids.js";
import { logger } from "../utils/logger.js";
import { validateCreateUser } from "../utils/validate.js";
import { badRequest, conflict, notFound } from "./errors.js";

export function listUsers(): User[] {
  return userStore.list();
}

export function getUser(id: string): User {
  const user = userStore.findById(id);
  if (!user) throw notFound(`user ${id} was not found`);
  return user;
}

export function createUser(input: CreateUserInput): User {
  const check = validateCreateUser(input);
  if (!check.ok) {
    throw badRequest(`invalid user payload: ${check.errors.join("; ")}`, check.errors);
  }

  const email = input.email.trim().toLowerCase();
  if (userStore.findByEmail(email)) {
    throw conflict(`a user with email ${email} already exists`);
  }

  const user: User = {
    id: newId("usr"),
    email,
    name: input.name.trim(),
    role: input.role ?? "member",
    createdAt: nowIso(),
  };
  userStore.save(user);
  logger.info("user created", { userId: user.id });
  return user;
}

export function deleteUser(id: string): { unassignedTasks: number } {
  getUser(id);
  userStore.delete(id);
  const unassignedTasks = taskStore.unassign(id);
  logger.info("user deleted", { userId: id, unassignedTasks });
  return { unassignedTasks };
}
