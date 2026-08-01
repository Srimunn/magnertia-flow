import {
  INITIAL_ROUTING_RECORD,
  addRoutingOperationFn,
  getRoutingRecordFn,
  saveRoutingDraftFn,
  submitRoutingFn,
} from "@/lib/routingDevelopmentFns.server";
import type {
  RoutingAttachment,
  RoutingRecord,
  RoutingFormInput,
  RoutingOperation,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRoutingRecord(): Promise<RoutingRecord> {
  try {
    const res = await getRoutingRecordFn();
    return unwrap<RoutingRecord>(res);
  } catch (err) {
    console.warn("routingDevelopmentService fetchRecord fallback:", err);
    return INITIAL_ROUTING_RECORD;
  }
}

export async function saveRoutingDraft(
  input: RoutingFormInput
): Promise<RoutingRecord> {
  return unwrap<RoutingRecord>(
    await saveRoutingDraftFn({ data: { input } })
  );
}

export async function submitRoutingForReview(): Promise<RoutingRecord> {
  return unwrap<RoutingRecord>(await submitRoutingFn());
}

export async function addRoutingOperation(
  operation: Omit<RoutingOperation, "id">
): Promise<RoutingRecord> {
  return unwrap<RoutingRecord>(
    await addRoutingOperationFn({ data: operation })
  );
}

export async function uploadRoutingAttachment(file: {
  name: string;
  type: string;
  size: number;
  documentType: string;
}): Promise<RoutingAttachment> {
  const newAttachment: RoutingAttachment = {
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
