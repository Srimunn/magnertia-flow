import {
  advanceElectricalDesignStageFn,
  getElectricalDesignFn,
  reviewElectricalDesignFn,
  saveElectricalDesignDraftFn,
  submitElectricalDesignFn,
} from "@/lib/electricalDesignFns.server";
import type {
  ElectricalDesignApprovalDecision,
  ElectricalDesignFormInput,
  ElectricalDesignRecord,
  ElectricalDesignStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ElectricalDesignRecord> {
  return unwrap<ElectricalDesignRecord>(await getElectricalDesignFn());
}

export async function saveDraft(
  input: Partial<ElectricalDesignFormInput>,
  id?: string
): Promise<ElectricalDesignRecord> {
  return unwrap<ElectricalDesignRecord>(
    await saveElectricalDesignDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: ElectricalDesignStage
): Promise<ElectricalDesignRecord> {
  return unwrap<ElectricalDesignRecord>(
    await advanceElectricalDesignStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<ElectricalDesignRecord> {
  return unwrap<ElectricalDesignRecord>(
    await submitElectricalDesignFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: ElectricalDesignApprovalDecision;
  comments?: string;
}): Promise<ElectricalDesignRecord> {
  return unwrap<ElectricalDesignRecord>(
    await reviewElectricalDesignFn({ data: args })
  );
}

export const electricalDesignService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
