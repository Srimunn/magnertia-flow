import {
  INITIAL_APQP_RECORD,
  getApqpRecordFn,
  saveApqpDraftFn,
  submitApqpFn,
} from "@/lib/apqpFns.server";
import type {
  ApqpAttachment,
  ApqpRecord,
  ApqpFormInput,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchApqpRecord(): Promise<ApqpRecord> {
  try {
    const res = await getApqpRecordFn();
    return unwrap<ApqpRecord>(res);
  } catch (err) {
    console.warn("apqpService fetchRecord fallback:", err);
    return INITIAL_APQP_RECORD;
  }
}

export async function saveApqpDraft(
  input: ApqpFormInput
): Promise<ApqpRecord> {
  return unwrap<ApqpRecord>(
    await saveApqpDraftFn({ data: { input } })
  );
}

export async function submitApqpForReview(): Promise<ApqpRecord> {
  return unwrap<ApqpRecord>(await submitApqpFn());
}

export async function uploadApqpAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<ApqpAttachment> {
  const newAttachment: ApqpAttachment = {
    id: `att-apqp-${Date.now()}`,
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
