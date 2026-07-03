import { apiRequest } from "./apiClient";
import {
  mockBankAccounts,
  mockCashTransactions,
  mockCheques,
  mockDeposits,
  dashKpis,
} from "@/lib/mock-data";
import type {
  CashPosition,
  DashboardQuery,
  CashTransaction,
  NewCashTransactionInput,
  ChequeRecord,
  DepositRecord,
} from "./types";

export function fetchCashBalance(query: DashboardQuery): Promise<CashPosition> {
  return apiRequest(
    `/api/financial/cash-bank/balance?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => {
      // Sum balances of all accounts
      const total = mockBankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
      return { cashBalance: total };
    },
  );
}

export function calculateOperatingCash(query: DashboardQuery): Promise<number> {
  return apiRequest(`/api/financial/cash-bank/operating-cash?fy=${query.fiscalYear}`, () => {
    // Sum balances of accounts with type === "Operating"
    return mockBankAccounts
      .filter((acc) => acc.type === "Operating")
      .reduce((sum, acc) => sum + acc.currentBalance, 0);
  });
}

export function calculateCashFlowMtd(
  query: DashboardQuery,
): Promise<{ inflow: number; outflow: number; netFlow: number }> {
  return apiRequest(`/api/financial/cash-bank/mtd-flow?fy=${query.fiscalYear}`, () => {
    // Return fixed mockup values or aggregate from mockTransactions
    return {
      inflow: 8945320.0,
      outflow: 6781240.0,
      netFlow: 2164080.0,
    };
  });
}

export function fetchCashTransactions(query: DashboardQuery): Promise<CashTransaction[]> {
  return apiRequest(
    `/api/financial/cash-transactions?fy=${query.fiscalYear}`,
    () => mockCashTransactions,
  );
}

export function saveCashTransaction(input: NewCashTransactionInput): Promise<CashTransaction> {
  return apiRequest(`/api/financial/cash-transactions`, () => {
    const newTx: CashTransaction = {
      id: `CT-0${mockCashTransactions.length + 1}`,
      date: input.date,
      description: input.description,
      type: input.type,
      amount: Number(input.amount),
      bankAccountNo: input.bankAccountNo,
      reference: input.reference,
      category: input.category,
      status: "Posted" as const,
    };

    // Update bank account balance
    const account = mockBankAccounts.find((a) => a.accountNo === input.bankAccountNo);
    if (account) {
      if (input.type === "Inflow") {
        account.currentBalance += Number(input.amount);
      } else {
        account.currentBalance -= Number(input.amount);
      }
    }

    mockCashTransactions.unshift(newTx);
    return newTx;
  });
}

export function fetchCheques(query: DashboardQuery): Promise<ChequeRecord[]> {
  return apiRequest(`/api/financial/cash-bank/cheques?fy=${query.fiscalYear}`, () => mockCheques);
}

export function fetchDeposits(query: DashboardQuery): Promise<DepositRecord[]> {
  return apiRequest(`/api/financial/cash-bank/deposits?fy=${query.fiscalYear}`, () => mockDeposits);
}
