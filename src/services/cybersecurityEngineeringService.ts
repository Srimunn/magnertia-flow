import {
  DEFAULT_RECORD,
  getCybersecurityEngineeringFn,
  reviewCybersecurityEngineeringFn,
  saveCybersecurityEngineeringDraftFn,
  submitCybersecurityEngineeringFn,
} from "@/lib/cybersecurityEngineeringFns.server";
import type {
  CybersecurityApprovalDecision,
  CybersecurityFormInput,
  CybersecurityRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<CybersecurityRecord> {
  try {
    const res = await getCybersecurityEngineeringFn();
    return unwrap<CybersecurityRecord>(res);
  } catch (err) {
    console.warn("cybersecurityEngineeringService fetchRecord fallback:", err);
    return DEFAULT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<CybersecurityFormInput>,
  id?: string
): Promise<CybersecurityRecord> {
  return unwrap<CybersecurityRecord>(
    await saveCybersecurityEngineeringDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<CybersecurityRecord> {
  return unwrap<CybersecurityRecord>(await submitCybersecurityEngineeringFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: CybersecurityApprovalDecision;
  comments?: string;
}): Promise<CybersecurityRecord> {
  return unwrap<CybersecurityRecord>(await reviewCybersecurityEngineeringFn({ data: args }));
}

export const cybersecurityEngineeringService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
