import {
  advanceMobileDevelopmentStageFn,
  getMobileDevelopmentFn,
  reviewMobileDevelopmentFn,
  saveMobileDevelopmentDraftFn,
  submitMobileDevelopmentFn,
} from "@/lib/mobileDevelopmentFns.server";
import type {
  MobileDevelopmentApprovalDecision,
  MobileDevelopmentFormInput,
  MobileDevelopmentRecord,
  MobileDevelopmentStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<MobileDevelopmentRecord> {
  return unwrap<MobileDevelopmentRecord>(await getMobileDevelopmentFn());
}

export async function saveDraft(
  input: Partial<MobileDevelopmentFormInput>,
  id?: string
): Promise<MobileDevelopmentRecord> {
  return unwrap<MobileDevelopmentRecord>(
    await saveMobileDevelopmentDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: MobileDevelopmentStage
): Promise<MobileDevelopmentRecord> {
  return unwrap<MobileDevelopmentRecord>(
    await advanceMobileDevelopmentStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<MobileDevelopmentRecord> {
  return unwrap<MobileDevelopmentRecord>(
    await submitMobileDevelopmentFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: MobileDevelopmentApprovalDecision;
  comments?: string;
}): Promise<MobileDevelopmentRecord> {
  return unwrap<MobileDevelopmentRecord>(
    await reviewMobileDevelopmentFn({ data: args })
  );
}

export const mobileDevelopmentService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
