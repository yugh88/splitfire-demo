import type { Task, TaskFilter } from "../types/index.js";

const tasks = new Map<string, Task>();

function sorted(): Task[] {
  return [...tasks.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const taskStore = {
  list(): Task[] {
    return sorted();
  },

  findById(id: string): Task | undefined {
    return tasks.get(id);
  },

  query(filter: TaskFilter = {}): Task[] {
    const needle = filter.search?.trim().toLowerCase();
    return sorted().filter((task) => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.assigneeId && task.assigneeId !== filter.assigneeId) return false;
      if (!needle) return true;
      return `${task.title} ${task.description}`.toLowerCase().includes(needle);
    });
  },

  save(task: Task): Task {
    tasks.set(task.id, task);
    return task;
  },

  delete(id: string): boolean {
    return tasks.delete(id);
  },

  /** Clears the assignee of every task owned by the user; returns how many changed. */
  unassign(userId: string): number {
    let changed = 0;
    for (const task of tasks.values()) {
      if (task.assigneeId === userId) {
        tasks.set(task.id, { ...task, assigneeId: null });
        changed += 1;
      }
    }
    return changed;
  },

  count(): number {
    return tasks.size;
  },

  reset(): void {
    tasks.clear();
  },
};
