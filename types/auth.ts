export type Role = "CLIENT" | "ADMIN";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  defaultAddress: string | null;
  role: Role;
}
