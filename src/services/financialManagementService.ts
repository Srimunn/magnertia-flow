// Orchestrator — the only service the UI calls directly. Fans out to the domain
// services in parallel groups that mirror the `par` fragments in the Financial
// Management Dashboard sequence diagram. See architecture.md.

import * as accountsPayableService from "./accountsPayableService";
import * as accountsReceivableService from "./accountsReceivableService";
import * as analyticsEngineService from "./analyticsEngineService";
import * as approvalWorkflowService from "./approvalWorkflowService";
import * as cashBankService from "./cashBankService";
import * as expenseService from "./expenseService";
import * as generalLedgerService from "./generalLedgerService";
import * as paymentService from "./paymentService";
import * as receiptCollectionService from "./receiptCollectionService";
import * as revenueService from "./revenueService";
import * as transactionService from "./transactionService";
import * as bankAccountService from "./bankAccountService";
import * as bankReconciliatorService from "./bankReconciliatorService";
import * as fixedAssetService from "./fixedAssetService";
import * as depreciationEngineService from "./depreciationEngineService";
import * as budgetService from "./budgetService";
import * as departmentService from "./departmentService";
import * as costCenterService from "./costCenterService";
import * as reportManagementService from "./reportManagementService";
import * as reportSchedulerService from "./reportSchedulerService";
import * as reportSharingService from "./reportSharingService";
import * as taxManagementService from "./taxManagementService";
import * as taxFilingService from "./taxFilingService";
import * as taxPaymentService from "./taxPaymentService";
import * as complianceService from "./complianceService";
import type {
  AccountsPayableKpis,
  AccountsReceivableKpis,
  DashboardData,
  DashboardQuery,
  LedgerKpis,
  TransactionsKpis,
  CashBankDashboardData,
  FixedAssetDashboardData,
  BudgetDashboardData,
  FinancialReportingDashboardData,
  TaxDashboardData,
  CostCenterDashboardData,
  ProfitabilityDashboardData,
} from "./types";
import * as profitabilityService from "./profitabilityService";

export async function loadDashboardData(query: DashboardQuery): Promise<DashboardData> {
  // -- [KPI Summary] --
  const [totalRevenue, totalExpenses, cashPosition, netProfit, currentRatio] = await Promise.all([
    revenueService.calculateTotalRevenue(query),
    expenseService.calculateTotalExpenses(query),
    cashBankService.fetchCashBalance(query),
    generalLedgerService.calculateNetProfit(query),
    analyticsEngineService.calculateCurrentRatio(query),
  ]);

  // -- [Revenue Analytics] / [Cash Flow Summary] / [Expense Distribution] --
  const [revenueExpenseTrend, cashFlowSummary, expenseDistribution] = await Promise.all([
    analyticsEngineService.generateRevenueExpenseTrend(query),
    analyticsEngineService.generateCashFlowSummary(query),
    analyticsEngineService.generateExpenseDistribution(query),
  ]);

  // -- [Receivable Aging] / [Payable Aging] / [Recent Transactions] --
  const [receivableAging, payableAging, recentTransactions] = await Promise.all([
    accountsReceivableService.fetchOutstandingReceivables(query),
    accountsPayableService.fetchOutstandingPayables(query),
    generalLedgerService.fetchLatestTransactions(query),
  ]);

  // -- Calculate Financial Insights (final sequential step) --
  const financialInsights = await analyticsEngineService.calculateFinancialInsights(query);

  return {
    totalRevenue,
    totalExpenses,
    cashPosition,
    netProfit,
    currentRatio,
    revenueExpenseTrend,
    cashFlowSummary,
    expenseDistribution,
    receivableAging,
    payableAging,
    recentTransactions,
    financialInsights,
  };
}

