import { describe, expect, it } from "vitest";
import {
  isEmail,
  isNonEmptyString,
  isRecord,
  isTaskPriority,
  isTaskStatus,
  isUserRole,
  validateCreateTask,
  validateCreateUser,
  validateTaskPatch,
} from "../src/utils/validate.js";

describe("primitive guards", () => {
  it("recognises plain objects only", () => {
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord("nope")).toBe(false);
  });

  it("handles strings, emails and enum values", () => {
    expect(isNonEmptyString("  hi ")).toBe(true);
    expect(isNonEmptyString("   ")).toBe(false);
    expect(isEmail("ada@example.com")).toBe(true);
    expect(isEmail("ada@example")).toBe(false);
    expect(isEmail("two words@example.com")).toBe(false);
    expect(isTaskStatus("in_progress")).toBe(true);
    expect(isTaskStatus("blocked")).toBe(false);
    expect(isTaskPriority("urgent")).toBe(false);
    expect(isUserRole("admin")).toBe(true);
    expect(isUserRole("owner")).toBe(false);
  });
});

describe("validateCreateTask", () => {
  it("accepts a minimal task", () => {
    expect(validateCreateTask({ title: "Do the thing" })).toEqual({ ok: true, errors: [] });
  });

  it("reports every problem it finds", () => {
    const result = validateCreateTask({
      title: "x".repeat(121),
      description: 42,
      priority: "urgent",
      assigneeId: "",
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(4);
  });

  it("rejects non-object bodies", () => {
    expect(validateCreateTask(null).errors).toEqual(["body must be an object"]);
  });
});

describe("validateCreateUser", () => {
  it("accepts a valid user and requires email plus name", () => {
    expect(validateCreateUser({ name: "Ada", email: "ada@example.com", role: "admin" }).ok).toBe(true);
    expect(validateCreateUser({ email: "", name: "" }).errors).toEqual([
      "email must be a valid address",
      "name is required",
    ]);
  });
});

describe("validateTaskPatch", () => {
  it("accepts known fields", () => {
    expect(validateTaskPatch({ status: "done", assigneeId: null }).ok).toBe(true);
  });

  it("rejects empty, unknown and invalid fields", () => {
    expect(validateTaskPatch({}).errors).toEqual(["at least one field is required"]);
    expect(validateTaskPatch({ deletedAt: "now" }).errors).toEqual(["invalid field: deletedAt"]);
    expect(validateTaskPatch({ title: "   " }).ok).toBe(false);
    expect(validateTaskPatch({ status: "blocked" }).ok).toBe(false);
  });
});
