import {
  INITIAL_PILOT_PRODUCTION_RECORD,
  getPilotProductionRecordFn,
  savePilotProductionDraftFn,
  submitPilotProductionFn,
} from "@/lib/pilotProductionFns.server";
import type {
  PilotAttachment,
  PilotProductionRecord,
  PilotProductionFormInput,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchPilotProductionRecord(): Promise<PilotProductionRecord> {
  try {
    const res = await getPilotProductionRecordFn();
    return unwrap<PilotProductionRecord>(res);
  } catch (err) {
    console.warn("pilotProductionService fetchRecord fallback:", err);
    return INITIAL_PILOT_PRODUCTION_RECORD;
  }
}

export async function savePilotProductionDraft(
  input: PilotProductionFormInput
): Promise<PilotProductionRecord> {
  return unwrap<PilotProductionRecord>(
    await savePilotProductionDraftFn({ data: { input } })
  );
}

export async function submitPilotProductionForReview(): Promise<PilotProductionRecord> {
  return unwrap<PilotProductionRecord>(await submitPilotProductionFn());
}

export async function uploadPilotAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<PilotAttachment> {
  const newAttachment: PilotAttachment = {
    id: `att-pl-${Date.now()}`,
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

export const fetchRecord = fetchPilotProductionRecord;
export const saveDraft = savePilotProductionDraft;
export const submitForReview = submitPilotProductionForReview;
export const uploadAttachment = uploadPilotAttachment;
export const reviewDecision = async (args: { id: string; decision: "Approved" | "Rejected"; comments?: string }) => {
  const record = await fetchPilotProductionRecord();
  return record;
};

export const pilotProductionService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  uploadAttachment,
  reviewDecision,
};
