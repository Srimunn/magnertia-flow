import {
  DEFAULT_IOT_RECORD,
  advanceIotStageFn,
  getIotFn,
  reviewIotFn,
  saveIotDraftFn,
  submitIotFn,
  toggleIotChecklistFn,
} from "@/lib/iotDevelopmentFns.server";
import type {
  IotApprovalDecision,
  IotFormInput,
  IotRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<IotRecord> {
  try {
    const res = await getIotFn();
    return unwrap<IotRecord>(res);
  } catch (err) {
    console.warn("iotDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_IOT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<IotFormInput>,
  id?: string
): Promise<IotRecord> {
  return unwrap<IotRecord>(
    await saveIotDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<IotRecord> {
  return unwrap<IotRecord>(await submitIotFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: IotApprovalDecision;
  comments?: string;
}): Promise<IotRecord> {
  return unwrap<IotRecord>(await reviewIotFn({ data: args }));
}

export async function advanceStage(targetStage: 1 | 2 | 3 | 4): Promise<IotRecord> {
  return unwrap<IotRecord>(await advanceIotStageFn({ data: { targetStage } }));
}

export async function toggleChecklistItem(
  section: "deviceMgmt" | "dataCollection" | "integration",
  itemId: string
): Promise<IotRecord> {
  return unwrap<IotRecord>(await toggleIotChecklistFn({ data: { section, itemId } }));
}

export const iotDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  advanceStage,
  toggleChecklistItem,
};
