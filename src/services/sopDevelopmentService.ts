import {
  DEFAULT_SOP_RECORD,
  getSopFn,
  reviewSopFn,
  saveSopDraftFn,
  submitSopFn,
} from "@/lib/sopFns.server";
import type {
  SopApprovalDecision,
  SopAttachment,
  SopFormInput,
  SopRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<SopRecord> {
  try {
    const res = await getSopFn();
    return unwrap<SopRecord>(res);
  } catch (err) {
    console.warn("sopDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_SOP_RECORD;
  }
}

export async function saveDraft(
  input: Partial<SopFormInput>,
  id?: string
): Promise<SopRecord> {
  return unwrap<SopRecord>(
    await saveSopDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<SopRecord> {
  return unwrap<SopRecord>(await submitSopFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: SopApprovalDecision;
  comments?: string;
}): Promise<SopRecord> {
  return unwrap<SopRecord>(await reviewSopFn({ data: args }));
}

export async function uploadAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<SopAttachment> {
  const newAttachment: SopAttachment = {
    id: `sopatt-${Date.now()}`,
    fileName: file.name,
    fileType: file.name.endsWith(".png") ? "png" : file.name.endsWith(".zip") ? "zip" : "pdf",
    documentType: file.documentType || "SOP Document",
    version: "v2.0",
    uploadedBy: "Rahul Sharma",
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

export const sopDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  uploadAttachment,
};
