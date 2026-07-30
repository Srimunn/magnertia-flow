import {
  DEFAULT_RECORD,
  getAiModelDevelopmentFn,
  reviewAiModelDevelopmentFn,
  saveAiModelDevelopmentDraftFn,
  submitAiModelDevelopmentFn,
} from "@/lib/aiModelDevelopmentFns.server";
import type {
  AiModelApprovalDecision,
  AiModelFormInput,
  AiModelRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<AiModelRecord> {
  try {
    const res = await getAiModelDevelopmentFn();
    return unwrap<AiModelRecord>(res);
  } catch (err) {
    console.warn("aiModelDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<AiModelFormInput>,
  id?: string
): Promise<AiModelRecord> {
  return unwrap<AiModelRecord>(
    await saveAiModelDevelopmentDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<AiModelRecord> {
  return unwrap<AiModelRecord>(await submitAiModelDevelopmentFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: AiModelApprovalDecision;
  comments?: string;
}): Promise<AiModelRecord> {
  return unwrap<AiModelRecord>(await reviewAiModelDevelopmentFn({ data: args }));
}

export const aiModelDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
