import { apiRequest } from "./apiClient";
import { mockCostCenterBudgets } from "@/lib/mock-data";
import type { CostCenterBudget, DashboardQuery } from "./types";

export function fetchCostCenterBudgets(query: DashboardQuery): Promise<CostCenterBudget[]> {
  return apiRequest(
    `/api/financial/cost-centers/budgets?fy=${query.fiscalYear}`,
    () => mockCostCenterBudgets,
  );
}
