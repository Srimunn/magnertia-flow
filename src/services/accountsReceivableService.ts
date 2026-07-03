import { apiRequest } from "./apiClient";
import { agingReceivable, allTransactions, arKpisRaw, receivableInvoices } from "@/lib/mock-data";
import type {
  AgingReport,
  CreateCreditMemoInput,
  DashboardQuery,
  InvoiceDetail,
  NewReceivableInvoiceInput,
  ReceivableInvoice,
  ReceivableInvoiceFilters,
  ReceivableInvoiceSearchResult,
} from "./types";

export function fetchOutstandingReceivables(query: DashboardQuery): Promise<AgingReport> {
  return apiRequest(
    `/api/financial/accounts-receivable/aging?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => agingReceivable,
  );
}

// Matches the sequence diagram's [Invoice] branch — also used for the
// Receipt type, since a receipt is just a payment received against AR.
export function retrieveInvoiceInformation(ref: string): Promise<InvoiceDetail | null> {
  return apiRequest(`/api/financial/accounts-receivable/invoices/${ref}`, () => {
    const row = allTransactions.find((t) => t.ref === ref);
    if (!row) return null;

    // Matches the reference mockup's worked example exactly.
    if (ref === "INV-10034") {
      return {
        source: "invoice",
        ref: row.ref,
        type: row.type,
        date: row.date,
        description: row.description,
        account: row.account,
        amount: row.amount,
        status: row.status,
        customer: row.counterparty ?? "Acme Corp.",
        dueDate: "Jun 19, 2025",
        subtotal: 42_000,
        tax: 3_600,
        taxRate: 8.6,
        totalAmount: 45_600,
        amountPaid: 45_600,
        balanceDue: 0,
      };
    }

    const totalAmount = Math.abs(row.amount);
    const subtotal = Math.round((totalAmount / 1.08) * 100) / 100;
    const tax = Math.round((totalAmount - subtotal) * 100) / 100;
    const amountPaid = row.status === "Posted" ? totalAmount : 0;
    return {
      source: "invoice",
      ref: row.ref,
      type: row.type,
      date: row.date,
      description: row.description,
      account: row.account,
      amount: row.amount,
      status: row.status,
      customer: row.counterparty ?? "—",
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

// -- Accounts Receivable dashboard KPIs --

export function calculateTotalReceivables(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/accounts-receivable/total?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => arKpisRaw.totalReceivables,
  );
}

export function calculateOverdueAmount(
  query: DashboardQuery,
): Promise<{ amount: number; pctOfTotal: number }> {
  return apiRequest(
    `/api/financial/accounts-receivable/overdue?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({ amount: arKpisRaw.overdueAmount, pctOfTotal: arKpisRaw.overduePctOfTotal }),
  );
}

export function calculateDueWithin30Days(
  query: DashboardQuery,
): Promise<{ amount: number; pctOfTotal: number }> {
  return apiRequest(
    `/api/financial/accounts-receivable/due-within-30?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => ({ amount: arKpisRaw.dueWithin30Days, pctOfTotal: arKpisRaw.dueWithin30PctOfTotal }),
  );
}

export function countOpenInvoices(query: DashboardQuery): Promise<number> {
  return apiRequest(
    `/api/financial/accounts-receivable/open-invoices?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => arKpisRaw.openInvoices,
  );
}

// -- Invoice list & detail --

export function retrieveInvoiceList(
  query: DashboardQuery,
  filters: ReceivableInvoiceFilters,
): Promise<ReceivableInvoiceSearchResult> {
  return apiRequest(
    `/api/financial/accounts-receivable/invoices?fy=${query.fiscalYear}&company=${query.companyId}` +
      `&status=${filters.status}&q=${encodeURIComponent(filters.search)}`,
    () => {
      let rows = receivableInvoices;
      if (filters.status !== "All") rows = rows.filter((r) => r.status === filters.status);
      if (filters.search.trim()) {
        const needle = filters.search.trim().toLowerCase();
        rows = rows.filter(
          (r) =>
            r.invoiceNo.toLowerCase().includes(needle) ||
            r.customer.toLowerCase().includes(needle) ||
            String(r.amount).includes(needle),
        );
      }
      const total = rows.length;
      const start = (filters.page - 1) * filters.pageSize;
      return { rows: rows.slice(start, start + filters.pageSize), total };
    },
  );
}

export function retrieveReceivableDetails(invoiceNo: string): Promise<ReceivableInvoice | null> {
  return apiRequest(
    `/api/financial/accounts-receivable/invoices/${invoiceNo}`,
    () => receivableInvoices.find((i) => i.invoiceNo === invoiceNo) ?? null,
  );
}

export function saveInvoice(input: NewReceivableInvoiceInput): Promise<ReceivableInvoice> {
  return apiRequest("/api/financial/accounts-receivable/invoices", () => {
    const invoice: ReceivableInvoice = {
      invoiceNo: input.invoiceNo,
      customer: input.customer,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,
      amount: input.amount,
      status: "Due Soon",
      dueAmount: input.amount,
    };
    receivableInvoices.unshift(invoice);
    return invoice;
  });
}

export function notifyCustomer(invoiceNo: string): Promise<{ sent: boolean }> {
  return apiRequest(`/api/financial/accounts-receivable/invoices/${invoiceNo}/remind`, () => ({
    sent: true,
  }));
}

let creditMemoSequence = 3002;

export function createCreditMemo(input: CreateCreditMemoInput): Promise<ReceivableInvoice> {
  return apiRequest("/api/financial/accounts-receivable/credit-memos", () => {
    const memo: ReceivableInvoice = {
      invoiceNo: `CM-${creditMemoSequence++}`,
      customer: input.customer,
      invoiceDate: "May 20, 2025",
      dueDate: "May 20, 2025",
      amount: -Math.abs(input.amount),
      status: "Credit Memo",
      dueAmount: 0,
    };
    receivableInvoices.unshift(memo);
    return memo;
  });
}
