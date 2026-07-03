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
import type {
  AccountsPayableKpis,
  AccountsReceivableKpis,
  DashboardData,
  DashboardQuery,
  LedgerKpis,
  TransactionsKpis,
  CashBankDashboardData,
} from "./types";

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
