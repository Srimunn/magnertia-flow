import { apiRequest } from "./apiClient";
import {
  accountDistribution as accountDistributionRaw,
  apAgingSummary,
  apPaymentSummary,
  apTopVendors,
  arAgingSummary,
  arCollectionSummary,
  arTopCustomers,
  cashFlowSummary as cashFlowLines,
  chartOfAccounts,
  dashKpis,
  expenseDistribution,
  financialInsightsRaw,
  netCashFlow,
  receivableTrend,
  revenueExpenseTrend,
} from "@/lib/mock-data";
import type {
  AccountBalanceTrendPoint,
  AccountDistributionSlice,
  AccountNode,
  AgingReport,
  CashFlowSummary,
  CollectionSummary,
  CurrentRatio,
  DashboardQuery,
  ExpenseSlice,
  FinancialInsights,
  InsightMetric,
  PaymentSummary,
  ReceivableTrendPoint,
  TopCustomer,
  TopVendor,
  TrendPoint,
  CostCenterHierarchyNode,
  ProfitabilityTrendPoint,
  RegionalProfitabilityPoint,
  SalesChannelProfitabilityPoint,
  TopPerformer,
} from "./types";

export function calculateCurrentRatio(query: DashboardQuery): Promise<CurrentRatio> {
  return apiRequest(
    `/api/financial/analytics/current-ratio?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({ currentRatio: dashKpis.currentRatio, currentRatioPY: dashKpis.currentRatioPY }),
  );
}

export function generateRevenueExpenseTrend(query: DashboardQuery): Promise<TrendPoint[]> {
  return apiRequest(
    `/api/financial/analytics/revenue-expense-trend?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => revenueExpenseTrend,
  );
}

export function generateCashFlowSummary(query: DashboardQuery): Promise<CashFlowSummary> {
  return apiRequest(
    `/api/financial/analytics/cash-flow-summary?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({ lines: cashFlowLines, netCashFlow }),
  );
}

export function generateExpenseDistribution(query: DashboardQuery): Promise<ExpenseSlice[]> {
  return apiRequest(
    `/api/financial/analytics/expense-distribution?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => expenseDistribution,
  );
}

function findAccountNode(code: string, nodes: AccountNode[] = chartOfAccounts): AccountNode | null {
  for (const node of nodes) {
    if (node.code === code) return node;
    if (node.children) {
      const found = findAccountNode(code, node.children);
      if (found) return found;
    }
  }
  return null;
}

// Ramp fractions reproduce the reference mockup's Account Balance Trend
// chart exactly for account 1120 (each fraction * 1120's YTD debit/credit
// lands on the mockup's bars); applied to any account's own YTD figures so
// every account gets a plausible trend without hand-authoring one each.
const TREND_MONTHS = ["Apr '24", "Jun '24", "Aug '24", "Oct '24", "Dec '24", "Feb '25", "Apr '25"];
const TREND_FRACTIONS = [0.103, 0.24, 0.398, 0.563, 0.721, 0.879, 1];

export function generateAccountBalanceTrend(
  accountCode: string,
): Promise<AccountBalanceTrendPoint[]> {
  return apiRequest(`/api/financial/analytics/accounts/${accountCode}/balance-trend`, () => {
    const account = findAccountNode(accountCode);
    if (!account) return [];
    return TREND_MONTHS.map((month, i) => {
      const debit = Math.round(account.debit * TREND_FRACTIONS[i]);
      const credit = Math.round(account.credit * TREND_FRACTIONS[i]);
      return { month, debit, credit, netBalance: debit - credit };
    });
  });
}

export function generateAccountDistribution(
  query: DashboardQuery,
): Promise<AccountDistributionSlice[]> {
  return apiRequest(
    `/api/financial/analytics/accounts/distribution?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => accountDistributionRaw,
  );
}

// Page-scoped semantic palette (see mock-data.ts's apAgingSummary comment) —
// deliberately not the same aging function/colors used by the Dashboard's
// fetchOutstandingPayables.
export function generateApAgingSummary(query: DashboardQuery): Promise<AgingReport> {
  return apiRequest(
    `/api/financial/analytics/accounts-payable/aging?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => apAgingSummary,
  );
}

