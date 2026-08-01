import {
  DEFAULT_FACTORY_LAYOUT_RECORD,
  getFactoryLayoutFn,
  reviewFactoryLayoutFn,
  saveFactoryLayoutDraftFn,
  submitFactoryLayoutFn,
} from "@/lib/factoryLayoutFns.server";
import type {
  FactoryApprovalDecision,
  FactoryAttachment,
  FactoryLayoutFormInput,
  FactoryLayoutRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<FactoryLayoutRecord> {
  try {
    const res = await getFactoryLayoutFn();
    return unwrap<FactoryLayoutRecord>(res);
  } catch (err) {
    console.warn("factoryLayoutDesignService fetchRecord fallback:", err);
    return DEFAULT_FACTORY_LAYOUT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<FactoryLayoutFormInput>,
  id?: string
): Promise<FactoryLayoutRecord> {
  return unwrap<FactoryLayoutRecord>(
    await saveFactoryLayoutDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<FactoryLayoutRecord> {
  return unwrap<FactoryLayoutRecord>(await submitFactoryLayoutFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: FactoryApprovalDecision;
  comments?: string;
}): Promise<FactoryLayoutRecord> {
  return unwrap<FactoryLayoutRecord>(await reviewFactoryLayoutFn({ data: args }));
}

export async function uploadAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<FactoryAttachment> {
  const newAttachment: FactoryAttachment = {
    id: `fatt-${Date.now()}`,
    fileName: file.name,
    fileType: file.name.endsWith(".dwg") ? "dwg" : file.name.endsWith(".zip") ? "zip" : "pdf",
    documentType: file.documentType || "Factory Document",
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

export const factoryLayoutDesignService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  uploadAttachment,
};
