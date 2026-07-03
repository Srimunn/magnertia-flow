import { apiRequest } from "./apiClient";
import { mockBudgetVersions, mockProjectBudgets } from "@/lib/mock-data";
import type {
  BudgetVersion,
  NewBudgetInput,
  NewBudgetVersionInput,
  BudgetComparisonReport,
  ProjectBudget,
  DashboardQuery,
} from "./types";

export function fetchBudgetVersions(query: DashboardQuery): Promise<BudgetVersion[]> {
  return apiRequest(
    `/api/financial/budgets/versions?fy=${query.fiscalYear}`,
    () => mockBudgetVersions,
  );
}

export function fetchProjectBudgets(query: DashboardQuery): Promise<ProjectBudget[]> {
  return apiRequest(
    `/api/financial/budgets/projects?fy=${query.fiscalYear}`,
    () => mockProjectBudgets,
  );
}

export function saveBudget(input: NewBudgetInput): Promise<BudgetVersion> {
  return apiRequest(`/api/financial/budgets`, () => {
    const nextId = `BV-0${mockBudgetVersions.length + 1}`;
    const newVer: BudgetVersion = {
      id: nextId,
      name: input.name,
      type: input.type,
      status: input.status,
      totalBudget: Number(input.totalBudget),
      createdBy: input.createdBy,
      lastUpdated: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    mockBudgetVersions.unshift(newVer);
    return newVer;
  });
}

export function saveBudgetVersion(input: NewBudgetVersionInput): Promise<BudgetVersion> {
  return apiRequest(`/api/financial/budgets/versions`, () => {
    const nextId = `BV-0${mockBudgetVersions.length + 1}`;
    const newVer: BudgetVersion = {
      id: nextId,
      name: input.name,
      type: input.type,
      status: "Draft",
      totalBudget: Number(input.totalBudget),
      createdBy: input.createdBy,
      lastUpdated: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    mockBudgetVersions.unshift(newVer);
    return newVer;
  });
}

export function compareBudgetVersions(v1Id: string, v2Id: string): Promise<BudgetComparisonReport> {
  return apiRequest(`/api/financial/budgets/compare?v1=${v1Id}&v2=${v2Id}`, () => {
    const v1 = mockBudgetVersions.find((v) => v.id === v1Id) || mockBudgetVersions[0];
    const v2 = mockBudgetVersions.find((v) => v.id === v2Id) || mockBudgetVersions[1];
    const diff = v2.totalBudget - v1.totalBudget;
    const diffPct = (diff / v1.totalBudget) * 100;

    const departmentDifferences = [
      {
        department: "Sales & Marketing",
        v1Amount: 6250000.0,
        v2Amount: 6350000.0,
        difference: 100000.0,
      },
      { department: "Operations", v1Amount: 7850000.0, v2Amount: 7950000.0, difference: 100000.0 },
      {
        department: "Information Technology",
        v1Amount: 3250000.0,
        v2Amount: 3450000.0,
        difference: 200000.0,
      },
      { department: "Finance", v1Amount: 2150000.0, v2Amount: 2150000.0, difference: 0.0 },
      {
        department: "Human Resources",
        v1Amount: 1850000.0,
        v2Amount: 1900000.0,
        difference: 50000.0,
      },
      {
        department: "Research & Development",
        v1Amount: 2750000.0,
        v2Amount: 2850000.0,
        difference: 100000.0,
      },
      { department: "Administration", v1Amount: 900000.0, v2Amount: 900000.0, difference: 0.0 },
    ];

    return {
      version1: v1,
      version2: v2,
      totalDifference: diff,
      differencePct: diffPct,
      departmentDifferences,
    };
  });
}
