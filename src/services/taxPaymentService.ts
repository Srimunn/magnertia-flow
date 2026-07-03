import { apiRequest } from "./apiClient";
import { mockTaxPayments, mockTaxObligations } from "@/lib/mock-data";
import type { TaxPayment, NewTaxPaymentInput, DashboardQuery } from "./types";

export function fetchPayments(query: DashboardQuery): Promise<TaxPayment[]> {
  return apiRequest(`/api/financial/tax/payments?fy=${query.fiscalYear}`, () => mockTaxPayments);
}

export function recordTaxPayment(input: NewTaxPaymentInput): Promise<TaxPayment> {
  return apiRequest(`/api/financial/tax/payments`, () => {
    const nextId = `PAY-0${mockTaxPayments.length + 1}`;
    const newPay: TaxPayment = {
      id: nextId,
      taxType: input.taxType,
      period: input.period,
      paymentDate: new Date().toISOString().substring(0, 10),
      bankAccount: input.bankAccount,
      amount: Number(input.amount),
      transactionRef: input.transactionRef,
      status: "Cleared" as const,
    };

    // Also update matching obligation's paid amount
    const match = mockTaxObligations.find((o) => o.taxType === input.taxType);
    if (match) {
      match.paid = Math.min(match.taxLiability, match.paid + Number(input.amount));
      match.payable = Math.max(0, match.taxLiability - match.paid);
      match.status = match.payable === 0 ? "Paid" : "Partially Paid";
    }

    mockTaxPayments.unshift(newPay);
    return newPay;
  });
}
