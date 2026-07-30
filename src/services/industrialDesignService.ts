import {
  advanceIndustrialDesignStageFn,
  getIndustrialDesignFn,
  reviewIndustrialDesignFn,
  saveIndustrialDesignDraftFn,
  submitIndustrialDesignFn,
} from "@/lib/industrialDesignFns.server";
import type {
  IndustrialDesignApprovalDecision,
  IndustrialDesignFormInput,
  IndustrialDesignRecord,
  IndustrialDesignStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<IndustrialDesignRecord> {
  return unwrap<IndustrialDesignRecord>(await getIndustrialDesignFn());
}

export async function saveDraft(
  input: IndustrialDesignFormInput,
  id?: string
): Promise<IndustrialDesignRecord> {
  return unwrap<IndustrialDesignRecord>(
    await saveIndustrialDesignDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: IndustrialDesignStage
): Promise<IndustrialDesignRecord> {
  return unwrap<IndustrialDesignRecord>(
    await advanceIndustrialDesignStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<IndustrialDesignRecord> {
  return unwrap<IndustrialDesignRecord>(
    await submitIndustrialDesignFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: IndustrialDesignApprovalDecision;
  comments?: string;
}): Promise<IndustrialDesignRecord> {
  return unwrap<IndustrialDesignRecord>(
    await reviewIndustrialDesignFn({ data: args })
  );
}

export const industrialDesignService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
