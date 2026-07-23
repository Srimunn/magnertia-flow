import {
  completeExperimentStageFn,
  generateExperimentReportFn,
  getApprovedPrototypesFn,
  getExperimentFn,
  getExperimentListFn,
  getExperimentLookupsFn,
  reviewExperimentFn,
  saveExperimentDraftFn,
  submitExperimentFn,
} from "@/lib/experimentMgmtFns.server";
import type {
  ExperimentApprovalDecision,
  ExperimentFormInput,
  ExperimentListRow,
  ExperimentLookups,
  ExperimentProjectRecord,
  ExperimentStage,
} from "./types";

// Live, MongoDB-backed Experiment Management service — the evidence-generation
// stage that turns an approved Prototype into an Engineering Validation
// project. Same envelope-unwrapping pattern as the other innovation modules.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export interface ApprovedPrototype {
  id: string;
  prototypeCode: string;
  prototypeName: string;
  designObjective: string;
  successCriteria: string;
  linkedPocId: string | null;
  linkedPocCode: string | null;
  linkedResearchProjectId: string | null;
  linkedResearchProjectCode: string | null;
  prototypeOwner: string;
}

export async function fetchLookups(): Promise<ExperimentLookups> {
  return unwrap<ExperimentLookups>(await getExperimentLookupsFn());
}

export async function fetchList(): Promise<ExperimentListRow[]> {
  return unwrap<ExperimentListRow[]>(await getExperimentListFn());
}

export async function fetchRecord(id: string): Promise<ExperimentProjectRecord> {
  return unwrap<ExperimentProjectRecord>(await getExperimentFn({ data: id }));
}

export async function fetchApprovedPrototypes(): Promise<ApprovedPrototype[]> {
  return unwrap<ApprovedPrototype[]>(await getApprovedPrototypesFn());
}

export async function saveDraft(
  input: ExperimentFormInput,
  id?: string,
): Promise<ExperimentProjectRecord> {
  return unwrap<ExperimentProjectRecord>(await saveExperimentDraftFn({ data: { id, input } }));
}

export async function completeStage(
  id: string,
  stage: ExperimentStage,
): Promise<ExperimentProjectRecord> {
  return unwrap<ExperimentProjectRecord>(await completeExperimentStageFn({ data: { id, stage } }));
}

export async function submitForReview(id: string): Promise<ExperimentProjectRecord> {
  return unwrap<ExperimentProjectRecord>(await submitExperimentFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: ExperimentApprovalDecision;
  nextAction?: string;
  comments?: string;
  conditions?: string;
}): Promise<ExperimentProjectRecord> {
  return unwrap<ExperimentProjectRecord>(await reviewExperimentFn({ data: args }));
}

export async function generateReport(id: string): Promise<ExperimentProjectRecord> {
  return unwrap<ExperimentProjectRecord>(await generateExperimentReportFn({ data: id }));
}
