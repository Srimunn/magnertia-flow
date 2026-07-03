import { apiRequest } from "./apiClient";
import { mockTaxObligations, mockTaxAuthorities } from "@/lib/mock-data";
import type { TaxObligation, TaxAuthority, DashboardQuery } from "./types";

export function fetchObligations(query: DashboardQuery): Promise<TaxObligation[]> {
  return apiRequest(
    `/api/financial/tax/obligations?fy=${query.fiscalYear}`,
    () => mockTaxObligations,
  );
}

export function retrieveTaxDetails(obligationId: string): Promise<TaxObligation> {
  return apiRequest(
    `/api/financial/tax/obligations/${obligationId}`,
    () => mockTaxObligations.find((o) => o.id === obligationId) || mockTaxObligations[0],
  );
}

export function fetchTaxAuthorities(query: DashboardQuery): Promise<TaxAuthority[]> {
  return apiRequest(
    `/api/financial/tax/authorities?fy=${query.fiscalYear}`,
    () => mockTaxAuthorities,
  );
}
