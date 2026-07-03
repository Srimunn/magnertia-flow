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
import type {
  AccountsPayableKpis,
  AccountsReceivableKpis,
  DashboardData,
  DashboardQuery,
  LedgerKpis,
  TransactionsKpis,
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
