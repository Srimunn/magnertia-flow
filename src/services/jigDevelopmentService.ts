import {
  DEFAULT_JIG_RECORD,
  getJigFn,
  reviewJigFn,
  saveJigDraftFn,
  submitJigFn,
} from "@/lib/jigDevelopmentFns.server";
import type {
  JigApprovalDecision,
  JigAttachment,
  JigFormInput,
  JigRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<JigRecord> {
  try {
    const res = await getJigFn();
    return unwrap<JigRecord>(res);
  } catch (err) {
    console.warn("jigDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_JIG_RECORD;
  }
}

export async function saveDraft(
  input: Partial<JigFormInput>,
  id?: string
): Promise<JigRecord> {
  return unwrap<JigRecord>(
    await saveJigDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<JigRecord> {
  return unwrap<JigRecord>(await submitJigFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: JigApprovalDecision;
  comments?: string;
}): Promise<JigRecord> {
  return unwrap<JigRecord>(await reviewJigFn({ data: args }));
}

export async function uploadAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<JigAttachment> {
  const newAttachment: JigAttachment = {
    id: `att-${Date.now()}`,
    fileName: file.name,
    fileType: file.type.includes("pdf")
      ? "pdf"
      : file.type.includes("step") || file.name.endsWith(".step")
      ? "cad"
      : file.name.endsWith(".nc")
      ? "cnc"
      : "file",
    documentType: file.documentType || "Engineered Drawing",
    version: "v1.0",
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

export const jigDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  uploadAttachment,
};
