import { apiRequest } from "./apiClient";
import { arCustomerDirectory, receivableInvoices } from "@/lib/mock-data";
import type { CustomerProfile } from "./types";

export function fetchCustomerInformation(customerName: string): Promise<CustomerProfile | null> {
  return apiRequest(
    `/api/financial/customer-management/customers/${encodeURIComponent(customerName)}`,
    () => {
      const record = arCustomerDirectory[customerName];
      if (!record) return null;
      const outstandingBalance = receivableInvoices
        .filter((inv) => inv.customer === customerName)
        .reduce((sum, inv) => sum + inv.dueAmount, 0);
      return {
        id: record.id,
        name: customerName,
        category: record.category,
        email: record.email,
        phone: record.phone,
        paymentTerms: record.paymentTerms,
        outstandingBalance,
        status: record.status,
      };
    },
  );
}
