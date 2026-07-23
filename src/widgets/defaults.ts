import type { WidgetInstance, WidgetPageId } from "./types";

/* ===========================================================================
   Default layouts
   ---------------------------------------------------------------------------
   These reproduce each page EXACTLY as it looked before the widget system, in
   the same DOM order. A page with no saved layout renders from here, which is
   what makes this upgrade backward compatible: nothing changes for a user until
   they customize, and "Restore Default" simply deletes their saved layout.

   Spans (60-col desktop grid, see grid.ts):
     sm = 12 (1/5)   md = 20 (1/3)   lg = 30 (1/2)   xl = 40 (2/3)   full = 60
   `spanOverride` is used only where the original layout used a fraction the
   size presets don't express — the Dashboard's quarter-width cards at 15/60.
   =========================================================================== */

const base = { theme: "default", pinned: false } as const;

export const DEFAULT_LAYOUTS: Record<WidgetPageId, WidgetInstance[]> = {
  /** Mirrors src/routes/index.tsx: 5-up KPI row, 2+1+1 charts row, 3-up row, full-width insights. */
  dashboard: [
    { ...base, id: "dash-kpi-revenue", widgetId: "kpi.total-revenue", size: "sm" },
    { ...base, id: "dash-kpi-net-profit", widgetId: "kpi.net-profit", size: "sm" },
    { ...base, id: "dash-kpi-expenses", widgetId: "kpi.total-expenses", size: "sm" },
    { ...base, id: "dash-kpi-cash", widgetId: "kpi.cash-balance", size: "sm" },
    { ...base, id: "dash-kpi-current-ratio", widgetId: "kpi.current-ratio", size: "sm" },

    // Original: `lg:grid-cols-4` with the trend card at col-span-2 (half) and
    // the next two at a quarter each — 15/60 has no size preset, hence override.
    { ...base, id: "dash-trend", widgetId: "chart.revenue-expense-trend", size: "lg" },
    {
      ...base,
      id: "dash-cash-flow",
      widgetId: "list.cash-flow-summary",
      size: "md",
      spanOverride: { xl: 15, lg: 3, md: 3 },
    },
    {
      ...base,
      id: "dash-expense-donut",
      widgetId: "chart.expense-donut",
      size: "md",
      spanOverride: { xl: 15, lg: 3, md: 3 },
    },

    // Original: `lg:grid-cols-3` — thirds.
    { ...base, id: "dash-aging-ar", widgetId: "chart.aging-receivable", size: "md" },
    { ...base, id: "dash-aging-ap", widgetId: "chart.aging-payable", size: "md" },
    { ...base, id: "dash-recent-txn", widgetId: "table.recent-transactions", size: "md" },

    { ...base, id: "dash-insights", widgetId: "insight.quick-financial", size: "full" },
  ],

  /**
   * Mirrors src/routes/management.finance.overview.tsx: a 9-card KPI row, then
   * a `lg:grid-cols-3` section (trend spans 2, cash flow 1, banks 1, net income
   * spans 2), then ops-ledger (2) + alerts (1), then full-width AI.
   * The original page put 6px more space between sections (`space-y-6`) than
   * within them; the grid now uses one uniform 16px gap.
   */
  "finance-overview": [
    { ...base, id: "ovw-kpi-revenue", widgetId: "kpi.total-revenue", size: "sm" },
    { ...base, id: "ovw-kpi-expenses", widgetId: "kpi.total-expenses", size: "sm" },
    { ...base, id: "ovw-kpi-cash", widgetId: "kpi.cash-balance", size: "sm" },
    { ...base, id: "ovw-kpi-net-profit", widgetId: "kpi.net-profit", size: "sm" },
    { ...base, id: "ovw-kpi-accounts", widgetId: "kpi.total-accounts", size: "sm" },
    { ...base, id: "ovw-kpi-posted", widgetId: "kpi.posted-journals", size: "sm" },
    { ...base, id: "ovw-kpi-trial-diff", widgetId: "kpi.trial-balance-diff", size: "sm" },
    { ...base, id: "ovw-kpi-ap", widgetId: "kpi.pending-payables", size: "sm" },
    { ...base, id: "ovw-kpi-ar", widgetId: "kpi.pending-receivables", size: "sm" },

    // `lg:grid-cols-3` → thirds; the trend and area charts spanned 2 of 3.
    { ...base, id: "ovw-trend", widgetId: "chart.overview-trend", size: "xl" },
    { ...base, id: "ovw-cash-flow", widgetId: "list.overview-cash-flow", size: "md" },
    { ...base, id: "ovw-bank-balances", widgetId: "list.bank-balances", size: "md" },
    { ...base, id: "ovw-net-income", widgetId: "chart.net-income-area", size: "xl" },

    { ...base, id: "ovw-ops-ledger", widgetId: "table.operations-ledger", size: "xl" },
    { ...base, id: "ovw-alerts", widgetId: "insight.system-alerts", size: "md" },

    { ...base, id: "ovw-ai", widgetId: "ai.financial-intelligence", size: "full" },
  ],
  "finance-payables": [],
  "finance-receivables": [],
  "finance-cash-bank": [],
  "finance-budgeting": [],
  "finance-cost-centers": [],
  "finance-consolidation": [],
  "finance-profitability": [],
  "finance-tax": [],
  "finance-reports": [],
  "finance-assets": [],
  "finance-audit": [],
};

/** Display metadata for each widget surface. */
export const PAGE_META: Record<WidgetPageId, { label: string; route: string }> = {
  dashboard: { label: "Dashboard", route: "/" },
  "finance-overview": { label: "Finance Overview", route: "/management/finance/overview" },
  "finance-payables": { label: "Accounts Payable", route: "/management/finance/payables" },
  "finance-receivables": { label: "Accounts Receivable", route: "/management/finance/receivables" },
  "finance-cash-bank": { label: "Cash & Bank", route: "/management/finance/cash-bank" },
  "finance-budgeting": { label: "Budgeting", route: "/management/finance/budgeting" },
  "finance-cost-centers": { label: "Cost Centers", route: "/management/finance/cost-centers" },
  "finance-consolidation": { label: "Consolidation", route: "/management/finance/consolidation" },
  "finance-profitability": { label: "Profitability", route: "/management/finance/profitability" },
  "finance-tax": { label: "Tax Management", route: "/management/finance/tax" },
  "finance-reports": { label: "Financial Reports", route: "/management/finance/reports" },
  "finance-assets": { label: "Fixed Assets", route: "/management/finance/assets" },
  "finance-audit": { label: "Audit Trail", route: "/management/finance/audit" },
};

/**
 * Locations offered in the Widget Settings dialog's "Choose Display Location".
 * The current page is added dynamically when it isn't one of these.
 */
export const PLACEABLE_PAGES: WidgetPageId[] = ["dashboard", "finance-overview"];

/** Deep-copy a default layout so callers can never mutate the shared constant. */
export function getDefaultLayout(pageId: WidgetPageId): WidgetInstance[] {
  return DEFAULT_LAYOUTS[pageId].map((i) => ({
    ...i,
    spanOverride: i.spanOverride && { ...i.spanOverride },
  }));
}
