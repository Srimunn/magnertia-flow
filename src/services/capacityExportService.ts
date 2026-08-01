import type { CapacityPlanningRecord } from "./types";

export async function exportCapacityReportPdf(record: Partial<CapacityPlanningRecord>) {
  return { filename: `Capacity_Plan_${record.planningId || "CP-2024-00027"}.pdf`, status: "success" };
}

export async function exportCapacityDataExcel(record: Partial<CapacityPlanningRecord>) {
  return { filename: `Capacity_Plan_${record.planningId || "CP-2024-00027"}.xlsx`, status: "success" };
}

export const capacityExportService = {
  exportCapacityReportPdf,
  exportCapacityDataExcel,
};
