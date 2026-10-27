export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  /** ISO 8601 timestamp; null when the task has no due date. */
  dueDate?: string | null;
  emailReminderEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string | null;
  /** ISO 8601 timestamp; null when the task has no due date. */
  dueDate?: string | null;
  emailReminderEnabled?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  /** ISO 8601 timestamp; null clears the due date. */
  dueDate?: string | null;
  emailReminderEnabled?: boolean;
}

export interface TaskFilter {
  status?: TaskStatus;
  assigneeId?: string;
  search?: string;
}
