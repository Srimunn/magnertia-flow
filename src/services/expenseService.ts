import { apiRequest } from "./apiClient";
import { dashKpis } from "@/lib/mock-data";
import type { DashboardQuery } from "./types";

export function calculateTotalExpenses(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/expenses/total?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => dashKpis.totalExpenses,
  );
}
