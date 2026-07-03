import { apiRequest } from "./apiClient";
import {
  mockFixedAssets,
  mockAssetCategories,
  mockAssetDisposals,
  mockAssetRevaluations,
  mockAssetTransfers,
} from "@/lib/mock-data";
import type {
  FixedAsset,
  FixedAssetFilters,
  DashboardQuery,
  NewFixedAssetInput,
  AssetCategoryRecord,
  AssetDisposalRecord,
  AssetRevaluationRecord,
  AssetTransferRecord,
} from "./types";

export function fetchFixedAssets(
  query: DashboardQuery,
  filters: FixedAssetFilters,
): Promise<FixedAsset[]> {
  return apiRequest(
    `/api/financial/fixed-assets?search=${encodeURIComponent(filters.search)}&category=${filters.category}&status=${filters.status}&location=${filters.location}`,
    () => {
      let list = [...mockFixedAssets];
      if (filters.search) {
        const s = filters.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.name.toLowerCase().includes(s) ||
            a.assetCode.toLowerCase().includes(s) ||
            a.location.toLowerCase().includes(s),
        );
      }
      if (filters.category !== "All Categories") {
        list = list.filter((a) => a.category === filters.category);
      }
      if (filters.status !== "All Statuses") {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters.location !== "All Locations") {
        list = list.filter((a) => a.location === filters.location);
      }
      return list;
    },
  );
}

export function retrieveFixedAssetDetails(assetCode: string): Promise<FixedAsset | undefined> {
  return apiRequest(`/api/financial/fixed-assets/${assetCode}`, () =>
    mockFixedAssets.find((a) => a.assetCode === assetCode),
  );
}

export function saveFixedAsset(input: NewFixedAssetInput): Promise<FixedAsset> {
  return apiRequest(`/api/financial/fixed-assets`, () => {
    const code = `FA-0${mockFixedAssets.length + 10}`;
    const cost = Number(input.cost);
    const newAsset: FixedAsset = {
      id: `AST-0${mockFixedAssets.length + 1}`,
      assetCode: code,
      name: input.name,
      category: input.category,
      location: input.location,
      purchaseDate: input.purchaseDate,
      cost,
      accumulatedDepreciation: 0,
      netBookValue: cost,
      status: "Active" as const,
    };
    mockFixedAssets.push(newAsset);
    return newAsset;
  });
}

export function transferFixedAsset(
  assetCode: string,
  destinationLocation: string,
  transferDate: string,
  authorizedBy: string,
): Promise<boolean> {
  return apiRequest(`/api/financial/fixed-assets/transfer`, () => {
    const asset = mockFixedAssets.find((a) => a.assetCode === assetCode);
    if (asset) {
      const sourceLocation = asset.location;
      asset.location = destinationLocation;
      mockAssetTransfers.unshift({
        id: `TRF-0${mockAssetTransfers.length + 1}`,
        assetCode,
        name: asset.name,
        date: transferDate,
        sourceLocation,
        destinationLocation,
        authorizedBy,
      });
      return true;
    }
    return false;
  });
}

export function disposeFixedAsset(
  assetCode: string,
  saleProceeds: number,
  disposalReason: string,
  disposalDate: string,
): Promise<boolean> {
  return apiRequest(`/api/financial/fixed-assets/dispose`, () => {
    const asset = mockFixedAssets.find((a) => a.assetCode === assetCode);
    if (asset) {
      asset.status = "Disposed";
      const gainLoss = saleProceeds - asset.netBookValue;

      mockAssetDisposals.unshift({
        id: `DSP-0${mockAssetDisposals.length + 1}`,
        assetCode,
        name: asset.name,
        disposalDate,
        cost: asset.cost,
        accumulatedDepreciation: asset.accumulatedDepreciation,
        proceeds: saleProceeds,
        gainLoss,
        status: "Approved",
      });

      asset.netBookValue = 0;
      return true;
    }
    return false;
  });
}

export function revalueFixedAsset(
  assetCode: string,
  newMarketValue: number,
  reason: string,
  revaluationDate: string,
): Promise<boolean> {
  return apiRequest(`/api/financial/fixed-assets/revalue`, () => {
    const asset = mockFixedAssets.find((a) => a.assetCode === assetCode);
    if (asset) {
      const oldNBV = asset.netBookValue;
      const adjustment = newMarketValue - oldNBV;
      asset.netBookValue = newMarketValue;
      if (adjustment > 0) {
        asset.cost += adjustment;
      } else {
        asset.accumulatedDepreciation += Math.abs(adjustment);
      }

      mockAssetRevaluations.unshift({
        id: `REV-0${mockAssetRevaluations.length + 1}`,
        assetCode,
        name: asset.name,
        date: revaluationDate,
        oldNBV,
        newNBV: newMarketValue,
        adjustment,
        reason,
      });
      return true;
    }
    return false;
  });
}

export function fetchAssetCategories(query: DashboardQuery): Promise<AssetCategoryRecord[]> {
  return apiRequest(
    `/api/financial/fixed-assets/categories?fy=${query.fiscalYear}`,
    () => mockAssetCategories,
  );
}

export function fetchAssetDisposals(query: DashboardQuery): Promise<AssetDisposalRecord[]> {
  return apiRequest(
    `/api/financial/fixed-assets/disposals?fy=${query.fiscalYear}`,
    () => mockAssetDisposals,
  );
}

export function fetchAssetRevaluations(query: DashboardQuery): Promise<AssetRevaluationRecord[]> {
  return apiRequest(
    `/api/financial/fixed-assets/revaluations?fy=${query.fiscalYear}`,
    () => mockAssetRevaluations,
  );
}

export function fetchAssetTransfers(query: DashboardQuery): Promise<AssetTransferRecord[]> {
  return apiRequest(
    `/api/financial/fixed-assets/transfers?fy=${query.fiscalYear}`,
    () => mockAssetTransfers,
  );
}
