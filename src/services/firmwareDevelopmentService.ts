import {
  advanceFirmwareDevelopmentStageFn,
  getFirmwareDevelopmentFn,
  reviewFirmwareDevelopmentFn,
  saveFirmwareDevelopmentDraftFn,
  submitFirmwareDevelopmentFn,
} from "@/lib/firmwareDevelopmentFns.server";
import type {
  FirmwareDevelopmentApprovalDecision,
  FirmwareDevelopmentFormInput,
  FirmwareDevelopmentRecord,
  FirmwareDevelopmentStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<FirmwareDevelopmentRecord> {
  return unwrap<FirmwareDevelopmentRecord>(await getFirmwareDevelopmentFn());
}

export async function saveDraft(
  input: Partial<FirmwareDevelopmentFormInput>,
  id?: string
): Promise<FirmwareDevelopmentRecord> {
  return unwrap<FirmwareDevelopmentRecord>(
    await saveFirmwareDevelopmentDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: FirmwareDevelopmentStage
): Promise<FirmwareDevelopmentRecord> {
  return unwrap<FirmwareDevelopmentRecord>(
    await advanceFirmwareDevelopmentStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<FirmwareDevelopmentRecord> {
  return unwrap<FirmwareDevelopmentRecord>(
    await submitFirmwareDevelopmentFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: FirmwareDevelopmentApprovalDecision;
  comments?: string;
}): Promise<FirmwareDevelopmentRecord> {
  return unwrap<FirmwareDevelopmentRecord>(
    await reviewFirmwareDevelopmentFn({ data: args })
  );
}

export const firmwareDevelopmentService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
