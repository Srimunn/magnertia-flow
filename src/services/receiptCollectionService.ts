import { apiRequest } from "./apiClient";
import { arKpisRaw, receivableInvoices } from "@/lib/mock-data";
import type { DashboardQuery, ReceivableInvoice, ReceivePaymentInput } from "./types";

// Matches the diagram's "Retrieve Collection Summary" step for the KPI row.
export function retrieveCollectionAmount(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/receipt-collection/collected-this-month?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => arKpisRaw.collectedThisMonth,
  );
}

export function recordReceipt(input: ReceivePaymentInput): Promise<ReceivableInvoice> {
  return apiRequest(`/api/financial/receipt-collection/receipts/${input.invoiceNo}`, () => {
    const invoice = receivableInvoices.find((i) => i.invoiceNo === input.invoiceNo);
    if (!invoice) throw new Error(`Invoice ${input.invoiceNo} not found`);
    invoice.dueAmount = Math.max(0, invoice.dueAmount - input.amount);
    invoice.status = invoice.dueAmount === 0 ? "Paid" : "Partially Paid";
    return invoice;
  });
}
