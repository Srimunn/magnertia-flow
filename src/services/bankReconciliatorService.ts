import { apiRequest } from "./apiClient";
import { mockBankAccounts, mockReconciliationRecords } from "@/lib/mock-data";
import type { BankReconciliationSummary, DashboardQuery, ReconciliationStatus } from "./types";

export function generateReconciliationSummary(
  query: DashboardQuery,
): Promise<BankReconciliationSummary> {
  return apiRequest(`/api/financial/reconciliation/summary?fy=${query.fiscalYear}`, () => {
    const reconciled = mockBankAccounts.filter(
      (a) => a.reconciliationStatus === "Reconciled",
    ).length;
    const partially = mockBankAccounts.filter(
      (a) => a.reconciliationStatus === "Partially Reconciled",
    ).length;
    const notReconciled = mockBankAccounts.filter(
      (a) => a.reconciliationStatus === "Not Reconciled",
    ).length;
    return {
      reconciledCount: reconciled,
      partiallyReconciledCount: partially,
      notReconciledCount: notReconciled,
      totalAccounts: mockBankAccounts.length,
    };
  });
}

export function matchBankStatement(
  accountNo: string,
  fileName: string,
): Promise<{ success: boolean; reconciledCount: number; unreconciledAmount: number }> {
  return apiRequest(`/api/financial/reconciliation/match`, () => {
    const account = mockBankAccounts.find((a) => a.accountNo === accountNo);
    if (account) {
      account.reconciliationStatus = "Reconciled";
      account.unreconciledAmount = 0;

      // Update mock reconciliation records
      const rec = mockReconciliationRecords.find((r) => r.accountNo === accountNo);
      if (rec) {
        rec.status = "Reconciled";
        rec.unreconciledAmount = 0;
        rec.statementBalance = account.currentBalance;
        rec.ledgerBalance = account.currentBalance;
        rec.lastReconciledAt = new Date().toISOString().replace("T", " ").substring(0, 16);
      }
    }
    return {
      success: true,
      reconciledCount: 1,
      unreconciledAmount: 0,
    };
  });
}

export function updateReconciliationStatus(
  accountNo: string,
  status: ReconciliationStatus,
): Promise<boolean> {
  return apiRequest(`/api/financial/reconciliation/status`, () => {
    const account = mockBankAccounts.find((a) => a.accountNo === accountNo);
    if (account) {
      account.reconciliationStatus = status;
      if (status === "Reconciled") {
        account.unreconciledAmount = 0;
      }
      const rec = mockReconciliationRecords.find((r) => r.accountNo === accountNo);
      if (rec) {
        rec.status = status;
        if (status === "Reconciled") {
          rec.unreconciledAmount = 0;
        }
      }
      return true;
    }
    return false;
  });
}
