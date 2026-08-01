import {
  INITIAL_BOM_RECORD,
  addBomItemFn,
  getBomRecordFn,
  saveBomDraftFn,
  submitBomFn,
} from "@/lib/bomEngineeringFns.server";
import type {
  BomAttachment,
  BomEngineeringRecord,
  BomFormInput,
  BomItemNode,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchBomRecord(): Promise<BomEngineeringRecord> {
  try {
    const res = await getBomRecordFn();
    return unwrap<BomEngineeringRecord>(res);
  } catch (err) {
    console.warn("bomEngineeringService fetchRecord fallback:", err);
    return INITIAL_BOM_RECORD;
  }
}

export async function saveBomDraft(
  input: BomFormInput
): Promise<BomEngineeringRecord> {
  return unwrap<BomEngineeringRecord>(
    await saveBomDraftFn({ data: { input } })
  );
}

export async function submitBomForReview(): Promise<BomEngineeringRecord> {
  return unwrap<BomEngineeringRecord>(await submitBomFn());
}

export async function addBomComponent(
  item: Omit<BomItemNode, "id">
): Promise<BomEngineeringRecord> {
  return unwrap<BomEngineeringRecord>(await addBomItemFn({ data: item }));
}

export async function uploadBomAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<BomAttachment> {
  const newAttachment: BomAttachment = {
    id: `att-${Date.now()}`,
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
