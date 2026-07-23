import {
  getAccountsTreeFn,
  getLedgerDashboardDataFn,
  getAccountActivityFn,
  getTrialBalanceReportFn,
  getIntegrationSettingsFn,
  updateIntegrationSettingsFn,
} from "@/lib/generalLedgerFns.server";
import type {
  AccountNode,
  AccountSummary,
  DashboardQuery,
  JournalDetail,
  LedgerJournalEntry,
  Transaction,
  TrialBalanceReport,
} from "./types";

// Expose full dashboard KPI + AI Intelligence retrieval helper
export async function fetchLedgerDashboardData() {
  try {
    return await getLedgerDashboardDataFn();
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message || "Failed to connect to MongoDB",
    };
  }
}

export async function calculateNetProfit(query: DashboardQuery): Promise<number> {
  const res = await getLedgerDashboardDataFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data.kpis.netProfit;
}

export async function fetchLatestTransactions(query: DashboardQuery): Promise<Transaction[]> {
  return []; // KPI row transaction list is not used on home dashboard
}

// -- General Ledger dashboard KPIs --
export async function calculateTotalAccounts(query: DashboardQuery): Promise<number> {
  const res = await getLedgerDashboardDataFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data.kpis.totalAccounts;
}

export async function calculateTotalDebits(query: DashboardQuery): Promise<number> {
  const res = await getLedgerDashboardDataFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data.kpis.totalDebits;
}

export async function calculateTotalCredits(query: DashboardQuery): Promise<number> {
  const res = await getLedgerDashboardDataFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data.kpis.totalCredits;
}

export async function calculateNetIncome(query: DashboardQuery): Promise<number> {
  const res = await getLedgerDashboardDataFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data.kpis.netIncome;
}

export async function retrieveCurrentAccountingPeriod(
  query: DashboardQuery,
): Promise<{ period: string; status: "Open" | "Closed" }> {
  const res = await getLedgerDashboardDataFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return {
    period: res.data.kpis.currentPeriod,
    status: res.data.kpis.periodStatus as "Open" | "Closed",
  };
}

// -- Per-account views --
export async function retrieveAccountSummary(code: string): Promise<AccountSummary | null> {
  const res = await getAccountsTreeFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);

  const findNode = (nodes: AccountNode[]): AccountNode | null => {
    for (const n of nodes) {
      if (n.code === code) return n;
      if (n.children) {
        const found = findNode(n.children);
        if (found) return found;
      }
    }
    return null;
  };

  const node = findNode(res.data);
  if (!node) return null;

  return {
    code: node.code,
    name: node.name,
    status: node.status,
    accountType: node.type,
    accountGroup: node.group,
    normalBalance: node.normalBalance,
    currency: "INR",
    openingBalance: node.openingBalance ?? 0,
    periodDebit: node.debit,
    periodCredit: node.credit,
    endingBalance: node.debit - node.credit,
  };
}

export async function fetchTransactionHistory(code: string): Promise<LedgerJournalEntry[]> {
  const res = await getAccountActivityFn({ data: code });
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data;
}

export async function generateTrialBalance(query: DashboardQuery): Promise<TrialBalanceReport> {
  const res = await getTrialBalanceReportFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data;
}

// Load and Save Integration Settings
export async function fetchIntegrationSettings() {
  try {
    return await getIntegrationSettingsFn();
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load settings",
    };
  }
}

export async function updateIntegrationSettings(settings: Record<string, string>) {
  return updateIntegrationSettingsFn({ data: settings });
}

export function retrieveJournalEntry(ref: string): Promise<JournalDetail | null> {
  return Promise.resolve(null);
}
