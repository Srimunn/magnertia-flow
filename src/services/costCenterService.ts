import { apiRequest } from "./apiClient";
import { mockCostCenters, mockCostCenterBudgets, mockCostCenterHierarchy } from "@/lib/mock-data";
import type {
  CostCenterRecord,
  CostCenterBudget,
  NewCostCenterInput,
  NewSubCostCenterInput,
  DashboardQuery,
} from "./types";

export function fetchCostCenterBudgets(query: DashboardQuery): Promise<CostCenterBudget[]> {
  return apiRequest(
    `/api/financial/cost-centers/budgets?fy=${query.fiscalYear}`,
    () => mockCostCenterBudgets,
  );
}

export function fetchCostCenters(query: DashboardQuery): Promise<CostCenterRecord[]> {
  return apiRequest(`/api/financial/cost-centers?fy=${query.fiscalYear}`, () => mockCostCenters);
}

export function createCostCenter(input: NewCostCenterInput): Promise<CostCenterRecord> {
  return apiRequest(`/api/financial/cost-centers`, () => {
    const nextId = `CC-0${mockCostCenters.length + 1}`;
    const newCC: CostCenterRecord = {
      id: nextId,
      code: input.code,
      name: input.name,
      department: input.department,
      manager: input.manager,
      budget: Number(input.budget),
      actual: 0.0,
      variance: Number(input.budget),
      utilization: 0.0,
      status: "Active" as const,
      type: input.type,
      parentId: input.parentId,
    };

    // Add to hierarchy structure
    if (input.parentId === "Administration") {
      mockCostCenterHierarchy.children[0].children?.push({ name: input.name });
    } else if (input.parentId === "Operations") {
      mockCostCenterHierarchy.children[2].children?.push({ name: input.name });
    } else if (input.parentId === "Commercial") {
      mockCostCenterHierarchy.children[3].children?.push({ name: input.name });
    } else if (input.parentId === "Technology") {
      mockCostCenterHierarchy.children[4].children?.push({ name: input.name });
    } else {
      mockCostCenterHierarchy.children.push({ name: input.name });
    }

    mockCostCenters.push(newCC);
    return newCC;
  });
}

export function createSubCostCenter(input: NewSubCostCenterInput): Promise<CostCenterRecord> {
  return createCostCenter({
    code: input.code,
    name: input.name,
    department: input.department,
    manager: input.manager,
    budget: input.budget,
    type: "Support",
    parentId: input.parentId,
  });
}
