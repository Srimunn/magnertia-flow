import { apiRequest } from "./apiClient";
import {
  mockUsers,
  mockLoginHistory,
  mockUserActivityTrend,
  mockUsersByDepartment,
  mockUserStatusSummary,
} from "@/lib/mock-data";
import type { UserRecord, NewUserInput, LoginHistoryEntry } from "./types";

export function fetchUsers(): Promise<UserRecord[]> {
  return apiRequest(`/api/administration/users`, () => mockUsers);
}

export function createUser(input: NewUserInput): Promise<UserRecord> {
  return apiRequest(`/api/administration/users`, () => {
    const newUser: UserRecord = {
      id: `USR-00${mockUsers.length + 1}`,
      name: input.name,
      email: input.email,
      companyName: mockUsers[0]?.companyName ?? "Magnertia EV Infrastructure Pvt Ltd",
      branchName: mockUsers[0]?.branchName ?? "Bengaluru HQ",
      department: input.department,
      role: input.role,
      status: "Active",
      lastLogin: "Never",
    };
    mockUsers.push(newUser);
    return newUser;
  });
}

export function fetchLoginHistory(): Promise<LoginHistoryEntry[]> {
  return apiRequest(`/api/administration/users/login-history`, () => mockLoginHistory);
}

export function fetchUserActivityTrend(): Promise<{ date: string; logins: number }[]> {
  return apiRequest(`/api/administration/users/activity-trend`, () => mockUserActivityTrend);
}

export function fetchUsersByDepartment(): Promise<
  { name: string; value: number; color: string }[]
> {
  return apiRequest(`/api/administration/users/by-department`, () => mockUsersByDepartment);
}

export function fetchUserStatusSummary(): Promise<{
  activeCount: number;
  inactiveCount: number;
}> {
  return apiRequest(`/api/administration/users/status-summary`, () => mockUserStatusSummary);
}
