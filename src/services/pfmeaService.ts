import {
  INITIAL_PFMEA_RECORD,
  addFailureModeFn,
  getPfmeaRecordFn,
  savePfmeaDraftFn,
  submitPfmeaFn,
} from "@/lib/pfmeaFns.server";
import type {
  PfmeaAttachment,
  PfmeaRecord,
  PfmeaFormInput,
  PfmeaFailureMode,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchPfmeaRecord(): Promise<PfmeaRecord> {
  try {
    const res = await getPfmeaRecordFn();
    return unwrap<PfmeaRecord>(res);
  } catch (err) {
    console.warn("pfmeaService fetchRecord fallback:", err);
    return INITIAL_PFMEA_RECORD;
  }
}

export async function savePfmeaDraft(
  input: PfmeaFormInput
): Promise<PfmeaRecord> {
  return unwrap<PfmeaRecord>(
    await savePfmeaDraftFn({ data: { input } })
  );
}

export async function submitPfmeaForReview(): Promise<PfmeaRecord> {
  return unwrap<PfmeaRecord>(await submitPfmeaFn());
}

export async function addFailureMode(
  fm: Omit<PfmeaFailureMode, "id">
): Promise<PfmeaRecord> {
  return unwrap<PfmeaRecord>(
    await addFailureModeFn({ data: fm })
  );
}

export async function uploadPfmeaAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<PfmeaAttachment> {
  const newAttachment: PfmeaAttachment = {
    id: `att-pfmea-${Date.now()}`,
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
