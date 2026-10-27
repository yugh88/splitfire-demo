import { beforeEach, describe, expect, it } from "vitest";
import { ServiceError } from "../src/services/errors.js";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "../src/services/taskService.js";
import { createUser } from "../src/services/userService.js";
import { listNotifications, resetNotifications } from "../src/services/notificationService.js";
import { taskStore } from "../src/store/taskStore.js";
import { userStore } from "../src/store/userStore.js";

beforeEach(() => {
  taskStore.reset();
  userStore.reset();
  resetNotifications();
});

describe("taskService", () => {
  it("creates a task with sensible defaults", () => {
    const task = createTask({ title: "  Write the demo README  " });

    expect(task.id).toMatch(/^tsk_[0-9a-f]{10}$/);
    expect(task.title).toBe("Write the demo README");
    expect(task.status).toBe("todo");
    expect(task.priority).toBe("medium");
    expect(task.assigneeId).toBeNull();
    expect(task.description).toBe("");
  });

  it("rejects invalid payloads", () => {
    expect(() => createTask({ title: "   " })).toThrow(ServiceError);
    expect(() => createTask({ title: "Orphan", assigneeId: "usr_missing" })).toThrow(
      /assignee usr_missing was not found/,
    );

    const task = createTask({ title: "Steady" });
    expect(() => updateTask(task.id, {})).toThrow(/at least one field is required/);
  });

  it("notifies the assignee when a task is created", () => {
    const user = createUser({ name: "Ada", email: "ada@example.com" });
    const task = createTask({ title: "Ship it", assigneeId: user.id });

    const [notification] = listNotifications();
    expect(notification?.kind).toBe("task.assigned");
    expect(notification?.taskId).toBe(task.id);
    expect(notification?.message).toContain("Ada");
  });

  it("filters by status, assignee and search text", () => {
    const user = createUser({ name: "Grace", email: "grace@example.com" });
    createTask({ title: "Draft spec", assigneeId: user.id });
    const done = createTask({ title: "Ship release" });
    updateTask(done.id, { status: "done" });

    expect(listTasks({ status: "done" }).map((task) => task.id)).toEqual([done.id]);
    expect(listTasks({ assigneeId: user.id })).toHaveLength(1);
    expect(listTasks({ search: "release" })).toHaveLength(1);
  });

  it("updates fields and records completion exactly once", () => {
    const task = createTask({ title: "Close the loop" });
    const updated = updateTask(task.id, { title: "Closed", status: "done" });
    updateTask(task.id, { status: "done" });

    expect(updated.title).toBe("Closed");
    expect(updated.status).toBe("done");
    const completed = listNotifications().filter((item) => item.kind === "task.completed");
    expect(completed).toHaveLength(1);
  });

  it("deletes tasks and reports missing ones", () => {
    const task = createTask({ title: "Temporary" });
    deleteTask(task.id);

    expect(() => getTask(task.id)).toThrow(/was not found/);
    expect(() => deleteTask(task.id)).toThrow(ServiceError);
  });
});
