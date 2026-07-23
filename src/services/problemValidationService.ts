import {
  getPVLookupsFn,
  getPVListFn,
  getPVFn,
  getApprovedDesignThinkingFn,
  savePVDraftFn,
  completePVStageFn,
  generatePVReportFn,
  submitPVFn,
  reviewPVFn,
} from "@/lib/problemValidationFns.server";
import type {
  ProblemValidationFormInput,
  ProblemValidationListRow,
  ProblemValidationLookups,
  ProblemValidationRecord2,
  PVStage,
} from "./types";

// Live, MongoDB-backed Problem Validation service. Same envelope-unwrapping
// pattern as the earlier innovation-pipeline modules.

export type ApprovedDesignThinkingOption = {
  id: string;
  designThinkingCode: string;
  projectName: string;
  opportunityId: string | null;
  opportunityCode: string | null;
  ideaId: string | null;
  ideaCode: string | null;
  problemStatement: string;
  rootCause: string;
  customerNeed: string;
  businessImpact: string;
  satisfactionScore: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchLookups(): Promise<ProblemValidationLookups> {
  return unwrap<ProblemValidationLookups>(await getPVLookupsFn());
}

export async function fetchList(): Promise<ProblemValidationListRow[]> {
  return unwrap<ProblemValidationListRow[]>(await getPVListFn());
}

export async function fetchRecord(id: string): Promise<ProblemValidationRecord2> {
  return unwrap<ProblemValidationRecord2>(await getPVFn({ data: id }));
}

export async function fetchApprovedDesignThinking(): Promise<ApprovedDesignThinkingOption[]> {
  return unwrap<ApprovedDesignThinkingOption[]>(await getApprovedDesignThinkingFn());
}

export async function saveDraft(
  input: ProblemValidationFormInput,
  id?: string,
): Promise<ProblemValidationRecord2> {
  return unwrap<ProblemValidationRecord2>(await savePVDraftFn({ data: { id, input } }));
}

export async function completeStage(id: string, stage: PVStage): Promise<ProblemValidationRecord2> {
  return unwrap<ProblemValidationRecord2>(await completePVStageFn({ data: { id, stage } }));
}

export async function generateReport(id: string): Promise<ProblemValidationRecord2> {
  return unwrap<ProblemValidationRecord2>(await generatePVReportFn({ data: id }));
}

export async function submitForReview(id: string): Promise<ProblemValidationRecord2> {
  return unwrap<ProblemValidationRecord2>(await submitPVFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: "Validated" | "More Research Required" | "Revision Required" | "Validation Failed";
  comments?: string;
}): Promise<ProblemValidationRecord2> {
  return unwrap<ProblemValidationRecord2>(await reviewPVFn({ data: args }));
}
