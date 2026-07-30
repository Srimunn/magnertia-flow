import {
  DEFAULT_RECORD,
  getUiUxDevelopmentFn,
  reviewUiUxDevelopmentFn,
  saveUiUxDevelopmentDraftFn,
  submitUiUxDevelopmentFn,
} from "@/lib/uiUxDevelopmentFns.server";
import type {
  UiUxDevelopmentApprovalDecision,
  UiUxDevelopmentFormInput,
  UiUxDevelopmentRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<UiUxDevelopmentRecord> {
  try {
    const res = await getUiUxDevelopmentFn();
    return unwrap<UiUxDevelopmentRecord>(res);
  } catch (err) {
    console.warn("fetchRecord fallback triggered:", err);
    return DEFAULT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<UiUxDevelopmentFormInput>,
  id?: string
): Promise<UiUxDevelopmentRecord> {
  return unwrap<UiUxDevelopmentRecord>(
    await saveUiUxDevelopmentDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<UiUxDevelopmentRecord> {
  return unwrap<UiUxDevelopmentRecord>(await submitUiUxDevelopmentFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: UiUxDevelopmentApprovalDecision;
  comments?: string;
}): Promise<UiUxDevelopmentRecord> {
  return unwrap<UiUxDevelopmentRecord>(await reviewUiUxDevelopmentFn({ data: args }));
}

export const uiUxDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
