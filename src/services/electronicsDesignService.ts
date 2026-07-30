import {
  advanceElectronicsDesignStageFn,
  getElectronicsDesignFn,
  reviewElectronicsDesignFn,
  saveElectronicsDesignDraftFn,
  submitElectronicsDesignFn,
} from "@/lib/electronicsDesignFns.server";
import type {
  ElectronicsDesignApprovalDecision,
  ElectronicsDesignFormInput,
  ElectronicsDesignRecord,
  ElectronicsDesignStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ElectronicsDesignRecord> {
  return unwrap<ElectronicsDesignRecord>(await getElectronicsDesignFn());
}

export async function saveDraft(
  input: Partial<ElectronicsDesignFormInput>,
  id?: string
): Promise<ElectronicsDesignRecord> {
  return unwrap<ElectronicsDesignRecord>(
    await saveElectronicsDesignDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: ElectronicsDesignStage
): Promise<ElectronicsDesignRecord> {
  return unwrap<ElectronicsDesignRecord>(
    await advanceElectronicsDesignStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<ElectronicsDesignRecord> {
  return unwrap<ElectronicsDesignRecord>(
    await submitElectronicsDesignFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: ElectronicsDesignApprovalDecision;
  comments?: string;
}): Promise<ElectronicsDesignRecord> {
  return unwrap<ElectronicsDesignRecord>(
    await reviewElectronicsDesignFn({ data: args })
  );
}

export const electronicsDesignService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