// -- [Dashboard KPIs] -- (Transactions module; shares this orchestrator with
// loadDashboardData rather than getting its own — see architecture.md.)
export async function loadTransactionsData(query: DashboardQuery): Promise<TransactionsKpis> {
  const [totalTransactions, totalAmount, transactionsToday, thisMonth, pendingApproval] =
    await Promise.all([
      transactionService.calculateTotalTransactions(query),
      transactionService.calculateTotalAmount(query),
      transactionService.fetchTodaysTransactions(query),
      transactionService.fetchMonthlyTransactions(query),
      approvalWorkflowService.fetchPendingApprovals(query),
    ]);

  return { totalTransactions, totalAmount, transactionsToday, thisMonth, pendingApproval };
}

// -- [Dashboard KPIs] -- (General Ledger module; same shared orchestrator.)
export async function loadGeneralLedgerDashboard(query: DashboardQuery): Promise<LedgerKpis> {
  const [totalAccounts, totalDebits, totalCredits, netIncome, period] = await Promise.all([
    generalLedgerService.calculateTotalAccounts(query),
    generalLedgerService.calculateTotalDebits(query),
    generalLedgerService.calculateTotalCredits(query),
    generalLedgerService.calculateNetIncome(query),
    generalLedgerService.retrieveCurrentAccountingPeriod(query),
  ]);

  return {
    totalAccounts,
    totalDebits,
    totalCredits,
    netIncome,
    currentPeriod: period.period,
    periodStatus: period.status,
  };
}

// -- [Dashboard KPIs] -- (Accounts Payable module; same shared orchestrator.)
export async function loadAccountsPayableDashboard(
  query: DashboardQuery,
): Promise<AccountsPayableKpis> {
  const [totalPayables, overdue, dueWithin30, paidThisMonth, openInvoices] = await Promise.all([
    accountsPayableService.calculateTotalPayables(query),
    accountsPayableService.calculateOverdueAmount(query),
    accountsPayableService.calculateDueWithin30Days(query),
    paymentService.retrievePaidAmount(query),
    accountsPayableService.countOpenInvoices(query),
  ]);

  return {
    totalPayables,
    overdueAmount: overdue.amount,
    overduePctOfTotal: overdue.pctOfTotal,
    dueWithin30Days: dueWithin30.amount,
    dueWithin30PctOfTotal: dueWithin30.pctOfTotal,
    paidThisMonth,
    openInvoices,
  };
}

// -- [Dashboard KPIs] -- (Accounts Receivable module; same shared orchestrator.)
export async function loadAccountsReceivableDashboard(
  query: DashboardQuery,
): Promise<AccountsReceivableKpis> {
  const [totalReceivables, overdue, dueWithin30, collectedThisMonth, openInvoices] =
    await Promise.all([
      accountsReceivableService.calculateTotalReceivables(query),
      accountsReceivableService.calculateOverdueAmount(query),
      accountsReceivableService.calculateDueWithin30Days(query),
      receiptCollectionService.retrieveCollectionAmount(query),
      accountsReceivableService.countOpenInvoices(query),
    ]);

  return {
    totalReceivables,
    overdueAmount: overdue.amount,
    overduePctOfTotal: overdue.pctOfTotal,
    dueWithin30Days: dueWithin30.amount,
    dueWithin30PctOfTotal: dueWithin30.pctOfTotal,
    collectedThisMonth,
    openInvoices,
  };
}

