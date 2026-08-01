import {
  DEFAULT_WORK_INSTRUCTION_RECORD,
  getWorkInstructionFn,
  reviewWorkInstructionFn,
  saveWorkInstructionDraftFn,
  submitWorkInstructionFn,
} from "@/lib/workInstructionFns.server";
import type {
  WorkInstructionApprovalDecision,
  WorkInstructionAttachment,
  WorkInstructionFormInput,
  WorkInstructionRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<WorkInstructionRecord> {
  try {
    const res = await getWorkInstructionFn();
    return unwrap<WorkInstructionRecord>(res);
  } catch (err) {
    console.warn("workInstructionDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_WORK_INSTRUCTION_RECORD;
  }
}

export async function saveDraft(
  input: Partial<WorkInstructionFormInput>,
  id?: string
): Promise<WorkInstructionRecord> {
  return unwrap<WorkInstructionRecord>(
    await saveWorkInstructionDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<WorkInstructionRecord> {
  return unwrap<WorkInstructionRecord>(await submitWorkInstructionFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: WorkInstructionApprovalDecision;
  comments?: string;
}): Promise<WorkInstructionRecord> {
  return unwrap<WorkInstructionRecord>(await reviewWorkInstructionFn({ data: args }));
}

export async function uploadAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<WorkInstructionAttachment> {
  const newAttachment: WorkInstructionAttachment = {
    id: `wiatt-${Date.now()}`,
    fileName: file.name,
    fileType: file.name.endsWith(".mp4") ? "mp4" : file.name.endsWith(".vsdx") ? "vsdx" : "pdf",
    documentType: file.documentType || "Instruction Document",
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

export const workInstructionDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  uploadAttachment,
};
