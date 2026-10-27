import type { User } from "../types/index.js";

const users = new Map<string, User>();

export const userStore = {
  list(): User[] {
    return [...users.values()].sort((a, b) => a.name.localeCompare(b.name));
  },

  findById(id: string): User | undefined {
    return users.get(id);
  },

  findByEmail(email: string): User | undefined {
    const needle = email.trim().toLowerCase();
    return [...users.values()].find((user) => user.email === needle);
  },

  save(user: User): User {
    users.set(user.id, user);
    return user;
  },

  delete(id: string): boolean {
    return users.delete(id);
  },

  count(): number {
    return users.size;
  },

  reset(): void {
    users.clear();
  },
};
