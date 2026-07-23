import { apiRequest } from "./apiClient";
import { mockRoles } from "@/lib/mock-data";
import type { RoleRecord, NewRoleInput } from "./types";

export function fetchRoles(): Promise<RoleRecord[]> {
  return apiRequest(`/api/administration/roles`, () => mockRoles);
}

export function createRole(input: NewRoleInput): Promise<RoleRecord> {
  return apiRequest(`/api/administration/roles`, () => {
    const newRole: RoleRecord = {
      id: `ROLE-00${mockRoles.length + 1}`,
      name: input.name,
      description: input.description,
      permissionsCount: 0,
      usersAssignedCount: 0,
      status: "Active",
    };
    mockRoles.push(newRole);
    return newRole;
  });
}