export function calculateTopVendors(query: DashboardQuery): Promise<TopVendor[]> {
  return apiRequest(
    `/api/financial/analytics/accounts-payable/top-vendors?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => apTopVendors,
  );
}

export function generatePaymentSummary(query: DashboardQuery): Promise<PaymentSummary> {
  return apiRequest(
    `/api/financial/analytics/accounts-payable/payment-summary?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => apPaymentSummary,
  );
}

export function generateArAgingSummary(query: DashboardQuery): Promise<AgingReport> {
  return apiRequest(
    `/api/financial/analytics/accounts-receivable/aging?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => arAgingSummary,
  );
}

export function generateReceivableTrend(query: DashboardQuery): Promise<ReceivableTrendPoint[]> {
  return apiRequest(
    `/api/financial/analytics/accounts-receivable/trend?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => receivableTrend,
  );
}

export function calculateTopCustomers(query: DashboardQuery): Promise<TopCustomer[]> {
  return apiRequest(
    `/api/financial/analytics/accounts-receivable/top-customers?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => arTopCustomers,
  );
}

export function generateCollectionSummary(query: DashboardQuery): Promise<CollectionSummary> {
  return apiRequest(
    `/api/financial/analytics/accounts-receivable/collection-summary?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => arCollectionSummary,
  );
}

function toPercentMetric(
  label: string,
  raw: { value: number; deltaPct: number; direction: "up" | "down"; tone: "positive" | "negative" },
): InsightMetric {
  return {
    label,
    value: `${raw.value.toFixed(1)}%`,
    deltaLabel: `${raw.deltaPct.toFixed(1)}% vs. PY`,
    direction: raw.direction,
    tone: raw.tone,
  };
}

function toDaysMetric(
  label: string,
  raw: {
    value: number;
    deltaDays: number;
    direction: "up" | "down";
    tone: "positive" | "negative";
  },
): InsightMetric {
  return {
    label,
    value: `${raw.value} Days`,
    deltaLabel: `${raw.deltaDays} Day${raw.deltaDays === 1 ? "" : "s"} vs. PY`,
    direction: raw.direction,
    tone: raw.tone,
  };
}

