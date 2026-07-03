import { apiRequest } from "./apiClient";
import { mockReports } from "@/lib/mock-data";
import type { ReportRecord, NewReportInput, DashboardQuery } from "./types";

export function fetchReports(query: DashboardQuery): Promise<ReportRecord[]> {
  return apiRequest(`/api/financial/reports?fy=${query.fiscalYear}`, () => mockReports);
}

export function retrieveReportDetails(reportId: string): Promise<ReportRecord> {
  return apiRequest(
    `/api/financial/reports/${reportId}`,
    () => mockReports.find((r) => r.id === reportId) || mockReports[0],
  );
}

export function saveReportTemplate(input: NewReportInput): Promise<ReportRecord> {
  return apiRequest(`/api/financial/reports`, () => {
    const nextId = `REP-0${mockReports.length + 1}`;
    const newRep: ReportRecord = {
      id: nextId,
      name: input.name,
      description: input.description,
      category: input.category,
      type: input.type,
      lastModified: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      lastModifiedBy: "Amit Mehra",
      isFavorite: false,
    };
    mockReports.unshift(newRep);
    return newRep;
  });
}

export function manageReport(
  reportId: string,
  updates: Partial<ReportRecord>,
): Promise<ReportRecord> {
  return apiRequest(`/api/financial/reports/${reportId}/manage`, () => {
    const rep = mockReports.find((r) => r.id === reportId);
    if (rep) {
      Object.assign(rep, updates);
      return rep;
    }
    throw new Error("Report not found");
  });
}
