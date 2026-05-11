import { Role } from "@prisma/client";

export const demoUsers = [
  {
    name: "Demo Owner",
    email: "admin@propertyledger.pro",
    password: "Demo@12345",
    role: Role.OWNER_ADMIN,
    label: "Owner/Admin"
  },
  {
    name: "Demo Manager",
    email: "manager@propertyledger.pro",
    password: "Demo@12345",
    role: Role.ACCOUNTANT_MANAGER,
    label: "Accountant/Manager"
  },
  {
    name: "Demo Viewer",
    email: "viewer@propertyledger.pro",
    password: "Demo@12345",
    role: Role.READ_ONLY_VIEWER,
    label: "Read-only Viewer"
  }
] as const;

export const writeRoles: Role[] = [Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER];

export function canManageRecords(role?: Role | null) {
  return role ? writeRoles.includes(role) : false;
}

export function roleLabel(role?: Role | null) {
  return demoUsers.find((user) => user.role === role)?.label ?? "Unknown";
}
