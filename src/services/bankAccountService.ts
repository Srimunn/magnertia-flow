import { apiRequest } from "./apiClient";
import { mockBankAccounts } from "@/lib/mock-data";
import type { BankAccount, BankAccountFilters, DashboardQuery, NewBankAccountInput } from "./types";

export function fetchBankAccounts(
  query: DashboardQuery,
  filters: BankAccountFilters,
): Promise<BankAccount[]> {
  return apiRequest(
    `/api/financial/bank-accounts?search=${encodeURIComponent(filters.search)}&type=${filters.type}&status=${filters.status}&currency=${filters.currency}`,
    () => {
      let list = [...mockBankAccounts];
      if (filters.search) {
        const s = filters.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.name.toLowerCase().includes(s) ||
            a.bankName.toLowerCase().includes(s) ||
            a.accountNo.includes(s),
        );
      }
      if (filters.type !== "All Types") {
        list = list.filter((a) => a.type === filters.type);
      }
      if (filters.status !== "All Statuses") {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters.currency !== "All Currency") {
        list = list.filter((a) => a.currency === filters.currency);
      }
      return list;
    },
  );
}

export function retrieveBankAccountDetails(accountNo: string): Promise<BankAccount | undefined> {
  return apiRequest(`/api/financial/bank-accounts/${accountNo}`, () =>
    mockBankAccounts.find((a) => a.accountNo === accountNo),
  );
}

export function saveBankAccount(input: NewBankAccountInput): Promise<BankAccount> {
  return apiRequest(`/api/financial/bank-accounts`, () => {
    const newAcc: BankAccount = {
      id: `BA-00${mockBankAccounts.length + 1}`,
      name: input.name,
      bankName: input.bankName,
      type: input.type,
      accountNo: input.accountNo,
      currency: input.currency,
      currentBalance: Number(input.initialBalance),
      status: "Active" as const,
      reconciliationStatus: "Not Reconciled" as const,
      unreconciledAmount: Number(input.initialBalance),
    };
    mockBankAccounts.push(newAcc);
    return newAcc;
  });
}
