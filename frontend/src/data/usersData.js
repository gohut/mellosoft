import { hashPassword } from "../utils/security";

export const DEFAULT_USERS = [
  {
    id: "user-001",
    name: "Rahul Sharma",
    email: "admin@mellosoft.com",
    phone: "+91 98765 43210",
    passwordHash: hashPassword("Admin@123"),
    roleId: "role-super-admin",
    status: "Active",
    lastLogin: "2026-08-10 14:32",
    createdAt: "2026-01-15",
  },
];
