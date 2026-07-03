import { apiRequest } from "./apiClient";
import { mockFixedAssets, mockDepreciationRuns } from "@/lib/mock-data";
import type { DashboardQuery, DepreciationRun } from "./types";

export function executeDepreciation(
  query: DashboardQuery,
  method: string,
  executedBy: string,
): Promise<DepreciationRun> {
  return apiRequest(`/api/financial/depreciation/execute`, () => {
    // Calculate a mock depreciation amount for active assets
    const activeAssets = mockFixedAssets.filter((a) => a.status === "Active");

    // Calculate total depreciation to apply: say, 2% of the cost of each active asset
    let runDepreciation = 0;
    activeAssets.forEach((asset) => {
      const depAmt = Math.round(asset.cost * 0.02);
      asset.accumulatedDepreciation += depAmt;
      asset.netBookValue = Math.max(0, asset.cost - asset.accumulatedDepreciation);
      if (asset.netBookValue === 0) {
        asset.status = "Fully Depreciated";
      }
      runDepreciation += depAmt;
    });

    const nextId = `DEP-RUN-0${mockDepreciationRuns.length + 1}`;
    const period = "May 2025"; // next month from mock
    const newRun: DepreciationRun = {
      id: nextId,
      date: new Date().toISOString().substring(0, 10),
      period,
      assetsCount: activeAssets.length,
      totalDepreciation: runDepreciation,
      method,
      status: "Posted" as const,
      executedBy,
    };

    mockDepreciationRuns.unshift(newRun);
    return newRun;
  });
}

export function fetchDepreciationRuns(query: DashboardQuery): Promise<DepreciationRun[]> {
  return apiRequest(
    `/api/financial/depreciation/runs?fy=${query.fiscalYear}`,
    () => mockDepreciationRuns,
  );
}
