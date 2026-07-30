import {
  advanceMechanicalDesignStageFn,
  getMechanicalDesignFn,
  reviewMechanicalDesignFn,
  saveMechanicalDesignDraftFn,
  submitMechanicalDesignFn,
} from "@/lib/mechanicalDesignFns.server";
import type {
  MechanicalDesignApprovalDecision,
  MechanicalDesignFormInput,
  MechanicalDesignRecord,
  MechanicalDesignStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<MechanicalDesignRecord> {
  return unwrap<MechanicalDesignRecord>(await getMechanicalDesignFn());
}

export async function saveDraft(
  input: Partial<MechanicalDesignFormInput>,
  id?: string
): Promise<MechanicalDesignRecord> {
  return unwrap<MechanicalDesignRecord>(
    await saveMechanicalDesignDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: MechanicalDesignStage
): Promise<MechanicalDesignRecord> {
  return unwrap<MechanicalDesignRecord>(
    await advanceMechanicalDesignStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<MechanicalDesignRecord> {
  return unwrap<MechanicalDesignRecord>(
    await submitMechanicalDesignFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: MechanicalDesignApprovalDecision;
  comments?: string;
}): Promise<MechanicalDesignRecord> {
  return unwrap<MechanicalDesignRecord>(
    await reviewMechanicalDesignFn({ data: args })
  );
}

export const mechanicalDesignService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
