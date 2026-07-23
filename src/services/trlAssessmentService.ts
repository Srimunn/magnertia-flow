import {
  completeTrlStageFn,
  generateTrlReportFn,
  getTrlFn,
  getTrlListFn,
  getTrlLookupsFn,
  reviewTrlFn,
  saveTrlDraftFn,
  submitTrlFn,
} from "@/lib/trlAssessmentFns.server";
import type {
  TrlApprovalDecision,
  TrlAssessmentRecord,
  TrlFormInput,
  TrlListRow,
  TrlLookups,
  TrlStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchLookups(): Promise<TrlLookups> {
  return unwrap<TrlLookups>(await getTrlLookupsFn());
}

export async function fetchList(): Promise<TrlListRow[]> {
  return unwrap<TrlListRow[]>(await getTrlListFn());
}

export async function fetchRecord(id: string): Promise<TrlAssessmentRecord> {
  return unwrap<TrlAssessmentRecord>(await getTrlFn({ data: id }));
}

export async function saveDraft(input: TrlFormInput, id?: string): Promise<TrlAssessmentRecord> {
  return unwrap<TrlAssessmentRecord>(await saveTrlDraftFn({ data: { id, input } }));
}

export async function completeStage(id: string, stage: TrlStage): Promise<TrlAssessmentRecord> {
  return unwrap<TrlAssessmentRecord>(await completeTrlStageFn({ data: { id, stage } }));
}

export async function submitForReview(id: string): Promise<TrlAssessmentRecord> {
  return unwrap<TrlAssessmentRecord>(await submitTrlFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: TrlApprovalDecision;
  comments?: string;
}): Promise<TrlAssessmentRecord> {
  return unwrap<TrlAssessmentRecord>(await reviewTrlFn({ data: args }));
}

export async function generateReport(id: string): Promise<TrlAssessmentRecord> {
  return unwrap<TrlAssessmentRecord>(await generateTrlReportFn({ data: id }));
}

export const trlAssessmentService = {
  fetchLookups,
  fetchList,
  fetchRecord,
  saveDraft,
  completeStage,
  submitForReview,
  reviewDecision,
  generateReport,
};
