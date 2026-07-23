import { apiRequest } from "./apiClient";
import { mockCompanies } from "@/lib/mock-data";
import type { CompanyRecord, NewCompanyInput } from "./types";

export function fetchCompanies(): Promise<CompanyRecord[]> {
  return apiRequest(`/api/administration/companies`, () => mockCompanies);
}

export function createCompany(input: NewCompanyInput): Promise<CompanyRecord> {
  return apiRequest(`/api/administration/companies`, () => {
    const newCompany: CompanyRecord = {
      id: `CO-0${mockCompanies.length + 1}`,
      code: input.code,
      name: input.name,
      taxId: input.taxId,
      status: "Active",
      branchCount: 0,
      createdDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    mockCompanies.push(newCompany);
    return newCompany;
  });
}
