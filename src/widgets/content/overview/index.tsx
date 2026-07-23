import {
  BarChart3,
  BrainCircuit,
  Calculator,
  Coins,
  Landmark,
  LineChart,
  Percent,
  ShieldCheck,
  Siren,
  TableProperties,
  TrendingUp,
  Waves,
} from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";
import type { WidgetDefinition } from "../../types";
import {
  apCountOptions,
  apTotalOptions,
  arCountOptions,
  arTotalOptions,
  bankAccountsOptions,
  dashboardDataOptions,
  journalsOptions,
  ledgerDashboardOptions,
  unwrapLedger,
} from "../../data/queries";
import { makeStatCardWidget } from "../shared/StatCardWidget";
import {
  AiIntelligenceWidget,
  BankBalancesWidget,
  CashFlowSummaryWidget,
  NetIncomeAreaWidget,
  OperationsLedgerWidget,
  PendingPayablesWidget,
  PendingReceivablesWidget,
  SystemAlertsWidget,
  TrendComposedWidget,
} from "./panels";

/* ===========================================================================
   Finance Overview widget definitions
   ---------------------------------------------------------------------------
   Only the widgets unique to this page are defined here. Total Revenue, Total
   Expenses, Cash Balance and Net Profit already exist as Dashboard widgets and
   are reused as-is — the whole point of a registry is that a widget is defined
   once and placed anywhere.
   =========================================================================== */

