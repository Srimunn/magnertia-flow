import { apiRequest } from "./apiClient";
import {
  mockConsolidationOverview,
  mockConsolidationProgress,
  mockConsolidationTimeline,
  mockTopIntercompanyTransactions,
  mockConsolidationMappings,
  mockConsolidationValidations,
} from "@/lib/mock-data";
import type {
  ConsolidationRecord,
  IntercompanyTransaction,
  ConsolidationTimelineMilestone,
  AccountMappingRecord,
  EntityValidationResult,
  DashboardQuery,
} from "./types";

export function fetchConsolidationSummary(query: DashboardQuery): Promise<ConsolidationRecord[]> {
  return apiRequest(
    `/api/financial/consolidation/summary?fy=${query.fiscalYear}`,
    () => mockConsolidationOverview,
  );
}

export function fetchIntercompanyTransactions(
  query: DashboardQuery,
): Promise<IntercompanyTransaction[]> {
  return apiRequest(
    `/api/financial/consolidation/intercompany?fy=${query.fiscalYear}`,
    () => mockTopIntercompanyTransactions,
  );
}

export function fetchTimelineMilestones(
  query: DashboardQuery,
): Promise<ConsolidationTimelineMilestone[]> {
  return apiRequest(
    `/api/financial/consolidation/timeline?fy=${query.fiscalYear}`,
    () => mockConsolidationTimeline,
  );
}

export function runConsolidation(
  query: DashboardQuery,
): Promise<{ success: boolean; log: string[] }> {
  return apiRequest(`/api/financial/consolidation/run?fy=${query.fiscalYear}`, () => {
    // Simulate backend consolidation process steps
    return {
      success: true,
      log: [
        "Data collection completed for 12 entities.",
        "Currency translation calculations executed cleanly.",
        "Intercompany transactions matched (Variance: $0).",
        "Elimination journal entries posted (Total: 156 entries).",
        "Consolidation process completed successfully.",
      ],
    };
  });
}

export function validateEntityData(query: DashboardQuery): Promise<EntityValidationResult[]> {
  return apiRequest(
    `/api/financial/consolidation/validate?fy=${query.fiscalYear}`,
    () => mockConsolidationValidations,
  );
}

export function updateAccountMapping(
  mappings: AccountMappingRecord[],
): Promise<{ success: boolean; updatedCount: number }> {
  return apiRequest(`/api/financial/consolidation/mappings`, () => {
    mockConsolidationMappings.length = 0;
    mappings.forEach((m) => {
      mockConsolidationMappings.push(m);
    });
    return { success: true, updatedCount: mappings.length };
  });
}
