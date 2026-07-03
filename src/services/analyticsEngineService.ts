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
