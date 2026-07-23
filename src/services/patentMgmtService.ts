import {
  completePatentStageFn,
  getApprovedIpRecordsFn,
  getPatentFn,
  getPatentListFn,
  getPatentLookupsFn,
  payRenewalFeeFn,
  refreshPatentFn,
  reviewPatentFn,
  savePatentDraftFn,
  submitOfficeActionResponseFn,
  submitPatentFn,
} from "@/lib/patentMgmtFns.server";
import type {
  PatentApprovalDecision,
  PatentFormInput,
  PatentListRow,
  PatentLookups,
  PatentRecord,
  PatentStage,
} from "./types";

// Live, MongoDB-backed Patent Management service — the IP lifecycle engine
// (preparation → filing → examination → grant → commercialization) with real
// deadline tracking. Same envelope-unwrapping pattern as the other modules.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export interface ApprovedIpRecord {
  id: string;
  ipRecordCode: string;
  inventionTitle: string;
  abstract: string;
  technologyArea: string;
  technologyDomain: string;
  industrySector: string;
  leadInventor: string;
  coInventors: string[];
  keywords: string[];
  linkedProductId: string | null;
  linkedProductCode: string | null;
}

export async function fetchLookups(): Promise<PatentLookups> {
  return unwrap<PatentLookups>(await getPatentLookupsFn());
}
export async function fetchList(): Promise<PatentListRow[]> {
  return unwrap<PatentListRow[]>(await getPatentListFn());
}
export async function fetchRecord(id: string): Promise<PatentRecord> {
  return unwrap<PatentRecord>(await getPatentFn({ data: id }));
}
export async function fetchApprovedIpRecords(): Promise<ApprovedIpRecord[]> {
  return unwrap<ApprovedIpRecord[]>(await getApprovedIpRecordsFn());
}
export async function saveDraft(input: PatentFormInput, id?: string): Promise<PatentRecord> {
  return unwrap<PatentRecord>(await savePatentDraftFn({ data: { id, input } }));
}
export async function completeStage(id: string, stage: PatentStage): Promise<PatentRecord> {
  return unwrap<PatentRecord>(await completePatentStageFn({ data: { id, stage } }));
}
export async function submitOfficeActionResponse(id: string): Promise<PatentRecord> {
  return unwrap<PatentRecord>(await submitOfficeActionResponseFn({ data: id }));
}
export async function payRenewalFee(id: string): Promise<PatentRecord> {
  return unwrap<PatentRecord>(await payRenewalFeeFn({ data: id }));
}
export async function submitForReview(id: string): Promise<PatentRecord> {
  return unwrap<PatentRecord>(await submitPatentFn({ data: id }));
}
export async function review(args: {
  id: string;
  decision: PatentApprovalDecision;
  comments?: string;
}): Promise<PatentRecord> {
  return unwrap<PatentRecord>(await reviewPatentFn({ data: args }));
}
export async function refresh(id: string): Promise<PatentRecord> {
  return unwrap<PatentRecord>(await refreshPatentFn({ data: id }));
}