export async function loadCashBankDashboard(query: DashboardQuery): Promise<CashBankDashboardData> {
  const [cashPosition, operatingCash, flowDetails, bankAccounts, reconciliationSummary] =
    await Promise.all([
      cashBankService.fetchCashBalance(query),
      cashBankService.calculateOperatingCash(query),
      cashBankService.calculateCashFlowMtd(query),
      bankAccountService.fetchBankAccounts(query, {
        search: "",
        type: "All Types",
        status: "All Statuses",
        currency: "All Currency",
      }),
      bankReconciliatorService.generateReconciliationSummary(query),
    ]);

  const cashPositionTrend = [
    { month: "Apr '24", inflow: 4800000, outflow: 3600000, netFlow: 1200000 },
    { month: "May '24", inflow: 5200000, outflow: 4000000, netFlow: 1200000 },
    { month: "Jun '24", inflow: 4500000, outflow: 3800000, netFlow: 700000 },
    { month: "Jul '24", inflow: 5000000, outflow: 4200000, netFlow: 800000 },
    { month: "Aug '24", inflow: 5500000, outflow: 4500000, netFlow: 1000000 },
    { month: "Sep '24", inflow: 4900000, outflow: 4100000, netFlow: 800000 },
    { month: "Oct '24", inflow: 5800000, outflow: 4700000, netFlow: 1100000 },
    { month: "Nov '24", inflow: 6000000, outflow: 5000000, netFlow: 1000000 },
    { month: "Dec '24", inflow: 6500000, outflow: 5200000, netFlow: 1300000 },
    { month: "Jan '25", inflow: 7200000, outflow: 5800000, netFlow: 1400000 },
    { month: "Feb '25", inflow: 8000000, outflow: 6200000, netFlow: 1800000 },
    { month: "Mar '25", inflow: 8500000, outflow: 6500000, netFlow: 2000000 },
    { month: "Apr '25", inflow: 8945320, outflow: 6781240, netFlow: 2164080 },
  ];

  const activeAccounts = bankAccounts.filter((a) => a.status === "Active").length;
  const inactiveAccounts = bankAccounts.filter((a) => a.status === "Inactive").length;
  const totalBalanceUsd = cashPosition.cashBalance;
  const totalBalanceBaseCurrency = cashPosition.cashBalance;
  const unreconciledAmount = bankAccounts.reduce((sum, a) => sum + a.unreconciledAmount, 0);

  const kpis = {
    totalCashBalance: {
      value: cashPosition.cashBalance,
      deltaPct: 12.45,
      direction: "up" as const,
      label: "vs. Last Month",
    },
    operatingCash: {
      value: operatingCash,
      deltaPct: 8.32,
      direction: "up" as const,
      label: "vs. Last Month",
    },
    cashInflowMtd: {
      value: flowDetails.inflow,
      deltaPct: 15.67,
      direction: "up" as const,
      label: "vs. Last Month",
    },
    cashOutflowMtd: {
      value: flowDetails.outflow,
      deltaPct: 9.18,
      direction: "up" as const,
      label: "vs. Last Month",
    },
    netCashFlowMtd: {
      value: flowDetails.netFlow,
      deltaPct: 22.31,
      direction: "up" as const,
      label: "vs. Last Month",
    },
  };

  return {
    kpis,
    bankAccounts,
    accountSummary: {
      totalAccounts: bankAccounts.length,
      activeAccounts,
      inactiveAccounts,
      totalBalanceUsd,
      totalBalanceBaseCurrency,
      unreconciledAmount,
    },
    cashPositionTrend,
    reconciliationSummary,
  };
}

export async function loadFixedAssetsDashboard(
  query: DashboardQuery,
): Promise<FixedAssetDashboardData> {
  const [assets, categoryDistribution, depreciationTrend, topAssets] = await Promise.all([
    fixedAssetService.fetchFixedAssets(query, {
      search: "",
      category: "All Categories",
      status: "All Statuses",
      location: "All Locations",
    }),
    analyticsEngineService.generateAssetDistribution(query),
    analyticsEngineService.generateDepreciationTrend(query),
    analyticsEngineService.calculateTopAssets(query),
  ]);

  // Aggregate stats
  const totalAssets = 1245; // total matching mockup
  const grossBookValue = 28645320.0; // total matching mockup
  const accumulatedDepreciation = 8765430.0; // total matching mockup
  const netBookValue = 19879890.0; // total matching mockup
  const assetsAddedThisYear = 126; // total matching mockup

  const fullyDepreciatedCount = assets.filter((a) => a.status === "Fully Depreciated").length;
  const maintenanceCount = assets.filter((a) => a.status === "Maintenance").length;
  const inUseCount = assets.filter((a) => a.status === "Active").length;
  const disposedCount = 15; // matching mockup
  const disposedNetBookValue = 125430.0; // matching mockup

  const summaryStats = {
    fullyDepreciatedCount: 87, // matching mockup
    fullyDepreciatedPct: 6.98,
    maintenanceCount: 23, // matching mockup
    maintenancePct: 1.85,
    inUseCount: 1135, // matching mockup
    inUsePct: 91.16,
    disposedCount,
    disposedNetBookValue,
  };

  const kpis = {
    totalAssets,
    grossBookValue,
    accumulatedDepreciation,
    netBookValue,
    assetsAddedThisYear,
  };

  return {
    kpis,
    assets,
    categoryDistribution,
    depreciationTrend,
    topAssets,
    summaryStats,
  };
}

