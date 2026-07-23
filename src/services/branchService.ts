import { apiRequest } from "./apiClient";
import { mockBranches, mockCompanies } from "@/lib/mock-data";
import type { BranchRecord, NewBranchInput } from "./types";

export function fetchBranches(): Promise<BranchRecord[]> {
  return apiRequest(`/api/administration/branches`, () => mockBranches);
}

export function createBranch(input: NewBranchInput): Promise<BranchRecord> {
  return apiRequest(`/api/administration/branches`, () => {
    const company = mockCompanies.find((c) => c.id === input.companyId);
    const newBranch: BranchRecord = {
      id: `BR-0${mockBranches.length + 1}`,
      code: input.code,
      name: input.name,
      companyId: input.companyId,
      companyName: company?.name ?? "Unknown Company",
      city: input.city,
      status: "Active",
      departmentCount: 0,
    };
    mockBranches.push(newBranch);
    return newBranch;
  });
}
