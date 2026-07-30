import {
  advanceSoftwareDevelopmentStageFn,
  getSoftwareDevelopmentFn,
  reviewSoftwareDevelopmentFn,
  saveSoftwareDevelopmentDraftFn,
  submitSoftwareDevelopmentFn,
} from "@/lib/softwareDevelopmentFns.server";
import type {
  SoftwareDevelopmentApprovalDecision,
  SoftwareDevelopmentFormInput,
  SoftwareDevelopmentRecord,
  SoftwareDevelopmentStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<SoftwareDevelopmentRecord> {
  return unwrap<SoftwareDevelopmentRecord>(await getSoftwareDevelopmentFn());
}

export async function saveDraft(
  input: Partial<SoftwareDevelopmentFormInput>,
  id?: string
): Promise<SoftwareDevelopmentRecord> {
  return unwrap<SoftwareDevelopmentRecord>(
    await saveSoftwareDevelopmentDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: SoftwareDevelopmentStage
): Promise<SoftwareDevelopmentRecord> {
  return unwrap<SoftwareDevelopmentRecord>(
    await advanceSoftwareDevelopmentStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<SoftwareDevelopmentRecord> {
  return unwrap<SoftwareDevelopmentRecord>(
    await submitSoftwareDevelopmentFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: SoftwareDevelopmentApprovalDecision;
  comments?: string;
}): Promise<SoftwareDevelopmentRecord> {
  return unwrap<SoftwareDevelopmentRecord>(
    await reviewSoftwareDevelopmentFn({ data: args })
  );
}

export const softwareDevelopmentService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
