import type { WidgetPageId } from "../../types";

/* ===========================================================================
   Finance page KPI map
   ---------------------------------------------------------------------------
   Maps each finance page's built-in KPI card LABEL (exactly as rendered by the
   page's <StatCard label=...>) to the registry widget that mirrors it. The
   KpiQuickAddLayer uses this to turn a click on a native KPI card into "add
   this metric to the Dashboard or Overview".

   Keys MUST match the page's StatCard label text verbatim.
   =========================================================================== */

export const FINANCE_PAGE_KPIS: Partial<Record<WidgetPageId, Record<string, string>>> = {
  "finance-payables": {
    "Total Payables": "kpi.total-payables",
    "Overdue Amount": "kpi.ap-overdue",
    "Due Within 30 Days": "kpi.ap-due-30",
    "Paid This Month": "kpi.ap-paid-month",
    "Open Invoices": "kpi.ap-open-invoices",
  },
  "finance-receivables": {
    "Total Receivables": "kpi.total-receivables",
    "Overdue Amount": "kpi.ar-overdue",
    "Due Within 30 Days": "kpi.ar-due-30",
    "Collected This Month": "kpi.ar-collected-month",
    "Open Invoices": "kpi.ar-open-invoices",
  },
  "finance-cash-bank": {
    "Total Cash Balance": "kpi.total-cash-balance",
    "Operating Cash": "kpi.operating-cash",
    "Cash Inflow (MTD)": "kpi.cash-inflow-mtd",
    "Cash Outflow (MTD)": "kpi.cash-outflow-mtd",
    "Net Cash Flow (MTD)": "kpi.net-cash-flow-mtd",
  },
  "finance-budgeting": {
    "Total Budget": "kpi.total-budget",
    "Total Actual": "kpi.total-actual",
    "Budget Utilization": "kpi.budget-utilization",
    "Variance (Favorable)": "kpi.budget-variance",
    Budgets: "kpi.active-budgets",
  },
  "finance-cost-centers": {
    "Total Cost Centers": "kpi.total-cost-centers",
    "Total Budget (FY)": "kpi.cc-total-budget",
    "Total Actual (YTD)": "kpi.cc-total-actual",
    "Variance (Favorable)": "kpi.cc-variance",
    "Budget Utilization": "kpi.cc-utilization",
  },
  "finance-consolidation": {
    "Total Entities": "kpi.total-entities",
    "Consolidated Revenue (YTD)": "kpi.consolidated-revenue",
    "Consolidated Net Profit (YTD)": "kpi.consolidated-net-profit",
    "Elimination Entries (YTD)": "kpi.elimination-entries",
    "Consolidation Status": "kpi.consolidation-status",
  },
  "finance-profitability": {
    "Total Revenue (YTD)": "kpi.prof-revenue",
    "Gross Profit (YTD)": "kpi.gross-profit",
    "Gross Profit Margin": "kpi.gross-margin",
    "Net Profit (YTD)": "kpi.prof-net-profit",
    "Net Profit Margin": "kpi.net-margin",
  },
  "finance-tax": {
    "Total Tax Liability (YTD)": "kpi.tax-liability",
    "Total Tax Paid (YTD)": "kpi.tax-paid",
    "Tax Payable": "kpi.tax-payable",
    "Upcoming Filings": "kpi.tax-upcoming-filings",
    "Compliance Status": "kpi.tax-compliance",
  },
  "finance-reports": {
    "Total Revenue (YTD)": "kpi.rep-revenue",
    "Gross Profit (YTD)": "kpi.rep-gross-profit",
    "Net Income (YTD)": "kpi.rep-net-income",
    "Total Assets": "kpi.rep-total-assets",
    "Total Liabilities": "kpi.rep-total-liabilities",
  },
  "finance-assets": {
    "Total Assets": "kpi.total-assets",
    "Gross Book Value": "kpi.gross-book-value",
    "Accumulated Depreciation": "kpi.accumulated-depreciation",
    "Net Book Value": "kpi.net-book-value",
    "Assets Added This Year": "kpi.assets-added",
  },
  "finance-audit": {
    "Total Activities (YTD)": "kpi.audit-activities",
    "Unique Users": "kpi.audit-unique-users",
    "Successful Activities": "kpi.audit-successful",
    "Failed Activities": "kpi.audit-failed",
    "Sensitive Changes": "kpi.audit-sensitive",
  },
};