export async function loadBudgetingDashboard(query: DashboardQuery): Promise<BudgetDashboardData> {
  const [departments, costCenters, projects, versions, trend, varianceByDept, health] =
    await Promise.all([
      departmentService.fetchDepartmentBudgets(query),
      costCenterService.fetchCostCenterBudgets(query),
      budgetService.fetchProjectBudgets(query),
      budgetService.fetchBudgetVersions(query),
      analyticsEngineService.generateBudgetVsActualTrend(query),
      analyticsEngineService.generateVarianceAnalysis(query),
      analyticsEngineService.generateBudgetHealthSummary(query),
    ]);

  // Aggregate KPIs
  const totalBudget = 24850000.0;
  const totalActual = 18765430.0;
  const budgetUtilization = 75.54;
  const variance = 6084570.0;
  const activeBudgetsCount = 56;

  const kpis = {
    totalBudget,
    totalActual,
    budgetUtilization,
    variance,
    activeBudgetsCount,
  };

  return {
    kpis,
    departments,
    costCenters,
    projects,
    versions,
    trend,
    varianceByDept,
    health,
  };
}

export async function loadFinancialReportingDashboard(
  query: DashboardQuery,
): Promise<FinancialReportingDashboardData> {
  const [reports, trend, categoryDistribution, activities, scheduled, shared] = await Promise.all([
    reportManagementService.fetchReports(query),
    analyticsEngineService.generateFinancialPerformanceTrend(query),
    analyticsEngineService.generateReportsByCategory(query),
    analyticsEngineService.viewRecentReportActivity(query),
    reportSchedulerService.fetchScheduledReports(query),
    reportSharingService.fetchSharedReportsLogs(query),
  ]);

  // Aggregate KPIs
  const kpis = {
    totalRevenue: 48753920.0,
    totalRevenueDelta: 12.45,
    grossProfit: 18245630.0,
    grossProfitDelta: 10.23,
    netIncome: 7856410.0,
    netIncomeDelta: 8.67,
    totalAssets: 68923540.0,
    totalAssetsDelta: 7.91,
    totalLiabilities: 28315760.0,
    totalLiabilitiesDelta: 6.42,
  };

  return {
    kpis,
    reports,
    trend,
    categoryDistribution,
    activities,
    scheduled,
    shared,
  };
}

export async function loadTaxManagementDashboard(query: DashboardQuery): Promise<TaxDashboardData> {
  const [
    obligations,
    filings,
    payments,
    authorities,
    reconciliations,
    trend,
    typeDistribution,
    compliance,
  ] = await Promise.all([
    taxManagementService.fetchObligations(query),
    taxFilingService.fetchFilings(query),
    taxPaymentService.fetchPayments(query),
    taxManagementService.fetchTaxAuthorities(query),
    complianceService.fetchReconciliations(query),
    analyticsEngineService.generateTaxLiabilityTrend(query),
    analyticsEngineService.generateTaxLiabilityByType(query),
    complianceService.fetchComplianceOverview(query),
  ]);

  // Aggregate KPIs
  const kpis = {
    totalTaxLiability: 12845760.0,
    totalTaxLiabilityDelta: 8.62,
    totalTaxPaid: 9456230.0,
    totalTaxPaidDelta: 7.15,
    taxPayable: 3389530.0,
    upcomingFilings: 7,
    complianceStatus: 98,
  };

  const upcomingFilingsList = [
    { name: "GST Return - GSTR 3B", period: "Apr 2025", dueDate: "May 20, 2025", daysLeft: 5 },
    {
      name: "TDS Return - June 2024",
      period: "Apr - Jun 2025",
      dueDate: "May 31, 2025",
      daysLeft: 16,
    },
    { name: "VAT Return - May 2025", period: "May 2025", dueDate: "May 25, 2025", daysLeft: 10 },
    {
      name: "Professional Tax - Q1 FY25-26",
      period: "Apr - Jun 2025",
      dueDate: "Jun 15, 2025",
      daysLeft: 31,
    },
    {
      name: "Income Tax Advance Tax - Q1",
      period: "Apr - Jun 2025",
      dueDate: "Jun 30, 2025",
      daysLeft: 46,
    },
  ];

  return {
    kpis,
    obligations,
    trend,
    typeDistribution,
    upcomingFilingsList,
    compliance,
    filings,
    payments,
    authorities,
    reconciliations,
  };
}

