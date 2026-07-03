import { apiRequest } from "./apiClient";
import { dashKpis } from "@/lib/mock-data";
import type { DashboardQuery } from "./types";

export function calculateTotalRevenue(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/revenue/total?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => dashKpis.totalRevenue,
  );
}
