import { beforeEach, describe, expect, it } from "vitest";
import { ServiceError } from "../src/services/errors.js";
import { createTask, getTask } from "../src/services/taskService.js";
import { createUser, deleteUser, getUser, listUsers } from "../src/services/userService.js";
import { taskStore } from "../src/store/taskStore.js";
import { userStore } from "../src/store/userStore.js";

beforeEach(() => {
  taskStore.reset();
  userStore.reset();
});

describe("userService", () => {
  it("normalises email and defaults the role", () => {
    const user = createUser({ name: "  Ada Lovelace ", email: " ADA@Example.COM " });

    expect(user.id).toMatch(/^usr_[0-9a-f]{10}$/);
    expect(user.name).toBe("Ada Lovelace");
    expect(user.email).toBe("ada@example.com");
    expect(user.role).toBe("member");
  });

  it("rejects invalid payloads", () => {
    expect(() => createUser({ name: "No Email", email: "nope" })).toThrow(ServiceError);
    expect(() => createUser({ name: "  ", email: "ok@example.com" })).toThrow(/name is required/);
    expect(() =>
      createUser({ name: "Root", email: "root@example.com", role: "owner" as never }),
    ).toThrow(/role must be admin or member/);
  });

  it("rejects duplicate emails case-insensitively", () => {
    createUser({ name: "Ada", email: "ada@example.com" });
    expect(() => createUser({ name: "Ada Again", email: "ADA@example.com" })).toThrow(
      /already exists/,
    );
  });

  it("lists users by name", () => {
    createUser({ name: "Zoe", email: "zoe@example.com" });
    createUser({ name: "Amir", email: "amir@example.com" });

    expect(listUsers().map((user) => user.name)).toEqual(["Amir", "Zoe"]);
  });

  it("unassigns tasks when a user is deleted", () => {
    const user = createUser({ name: "Grace", email: "grace@example.com" });
    const task = createTask({ title: "Owned work", assigneeId: user.id });

    expect(deleteUser(user.id)).toEqual({ unassignedTasks: 1 });
    expect(getTask(task.id).assigneeId).toBeNull();
    expect(() => getUser(user.id)).toThrow(/was not found/);
  });

  it("fails loudly for unknown users", () => {
    expect(() => deleteUser("usr_missing")).toThrow(ServiceError);
  });
});
