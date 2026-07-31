import {
  DEFAULT_PLM_RECORD,
  advancePlmStageFn,
  getPlmFn,
  reviewPlmFn,
  savePlmDraftFn,
  submitPlmFn,
  togglePlmChecklistFn,
} from "@/lib/plmFns.server";
import type {
  PlmApprovalDecision,
  PlmFormInput,
  PlmRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<PlmRecord> {
  try {
    const res = await getPlmFn();
    return unwrap<PlmRecord>(res);
  } catch (err) {
    console.warn("plmService fetchRecord fallback:", err);
    return DEFAULT_PLM_RECORD;
  }
}

export async function saveDraft(
  input: Partial<PlmFormInput>,
  id?: string
): Promise<PlmRecord> {
  return unwrap<PlmRecord>(
    await savePlmDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<PlmRecord> {
  return unwrap<PlmRecord>(await submitPlmFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: PlmApprovalDecision;
  comments?: string;
}): Promise<PlmRecord> {
  return unwrap<PlmRecord>(await reviewPlmFn({ data: args }));
}

export async function advanceStage(targetStage: 1 | 2 | 3 | 4): Promise<PlmRecord> {
  return unwrap<PlmRecord>(await advancePlmStageFn({ data: { targetStage } }));
}

export async function toggleChecklistItem(
  section: "engineering" | "manufacturing" | "service",
  itemId: string
): Promise<PlmRecord> {
  return unwrap<PlmRecord>(await togglePlmChecklistFn({ data: { section, itemId } }));
}

export const plmService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  advanceStage,
  toggleChecklistItem,
};
