export type Role = "CLIENT" | "ADMIN";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
