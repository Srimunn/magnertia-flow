import {
  INITIAL_MANUFACTURING_EXCELLENCE_RECORD,
  getExcellenceRecordFn,
  saveExcellenceDraftFn,
  submitExcellenceReviewFn,
  updateExcellenceDecisionFn,
} from "@/lib/manufacturingExcellenceFns.server";
import type {
  ExcellenceAttachment,
  ManufacturingExcellenceRecord,
  ExcellenceFormInput,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchExcellenceRecord(): Promise<ManufacturingExcellenceRecord> {
  try {
    const res = await getExcellenceRecordFn();
    return unwrap<ManufacturingExcellenceRecord>(res);
  } catch (err) {
    console.warn("manufacturingExcellenceService fetchRecord fallback:", err);
    return INITIAL_MANUFACTURING_EXCELLENCE_RECORD;
  }
}

export async function saveExcellenceDraft(
  input: ExcellenceFormInput
): Promise<ManufacturingExcellenceRecord> {
  return unwrap<ManufacturingExcellenceRecord>(
    await saveExcellenceDraftFn({ data: { input } })
  );
}

export async function submitExcellenceForReview(): Promise<ManufacturingExcellenceRecord> {
  return unwrap<ManufacturingExcellenceRecord>(
    await submitExcellenceReviewFn()
  );
}

export async function uploadExcellenceAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<ExcellenceAttachment> {
  const newAttachment: ExcellenceAttachment = {
    id: `att-mex-${Date.now()}`,
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

export async function updateExcellenceReviewDecision(args: {
  decision: "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected";
  comments: string;
}): Promise<ManufacturingExcellenceRecord> {
  return unwrap<ManufacturingExcellenceRecord>(
    await updateExcellenceDecisionFn({ data: args })
  );
}

export const fetchRecord = fetchExcellenceRecord;
export const saveDraft = saveExcellenceDraft;
export const submitForReview = submitExcellenceForReview;
export const uploadAttachment = uploadExcellenceAttachment;
export const reviewDecision = updateExcellenceReviewDecision;

export const manufacturingExcellenceService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  uploadAttachment,
  reviewDecision,
};
