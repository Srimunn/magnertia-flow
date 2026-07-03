import { apiRequest } from "./apiClient";
import {
  accountActivity,
  allTransactions,
  chartOfAccounts,
  dashKpis,
  ledgerKpisRaw,
  recentTxns,
} from "@/lib/mock-data";
import type {
  AccountNode,
  AccountSummary,
  DashboardQuery,
  JournalDetail,
  LedgerJournalEntry,
  Transaction,
  TrialBalanceReport,
} from "./types";

export function calculateNetProfit(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/general-ledger/net-profit?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => dashKpis.netProfit,
  );
}

export function fetchLatestTransactions(query: DashboardQuery): Promise<Transaction[]> {
  return apiRequest(
    `/api/financial/general-ledger/transactions/latest?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => recentTxns,
  );
}

// -- General Ledger dashboard KPIs --

function flattenAccounts(nodes: AccountNode[]): AccountNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenAccounts(node.children) : [])]);
}

function findAccount(code: string): AccountNode | null {
  return flattenAccounts(chartOfAccounts).find((a) => a.code === code) ?? null;
}

export function calculateTotalAccounts(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/general-ledger/accounts/total?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ledgerKpisRaw.totalAccounts,
  );
}

export function calculateTotalDebits(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/general-ledger/debits/total?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ledgerKpisRaw.totalDebits,
  );
}

export function calculateTotalCredits(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/general-ledger/credits/total?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ledgerKpisRaw.totalCredits,
  );
}

export function calculateNetIncome(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/general-ledger/net-income?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ledgerKpisRaw.netIncome,
  );
}

export function retrieveCurrentAccountingPeriod(
  query: DashboardQuery,
): Promise<{ period: string; status: "Open" | "Closed" }> {
  return apiRequest(
    `/api/financial/general-ledger/accounting-period?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({ period: ledgerKpisRaw.currentPeriod, status: ledgerKpisRaw.periodStatus }),
  );
}

// -- Per-account views --

export function retrieveAccountSummary(code: string): Promise<AccountSummary | null> {
  return apiRequest(`/api/financial/general-ledger/accounts/${code}/summary`, () => {
    const account = findAccount(code);
    if (!account) return null;
    const endingBalance = account.debit - account.credit;
    return {
      code: account.code,
      name: account.name,
      status: account.status,
      accountType: account.group,
      accountGroup: account.group,
      normalBalance: account.normalBalance,
      currency: "USD",
      openingBalance: account.openingBalance ?? 0,
      periodDebit: account.debit,
      periodCredit: account.credit,
      endingBalance,
    };
  });
}

export function fetchTransactionHistory(code: string): Promise<LedgerJournalEntry[]> {
  return apiRequest(`/api/financial/general-ledger/accounts/${code}/activity`, () => {
    const hardAuthored = accountActivity[code];
    if (hardAuthored) return hardAuthored;

    const account = findAccount(code);
    if (!account) return [];
    // No hand-authored history for this account — synthesize a single
    // opening-to-current entry so the tab isn't empty, rather than faking a
    // multi-row history the mock data doesn't actually have.
    return [
      {
        date: ledgerKpisRaw.currentPeriod,
        ref: `OB-${account.code}`,
        description: `${account.name} — period activity`,
        debit: account.debit,
        credit: account.credit,
        balance: account.debit - account.credit,
      },
    ];
  });
}

export function generateTrialBalance(query: DashboardQuery): Promise<TrialBalanceReport> {
  return apiRequest(
    `/api/financial/general-ledger/trial-balance?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => {
      const leaves = flattenAccounts(chartOfAccounts).filter((a) => !a.children);
      const rows = leaves.map((a) => ({
        code: a.code,
        name: a.name,
        debit: a.debit,
        credit: a.credit,
      }));
      const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
      const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);
      return { rows, totalDebit, totalCredit };
    },
  );
}

// Matches the sequence diagram's [Journal Entry] branch.
export function retrieveJournalEntry(ref: string): Promise<JournalDetail | null> {
  return apiRequest(`/api/financial/general-ledger/entries/${ref}`, () => {
    const row = allTransactions.find((t) => t.ref === ref);
    if (!row) return null;
    const debit = row.amount < 0 ? Math.abs(row.amount) : 0;
    const credit = row.amount >= 0 ? row.amount : 0;
    return {
      source: "journal",
      ref: row.ref,
      type: row.type,
      date: row.date,
      description: row.description,
      account: row.account,
      amount: row.amount,
      status: row.status,
      memo: row.description,
      debit,
      credit,
    };
  });
}