export function calculateFinancialInsights(query: DashboardQuery): Promise<FinancialInsights> {
  return apiRequest(
    `/api/financial/analytics/insights?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({
      grossMargin: toPercentMetric("Gross Margin", financialInsightsRaw.grossMargin),
      operatingMargin: toPercentMetric("Operating Margin", financialInsightsRaw.operatingMargin),
      expenseRatio: toPercentMetric("Expense Ratio", financialInsightsRaw.expenseRatio),
      dso: toDaysMetric("DSO", financialInsightsRaw.dso),
      dpo: toDaysMetric("DPO", financialInsightsRaw.dpo),
      cashConversionCycle: toDaysMetric(
        "Cash Conversion Cycle",
        financialInsightsRaw.cashConversionCycle,
      ),
    }),
  );
}

export function generateAssetDistribution(query: DashboardQuery): Promise<AssetCategoryCount[]> {
  return apiRequest(
    `/api/financial/analytics/fixed-assets/distribution?fy=${query.fiscalYear}`,
    () => [
      { name: "Building", count: 348, percentage: 28, cost: 8020000.0, color: "#0A3C75" },
      { name: "Machinery", count: 298, percentage: 24, cost: 6880000.0, color: "#336B9F" },
      { name: "IT Equipment", count: 224, percentage: 18, cost: 5160000.0, color: "#729FC9" },
      { name: "Vehicles", count: 149, percentage: 12, cost: 3440000.0, color: "#B2C9DF" },
      { name: "Furniture", count: 100, percentage: 8, cost: 2290000.0, color: "#E2D9C5" },
      { name: "Others", count: 126, percentage: 10, cost: 2850000.0, color: "#F59E0B" },
    ],
  );
}

export function generateDepreciationTrend(
  query: DashboardQuery,
): Promise<{ month: string; depreciation: number }[]> {
  return apiRequest(
    `/api/financial/analytics/fixed-assets/depreciation-trend?fy=${query.fiscalYear}`,
    () => [
      { month: "Apr '24", depreciation: 680000.0 },
      { month: "May '24", depreciation: 750000.0 },
      { month: "Jun '24", depreciation: 780000.0 },
      { month: "Jul '24", depreciation: 890000.0 },
      { month: "Aug '24", depreciation: 1100000.0 },
      { month: "Sep '24", depreciation: 980000.0 },
      { month: "Oct '24", depreciation: 1200000.0 },
      { month: "Mar '25", depreciation: 1300000.0 },
    ],
  );
}

export function calculateTopAssets(
  query: DashboardQuery,
): Promise<{ name: string; netBookValue: number }[]> {
  return apiRequest(`/api/financial/analytics/fixed-assets/top?fy=${query.fiscalYear}`, () => [
    { name: "Office Building", netBookValue: 6800000.0 },
    { name: "Plant & Machinery - Line 1", netBookValue: 2975000.0 },
    { name: "Computer Equipment", netBookValue: 192500.0 },
    { name: "Office Renovation", netBookValue: 176000.0 },
    { name: "Generator Set", netBookValue: 162500.0 },
  ]);
}

export function generateBudgetVsActualTrend(
  query: DashboardQuery,
): Promise<{ month: string; budget: number; actual: number; forecast: number }[]> {
  return apiRequest(`/api/financial/analytics/budget/trend?fy=${query.fiscalYear}`, () => [
    { month: "Apr '24", budget: 10000000, actual: 8000000, forecast: 10000000 },
    { month: "May '24", budget: 11500000, actual: 9500000, forecast: 11500000 },
    { month: "Jun '24", budget: 13000000, actual: 11200000, forecast: 12800000 },
    { month: "Jul '24", budget: 14500000, actual: 12500000, forecast: 14200000 },
    { month: "Aug '24", budget: 16000000, actual: 13900000, forecast: 15600000 },
    { month: "Sep '24", budget: 18200000, actual: 14800000, forecast: 17200000 },
    { month: "Oct '24", budget: 20500000, actual: 16200000, forecast: 19100000 },
    { month: "Mar '25", budget: 24850000, actual: 18765430, forecast: 21980000 },
  ]);
}

export function generateVarianceAnalysis(
  query: DashboardQuery,
): Promise<{ name: string; variance: number }[]> {
  return apiRequest(`/api/financial/analytics/budget/variance?fy=${query.fiscalYear}`, () => [
    { name: "Sales & Marketing", variance: 1374750.0 },
    { name: "Operations", variance: 1747570.0 },
    { name: "IT", variance: 1008120.0 },
    { name: "Finance", variance: 495700.0 },
    { name: "HR", variance: 585440.0 },
    { name: "R&D", variance: 723460.0 },
    { name: "Administration", variance: 299530.0 },
  ]);
}

export function generateBudgetHealthSummary(query: DashboardQuery): Promise<{
  onTrackCount: number;
  onTrackPct: number;
  atRiskCount: number;
  atRiskPct: number;
  overBudgetCount: number;
  overBudgetPct: number;
}> {
  return apiRequest(`/api/financial/analytics/budget/health?fy=${query.fiscalYear}`, () => ({
    onTrackCount: 28,
    onTrackPct: 50.0,
    atRiskCount: 17,
    atRiskPct: 30.36,
    overBudgetCount: 11,
    overBudgetPct: 19.64,
  }));
}

export function generateFinancialPerformanceTrend(
  query: DashboardQuery,
): Promise<{ month: string; revenue: number; grossProfit: number; netIncome: number }[]> {
  return apiRequest(`/api/financial/analytics/reports/trend?fy=${query.fiscalYear}`, () => [
    { month: "Apr '24", revenue: 10200000.0, grossProfit: 4500000.0, netIncome: 1800000.0 },
    { month: "May '24", revenue: 13500000.0, grossProfit: 5800000.0, netIncome: 2400000.0 },
    { month: "Jun '24", revenue: 18200000.0, grossProfit: 7200000.0, netIncome: 3100000.0 },
    { month: "Jul '24", revenue: 22800000.0, grossProfit: 8900000.0, netIncome: 3900000.0 },
    { month: "Aug '24", revenue: 27900000.0, grossProfit: 10800000.0, netIncome: 4800000.0 },
    { month: "Sep '24", revenue: 32600000.0, grossProfit: 12400000.0, netIncome: 5500000.0 },
    { month: "Oct '24", revenue: 38400000.0, grossProfit: 14600000.0, netIncome: 6500000.0 },
    { month: "Mar '25", revenue: 48753920.0, grossProfit: 18245630.0, netIncome: 7856410.0 },
  ]);
}

export function generateReportsByCategory(
  query: DashboardQuery,
): Promise<{ name: string; count: number; percentage: number; color: string }[]> {
  return apiRequest(
    `/api/financial/analytics/reports/category-split?fy=${query.fiscalYear}`,
    () => [
      { name: "Financial Statements", count: 9, percentage: 37.5, color: "#4F46E5" },
      { name: "Management Reports", count: 6, percentage: 25.0, color: "#06B6D4" },
      { name: "Cash Flow Reports", count: 4, percentage: 16.67, color: "#10B981" },
      { name: "Budget Reports", count: 3, percentage: 12.5, color: "#F59E0B" },
      { name: "Tax Reports", count: 2, percentage: 8.33, color: "#EF4444" },
      { name: "Custom Reports", count: 2, percentage: 8.33, color: "#8B5CF6" },
    ],
  );
}

export function viewRecentReportActivity(
  query: DashboardQuery,
): Promise<
  { id: string; reportName: string; activity: string; performedBy: string; timestamp: string }[]
> {
  return apiRequest(`/api/financial/analytics/reports/activities?fy=${query.fiscalYear}`, () => [
    {
      id: "ACT-001",
      reportName: "Balance Sheet",
      activity: "Generated YTD Balance Sheet",
      performedBy: "Amit Mehra",
      timestamp: "May 20, 2025 10:15 AM",
    },
    {
      id: "ACT-002",
      reportName: "Profit & Loss Statement",
      activity: "Generated Monthly P&L Statement",
      performedBy: "Amit Mehra",
      timestamp: "May 20, 2025 10:15 AM",
    },
    {
      id: "ACT-003",
      reportName: "Cash Flow Statement",
      activity: "Scheduled Monthly PDF Delivery",
      performedBy: "Neha Sharma",
      timestamp: "May 19, 2025 04:30 PM",
    },
    {
      id: "ACT-004",
      reportName: "Budget vs Actual Report",
      activity: "Exported XLSX spreadsheet",
      performedBy: "Rohit Verma",
      timestamp: "May 18, 2025 11:20 AM",
    },
    {
      id: "ACT-005",
      reportName: "Trial Balance",
      activity: "Viewed HTML report details",
      performedBy: "Rohit Verma",
      timestamp: "May 18, 2025 11:20 AM",
    },
  ]);
}

export function generateTaxLiabilityByType(
  query: DashboardQuery,
): Promise<{ name: string; value: number; percentage: number; color: string }[]> {
  return apiRequest(`/api/financial/analytics/tax/type-split?fy=${query.fiscalYear}`, () => [
    { name: "GST", value: 4250000, percentage: 33.09, color: "#4F46E5" },
    { name: "Income Tax", value: 2900000, percentage: 22.56, color: "#3B82F6" },
    { name: "TDS - Salaries", value: 1250000, percentage: 9.73, color: "#10B981" },
    { name: "TDS - Contractors", value: 680000, percentage: 5.29, color: "#EF4444" },
    { name: "VAT", value: 980000, percentage: 7.63, color: "#F59E0B" },
    { name: "Others", value: 2785760, percentage: 21.7, color: "#8B5CF6" },
  ]);
}

export function generateTaxLiabilityTrend(
  query: DashboardQuery,
): Promise<{ month: string; liability: number; paid: number }[]> {
  return apiRequest(`/api/financial/analytics/tax/trend?fy=${query.fiscalYear}`, () => [
    { month: "Apr '24", liability: 800000, paid: 600000 },
    { month: "May '24", liability: 1100000, paid: 800000 },
    { month: "Jun '24", liability: 1500000, paid: 1100000 },
    { month: "Jul '24", liability: 1200000, paid: 950000 },
    { month: "Aug '24", liability: 1650000, paid: 1300000 },
    { month: "Sep '24", liability: 1350000, paid: 1100000 },
    { month: "Oct '24", liability: 1800000, paid: 1400000 },
    { month: "Mar '25", liability: 12845760, paid: 9456230 },
  ]);
}

export function generateTaxPaymentSummary(
  query: DashboardQuery,
): Promise<{ liabilityYTD: number; paidYTD: number; payable: number; effectiveRate: number }> {
  return apiRequest(`/api/financial/analytics/tax/payment-summary?fy=${query.fiscalYear}`, () => ({
    liabilityYTD: 12845760.0,
    paidYTD: 9456230.0,
    payable: 3389530.0,
    effectiveRate: 24.36,
  }));
}

export function generateCostCenterTrend(
  query: DashboardQuery,
): Promise<{ month: string; budget: number; actual: number; forecast: number }[]> {
  return apiRequest(`/api/financial/analytics/cost-centers/trend?fy=${query.fiscalYear}`, () => [
    { month: "Apr '24", budget: 1500000, actual: 1100000, forecast: 1400000 },
    { month: "May '24", budget: 1600000, actual: 1250000, forecast: 1500000 },
    { month: "Jun '24", budget: 1800000, actual: 1400000, forecast: 1700000 },
    { month: "Jul '24", budget: 1750000, actual: 1350000, forecast: 1650000 },
    { month: "Aug '24", budget: 1900000, actual: 1500000, forecast: 1850000 },
    { month: "Sep '24", budget: 1850000, actual: 1450000, forecast: 1800000 },
    { month: "Oct '24", budget: 2000000, actual: 1600000, forecast: 1950000 },
    { month: "Nov '24", budget: 2100000, actual: 1700000, forecast: 2050000 },
    { month: "Dec '24", budget: 2200000, actual: 1850000, forecast: 2150000 },
    { month: "Jan '25", budget: 2300000, actual: 1950000, forecast: 2250000 },
    { month: "Feb '25", budget: 2400000, actual: 2050000, forecast: 2350000 },
    { month: "Mar '25", budget: 2500000, actual: 2200000, forecast: 2450000 },
  ]);
}

export function generateCostCenterDepartmentSplit(
  query: DashboardQuery,
): Promise<{ name: string; value: number; percentage: number; color: string }[]> {
  return apiRequest(
    `/api/financial/analytics/cost-centers/dept-split?fy=${query.fiscalYear}`,
    () => [
      { name: "Sales", value: 4983320, percentage: 26.55, color: "#4F46E5" },
      { name: "IT", value: 3085600, percentage: 16.45, color: "#3B82F6" },
      { name: "Finance", value: 2320750, percentage: 12.37, color: "#10B981" },
      { name: "R&D", value: 2145790, percentage: 11.43, color: "#EF4444" },
      { name: "Marketing", value: 2010200, percentage: 10.72, color: "#F59E0B" },
      { name: "Others", value: 4219770, percentage: 22.48, color: "#8B5CF6" },
    ],
  );
}

export function generateCostCenterVariances(
  query: DashboardQuery,
): Promise<{ costCenter: string; variance: number; percentage: number }[]> {
  return apiRequest(
    `/api/financial/analytics/cost-centers/variances?fy=${query.fiscalYear}`,
    () => [
      { costCenter: "Sales", variance: 1516680.0, percentage: 23.33 },
      { costCenter: "Finance", variance: 779250.0, percentage: 25.14 },
      { costCenter: "Marketing", variance: 739800.0, percentage: 26.9 },
      { costCenter: "IT", variance: 1164400.0, percentage: 27.4 },
      { costCenter: "HR", variance: 665340.0, percentage: 44.36 },
      { costCenter: "Administration", variance: 454570.0, percentage: 20.2 },
      { costCenter: "Production", variance: 343000.0, percentage: 34.3 },
      { costCenter: "R&D", variance: 854210.0, percentage: 28.47 },
    ],
  );
}

export function generateCostCenterHierarchyModel(
  query: DashboardQuery,
): Promise<CostCenterHierarchyNode> {
  return apiRequest(
    `/api/financial/analytics/cost-centers/hierarchy?fy=${query.fiscalYear}`,
    () => ({
      name: "Total Organization",
      children: [
        {
          name: "Administration",
          children: [{ name: "HR" }, { name: "R&D" }, { name: "Accounts" }, { name: "Legal" }],
        },
        {
          name: "Finance",
        },
        {
          name: "Operations",
          children: [{ name: "Production" }, { name: "Supply Chain" }],
        },
        {
          name: "Commercial",
          children: [{ name: "Sales" }, { name: "Marketing" }],
        },
        {
          name: "Technology",
          children: [{ name: "IT" }, { name: "R&D" }],
        },
      ],
    }),
  );
}

export function generateProfitabilityTrend(
  query: DashboardQuery,
): Promise<ProfitabilityTrendPoint[]> {
  return apiRequest(`/api/financial/analytics/profitability/trend?fy=${query.fiscalYear}`, () => [
    { month: "Apr '24", netProfit: 400000, netMargin: 14.5 },
    { month: "May '24", netProfit: 420000, netMargin: 15.1 },
    { month: "Jun '24", netProfit: 480000, netMargin: 14.8 },
    { month: "Jul '24", netProfit: 450000, netMargin: 14.2 },
    { month: "Aug '24", netProfit: 520000, netMargin: 15.3 },
    { month: "Sep '24", netProfit: 600000, netMargin: 14.9 },
    { month: "Oct '24", netProfit: 650000, netMargin: 14.1 },
    { month: "Nov '24", netProfit: 700000, netMargin: 14.7 },
    { month: "Dec '24", netProfit: 780000, netMargin: 15.0 },
    { month: "Jan '25", netProfit: 800000, netMargin: 14.9 },
    { month: "Feb '25", netProfit: 850000, netMargin: 15.2 },
    { month: "Mar '25", netProfit: 1000000, netMargin: 15.8 },
  ]);
}

export function generateRegionalProfitability(
  query: DashboardQuery,
): Promise<RegionalProfitabilityPoint[]> {
  return apiRequest(
    `/api/financial/analytics/profitability/regional?fy=${query.fiscalYear}`,
    () => [
      { region: "North America", netMargin: 18.91 },
      { region: "Europe", netMargin: 17.42 },
      { region: "Asia Pacific", netMargin: 16.83 },
      { region: "Middle East", netMargin: 15.27 },
      { region: "South America", netMargin: 13.58 },
      { region: "Africa", netMargin: 12.11 },
    ],
  );
}

export function generateSalesChannelProfitability(
  query: DashboardQuery,
): Promise<SalesChannelProfitabilityPoint[]> {
  return apiRequest(
    `/api/financial/analytics/profitability/sales-channel?fy=${query.fiscalYear}`,
    () => [
      { name: "Direct Sales", value: 4320000, percentage: 20.34, color: "#4F46E5" },
      { name: "Distributors", value: 2910000, percentage: 17.89, color: "#3B82F6" },
      { name: "Online Sales", value: 1630000, percentage: 18.17, color: "#10B981" },
      { name: "Retail Partners", value: 980000, percentage: 16.25, color: "#F59E0B" },
      { name: "Others", value: 480000, percentage: 15.32, color: "#8B5CF6" },
    ],
  );
}

export function generateTopPerformers(query: DashboardQuery): Promise<TopPerformer[]> {
  return apiRequest(
    `/api/financial/analytics/profitability/top-performers?fy=${query.fiscalYear}`,
    () => [
      { rank: 1, name: "Spare Parts", netMargin: 23.33, netProfit: 512470.0 },
      { rank: 2, name: "Control Systems", netMargin: 19.73, netProfit: 642790.0 },
      { rank: 3, name: "Valves & Fittings", netMargin: 19.37, netProfit: 1890450.0 },
    ],
  );
}
