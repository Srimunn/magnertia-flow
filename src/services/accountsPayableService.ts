import { apiRequest } from "./apiClient";
import { agingPayable, allTransactions, apKpisRaw, payableInvoices } from "@/lib/mock-data";
import type {
  AgingReport,
  DashboardQuery,
  InvoiceFilters,
  InvoiceSearchResult,
  NewInvoiceInput,
  PayableInvoice,
  PaymentDetail,
} from "./types";

export function fetchOutstandingPayables(query: DashboardQuery): Promise<AgingReport> {
  return apiRequest(
    `/api/financial/accounts-payable/aging?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => agingPayable,
  );
}

// Matches the sequence diagram's [Payment] branch — also used for the Bill
// type, since a bill is just an obligation owed against AP.
export function retrievePaymentInformation(ref: string): Promise<PaymentDetail | null> {
  return apiRequest(`/api/financial/accounts-payable/payments/${ref}`, () => {
    const row = allTransactions.find((t) => t.ref === ref);
    if (!row) return null;

    const totalAmount = Math.abs(row.amount);
    const subtotal = Math.round((totalAmount / 1.08) * 100) / 100;
    const tax = Math.round((totalAmount - subtotal) * 100) / 100;
    const amountPaid = row.status === "Posted" ? totalAmount : 0;
    return {
      source: "payment",
      ref: row.ref,
      type: row.type,
      date: row.date,
      description: row.description,
      account: row.account,
      amount: row.amount,
      status: row.status,
      vendor: row.counterparty ?? "—",
      dueDate: row.dueDate ?? row.date,
      subtotal,
      tax,
      taxRate: 8,
      totalAmount,
      amountPaid,
      balanceDue: totalAmount - amountPaid,
    };
  });
}

// -- Accounts Payable dashboard KPIs --

export function calculateTotalPayables(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/accounts-payable/total?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => apKpisRaw.totalPayables,
  );
}

export function calculateOverdueAmount(
  query: DashboardQuery,
): Promise<{ amount: number; pctOfTotal: number }> {
  return apiRequest(
    `/api/financial/accounts-payable/overdue?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({ amount: apKpisRaw.overdueAmount, pctOfTotal: apKpisRaw.overduePctOfTotal }),
  );
}

export function calculateDueWithin30Days(
  query: DashboardQuery,
): Promise<{ amount: number; pctOfTotal: number }> {
  return apiRequest(
    `/api/financial/accounts-payable/due-within-30?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({ amount: apKpisRaw.dueWithin30Days, pctOfTotal: apKpisRaw.dueWithin30PctOfTotal }),
  );
}

export function countOpenInvoices(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/accounts-payable/open-invoices?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => apKpisRaw.openInvoices,
  );
}

// -- Invoice list & detail --

export function retrieveInvoiceList(
  query: DashboardQuery,
  filters: InvoiceFilters,
): Promise<InvoiceSearchResult> {
  return apiRequest(
    `/api/financial/accounts-payable/invoices?fy=${query.fiscalYear}&company=${query.companyId}` +
      `&status=${filters.status}&q=${encodeURIComponent(filters.search)}`,
    () => {
      let rows = payableInvoices;
      if (filters.status !== "All") rows = rows.filter((r) => r.status === filters.status);
      if (filters.search.trim()) {
        const needle = filters.search.trim().toLowerCase();
        rows = rows.filter(
          (r) =>
            r.invoiceNo.toLowerCase().includes(needle) ||
            r.vendor.toLowerCase().includes(needle) ||
            String(r.amount).includes(needle),
        );
      }
      const total = rows.length;
      const start = (filters.page - 1) * filters.pageSize;
      return { rows: rows.slice(start, start + filters.pageSize), total };
    },
  );
}

export function retrieveInvoiceDetails(invoiceNo: string): Promise<PayableInvoice | null> {
  return apiRequest(
    `/api/financial/accounts-payable/invoices/${invoiceNo}`,
    () => payableInvoices.find((i) => i.invoiceNo === invoiceNo) ?? null,
  );
}

export function saveInvoice(input: NewInvoiceInput): Promise<PayableInvoice> {
  return apiRequest("/api/financial/accounts-payable/invoices", () => {
    const invoice: PayableInvoice = {
      invoiceNo: input.invoiceNo,
      vendor: input.vendor,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,
      amount: input.amount,
      status: "Due Soon",
      dueAmount: input.amount,
      approved: false,
    };
    payableInvoices.unshift(invoice);
    return invoice;
  });
}

export function updateApprovalStatus(
  invoiceNo: string,
  approved: boolean,
): Promise<PayableInvoice> {
  return apiRequest(`/api/financial/accounts-payable/invoices/${invoiceNo}/approval`, () => {
    const invoice = payableInvoices.find((i) => i.invoiceNo === invoiceNo);
    if (!invoice) throw new Error(`Invoice ${invoiceNo} not found`);
    invoice.approved = approved;
    return invoice;
  });
}
