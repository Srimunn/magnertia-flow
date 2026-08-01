import {
  DEFAULT_CAPACITY_PLANNING_RECORD,
  getCapacityPlanningFn,
  reviewCapacityFn,
  saveCapacityDraftFn,
  submitCapacityFn,
} from "@/lib/capacityPlanningFns.server";
import type {
  CapacityApprovalDecision,
  CapacityAttachment,
  CapacityFormInput,
  CapacityPlanningRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<CapacityPlanningRecord> {
  try {
    const res = await getCapacityPlanningFn();
    return unwrap<CapacityPlanningRecord>(res);
  } catch (err) {
    console.warn("capacityPlanningService fetchRecord fallback:", err);
    return DEFAULT_CAPACITY_PLANNING_RECORD;
  }
}

export async function saveDraft(
  input: Partial<CapacityFormInput>,
  id?: string
): Promise<CapacityPlanningRecord> {
  return unwrap<CapacityPlanningRecord>(
    await saveCapacityDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<CapacityPlanningRecord> {
  return unwrap<CapacityPlanningRecord>(await submitCapacityFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: CapacityApprovalDecision;
  comments?: string;
}): Promise<CapacityPlanningRecord> {
  return unwrap<CapacityPlanningRecord>(await reviewCapacityFn({ data: args }));
}

export async function uploadAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<CapacityAttachment> {
  const newAttachment: CapacityAttachment = {
    id: `catt-${Date.now()}`,
    fileName: file.name,
    fileType: file.name.endsWith(".xlsx") ? "xlsx" : file.name.endsWith(".pdf") ? "pdf" : "doc",
    documentType: file.documentType || "Capacity Document",
    version: "v1.0",
    uploadedBy: "Rahul Sharma",
    uploadedDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    fileSize: `${(file.size / 1024).toFixed(0)} KB`,
    status: "Active",
  };
  return newAttachment;
}

export const capacityPlanningService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  uploadAttachment,
};
