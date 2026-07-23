import {
  completeCommercializationStageFn,
  generateCommercializationReportFn,
  getCommercializationFn,
  getCommercializationListFn,
  getCommercializationLookupsFn,
  reviewCommercializationFn,
  saveCommercializationDraftFn,
  submitCommercializationFn,
} from "@/lib/commercializationFns.server";
import type {
  CommercializationApprovalDecision,
  CommercializationFormInput,
  CommercializationListRow,
  CommercializationLookups,
  CommercializationRecord,
  CommercializationStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchLookups(): Promise<CommercializationLookups> {
  return unwrap<CommercializationLookups>(await getCommercializationLookupsFn());
}

export async function fetchList(): Promise<CommercializationListRow[]> {
  return unwrap<CommercializationListRow[]>(await getCommercializationListFn());
}

export async function fetchRecord(id: string): Promise<CommercializationRecord> {
  return unwrap<CommercializationRecord>(await getCommercializationFn({ data: id }));
}

export async function saveDraft(input: CommercializationFormInput, id?: string): Promise<CommercializationRecord> {
  return unwrap<CommercializationRecord>(await saveCommercializationDraftFn({ data: { id, input } }));
}

export async function completeStage(id: string, stage: CommercializationStage): Promise<CommercializationRecord> {
  return unwrap<CommercializationRecord>(await completeCommercializationStageFn({ data: { id, stage } }));
}

export async function submitForReview(id: string): Promise<CommercializationRecord> {
  return unwrap<CommercializationRecord>(await submitCommercializationFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: CommercializationApprovalDecision;
  comments?: string;
  approvalDate?: string;
}): Promise<CommercializationRecord> {
  return unwrap<CommercializationRecord>(await reviewCommercializationFn({ data: args }));
}

export async function generateReport(id: string): Promise<CommercializationRecord> {
  return unwrap<CommercializationRecord>(await generateCommercializationReportFn({ data: id }));
}

export const commercializationService = {
  fetchLookups,
  fetchList,
  fetchRecord,
  saveDraft,
  completeStage,
  submitForReview,
  reviewDecision,
  generateReport,
};
