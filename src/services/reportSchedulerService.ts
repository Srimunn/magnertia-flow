import { apiRequest } from "./apiClient";
import { mockReportSchedules, mockReports } from "@/lib/mock-data";
import type { ReportScheduleRecord, NewReportScheduleInput, DashboardQuery } from "./types";

export function fetchScheduledReports(query: DashboardQuery): Promise<ReportScheduleRecord[]> {
  return apiRequest(
    `/api/financial/reports/schedules?fy=${query.fiscalYear}`,
    () => mockReportSchedules,
  );
}

export function configureSchedule(input: NewReportScheduleInput): Promise<ReportScheduleRecord> {
  return apiRequest(`/api/financial/reports/schedules`, () => {
    const reportName =
      mockReports.find((r) => r.id === input.reportId)?.name || "Financial Statement";
    const nextId = `SCH-0${mockReportSchedules.length + 1}`;
    const newSch: ReportScheduleRecord = {
      id: nextId,
      reportId: input.reportId,
      reportName,
      frequency: input.frequency,
      format: input.format,
      recipients: input.recipients,
      status: "Active" as const,
      nextRun: new Date(Date.now() + 86400000 * 7).toISOString().replace("T", " ").substring(0, 16),
    };
    mockReportSchedules.unshift(newSch);
    return newSch;
  });
}
