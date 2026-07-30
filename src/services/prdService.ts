import {
  advancePrdStageFn,
  getPrdFn,
  reviewPrdFn,
  savePrdDraftFn,
  submitPrdFn,
} from "@/lib/prdFns.server";
import type {
  PrdApprovalDecision,
  PrdFormInput,
  PrdRecord,
  PrdStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<PrdRecord> {
  return unwrap<PrdRecord>(await getPrdFn());
}

export async function saveDraft(input: PrdFormInput, id?: string): Promise<PrdRecord> {
  return unwrap<PrdRecord>(await savePrdDraftFn({ data: { id, input } }));
}

export async function advanceStage(id: string, targetStage: PrdStage): Promise<PrdRecord> {
  return unwrap<PrdRecord>(await advancePrdStageFn({ data: { id, targetStage } }));
}

export async function submitForReview(id: string): Promise<PrdRecord> {
  return unwrap<PrdRecord>(await submitPrdFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: PrdApprovalDecision;
  comments?: string;
}): Promise<PrdRecord> {
  return unwrap<PrdRecord>(await reviewPrdFn({ data: args }));
}

export const prdService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
