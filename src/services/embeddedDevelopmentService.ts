import {
  advanceEmbeddedDevelopmentStageFn,
  getEmbeddedDevelopmentFn,
  reviewEmbeddedDevelopmentFn,
  saveEmbeddedDevelopmentDraftFn,
  submitEmbeddedDevelopmentFn,
} from "@/lib/embeddedDevelopmentFns.server";
import type {
  EmbeddedDevelopmentApprovalDecision,
  EmbeddedDevelopmentFormInput,
  EmbeddedDevelopmentRecord,
  EmbeddedDevelopmentStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<EmbeddedDevelopmentRecord> {
  return unwrap<EmbeddedDevelopmentRecord>(await getEmbeddedDevelopmentFn());
}

export async function saveDraft(
  input: Partial<EmbeddedDevelopmentFormInput>,
  id?: string
): Promise<EmbeddedDevelopmentRecord> {
  return unwrap<EmbeddedDevelopmentRecord>(
    await saveEmbeddedDevelopmentDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: EmbeddedDevelopmentStage
): Promise<EmbeddedDevelopmentRecord> {
  return unwrap<EmbeddedDevelopmentRecord>(
    await advanceEmbeddedDevelopmentStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<EmbeddedDevelopmentRecord> {
  return unwrap<EmbeddedDevelopmentRecord>(
    await submitEmbeddedDevelopmentFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: EmbeddedDevelopmentApprovalDecision;
  comments?: string;
}): Promise<EmbeddedDevelopmentRecord> {
  return unwrap<EmbeddedDevelopmentRecord>(
    await reviewEmbeddedDevelopmentFn({ data: args })
  );
}

export const embeddedDevelopmentService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
