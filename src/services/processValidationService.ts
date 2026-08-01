import {
  INITIAL_PROCESS_VALIDATION_RECORD,
  getProcessValidationRecordFn,
  saveProcessValidationDraftFn,
  submitProcessValidationFn,
  updateTrialRunSummaryFn,
} from "@/lib/processValidationFns.server";
import type {
  ValidationAttachment,
  ProcessValidationRecord,
  ProcessValidationFormInput,
  ValidationTrialRunSummary,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchProcessValidationRecord(): Promise<ProcessValidationRecord> {
  try {
    const res = await getProcessValidationRecordFn();
    return unwrap<ProcessValidationRecord>(res);
  } catch (err) {
    console.warn("processValidationService fetchRecord fallback:", err);
    return INITIAL_PROCESS_VALIDATION_RECORD;
  }
}

export async function saveProcessValidationDraft(
  input: ProcessValidationFormInput
): Promise<ProcessValidationRecord> {
  return unwrap<ProcessValidationRecord>(
    await saveProcessValidationDraftFn({ data: { input } })
  );
}

export async function submitProcessValidationForReview(): Promise<ProcessValidationRecord> {
  return unwrap<ProcessValidationRecord>(await submitProcessValidationFn());
}

export async function updateTrialRunSummary(
  summary: ValidationTrialRunSummary
): Promise<ProcessValidationRecord> {
  return unwrap<ProcessValidationRecord>(
    await updateTrialRunSummaryFn({ data: summary })
  );
}

export async function uploadValidationAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<ValidationAttachment> {
  const newAttachment: ValidationAttachment = {
    id: `att-pv-${Date.now()}`,
    fileName: file.name,
    fileType: file.type || "Document",
    documentType: file.documentType || "Supporting Documents",
    version: "1.0",
    uploadedBy: "Current User",
    uploadedDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    status: "Active",
  };
  return newAttachment;
}
