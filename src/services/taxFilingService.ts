import { apiRequest } from "./apiClient";
import { mockTaxFilings, mockTaxObligations } from "@/lib/mock-data";
import type { TaxFiling, NewFilingInput, DashboardQuery } from "./types";

export function fetchFilings(query: DashboardQuery): Promise<TaxFiling[]> {
  return apiRequest(`/api/financial/tax/filings?fy=${query.fiscalYear}`, () => mockTaxFilings);
}

export function createFiling(input: NewFilingInput): Promise<TaxFiling> {
  return apiRequest(`/api/financial/tax/filings`, () => {
    const nextId = `FIL-0${mockTaxFilings.length + 1}`;
    const newFiling: TaxFiling = {
      id: nextId,
      taxType: input.taxType,
      period: input.period,
      filingDate: new Date().toISOString().substring(0, 10),
      filedBy: input.filedBy,
      returnAmount: Number(input.returnAmount),
      acknowledgementNo: `ACK-TAX-${Date.now().toString().substring(6)}`,
      status: "Filed" as const,
    };

    // Also update the corresponding obligation status if it exists
    const match = mockTaxObligations.find((o) => o.taxType === input.taxType);
    if (match) {
      match.status = "Paid";
      match.paid = match.taxLiability;
      match.payable = 0;
    }

    mockTaxFilings.unshift(newFiling);
    return newFiling;
  });
}

export function importTaxReturn(
  fileData: Record<string, unknown>,
): Promise<{ success: boolean; importedCount: number }> {
  return apiRequest(`/api/financial/tax/import`, () => {
    console.log("Importing file data:", fileData);
    return { success: true, importedCount: 1 };
  });
}

export function fetchTaxCalendar(
  query: DashboardQuery,
): Promise<{ title: string; date: string; type: "filing" | "payment" }[]> {
  return apiRequest(`/api/financial/tax/calendar?fy=${query.fiscalYear}`, () => [
    { title: "GST Return filing due", date: "2025-05-20", type: "filing" },
    { title: "TDS Salaries Payment due", date: "2025-05-31", type: "payment" },
    { title: "VAT Return filing due", date: "2025-05-25", type: "filing" },
    { title: "Professional Tax Payment", date: "2025-06-15", type: "payment" },
    { title: "Income Tax Advance Tax Q1", date: "2025-06-30", type: "payment" },
  ]);
}
