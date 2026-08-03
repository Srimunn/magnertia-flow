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

  "pd-overview": [
    { ...base, id: "pd-ovw-active", widgetId: "kpi.pd.active-projects", size: "sm" },
    { ...base, id: "pd-ovw-dev", widgetId: "kpi.pd.in-development", size: "sm" },
    { ...base, id: "pd-ovw-release", widgetId: "kpi.pd.ready-release", size: "sm" },
    { ...base, id: "pd-ovw-lifecycle", widgetId: "kpi.pd.active-lifecycle", size: "sm" },
    { ...base, id: "pd-ovw-health", widgetId: "kpi.pd.overall-health", size: "sm" },
  ],
  "md-overview": [
    { ...base, id: "md-ovw-active", widgetId: "kpi.md.active-projects", size: "sm" },
    { ...base, id: "md-ovw-pilot", widgetId: "kpi.md.in-pilot", size: "sm" },
    { ...base, id: "md-ovw-ppap", widgetId: "kpi.md.ready-ppap", size: "sm" },
    { ...base, id: "md-ovw-mass", widgetId: "kpi.md.mass-production", size: "sm" },
    { ...base, id: "md-ovw-readiness", widgetId: "kpi.md.overall-readiness", size: "sm" },
  ],

  /* R&I module dashboards — reproduce today's KPI row exactly (all sm/1-of-5). */
  "ri-overview": [
    { ...base, id: "ri-ovw-ideas", widgetId: "kpi.ri.ideas-total", size: "sm" },
    { ...base, id: "ri-ovw-opps", widgetId: "kpi.ri.opps-total", size: "sm" },
    { ...base, id: "ri-ovw-design", widgetId: "kpi.ri.design-total", size: "sm" },
    { ...base, id: "ri-ovw-validation", widgetId: "kpi.ri.pv-total", size: "sm" },
    { ...base, id: "ri-ovw-feasibility", widgetId: "kpi.ri.fs-total", size: "sm" },
    { ...base, id: "ri-ovw-poc", widgetId: "kpi.ri.poc-total", size: "sm" },
    { ...base, id: "ri-ovw-prototype", widgetId: "kpi.ri.pd-total", size: "sm" },
    { ...base, id: "ri-ovw-patents", widgetId: "kpi.ri.pat-total", size: "sm" },
    { ...base, id: "ri-ovw-innovation", widgetId: "kpi.ri.inn-total", size: "sm" },
    { ...base, id: "ri-ovw-experiments", widgetId: "kpi.ri.ex-total", size: "sm" },
  ],
  "ri-ideas": [
    { ...base, id: "ri-ideas-total", widgetId: "kpi.ri.ideas-total", size: "sm" },
    { ...base, id: "ri-ideas-approval", widgetId: "kpi.ri.ideas-approval-rate", size: "sm" },
    { ...base, id: "ri-ideas-avg", widgetId: "kpi.ri.ideas-avg-innovation", size: "sm" },
    { ...base, id: "ri-ideas-revenue", widgetId: "kpi.ri.ideas-revenue-pipeline", size: "sm" },
    { ...base, id: "ri-ideas-month", widgetId: "kpi.ri.ideas-this-month", size: "sm" },
    { ...base, id: "ri-ideas-patentable", widgetId: "kpi.ri.ideas-patentable", size: "sm" },
    { ...base, id: "ri-ideas-savings", widgetId: "kpi.ri.ideas-cost-savings", size: "sm" },
    { ...base, id: "ri-ideas-review", widgetId: "kpi.ri.ideas-avg-review-days", size: "sm" },
  ],
  "ri-opportunities": [
    { ...base, id: "ri-opps-total", widgetId: "kpi.ri.opps-total", size: "sm" },
    { ...base, id: "ri-opps-approval", widgetId: "kpi.ri.opps-approval-rate", size: "sm" },
    { ...base, id: "ri-opps-avg", widgetId: "kpi.ri.opps-avg-score", size: "sm" },
    { ...base, id: "ri-opps-revenue", widgetId: "kpi.ri.opps-revenue", size: "sm" },
  ],
  "ri-design": [
    { ...base, id: "ri-design-total", widgetId: "kpi.ri.design-total", size: "sm" },
    { ...base, id: "ri-design-active", widgetId: "kpi.ri.design-in-progress", size: "sm" },
    { ...base, id: "ri-design-approval", widgetId: "kpi.ri.design-approval-rate", size: "sm" },
    { ...base, id: "ri-design-avg", widgetId: "kpi.ri.design-avg-score", size: "sm" },
  ],
  "ri-validation": [
    { ...base, id: "ri-pv-total", widgetId: "kpi.ri.pv-total", size: "sm" },
    { ...base, id: "ri-pv-active", widgetId: "kpi.ri.pv-in-progress", size: "sm" },
    { ...base, id: "ri-pv-rate", widgetId: "kpi.ri.pv-validation-rate", size: "sm" },
    { ...base, id: "ri-pv-avg", widgetId: "kpi.ri.pv-avg-score", size: "sm" },
  ],
  "ri-portfolio": [
    { ...base, id: "ri-port-total", widgetId: "kpi.ri.port-total", size: "sm" },
    { ...base, id: "ri-port-active", widgetId: "kpi.ri.port-active", size: "sm" },
    { ...base, id: "ri-port-projects", widgetId: "kpi.ri.port-projects", size: "sm" },
    { ...base, id: "ri-port-avg", widgetId: "kpi.ri.port-avg-health", size: "sm" },
  ],
  "ri-scouting": [
    { ...base, id: "ri-sc-total", widgetId: "kpi.ri.sc-total", size: "sm" },
    { ...base, id: "ri-sc-approved", widgetId: "kpi.ri.sc-approved", size: "sm" },
    { ...base, id: "ri-sc-watchlist", widgetId: "kpi.ri.sc-watchlist", size: "sm" },
    { ...base, id: "ri-sc-avg", widgetId: "kpi.ri.sc-avg-score", size: "sm" },
  ],
  "ri-research": [
    { ...base, id: "ri-rm-total", widgetId: "kpi.ri.rm-total", size: "sm" },
    { ...base, id: "ri-rm-active", widgetId: "kpi.ri.rm-active", size: "sm" },
    { ...base, id: "ri-rm-approved", widgetId: "kpi.ri.rm-approved", size: "sm" },
    { ...base, id: "ri-rm-avg", widgetId: "kpi.ri.rm-avg-impact", size: "sm" },
  ],
  "ri-feasibility": [
    { ...base, id: "ri-fs-total", widgetId: "kpi.ri.fs-total", size: "sm" },
    { ...base, id: "ri-fs-assessment", widgetId: "kpi.ri.fs-in-assessment", size: "sm" },
    { ...base, id: "ri-fs-approved", widgetId: "kpi.ri.fs-approved", size: "sm" },
    { ...base, id: "ri-fs-avg", widgetId: "kpi.ri.fs-avg-score", size: "sm" },
  ],
  "ri-poc": [
    { ...base, id: "ri-poc-total", widgetId: "kpi.ri.poc-total", size: "sm" },
    { ...base, id: "ri-poc-active", widgetId: "kpi.ri.poc-in-progress", size: "sm" },
    { ...base, id: "ri-poc-approved", widgetId: "kpi.ri.poc-approved", size: "sm" },
    { ...base, id: "ri-poc-avg", widgetId: "kpi.ri.poc-avg-score", size: "sm" },
  ],
  "ri-prototype": [
    { ...base, id: "ri-pd-total", widgetId: "kpi.ri.pd-total", size: "sm" },
    { ...base, id: "ri-pd-active", widgetId: "kpi.ri.pd-in-progress", size: "sm" },
    { ...base, id: "ri-pd-approved", widgetId: "kpi.ri.pd-approved", size: "sm" },
    { ...base, id: "ri-pd-avg", widgetId: "kpi.ri.pd-avg-score", size: "sm" },
  ],
  "ri-experiments": [
    { ...base, id: "ri-ex-total", widgetId: "kpi.ri.ex-total", size: "sm" },
    { ...base, id: "ri-ex-running", widgetId: "kpi.ri.ex-running", size: "sm" },
    { ...base, id: "ri-ex-approved", widgetId: "kpi.ri.ex-approved", size: "sm" },
    { ...base, id: "ri-ex-avg", widgetId: "kpi.ri.ex-avg-score", size: "sm" },
  ],
  "ri-trl": [
    { ...base, id: "ri-trl-total", widgetId: "kpi.ri.trl-total", size: "sm" },
    { ...base, id: "ri-trl-under", widgetId: "kpi.ri.trl-under", size: "sm" },
    { ...base, id: "ri-trl-approved", widgetId: "kpi.ri.trl-approved", size: "sm" },
    { ...base, id: "ri-trl-avg", widgetId: "kpi.ri.trl-avg-score", size: "sm" },
  ],
  "ri-commercialization": [
    { ...base, id: "ri-cmp-total", widgetId: "kpi.ri.cmp-total", size: "sm" },
    { ...base, id: "ri-cmp-planning", widgetId: "kpi.ri.cmp-planning", size: "sm" },
    { ...base, id: "ri-cmp-approved", widgetId: "kpi.ri.cmp-approved", size: "sm" },
    { ...base, id: "ri-cmp-readiness", widgetId: "kpi.ri.cmp-avg-readiness", size: "sm" },
  ],
  "ri-innovation": [
    { ...base, id: "ri-inn-total", widgetId: "kpi.ri.inn-total", size: "sm" },
    { ...base, id: "ri-inn-active", widgetId: "kpi.ri.inn-active", size: "sm" },
    { ...base, id: "ri-inn-approved", widgetId: "kpi.ri.inn-approved", size: "sm" },
    { ...base, id: "ri-inn-avg", widgetId: "kpi.ri.inn-avg-score", size: "sm" },
  ],
  "ri-patents": [
    { ...base, id: "ri-pat-total", widgetId: "kpi.ri.pat-total", size: "sm" },
    { ...base, id: "ri-pat-prosecution", widgetId: "kpi.ri.pat-in-prosecution", size: "sm" },
    { ...base, id: "ri-pat-granted", widgetId: "kpi.ri.pat-granted", size: "sm" },
    { ...base, id: "ri-pat-alerts", widgetId: "kpi.ri.pat-deadline-alerts", size: "sm" },
  ],
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
  "ri-overview": { label: "R&I Overview", route: "/development/research-innovation/overview" },
  "ri-ideas": { label: "Ideas", route: "/development/research-innovation/idea-management" },
  "ri-opportunities": { label: "Opportunities", route: "/development/research-innovation/opportunity-discovery" },
  "ri-design": { label: "Design", route: "/development/research-innovation/design-thinking" },
  "ri-validation": { label: "Validation", route: "/development/research-innovation/problem-validation" },
  "ri-portfolio": { label: "Portfolio", route: "/development/research-innovation/innovation-portfolio" },
  "ri-scouting": { label: "Scouting", route: "/development/research-innovation/technology-scouting" },
  "ri-research": { label: "Research", route: "/development/research-innovation/research-management" },
  "ri-feasibility": { label: "Feasibility", route: "/development/research-innovation/feasibility-study" },
  "ri-poc": { label: "PoC", route: "/development/research-innovation/proof-of-concept" },
  "ri-prototype": { label: "Prototype", route: "/development/research-innovation/prototype-development" },
  "ri-experiments": { label: "Experiments", route: "/development/research-innovation/experiment-management" },
  "ri-trl": { label: "TRL", route: "/development/research-innovation/trl-assessment" },
  "ri-commercialization": { label: "Commercialization", route: "/development/research-innovation/commercialization-planning" },
  "ri-innovation": { label: "Innovation", route: "/development/research-innovation/continuous-innovation" },
  "ri-patents": { label: "Patents", route: "/development/ip-development/patent-management" },
  "pd-overview": { label: "Product Development Overview", route: "/development/product-development/overview" },
  "md-overview": { label: "Manufacturing Development Overview", route: "/development/manufacturing-development/overview" },
};

/**
 * Locations offered in the Widget Settings dialog's "Choose Display Location".
 * The current page is added dynamically when it isn't one of these.
 */
export const PLACEABLE_PAGES: WidgetPageId[] = [
  "dashboard",
  "finance-overview",
  "ri-overview",
  "ri-ideas",
  "ri-opportunities",
  "ri-design",
  "ri-validation",
  "ri-portfolio",
  "ri-scouting",
  "ri-research",
  "ri-feasibility",
  "ri-poc",
  "ri-prototype",
  "ri-experiments",
  "ri-trl",
  "ri-commercialization",
  "ri-innovation",
  "ri-patents",
];

/** Deep-copy a default layout so callers can never mutate the shared constant. */
export function getDefaultLayout(pageId: WidgetPageId): WidgetInstance[] {
  return DEFAULT_LAYOUTS[pageId].map((i) => ({
    ...i,
    spanOverride: i.spanOverride && { ...i.spanOverride },
  }));
}
