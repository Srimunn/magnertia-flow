import { apiRequest } from "./apiClient";
import { allTransactions, transactionsKpisRaw } from "@/lib/mock-data";
import * as accountsPayableService from "./accountsPayableService";
import * as accountsReceivableService from "./accountsReceivableService";
import * as generalLedgerService from "./generalLedgerService";
import type {
  DashboardQuery,
  TransactionDetail,
  TransactionFilters,
  TransactionKpiPeriod,
  TransactionRecord,
  TransactionSearchResult,
  TransactionUpdate,
} from "./types";

export function calculateTotalTransactions(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/transactions/total-count?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => transactionsKpisRaw.totalTransactions,
  );
}

export function calculateTotalAmount(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/transactions/total-amount?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => transactionsKpisRaw.totalAmount,
  );
}

export function fetchTodaysTransactions(query: DashboardQuery): Promise<TransactionKpiPeriod> {
  return apiRequest(
    `/api/financial/transactions/today?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => transactionsKpisRaw.transactionsToday,
  );
}

export function fetchMonthlyTransactions(query: DashboardQuery): Promise<TransactionKpiPeriod> {
  return apiRequest(
    `/api/financial/transactions/monthly?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => transactionsKpisRaw.thisMonth,
  );
}

export function searchTransactions(
  query: DashboardQuery,
  filters: TransactionFilters,
): Promise<TransactionSearchResult> {
  return apiRequest(
    `/api/financial/transactions/search?fy=${query.fiscalYear}&company=${query.companyId}` +
      `&type=${filters.type}&status=${filters.status}&q=${encodeURIComponent(filters.search)}`,
    () => {
      let rows = allTransactions;

      if (filters.type !== "All Types") {
        rows = rows.filter((r) => r.type === filters.type);
      }
      if (filters.status !== "All Statuses") {
        rows = rows.filter((r) => r.status === filters.status);
      }
      if (filters.search.trim()) {
        const needle = filters.search.trim().toLowerCase();
        rows = rows.filter(
          (r) =>
            r.ref.toLowerCase().includes(needle) ||
            r.description.toLowerCase().includes(needle) ||
            String(Math.abs(r.amount)).includes(needle),
        );
      }

      // Mock rows are authored newest-first; "asc" is just the reverse — no
      // real date parsing needed for a fixture this size.
      if (filters.sortDir === "asc") rows = [...rows].reverse();

      const total = rows.length;
      const start = (filters.page - 1) * filters.pageSize;
      const page = rows.slice(start, start + filters.pageSize);
      return { rows: page, total };
    },
  );
}

export function fetchTransactionDetails(ref: string): Promise<TransactionDetail | null> {
  const row = allTransactions.find((t) => t.ref === ref);
  if (!row) return Promise.resolve(null);

  // Dispatches to the same [Invoice] / [Payment] / [Journal Entry] branches
  // the sequence diagram shows Transaction Service delegating to.
  if (row.type === "Invoice" || row.type === "Receipt") {
    return accountsReceivableService.retrieveInvoiceInformation(ref);
  }
  if (row.type === "Payment" || row.type === "Bill") {
    return accountsPayableService.retrievePaymentInformation(ref);
  }
  return generalLedgerService.retrieveJournalEntry(ref);
}

export function updateTransaction(
  ref: string,
  patch: TransactionUpdate,
): Promise<TransactionRecord> {
  return apiRequest(`/api/financial/transactions/${ref}`, () => {
    const row = allTransactions.find((t) => t.ref === ref);
    if (!row) throw new Error(`Transaction ${ref} not found`);
    Object.assign(row, patch);
    return row;
  });
}

export function notifyCustomerOrSupplier(ref: string): Promise<{ sent: boolean }> {
  return apiRequest(`/api/financial/transactions/${ref}/remind`, () => ({ sent: true }));
}
