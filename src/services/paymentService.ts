import { apiRequest } from "./apiClient";
import { apKpisRaw, payableInvoices } from "@/lib/mock-data";
import type { DashboardQuery, PayableInvoice, RecordPaymentInput } from "./types";

// Matches the diagram's "Retrieve Paid Amount" step.
export function retrievePaidAmount(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/payments/paid-this-month?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => apKpisRaw.paidThisMonth,
  );
}

export function processPayment(input: RecordPaymentInput): Promise<PayableInvoice> {
  return apiRequest(`/api/financial/payments/${input.invoiceNo}`, () => {
    const invoice = payableInvoices.find((i) => i.invoiceNo === input.invoiceNo);
    if (!invoice) throw new Error(`Invoice ${input.invoiceNo} not found`);
    invoice.dueAmount = Math.max(0, invoice.dueAmount - input.amount);
    if (invoice.dueAmount === 0) invoice.status = "Paid";
    return invoice;
  });
}
