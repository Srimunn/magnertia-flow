import { apiRequest } from "./apiClient";
import { apVendorDirectory, payableInvoices } from "@/lib/mock-data";
import type { VendorProfile } from "./types";

export function fetchVendorInformation(vendorName: string): Promise<VendorProfile | null> {
  return apiRequest(
    `/api/financial/vendor-management/vendors/${encodeURIComponent(vendorName)}`,
    () => {
      const record = apVendorDirectory[vendorName];
      if (!record) return null;
      const outstandingBalance = payableInvoices
        .filter((inv) => inv.vendor === vendorName)
        .reduce((sum, inv) => sum + inv.dueAmount, 0);
      return {
        id: record.id,
        name: vendorName,
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
