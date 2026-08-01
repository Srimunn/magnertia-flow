import type { WorkInstructionRecord } from "./types";

export async function exportWorkInstructionPdf(record: Partial<WorkInstructionRecord>) {
  return { filename: `Work_Instruction_${record.documentNumber || "WI-MAG-ACCU-001"}.pdf`, status: "success" };
}

export async function exportWorkInstructionExcel(record: Partial<WorkInstructionRecord>) {
  return { filename: `Work_Instruction_${record.documentNumber || "WI-MAG-ACCU-001"}.xlsx`, status: "success" };
}

export const workInstructionExportService = {
  exportWorkInstructionPdf,
  exportWorkInstructionExcel,
};