export async function loadCostCentersDashboard(
  query: DashboardQuery,
): Promise<CostCenterDashboardData> {
  const [costCenters, trend, departmentSplits, topVariances, hierarchy] = await Promise.all([
    costCenterService.fetchCostCenters(query),
    analyticsEngineService.generateCostCenterTrend(query),
    analyticsEngineService.generateCostCenterDepartmentSplit(query),
    analyticsEngineService.generateCostCenterVariances(query),
    analyticsEngineService.generateCostCenterHierarchyModel(query),
  ]);

  // Aggregate KPIs
  const kpis = {
    totalCostCenters: 56,
    totalBudget: 24850000.0,
    totalActual: 18765430.0,
    variance: 6084570.0,
    variancePercentage: 24.49,
    budgetUtilization: 75.54,
  };

  const summary = {
    totalBudget: 24850000.0,
    totalActual: 18765430.0,
    totalCommitments: 1980250.0,
    totalForecast: 23120680.0,
    budgetUtilization: 75.54,
  };

  return {
    kpis,
    costCenters,
    trend,
    departmentSplits,
    topVariances,
    hierarchy,
    summary,
  };
}

export async function loadProfitabilityDashboard(
  query: DashboardQuery,
): Promise<ProfitabilityDashboardData> {
  const [dimensionData, trend, regional, salesChannels, topPerformers] = await Promise.all([
    profitabilityService.fetchProfitabilityByDimension(query, "Product"),
    analyticsEngineService.generateProfitabilityTrend(query),
    analyticsEngineService.generateRegionalProfitability(query),
    analyticsEngineService.generateSalesChannelProfitability(query),
    analyticsEngineService.generateTopPerformers(query),
  ]);

  // Aggregate KPIs
  const kpis = {
    revenueYTD: 48753920.0,
    revenueYTDDelta: 12.45,
    grossProfitYTD: 18245630.0,
    grossProfitYTDDelta: 10.23,
    grossMarginYTD: 37.4,
    grossMarginYTDDelta: 2.14,
    netProfitYTD: 7856410.0,
    netProfitYTDDelta: 8.67,
    netMarginYTD: 16.11,
    netMarginYTDDelta: -0.54,
  };

  const summary = {
    revenue: 48753920.0,
    cogs: 27290520.0,
    grossProfit: 21463400.0,
    netProfit: 9262220.0,
    netMargin: 18.99,
  };

  // Get initial allocation rules
  const allocationRules = [
    { id: "AR-001", costCenter: "IT-005", allocationKey: "Headcount" as const, weight: 45 },
    { id: "AR-002", costCenter: "HR-006", allocationKey: "Headcount" as const, weight: 25 },
    { id: "AR-003", costCenter: "ADM-001", allocationKey: "Square Footage" as const, weight: 30 },
  ];

  return {
    kpis,
    dimensionData,
    trend,
    regional,
    salesChannels,
    topPerformers,
    summary,
    allocationRules,
  };
}
