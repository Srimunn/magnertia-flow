/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Banknote,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleCheck,
  CircleX,
  ClipboardList,
  Coins,
  DollarSign,
  FileClock,
  FileText,
  FolderTree,
  Gauge,
  GitCompareArrows,
  Landmark,
  Layers,
  ListChecks,
  Package,
  Percent,
  PieChart,
  ReceiptText,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sigma,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";
import type { WidgetCategory, WidgetDefinition, WidgetRole } from "../../types";
import {
  auditDashboardOptions,
  budgetingDashboardOptions,
  cashBankDashboardOptions,
  consolidationDashboardOptions,
  costCentersDashboardOptions,
  fixedAssetsDashboardOptions,
  payablesDashboardOptions,
  profitabilityDashboardOptions,
  receivablesDashboardOptions,
  reportingDashboardOptions,
  taxDashboardOptions,
} from "../../data/queries";
import { makeStatCardWidget, type StatCardShape } from "../shared/StatCardWidget";

/* ===========================================================================
   Finance module KPIs — one widget per KPI card on each finance page
   ---------------------------------------------------------------------------
   Every KPI card on the 11 finance pages has a matching widget here, so any of
   them can be pushed onto the Dashboard/Overview by clicking the card (see
   KpiQuickAddLayer + financeKpiMap). Each reads the same field via the same
   query key as its page, so a widget shown on its own page hits the cache.

   The handful that are broadly useful stay in the Widget Library; the rest are
   `libraryHidden` so the library stays curated (reachable only via card click).
   =========================================================================== */

type Cfg = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  category: WidgetCategory;
  tags?: WidgetCategory[];
  roles: WidgetRole[] | "all";
  sourceRoute: string;
  options: () => any;
  /** Shown in the Widget Library (default: hidden — reachable via card click). */
  inLibrary?: boolean;
};

function widget(c: Cfg, map: (d: any) => StatCardShape): WidgetDefinition {
  return makeStatCardWidget({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    tags: c.tags,
    icon: c.icon,
    keywords: c.title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
    roles: c.roles,
    sourceRoute: c.sourceRoute,
    libraryHidden: !c.inLibrary,
    iconBg: c.iconBg,
    iconColor: c.iconColor,
    options: c.options,
    map,
  });
}

/* Value extractors. `d` is the loader's return value (non-null when mapped). */
// Direct-shape pages (AP / AR): the loader returns the KPIs object itself.
const dMoney =
  (f: string) =>
  (d: any): StatCardShape => ({ value: d?.[f] != null ? formatCurrency(d[f]) : "—" });
const dCount =
  (f: string) =>
  (d: any): StatCardShape => ({
    value: d?.[f] != null ? Number(d[f]).toLocaleString("en-IN") : "—",
  });
// Nested pages: KPIs live under `data.kpis`.
const nMoney =
  (f: string) =>
  (d: any): StatCardShape => ({ value: d?.kpis?.[f] != null ? formatCurrency(d.kpis[f]) : "—" });
const nValMoney =
  (f: string) =>
  (d: any): StatCardShape => ({
    value: d?.kpis?.[f]?.value != null ? formatCurrency(d.kpis[f].value) : "—",
  });
const nCount =
  (f: string) =>
  (d: any): StatCardShape => ({
    value: d?.kpis?.[f] != null ? Number(d.kpis[f]).toLocaleString("en-IN") : "—",
  });
const nPct =
  (f: string, dp = 0) =>
  (d: any): StatCardShape => ({
    value: d?.kpis?.[f] != null ? `${Number(d.kpis[f]).toFixed(dp)}%` : "—",
  });
const nRaw =
  (f: string) =>
  (d: any): StatCardShape => ({ value: d?.kpis?.[f] ?? "—" });

const AP_ROLES: WidgetRole[] = ["CEO", "Finance", "Accountant"];
const BUDGET_ROLES: WidgetRole[] = ["CEO", "Finance", "Operations"];
const TAX_ROLES: WidgetRole[] = ["CEO", "Finance", "Accountant", "Auditor"];
const ASSET_ROLES: WidgetRole[] = ["CEO", "Finance", "Operations", "Auditor"];
const AUDIT_ROLES: WidgetRole[] = ["CEO", "Auditor"];
const REPORT_ROLES: WidgetRole[] = ["CEO", "Finance", "Auditor"];
const CONS_ROLES: WidgetRole[] = ["CEO", "Finance"];

