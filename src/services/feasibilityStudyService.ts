import {
  completeFeasibilityStageFn,
  generateFeasibilityReportFn,
  getFeasibilityFn,
  getFeasibilityListFn,
  getFeasibilityLookupsFn,
  getValidatedProblemsFn,
  reviewFeasibilityFn,
  saveFeasibilityDraftFn,
  submitFeasibilityFn,
} from "@/lib/feasibilityStudyFns.server";
import type {
  FeasibilityFormInput,
  FeasibilityListRow,
  FeasibilityLookups,
  FeasibilityStage,
  FeasibilityStudyRecord,
  FSApprovalDecision,
  FSFundingApproval,
} from "./types";

// Live, MongoDB-backed Feasibility Study service — the investment-decision
// gate that turns a validated Problem into an approved Proof of Concept.
// Same envelope-unwrapping pattern as the other innovation modules.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export interface ValidatedProblem {
  id: string;
  problemValidationCode: string;
  problemTitle: string;
  problemDescription: string;
  industry: string;
  customerSegment: string;
  overallValidationScore: number;
  revenueOpportunity: number;
  marketSize: number;
  linkedOpportunityCode: string | null;
}

export async function fetchLookups(): Promise<FeasibilityLookups> {
  return unwrap<FeasibilityLookups>(await getFeasibilityLookupsFn());
}

export async function fetchList(): Promise<FeasibilityListRow[]> {
  return unwrap<FeasibilityListRow[]>(await getFeasibilityListFn());
}

export async function fetchRecord(id: string): Promise<FeasibilityStudyRecord> {
  return unwrap<FeasibilityStudyRecord>(await getFeasibilityFn({ data: id }));
}

export async function fetchValidatedProblems(): Promise<ValidatedProblem[]> {
  return unwrap<ValidatedProblem[]>(await getValidatedProblemsFn());
}

export async function saveDraft(
  input: FeasibilityFormInput,
  id?: string,
): Promise<FeasibilityStudyRecord> {
  return unwrap<FeasibilityStudyRecord>(await saveFeasibilityDraftFn({ data: { id, input } }));
}

export async function completeStage(
  id: string,
  stage: FeasibilityStage,
): Promise<FeasibilityStudyRecord> {
  return unwrap<FeasibilityStudyRecord>(await completeFeasibilityStageFn({ data: { id, stage } }));
}

export async function submitForReview(id: string): Promise<FeasibilityStudyRecord> {
  return unwrap<FeasibilityStudyRecord>(await submitFeasibilityFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: FSApprovalDecision;
  funding?: FSFundingApproval;
  comments?: string;
  conditions?: string;
}): Promise<FeasibilityStudyRecord> {
  return unwrap<FeasibilityStudyRecord>(await reviewFeasibilityFn({ data: args }));
}

export async function generateReport(id: string): Promise<FeasibilityStudyRecord> {
  return unwrap<FeasibilityStudyRecord>(await generateFeasibilityReportFn({ data: id }));
}
