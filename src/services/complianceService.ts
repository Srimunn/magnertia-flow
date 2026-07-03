import { apiRequest } from "./apiClient";
import { mockComplianceSummary, mockTaxReconciliations } from "@/lib/mock-data";
import type { ComplianceSummary, TaxReconciliation, DashboardQuery } from "./types";

export function fetchComplianceOverview(query: DashboardQuery): Promise<ComplianceSummary> {
  return apiRequest(
    `/api/financial/tax/compliance?fy=${query.fiscalYear}`,
    () => mockComplianceSummary,
  );
}

export function fetchReconciliations(query: DashboardQuery): Promise<TaxReconciliation[]> {
  return apiRequest(
    `/api/financial/tax/reconciliations?fy=${query.fiscalYear}`,
    () => mockTaxReconciliations,
  );
}

export function performTaxReconciliation(
  query: DashboardQuery,
): Promise<{ success: boolean; reconciledCount: number; varianceResolved: number }> {
  return apiRequest(`/api/financial/tax/reconciliations/run?fy=${query.fiscalYear}`, () => {
    // Mark mismatched reconciliations as reconciled for simulation
    mockTaxReconciliations.forEach((r) => {
      if (r.status === "Mismatched") {
        r.status = "Reconciled";
        r.difference = 0.0;
        r.booksLiability = r.returnsLiability;
      }
    });
    return { success: true, reconciledCount: 2, varianceResolved: 2000.0 };
  });
}
