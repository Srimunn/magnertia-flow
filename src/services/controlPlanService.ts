import {
  INITIAL_CONTROL_PLAN_RECORD,
  addCharacteristicFn,
  getControlPlanRecordFn,
  saveControlPlanDraftFn,
  submitControlPlanFn,
} from "@/lib/controlPlanFns.server";
import type {
  ControlPlanAttachment,
  ControlPlanRecord,
  ControlPlanFormInput,
  ControlPlanCharacteristic,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchControlPlanRecord(): Promise<ControlPlanRecord> {
  try {
    const res = await getControlPlanRecordFn();
    return unwrap<ControlPlanRecord>(res);
  } catch (err) {
    console.warn("controlPlanService fetchRecord fallback:", err);
    return INITIAL_CONTROL_PLAN_RECORD;
  }
}

export async function saveControlPlanDraft(
  input: ControlPlanFormInput
): Promise<ControlPlanRecord> {
  return unwrap<ControlPlanRecord>(
    await saveControlPlanDraftFn({ data: { input } })
  );
}

export async function submitControlPlanForReview(): Promise<ControlPlanRecord> {
  return unwrap<ControlPlanRecord>(await submitControlPlanFn());
}

export async function addCharacteristic(
  char: Omit<ControlPlanCharacteristic, "id">
): Promise<ControlPlanRecord> {
  return unwrap<ControlPlanRecord>(
    await addCharacteristicFn({ data: char })
  );
}

export async function uploadControlPlanAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<ControlPlanAttachment> {
  const newAttachment: ControlPlanAttachment = {
    id: `att-cp-${Date.now()}`,
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
