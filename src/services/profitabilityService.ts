import { apiRequest } from "./apiClient";
import {
  mockProfitabilityProducts,
  mockProfitabilityCustomers,
  mockProfitabilityAllocationRules,
  mockDrilldownTransactions,
} from "@/lib/mock-data";
import type { ProfitabilityRecord, CostAllocationRule, DashboardQuery } from "./types";

export function fetchProfitabilityByDimension(
  query: DashboardQuery,
  dimension: string,
): Promise<ProfitabilityRecord[]> {
  return apiRequest(
    `/api/financial/profitability/dimension?dim=${dimension}&fy=${query.fiscalYear}`,
    () => {
      if (dimension === "Customer") return mockProfitabilityCustomers;
      // Default / Product / Region etc returns product splits
      return mockProfitabilityProducts;
    },
  );
}

export function fetchPeriodComparison(
  query: DashboardQuery,
): Promise<
  { dimension: string; currentYTD: number; priorYTD: number; changePercentage: number }[]
> {
  return apiRequest(`/api/financial/profitability/comparison?fy=${query.fiscalYear}`, () => [
    { dimension: "Revenue", currentYTD: 48753920.0, priorYTD: 43356000.0, changePercentage: 12.45 },
    {
      dimension: "Gross Profit",
      currentYTD: 18245630.0,
      priorYTD: 16553000.0,
      changePercentage: 10.23,
    },
    { dimension: "Net Profit", currentYTD: 7856410.0, priorYTD: 7229000.0, changePercentage: 8.67 },
  ]);
}

export function fetchDrilldownAnalysis(
  query: DashboardQuery,
  dimension: string,
  id: string,
): Promise<{ date: string; ref: string; description: string; amount: number; type: string }[]> {
  return apiRequest(
    `/api/financial/profitability/drilldown?dim=${dimension}&id=${id}&fy=${query.fiscalYear}`,
    () => mockDrilldownTransactions,
  );
}

export function saveAllocationRules(
  rules: CostAllocationRule[],
): Promise<{ success: boolean; updatedRulesCount: number }> {
  return apiRequest(`/api/financial/profitability/allocation-rules`, () => {
    mockProfitabilityAllocationRules.length = 0;
    rules.forEach((rule) => {
      mockProfitabilityAllocationRules.push(rule);
    });
    return { success: true, updatedRulesCount: rules.length };
  });
}