export const OVERVIEW_WIDGETS: WidgetDefinition[] = [
  /* ---- KPIs unique to the Overview ---- */
  makeStatCardWidget({
    id: "kpi.total-accounts",
    title: "Total Accounts",
    description: "Number of accounts in the Chart of Accounts.",
    category: "ledger",
    tags: ["kpi", "finance"],
    icon: Landmark,
    keywords: ["accounts", "chart of accounts", "coa", "ledger"],
    iconBg: "bg-blue-600/10",
    iconColor: "text-blue-600",
    sourceRoute: "/management/finance/ledger",
    options: ledgerDashboardOptions,
    map: (res) => {
      const kpis = unwrapLedger(res)?.kpis;
      return {
        value: kpis ? kpis.totalAccounts.toLocaleString() : "—",
        neutralText: "Chart of Accounts size",
      };
    },
  }),
  makeStatCardWidget({
    id: "kpi.posted-journals",
    title: "Posted Journals",
    description: "Posted journal entries against the total raised.",
    category: "ledger",
    tags: ["kpi", "finance"],
    icon: ShieldCheck,
    keywords: ["journals", "posted", "entries", "ledger"],
    iconBg: "bg-indigo-600/10",
    iconColor: "text-indigo-600",
    sourceRoute: "/management/finance/ledger",
    options: ledgerDashboardOptions,
    map: (res) => {
      const kpis = unwrapLedger(res)?.kpis;
      return {
        value: kpis ? `${kpis.postedJournals}/${kpis.totalJournalEntries}` : "—",
        neutralText: "Journal Entries posted",
      };
    },
  }),
  makeStatCardWidget({
    id: "kpi.trial-balance-diff",
    title: "Trial Balance Diff",
    description: "Difference between total debits and total credits.",
    category: "ledger",
    tags: ["kpi", "compliance"],
    icon: Calculator,
    keywords: ["trial balance", "difference", "debit", "credit", "balance"],
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    sourceRoute: "/management/finance/ledger",
    options: ledgerDashboardOptions,
    map: (res) => {
      const kpis = unwrapLedger(res)?.kpis;
      if (!kpis) return { value: "—", neutralText: "—", captionTone: "muted" as const };
      const balanced = kpis.trialBalanceDifference === 0;
      return {
        value: formatCurrency(kpis.trialBalanceDifference, true),
        neutralText: balanced ? "Perfect Balance" : "Out of Balance!",
        captionTone: balanced ? ("positive" as const) : ("negative" as const),
        iconBg: balanced ? "bg-success/10" : "bg-destructive/10",
        iconColor: balanced ? "text-success" : "text-destructive",
      };
    },
  }),

  /* ---- Cross-module KPIs: the "add Total Payables to the Dashboard" story ---- */
  {
    id: "kpi.pending-payables",
    title: "Pending Payments (AP)",
    description: "Outstanding payables and the number of open invoices.",
    category: "payables",
    tags: ["kpi", "finance"],
    icon: Coins,
    keywords: ["payables", "ap", "pending", "payments", "invoices", "vendors", "kpi"],
    defaultSize: "sm",
    allowedSizes: ["sm", "md", "lg"],
    roles: "all",
    sourceRoute: "/management/finance/payables",
    dataKey: apTotalOptions().queryKey,
    component: PendingPayablesWidget,
  },
  {
    id: "kpi.pending-receivables",
    title: "Pending Receivables (AR)",
    description: "Outstanding receivables and the number of open invoices.",
    category: "receivables",
    tags: ["kpi", "finance"],
    icon: Percent,
    keywords: ["receivables", "ar", "pending", "invoices", "customers", "kpi"],
    defaultSize: "sm",
    allowedSizes: ["sm", "md", "lg"],
    roles: "all",
    sourceRoute: "/management/finance/receivables",
    dataKey: arTotalOptions().queryKey,
    component: PendingReceivablesWidget,
  },

  /* ---- Panels ---- */
  {
    id: "chart.overview-trend",
    title: "Revenue, Expenses & Profitability Trend",
    description: "Monthly revenue and expense bars with a net income trend line.",
    category: "chart",
    tags: ["finance", "analytics"],
    icon: LineChart,
    keywords: ["trend", "revenue", "expenses", "profit", "profitability"],
    defaultSize: "xl",
    allowedSizes: ["md", "lg", "xl", "full"],
    roles: "all",
    dataKey: dashboardDataOptions().queryKey,
    component: TrendComposedWidget,
  },
  {
    id: "list.overview-cash-flow",
    title: "Cash Flow Summary (YTD)",
    description: "Year-to-date operating, investing and financing cash flows.",
    category: "list",
    tags: ["banking", "finance"],
    icon: Waves,
    keywords: ["cash flow", "ytd", "operating", "investing", "financing"],
    defaultSize: "md",
    allowedSizes: ["md", "lg", "xl", "full"],
    roles: "all",
    dataKey: dashboardDataOptions().queryKey,
    component: CashFlowSummaryWidget,
  },
  {
    id: "list.bank-balances",
    title: "Bank Account Balances",
    description: "Balance and share of reserves per bank account.",
    category: "banking",
    tags: ["list", "finance"],
    icon: Landmark,
    keywords: ["bank", "balances", "accounts", "reserves", "cash"],
    defaultSize: "md",
    allowedSizes: ["md", "lg", "xl", "full"],
    roles: "all",
    sourceRoute: "/management/finance/cash-bank",
    dataKey: bankAccountsOptions().queryKey,
    component: BankBalancesWidget,
  },
  {
    id: "chart.net-income-area",
    title: "Monthly Net Income Progression",
    description: "Net income trend across the fiscal year.",
    category: "chart",
    tags: ["analytics", "finance"],
    icon: TrendingUp,
    keywords: ["net income", "progression", "monthly", "area", "profit"],
    defaultSize: "xl",
    allowedSizes: ["md", "lg", "xl", "full"],
    roles: "all",
    dataKey: dashboardDataOptions().queryKey,
    component: NetIncomeAreaWidget,
  },
  {
    id: "table.operations-ledger",
    title: "Financial Operations Ledger",
    description: "Journals, transactions, payments, receipts and pending approvals.",
    category: "table",
    tags: ["ledger", "finance", "operations"],
    icon: TableProperties,
    keywords: ["journals", "transactions", "payments", "receipts", "approvals", "operations"],
    defaultSize: "xl",
    allowedSizes: ["lg", "xl", "full"],
    roles: "all",
    sourceRoute: "/management/finance/ledger",
    dataKey: journalsOptions().queryKey,
    component: OperationsLedgerWidget,
  },
  {
    id: "insight.system-alerts",
    title: "System Alerts & Warnings",
    description: "Ledger risk alerts plus a 3-month cash flow prediction.",
    category: "insight",
    tags: ["compliance", "analytics"],
    icon: Siren,
    keywords: ["alerts", "warnings", "risk", "prediction", "forecast"],
    defaultSize: "md",
    allowedSizes: ["md", "lg", "xl", "full"],
    roles: "all",
    dataKey: ledgerDashboardOptions().queryKey,
    component: SystemAlertsWidget,
  },
  {
    id: "ai.financial-intelligence",
    title: "AI Financial Intelligence Center",
    description: "Ledger health, fraud detection and close-readiness scoring.",
    category: "ai",
    tags: ["analytics", "insight"],
    icon: BrainCircuit,
    keywords: ["ai", "intelligence", "fraud", "risk", "health", "recommendations"],
    defaultSize: "full",
    allowedSizes: ["lg", "xl", "full"],
    // Demonstrates access control: executive-level intelligence is scoped.
    roles: ["CEO", "Finance", "Auditor"],
    dataKey: ledgerDashboardOptions().queryKey,
    component: AiIntelligenceWidget,
  },
];
