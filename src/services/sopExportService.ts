import type { SopRecord } from "./types";

export async function exportSopPdf(record: Partial<SopRecord>) {
  return { filename: `SOP_${record.sopNumber || "SOP-MFG-001"}.pdf`, status: "success" };
}

export async function exportSopExcel(record: Partial<SopRecord>) {
  return { filename: `SOP_${record.sopNumber || "SOP-MFG-001"}.xlsx`, status: "success" };
}

export const sopExportService = {
  exportSopPdf,
  exportSopExcel,
};
