import {
  INITIAL_SMART_FACTORY_RECORD,
  getSmartFactoryRecordFn,
  saveSmartFactoryDraftFn,
  submitSmartFactoryReviewFn,
  updateSmartFactoryDecisionFn,
} from "@/lib/smartFactoryDevelopmentFns.server";
import type {
  SmartFactoryAttachment,
  SmartFactoryDevelopmentRecord,
  SmartFactoryFormInput,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchSmartFactoryRecord(): Promise<SmartFactoryDevelopmentRecord> {
  try {
    const res = await getSmartFactoryRecordFn();
    return unwrap<SmartFactoryDevelopmentRecord>(res);
  } catch (err) {
    console.warn("smartFactoryDevelopmentService fetchRecord fallback:", err);
    return INITIAL_SMART_FACTORY_RECORD;
  }
}

export async function saveSmartFactoryDraft(
  input: SmartFactoryFormInput
): Promise<SmartFactoryDevelopmentRecord> {
  return unwrap<SmartFactoryDevelopmentRecord>(
    await saveSmartFactoryDraftFn({ data: { input } })
  );
}

export async function submitSmartFactoryForReview(): Promise<SmartFactoryDevelopmentRecord> {
  return unwrap<SmartFactoryDevelopmentRecord>(
    await submitSmartFactoryReviewFn()
  );
}

export async function uploadSmartFactoryAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<SmartFactoryAttachment> {
  const newAttachment: SmartFactoryAttachment = {
    id: `att-sf-${Date.now()}`,
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

export async function updateSmartFactoryReviewDecision(args: {
  decision: "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected";
  comments: string;
}): Promise<SmartFactoryDevelopmentRecord> {
  return unwrap<SmartFactoryDevelopmentRecord>(
    await updateSmartFactoryDecisionFn({ data: args })
  );
}

export const fetchRecord = fetchSmartFactoryRecord;
export const saveDraft = saveSmartFactoryDraft;
export const submitForReview = submitSmartFactoryForReview;
export const uploadAttachment = uploadSmartFactoryAttachment;
export const reviewDecision = updateSmartFactoryReviewDecision;

export const smartFactoryDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  uploadAttachment,
  reviewDecision,
};
