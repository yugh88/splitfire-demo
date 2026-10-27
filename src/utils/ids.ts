import { randomUUID } from "node:crypto";

/** Short, prefixed identifier such as `tsk_2f81c0a4b9`. */
export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function truncate(value: string, max = 60): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
