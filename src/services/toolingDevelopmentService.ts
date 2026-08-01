import {
  DEFAULT_TOOLING_RECORD,
  getToolingFn,
  reviewToolingFn,
  saveToolingDraftFn,
  submitToolingFn,
} from "@/lib/toolingDevelopmentFns.server";
import type {
  ToolingApprovalDecision,
  ToolingFormInput,
  ToolingRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ToolingRecord> {
  try {
    const res = await getToolingFn();
    return unwrap<ToolingRecord>(res);
  } catch (err) {
    console.warn("toolingDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_TOOLING_RECORD;
  }
}

export async function saveDraft(
  input: Partial<ToolingFormInput>,
  id?: string
): Promise<ToolingRecord> {
  return unwrap<ToolingRecord>(
    await saveToolingDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<ToolingRecord> {
  return unwrap<ToolingRecord>(await submitToolingFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: ToolingApprovalDecision;
  comments?: string;
}): Promise<ToolingRecord> {
  return unwrap<ToolingRecord>(await reviewToolingFn({ data: args }));
}

export const toolingDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
