export type UserRole = "admin" | "member";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
}
