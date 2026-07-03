import { apiRequest } from "./apiClient";
import { dashKpis } from "@/lib/mock-data";
import type { CashPosition, DashboardQuery } from "./types";

export function fetchCashBalance(query: DashboardQuery): Promise<CashPosition> {
  return apiRequest(
    `/api/financial/cash-bank/balance?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({ cashBalance: dashKpis.cashBalance }),
  );
}
