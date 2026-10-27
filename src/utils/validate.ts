import type { TaskPriority, TaskStatus, UserRole } from "../types/index.js";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];
const USER_ROLES: UserRole[] = ["admin", "member"];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isEmail(value: unknown): value is string {
  return isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && TASK_STATUSES.includes(value as TaskStatus);
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && TASK_PRIORITIES.includes(value as TaskPriority);
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

const PATCH_CHECKS: Record<string, (value: unknown) => boolean> = {
  title: isNonEmptyString,
  description: (value) => typeof value === "string",
  status: isTaskStatus,
  priority: isTaskPriority,
  assigneeId: (value) => value === null || isNonEmptyString(value),
};

export function validateTaskPatch(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, errors: ["body must be an object"] };
  const keys = Object.keys(input);
  if (keys.length === 0) return { ok: false, errors: ["at least one field is required"] };
  const invalid = keys.filter((key) => !PATCH_CHECKS[key]?.(input[key]));
  return { ok: invalid.length === 0, errors: invalid.map((key) => `invalid field: ${key}`) };
}

export function validateCreateTask(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, errors: ["body must be an object"] };
  const errors: string[] = [];
  if (!isNonEmptyString(input.title)) errors.push("title is required");
  else if (input.title.length > 120) errors.push("title must be 120 characters or fewer");
  if (input.description !== undefined && typeof input.description !== "string") {
    errors.push("description must be a string");
  }
  if (input.priority !== undefined && !isTaskPriority(input.priority)) {
    errors.push("priority must be low, medium or high");
  }
  if (input.assigneeId != null && !isNonEmptyString(input.assigneeId)) {
    errors.push("assigneeId must be a string or null");
  }
  return { ok: errors.length === 0, errors };
}

export function validateCreateUser(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, errors: ["body must be an object"] };
  const errors: string[] = [];
  if (!isEmail(input.email)) errors.push("email must be a valid address");
  if (!isNonEmptyString(input.name)) errors.push("name is required");
  if (input.role !== undefined && !isUserRole(input.role)) {
    errors.push("role must be admin or member");
  }
  return { ok: errors.length === 0, errors };
}
