import type { ReportConfig } from "./types";

/* ===========================================================================
   Finance report configuration — the list of report types + per-type
   resolvers. Everything flows through the shared ReportBuilder / ReportOutput.
   The Finance service payloads are already externally-managed and don't yet
   expose aggregate arrays in a shape usable for a report, so each Finance
   report type currently returns a `not-connected` payload with the exact
   service function to wire up. The UI still lists all types, and swapping any
   of these to real data is a one-function edit — no UI changes.
   =========================================================================== */

const currentFy = () => ({
  from: `${new Date().getFullYear() - 1}-04-01`,
  to: `${new Date().getFullYear()}-03-31`,
});

export const FINANCE_REPORT_CONFIG: ReportConfig = {
  areaLabel: "Financial",
  defaultRange: currentFy(),
  secondaryFilter: {
    key: "companyCode",
    label: "Company / Cost Center",
    options: [
      { value: "MAG-IND", label: "Magnertia India" },
      { value: "MAG-EU", label: "Magnertia Europe" },
      { value: "CC-RND", label: "R&D Cost Center" },
      { value: "CC-OPS", label: "Operations Cost Center" },
    ],
  },
  reportTypes: [
    {
      id: "trial-balance",
      label: "Trial Balance",
      description: "Debit and credit balances per ledger account.",
      resolve: () => ({
        status: "not-connected" as const,
        message:
          "Trial-balance rows are not exposed by loadFinancialReportingDashboard yet. Wire chartOfAccountsService.fetchAll → account-level debit/credit aggregation to enable.",
      }),
    },
    {
      id: "ap-aging",
      label: "AP Aging",
      description: "Outstanding vendor invoices bucketed by age.",
      resolve: () => ({
        status: "not-connected" as const,
        message:
          "AP aging buckets are not yet exposed on the AP dashboard payload. Wire accountsPayableService's aging aggregation to enable.",
      }),
    },
    {
      id: "ar-aging",
      label: "AR Aging",
      description: "Outstanding customer invoices bucketed by age.",
      resolve: () => ({
        status: "not-connected" as const,
        message:
          "AR aging buckets are not yet exposed on the AR dashboard payload. Wire accountsReceivableService's aging aggregation to enable.",
      }),
    },
    {
      id: "cash-flow",
      label: "Cash Flow Summary",
      description: "Operating, investing, and financing cash flows.",
      resolve: () => ({
        status: "not-connected" as const,
        message:
          "Cash Flow Summary lines are not exposed on loadCashBankDashboard yet. Wire cashBankService cash-flow aggregation to enable.",
      }),
    },
    {
      id: "budget-vs-actual",
      label: "Budget vs Actual",
      description: "Departmental budget utilization vs actual spend.",
      resolve: () => ({
        status: "not-connected" as const,
        message:
          "Budget breakdown rows are not exposed on loadBudgetingDashboard yet. Wire budgetService per-department aggregation to enable.",
      }),
    },
    {
      id: "general-ledger",
      label: "General Ledger",
      description: "Journal entries by account for the selected period.",
      resolve: () => ({
        status: "not-connected" as const,
        message:
          "The GL Journal Entry log is available on the Ledger page but is not yet aggregated for the reports API. Wire journalEntryService.fetchAll to enable.",
      }),
    },
    {
      id: "journal-register",
      label: "Journal Register",
      description: "All posted journals for the selected period.",
      resolve: () => ({
        status: "not-connected" as const,
        message:
          "Journal register aggregation service is not yet exposed. Wire journalEntryService.fetchAll to enable this.",
      }),
    },
  ],
};
