import { apiRequest } from "./apiClient";
import type { DashboardQuery } from "./types";

export function generateInvoiceDocument(
  query: DashboardQuery,
  ref: string,
): Promise<{ fileName: string }> {
  return apiRequest(`/api/financial/reporting/invoices/${ref}`, () => ({ fileName: `${ref}.pdf` }));
}

export function generateExport(
  query: DashboardQuery,
  format: "csv" | "xlsx" | "pdf",
): Promise<{ fileName: string }> {
  return apiRequest(`/api/financial/reporting/export?format=${format}`, () => ({
    fileName: `transactions_${query.fiscalYear.replace(/\s+/g, "")}.${format}`,
  }));
}

// Same boundary as "Reporting Engine" in the Transactions diagram — the
// General Ledger diagram just labels it "Reporting Service". See
// architecture.md.
export function generateLedgerExport(
  query: DashboardQuery,
  format: "csv" | "xlsx" | "pdf",
): Promise<{ fileName: string }> {
  return apiRequest(`/api/financial/reporting/general-ledger/export?format=${format}`, () => ({
    fileName: `general_ledger_${query.fiscalYear.replace(/\s+/g, "")}.${format}`,
  }));
}

// Same boundary again, "Reporting Service" in the Accounts Payable diagram.
export function generateAccountsPayableExport(
  query: DashboardQuery,
  format: "csv" | "xlsx" | "pdf",
): Promise<{ fileName: string }> {
  return apiRequest(`/api/financial/reporting/accounts-payable/export?format=${format}`, () => ({
    fileName: `accounts_payable_${query.fiscalYear.replace(/\s+/g, "")}.${format}`,
  }));
}

// Same boundary again, "Reporting Service" in the Accounts Receivable diagram.
export function generateAccountsReceivableExport(
  query: DashboardQuery,
  format: "csv" | "xlsx" | "pdf",
): Promise<{ fileName: string }> {
  return apiRequest(`/api/financial/reporting/accounts-receivable/export?format=${format}`, () => ({
    fileName: `accounts_receivable_${query.fiscalYear.replace(/\s+/g, "")}.${format}`,
  }));
}

// "Statement of Account" is a distinct per-customer document, not a list
// export — still the same Reporting boundary.
export function generateCustomerStatement(
  query: DashboardQuery,
  customerName: string,
): Promise<{ fileName: string }> {
  return apiRequest(
    `/api/financial/reporting/accounts-receivable/statements/${encodeURIComponent(customerName)}`,
    () => ({ fileName: `statement_${customerName.replace(/\s+/g, "_")}.pdf` }),
  );
}
