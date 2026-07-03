import { apiRequest } from "./apiClient";
import { mockDepartmentBudgets } from "@/lib/mock-data";
import type { DepartmentBudget, DashboardQuery } from "./types";

export function fetchDepartmentBudgets(query: DashboardQuery): Promise<DepartmentBudget[]> {
  return apiRequest(
    `/api/financial/departments/budgets?fy=${query.fiscalYear}`,
    () => mockDepartmentBudgets,
  );
}
