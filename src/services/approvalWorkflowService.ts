import { apiRequest } from "./apiClient";
import { transactionsKpisRaw } from "@/lib/mock-data";
import type { DashboardQuery, TransactionKpiPeriod } from "./types";

export function fetchPendingApprovals(query: DashboardQuery): Promise<TransactionKpiPeriod> {
  return apiRequest(
    `/api/financial/approval-workflow/pending?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => transactionsKpisRaw.pendingApproval,
  );
}
