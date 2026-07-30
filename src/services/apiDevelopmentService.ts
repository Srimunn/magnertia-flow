import {
  DEFAULT_RECORD,
  getApiDevelopmentFn,
  reviewApiDevelopmentFn,
  saveApiDevelopmentDraftFn,
  submitApiDevelopmentFn,
} from "@/lib/apiDevelopmentFns.server";
import type {
  ApiDevelopmentApprovalDecision,
  ApiDevelopmentFormInput,
  ApiDevelopmentRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ApiDevelopmentRecord> {
  try {
    const res = await getApiDevelopmentFn();
    return unwrap<ApiDevelopmentRecord>(res);
  } catch (err) {
    console.warn("apiDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<ApiDevelopmentFormInput>,
  id?: string
): Promise<ApiDevelopmentRecord> {
  return unwrap<ApiDevelopmentRecord>(
    await saveApiDevelopmentDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<ApiDevelopmentRecord> {
  return unwrap<ApiDevelopmentRecord>(await submitApiDevelopmentFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: ApiDevelopmentApprovalDecision;
  comments?: string;
}): Promise<ApiDevelopmentRecord> {
  return unwrap<ApiDevelopmentRecord>(await reviewApiDevelopmentFn({ data: args }));
}

export const apiDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