export const FINANCE_KPI_WIDGETS: WidgetDefinition[] = [
  /* ---- Accounts Payable ---- */
  widget(
    {
      id: "kpi.total-payables",
      title: "Total Payables",
      description: "Total outstanding amount owed to vendors.",
      icon: ReceiptText,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "payables",
      tags: ["kpi", "finance"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/payables",
      options: payablesDashboardOptions,
      inLibrary: true,
    },
    dMoney("totalPayables"),
  ),
  widget(
    {
      id: "kpi.ap-overdue",
      title: "Overdue Amount",
      description: "Payables past their due date.",
      icon: AlertTriangle,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      category: "payables",
      tags: ["kpi", "compliance"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/payables",
      options: payablesDashboardOptions,
      inLibrary: true,
    },
    dMoney("overdueAmount"),
  ),
  widget(
    {
      id: "kpi.ap-due-30",
      title: "Due Within 30 Days",
      description: "Payables due in the next 30 days.",
      icon: CalendarClock,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "payables",
      tags: ["kpi"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/payables",
      options: payablesDashboardOptions,
    },
    dMoney("dueWithin30Days"),
  ),
  widget(
    {
      id: "kpi.ap-paid-month",
      title: "Paid This Month",
      description: "Payables settled this month.",
      icon: CheckCircle2,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "payables",
      tags: ["kpi"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/payables",
      options: payablesDashboardOptions,
    },
    dMoney("paidThisMonth"),
  ),
  widget(
    {
      id: "kpi.ap-open-invoices",
      title: "Open Invoices",
      description: "Number of outstanding vendor invoices.",
      icon: FileText,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "payables",
      tags: ["kpi"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/payables",
      options: payablesDashboardOptions,
    },
    dCount("openInvoices"),
  ),

  /* ---- Accounts Receivable ---- */
  widget(
    {
      id: "kpi.total-receivables",
      title: "Total Receivables",
      description: "Total outstanding amount owed by customers.",
      icon: Users,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "receivables",
      tags: ["kpi", "finance"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/receivables",
      options: receivablesDashboardOptions,
      inLibrary: true,
    },
    dMoney("totalReceivables"),
  ),
  widget(
    {
      id: "kpi.ar-overdue",
      title: "Overdue Amount",
      description: "Receivables past their due date.",
      icon: TrendingDown,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      category: "receivables",
      tags: ["kpi", "compliance"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/receivables",
      options: receivablesDashboardOptions,
      inLibrary: true,
    },
    dMoney("overdueAmount"),
  ),
  widget(
    {
      id: "kpi.ar-due-30",
      title: "Due Within 30 Days",
      description: "Receivables due in the next 30 days.",
      icon: CalendarClock,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "receivables",
      tags: ["kpi"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/receivables",
      options: receivablesDashboardOptions,
    },
    dMoney("dueWithin30Days"),
  ),
  widget(
    {
      id: "kpi.ar-collected-month",
      title: "Collected This Month",
      description: "Receivables collected this month.",
      icon: CheckCircle2,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "receivables",
      tags: ["kpi"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/receivables",
      options: receivablesDashboardOptions,
    },
    dMoney("collectedThisMonth"),
  ),
  widget(
    {
      id: "kpi.ar-open-invoices",
      title: "Open Invoices",
      description: "Number of outstanding customer invoices.",
      icon: FileText,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "receivables",
      tags: ["kpi"],
      roles: AP_ROLES,
      sourceRoute: "/management/finance/receivables",
      options: receivablesDashboardOptions,
    },
    dCount("openInvoices"),
  ),

  /* ---- Cash & Bank ---- */
  widget(
    {
      id: "kpi.total-cash-balance",
      title: "Total Cash Balance",
      description: "Consolidated cash across every bank account.",
      icon: Banknote,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "banking",
      tags: ["kpi", "finance"],
      roles: "all",
      sourceRoute: "/management/finance/cash-bank",
      options: cashBankDashboardOptions,
      inLibrary: true,
    },
    nValMoney("totalCashBalance"),
  ),
  widget(
    {
      id: "kpi.operating-cash",
      title: "Operating Cash",
      description: "Cash held in operating accounts.",
      icon: Wallet,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "banking",
      tags: ["kpi", "finance"],
      roles: "all",
      sourceRoute: "/management/finance/cash-bank",
      options: cashBankDashboardOptions,
      inLibrary: true,
    },
    nValMoney("operatingCash"),
  ),
  widget(
    {
      id: "kpi.cash-inflow-mtd",
      title: "Cash Inflow (MTD)",
      description: "Cash received month to date.",
      icon: TrendingUp,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "banking",
      tags: ["kpi"],
      roles: "all",
      sourceRoute: "/management/finance/cash-bank",
      options: cashBankDashboardOptions,
    },
    nValMoney("cashInflowMtd"),
  ),
  widget(
    {
      id: "kpi.cash-outflow-mtd",
      title: "Cash Outflow (MTD)",
      description: "Cash paid out month to date.",
      icon: TrendingDown,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      category: "banking",
      tags: ["kpi"],
      roles: "all",
      sourceRoute: "/management/finance/cash-bank",
      options: cashBankDashboardOptions,
    },
    nValMoney("cashOutflowMtd"),
  ),
  widget(
    {
      id: "kpi.net-cash-flow-mtd",
      title: "Net Cash Flow (MTD)",
      description: "Net cash movement month to date.",
      icon: ArrowLeftRight,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "banking",
      tags: ["kpi"],
      roles: "all",
      sourceRoute: "/management/finance/cash-bank",
      options: cashBankDashboardOptions,
    },
    nValMoney("netCashFlowMtd"),
  ),

  /* ---- Budgeting ---- */
  widget(
    {
      id: "kpi.total-budget",
      title: "Total Budget",
      description: "Total budget allocated for the fiscal year.",
      icon: Target,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "finance",
      tags: ["kpi", "analytics"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/budgeting",
      options: budgetingDashboardOptions,
      inLibrary: true,
    },
    nMoney("totalBudget"),
  ),
  widget(
    {
      id: "kpi.budget-utilization",
      title: "Budget Utilization",
      description: "Share of the allocated budget consumed to date.",
      icon: Percent,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "analytics",
      tags: ["kpi", "finance"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/budgeting",
      options: budgetingDashboardOptions,
      inLibrary: true,
    },
    nPct("budgetUtilization"),
  ),
  widget(
    {
      id: "kpi.total-actual",
      title: "Total Actual",
      description: "Actual spend against the budget.",
      icon: Coins,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "finance",
      tags: ["kpi"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/budgeting",
      options: budgetingDashboardOptions,
    },
    nMoney("totalActual"),
  ),
  widget(
    {
      id: "kpi.budget-variance",
      title: "Budget Variance",
      description: "Favorable/unfavorable variance to budget.",
      icon: Scale,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "finance",
      tags: ["kpi"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/budgeting",
      options: budgetingDashboardOptions,
    },
    nMoney("variance"),
  ),
  widget(
    {
      id: "kpi.active-budgets",
      title: "Active Budgets",
      description: "Number of active budgets.",
      icon: ListChecks,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "finance",
      tags: ["kpi"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/budgeting",
      options: budgetingDashboardOptions,
    },
    nCount("activeBudgetsCount"),
  ),

  /* ---- Cost Centers ---- */
  widget(
    {
      id: "kpi.total-cost-centers",
      title: "Total Cost Centers",
      description: "Number of cost centers.",
      icon: FolderTree,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "finance",
      tags: ["kpi", "operations"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/cost-centers",
      options: costCentersDashboardOptions,
    },
    nCount("totalCostCenters"),
  ),
  widget(
    {
      id: "kpi.cc-total-budget",
      title: "Cost Center Budget (FY)",
      description: "Total cost-center budget for the fiscal year.",
      icon: Target,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "finance",
      tags: ["kpi"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/cost-centers",
      options: costCentersDashboardOptions,
    },
    nMoney("totalBudget"),
  ),
  widget(
    {
      id: "kpi.cc-total-actual",
      title: "Cost Center Actual (YTD)",
      description: "Cost-center actual spend year to date.",
      icon: Coins,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "finance",
      tags: ["kpi"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/cost-centers",
      options: costCentersDashboardOptions,
    },
    nMoney("totalActual"),
  ),
  widget(
    {
      id: "kpi.cc-variance",
      title: "Cost Center Variance",
      description: "Cost-center budget variance.",
      icon: Scale,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "finance",
      tags: ["kpi"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/cost-centers",
      options: costCentersDashboardOptions,
    },
    nMoney("variance"),
  ),
  widget(
    {
      id: "kpi.cc-utilization",
      title: "Cost Center Utilization",
      description: "Cost-center budget utilization.",
      icon: Gauge,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "analytics",
      tags: ["kpi"],
      roles: BUDGET_ROLES,
      sourceRoute: "/management/finance/cost-centers",
      options: costCentersDashboardOptions,
    },
    nPct("budgetUtilization"),
  ),

  /* ---- Consolidation ---- */
  widget(
    {
      id: "kpi.total-entities",
      title: "Total Entities",
      description: "Entities in the consolidation group.",
      icon: Building2,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "finance",
      tags: ["kpi"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/consolidation",
      options: consolidationDashboardOptions,
    },
    nCount("totalEntities"),
  ),
  widget(
    {
      id: "kpi.consolidated-revenue",
      title: "Consolidated Revenue (YTD)",
      description: "Group revenue year to date.",
      icon: TrendingUp,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "finance",
      tags: ["kpi", "analytics"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/consolidation",
      options: consolidationDashboardOptions,
    },
    nMoney("consolidatedRevenueYTD"),
  ),
  widget(
    {
      id: "kpi.consolidated-net-profit",
      title: "Consolidated Net Profit (YTD)",
      description: "Group net profit year to date.",
      icon: Sigma,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "finance",
      tags: ["kpi", "analytics"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/consolidation",
      options: consolidationDashboardOptions,
    },
    nMoney("consolidatedNetProfitYTD"),
  ),
  widget(
    {
      id: "kpi.elimination-entries",
      title: "Elimination Entries (YTD)",
      description: "Intercompany elimination entries.",
      icon: GitCompareArrows,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "finance",
      tags: ["kpi"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/consolidation",
      options: consolidationDashboardOptions,
    },
    nMoney("eliminationEntriesYTD"),
  ),
  widget(
    {
      id: "kpi.consolidation-status",
      title: "Consolidation Status",
      description: "Current consolidation run status.",
      icon: CircleCheck,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      category: "finance",
      tags: ["kpi"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/consolidation",
      options: consolidationDashboardOptions,
    },
    nRaw("status"),
  ),

  /* ---- Profitability ---- */
  widget(
    {
      id: "kpi.prof-revenue",
      title: "Revenue (YTD)",
      description: "Total revenue year to date.",
      icon: DollarSign,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "analytics",
      tags: ["kpi", "finance"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/profitability",
      options: profitabilityDashboardOptions,
    },
    nMoney("revenueYTD"),
  ),
  widget(
    {
      id: "kpi.gross-profit",
      title: "Gross Profit (YTD)",
      description: "Gross profit year to date.",
      icon: TrendingUp,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "analytics",
      tags: ["kpi"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/profitability",
      options: profitabilityDashboardOptions,
    },
    nMoney("grossProfitYTD"),
  ),
  widget(
    {
      id: "kpi.gross-margin",
      title: "Gross Profit Margin",
      description: "Gross margin percentage.",
      icon: Percent,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "analytics",
      tags: ["kpi"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/profitability",
      options: profitabilityDashboardOptions,
    },
    nPct("grossMarginYTD", 2),
  ),
  widget(
    {
      id: "kpi.prof-net-profit",
      title: "Net Profit (YTD)",
      description: "Net profit year to date.",
      icon: PieChart,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "analytics",
      tags: ["kpi"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/profitability",
      options: profitabilityDashboardOptions,
    },
    nMoney("netProfitYTD"),
  ),
  widget(
    {
      id: "kpi.net-margin",
      title: "Net Profit Margin",
      description: "Net margin percentage.",
      icon: Percent,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "analytics",
      tags: ["kpi"],
      roles: CONS_ROLES,
      sourceRoute: "/management/finance/profitability",
      options: profitabilityDashboardOptions,
    },
    nPct("netMarginYTD", 2),
  ),

  /* ---- Tax ---- */
  widget(
    {
      id: "kpi.tax-liability",
      title: "Total Tax Liability (YTD)",
      description: "Tax liability accrued year to date.",
      icon: Landmark,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      category: "compliance",
      tags: ["kpi", "finance"],
      roles: TAX_ROLES,
      sourceRoute: "/management/finance/tax",
      options: taxDashboardOptions,
      inLibrary: true,
    },
    nMoney("totalTaxLiability"),
  ),
  widget(
    {
      id: "kpi.tax-paid",
      title: "Total Tax Paid (YTD)",
      description: "Tax remitted year to date.",
      icon: Coins,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "compliance",
      tags: ["kpi", "finance"],
      roles: TAX_ROLES,
      sourceRoute: "/management/finance/tax",
      options: taxDashboardOptions,
      inLibrary: true,
    },
    nMoney("totalTaxPaid"),
  ),
  widget(
    {
      id: "kpi.tax-payable",
      title: "Tax Payable",
      description: "Outstanding tax payable.",
      icon: FileText,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "compliance",
      tags: ["kpi"],
      roles: TAX_ROLES,
      sourceRoute: "/management/finance/tax",
      options: taxDashboardOptions,
    },
    nMoney("taxPayable"),
  ),
  widget(
    {
      id: "kpi.tax-upcoming-filings",
      title: "Upcoming Filings",
      description: "Tax filings due soon.",
      icon: CalendarClock,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "compliance",
      tags: ["kpi"],
      roles: TAX_ROLES,
      sourceRoute: "/management/finance/tax",
      options: taxDashboardOptions,
    },
    nCount("upcomingFilings"),
  ),
  widget(
    {
      id: "kpi.tax-compliance",
      title: "Compliance Status",
      description: "Tax compliance readiness.",
      icon: ShieldCheck,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      category: "compliance",
      tags: ["kpi"],
      roles: TAX_ROLES,
      sourceRoute: "/management/finance/tax",
      options: taxDashboardOptions,
    },
    nPct("complianceStatus"),
  ),

  /* ---- Financial Reports ---- */
  widget(
    {
      id: "kpi.rep-revenue",
      title: "Report Revenue (YTD)",
      description: "Total revenue from financial reports.",
      icon: DollarSign,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "reports",
      tags: ["kpi", "finance"],
      roles: REPORT_ROLES,
      sourceRoute: "/management/finance/reports",
      options: reportingDashboardOptions,
    },
    nMoney("totalRevenue"),
  ),
  widget(
    {
      id: "kpi.rep-gross-profit",
      title: "Report Gross Profit (YTD)",
      description: "Gross profit from financial reports.",
      icon: TrendingUp,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "reports",
      tags: ["kpi"],
      roles: REPORT_ROLES,
      sourceRoute: "/management/finance/reports",
      options: reportingDashboardOptions,
    },
    nMoney("grossProfit"),
  ),
  widget(
    {
      id: "kpi.rep-net-income",
      title: "Net Income (YTD)",
      description: "Net income from financial reports.",
      icon: PieChart,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "reports",
      tags: ["kpi"],
      roles: REPORT_ROLES,
      sourceRoute: "/management/finance/reports",
      options: reportingDashboardOptions,
    },
    nMoney("netIncome"),
  ),
  widget(
    {
      id: "kpi.rep-total-assets",
      title: "Total Assets (Balance Sheet)",
      description: "Total assets from the balance sheet.",
      icon: Boxes,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "reports",
      tags: ["kpi"],
      roles: REPORT_ROLES,
      sourceRoute: "/management/finance/reports",
      options: reportingDashboardOptions,
    },
    nMoney("totalAssets"),
  ),
  widget(
    {
      id: "kpi.rep-total-liabilities",
      title: "Total Liabilities",
      description: "Total liabilities from the balance sheet.",
      icon: Layers,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      category: "reports",
      tags: ["kpi"],
      roles: REPORT_ROLES,
      sourceRoute: "/management/finance/reports",
      options: reportingDashboardOptions,
    },
    nMoney("totalLiabilities"),
  ),

  /* ---- Fixed Assets ---- */
  widget(
    {
      id: "kpi.total-assets",
      title: "Total Assets",
      description: "Count of registered fixed assets.",
      icon: Package,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "assets",
      tags: ["kpi", "operations"],
      roles: ASSET_ROLES,
      sourceRoute: "/management/finance/assets",
      options: fixedAssetsDashboardOptions,
      inLibrary: true,
    },
    nCount("totalAssets"),
  ),
  widget(
    {
      id: "kpi.gross-book-value",
      title: "Gross Book Value",
      description: "Gross book value of the asset register.",
      icon: Briefcase,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "assets",
      tags: ["kpi", "finance"],
      roles: ASSET_ROLES,
      sourceRoute: "/management/finance/assets",
      options: fixedAssetsDashboardOptions,
      inLibrary: true,
    },
    nMoney("grossBookValue"),
  ),
  widget(
    {
      id: "kpi.accumulated-depreciation",
      title: "Accumulated Depreciation",
      description: "Total accumulated depreciation.",
      icon: TrendingDown,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      category: "assets",
      tags: ["kpi"],
      roles: ASSET_ROLES,
      sourceRoute: "/management/finance/assets",
      options: fixedAssetsDashboardOptions,
    },
    nMoney("accumulatedDepreciation"),
  ),
  widget(
    {
      id: "kpi.net-book-value",
      title: "Net Book Value",
      description: "Net book value of the asset register.",
      icon: Scale,
      iconBg: "bg-[#22C55E]/10",
      iconColor: "text-[#22C55E]",
      category: "assets",
      tags: ["kpi"],
      roles: ASSET_ROLES,
      sourceRoute: "/management/finance/assets",
      options: fixedAssetsDashboardOptions,
    },
    nMoney("netBookValue"),
  ),
  widget(
    {
      id: "kpi.assets-added",
      title: "Assets Added This Year",
      description: "New assets capitalized this year.",
      icon: ClipboardList,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "assets",
      tags: ["kpi"],
      roles: ASSET_ROLES,
      sourceRoute: "/management/finance/assets",
      options: fixedAssetsDashboardOptions,
    },
    nCount("assetsAddedThisYear"),
  ),

  /* ---- Audit Trail ---- */
  widget(
    {
      id: "kpi.audit-activities",
      title: "Total Activities (YTD)",
      description: "Audit-trail events recorded year to date.",
      icon: FileClock,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      category: "compliance",
      tags: ["kpi", "operations"],
      roles: AUDIT_ROLES,
      sourceRoute: "/management/finance/audit",
      options: auditDashboardOptions,
      inLibrary: true,
    },
    nCount("totalActivitiesYTD"),
  ),
  widget(
    {
      id: "kpi.audit-unique-users",
      title: "Unique Users",
      description: "Distinct users active in the audit trail.",
      icon: ShieldAlert,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
      category: "compliance",
      tags: ["kpi", "operations"],
      roles: AUDIT_ROLES,
      sourceRoute: "/management/finance/audit",
      options: auditDashboardOptions,
      inLibrary: true,
    },
    nCount("uniqueUsersCount"),
  ),
  widget(
    {
      id: "kpi.audit-successful",
      title: "Successful Activities",
      description: "Successful audit-trail activities.",
      icon: CircleCheck,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      category: "compliance",
      tags: ["kpi"],
      roles: AUDIT_ROLES,
      sourceRoute: "/management/finance/audit",
      options: auditDashboardOptions,
    },
    nCount("successfulActivitiesCount"),
  ),
  widget(
    {
      id: "kpi.audit-failed",
      title: "Failed Activities",
      description: "Failed audit-trail activities.",
      icon: CircleX,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      category: "compliance",
      tags: ["kpi"],
      roles: AUDIT_ROLES,
      sourceRoute: "/management/finance/audit",
      options: auditDashboardOptions,
    },
    nCount("failedActivitiesCount"),
  ),
  widget(
    {
      id: "kpi.audit-sensitive",
      title: "Sensitive Changes",
      description: "Sensitive changes flagged in the audit trail.",
      icon: BarChart3,
      iconBg: "bg-[#3B82F6]/10",
      iconColor: "text-[#3B82F6]",
      category: "compliance",
      tags: ["kpi"],
      roles: AUDIT_ROLES,
      sourceRoute: "/management/finance/audit",
      options: auditDashboardOptions,
    },
    nCount("sensitiveChangesCount"),
  ),
];
