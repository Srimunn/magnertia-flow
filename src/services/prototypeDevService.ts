import {
  completePrototypeStageFn,
  generatePrototypeReportFn,
  getApprovedPocsFn,
  getPrototypeFn,
  getPrototypeListFn,
  getPrototypeLookupsFn,
  reviewPrototypeFn,
  savePrototypeDraftFn,
  submitPrototypeFn,
} from "@/lib/prototypeDevFns.server";
import type {
  PrototypeApprovalDecision,
  PrototypeFormInput,
  PrototypeListRow,
  PrototypeLookups,
  PrototypeProjectRecord,
  PrototypeStage,
} from "./types";

// Live, MongoDB-backed Prototype Development service — the engineering-
// realization stage that turns an approved PoC into an Engineering Validation
// project. Same envelope-unwrapping pattern as the other innovation modules.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export interface ApprovedPoc {
  id: string;
  pocCode: string;
  pocTitle: string;
  objective: string;
  proposedSolution: string;
  overallPocScore: number;
  technologyReadinessLevel: string;
  linkedFeasibilityStudyId: string | null;
  linkedFeasibilityStudyCode: string | null;
  linkedResearchProjectId: string | null;
  linkedResearchProjectCode: string | null;
  businessUnit: string;
  department: string;
  projectManager: string;
}

export async function fetchLookups(): Promise<PrototypeLookups> {
  return unwrap<PrototypeLookups>(await getPrototypeLookupsFn());
}

export async function fetchList(): Promise<PrototypeListRow[]> {
  return unwrap<PrototypeListRow[]>(await getPrototypeListFn());
}

export async function fetchRecord(id: string): Promise<PrototypeProjectRecord> {
  return unwrap<PrototypeProjectRecord>(await getPrototypeFn({ data: id }));
}

export async function fetchApprovedPocs(): Promise<ApprovedPoc[]> {
  return unwrap<ApprovedPoc[]>(await getApprovedPocsFn());
}

export async function saveDraft(
  input: PrototypeFormInput,
  id?: string,
): Promise<PrototypeProjectRecord> {
  return unwrap<PrototypeProjectRecord>(await savePrototypeDraftFn({ data: { id, input } }));
}

export async function completeStage(
  id: string,
  stage: PrototypeStage,
): Promise<PrototypeProjectRecord> {
  return unwrap<PrototypeProjectRecord>(await completePrototypeStageFn({ data: { id, stage } }));
}

export async function submitForReview(id: string): Promise<PrototypeProjectRecord> {
  return unwrap<PrototypeProjectRecord>(await submitPrototypeFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: PrototypeApprovalDecision;
  nextAction?: string;
  comments?: string;
  conditions?: string;
}): Promise<PrototypeProjectRecord> {
  return unwrap<PrototypeProjectRecord>(await reviewPrototypeFn({ data: args }));
}

export async function generateReport(id: string): Promise<PrototypeProjectRecord> {
  return unwrap<PrototypeProjectRecord>(await generatePrototypeReportFn({ data: id }));
}
