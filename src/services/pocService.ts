import {
  completePocStageFn,
  generatePocReportFn,
  getApprovedFeasibilityStudiesFn,
  getPocFn,
  getPocListFn,
  getPocLookupsFn,
  reviewPocFn,
  savePocDraftFn,
  submitPocFn,
} from "@/lib/pocFns.server";
import type {
  PocApprovalDecision,
  PocFormInput,
  PocListRow,
  PocLookups,
  PocProjectRecord,
  PocStage,
} from "./types";

// Live, MongoDB-backed Proof of Concept service — the technical-validation
// gateway that turns an approved Feasibility Study into a Prototype
// Development project. Same envelope-unwrapping pattern as the other modules.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export interface ApprovedFeasibilityStudy {
  id: string;
  feasibilityStudyCode: string;
  studyTitle: string;
  studyObjective: string;
  businessNeed: string;
  overallFeasibilityScore: number;
  linkedResearchProjectId: string | null;
  linkedResearchProjectCode: string | null;
  linkedTechnologyScoutingId: string | null;
  linkedTechnologyScoutingCode: string | null;
  businessUnit: string;
  department: string;
  projectManager: string;
  budgetRequired: number;
}

export async function fetchLookups(): Promise<PocLookups> {
  return unwrap<PocLookups>(await getPocLookupsFn());
}

export async function fetchList(): Promise<PocListRow[]> {
  return unwrap<PocListRow[]>(await getPocListFn());
}

export async function fetchRecord(id: string): Promise<PocProjectRecord> {
  return unwrap<PocProjectRecord>(await getPocFn({ data: id }));
}

export async function fetchApprovedFeasibilityStudies(): Promise<ApprovedFeasibilityStudy[]> {
  return unwrap<ApprovedFeasibilityStudy[]>(await getApprovedFeasibilityStudiesFn());
}

export async function saveDraft(input: PocFormInput, id?: string): Promise<PocProjectRecord> {
  return unwrap<PocProjectRecord>(await savePocDraftFn({ data: { id, input } }));
}

export async function completeStage(id: string, stage: PocStage): Promise<PocProjectRecord> {
  return unwrap<PocProjectRecord>(await completePocStageFn({ data: { id, stage } }));
}

export async function submitForReview(id: string): Promise<PocProjectRecord> {
  return unwrap<PocProjectRecord>(await submitPocFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: PocApprovalDecision;
  nextAction?: string;
  comments?: string;
  conditions?: string;
}): Promise<PocProjectRecord> {
  return unwrap<PocProjectRecord>(await reviewPocFn({ data: args }));
}

export async function generateReport(id: string): Promise<PocProjectRecord> {
  return unwrap<PocProjectRecord>(await generatePocReportFn({ data: id }));
}
