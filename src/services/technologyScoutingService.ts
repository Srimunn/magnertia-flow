import {
  closeTechScoutingFn,
  completeTechScoutingStageFn,
  getScoutingSourceOpportunitiesFn,
  getTechScoutingFn,
  getTechScoutingListFn,
  getTechScoutingLookupsFn,
  monitorTechScoutingFn,
  reviewTechScoutingFn,
  saveTechScoutingDraftFn,
  submitTechScoutingFn,
} from "@/lib/technologyScoutingFns.server";
import type {
  TechnologyScoutingRecord,
  TechScoutingApprovalDecision,
  TechScoutingFormInput,
  TechScoutingListRow,
  TechScoutingLookups,
  TechScoutingStage,
} from "./types";

// Live, MongoDB-backed Technology Scouting service — the technology
// intelligence hub between Opportunity Discovery and the Innovation
// Portfolio / Feasibility Study stages. Same envelope-unwrapping pattern
// as the other innovation modules.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export interface ScoutingSourceOpportunity {
  id: string;
  opportunityCode: string;
  name: string;
  category: string;
  description: string;
  technologyDomain: string;
  emergingTechnology: string;
  industry: string;
  targetMarket: string;
  marketSize: number;
  growthRate: number;
}

export async function fetchLookups(): Promise<TechScoutingLookups> {
  return unwrap<TechScoutingLookups>(await getTechScoutingLookupsFn());
}

export async function fetchList(): Promise<TechScoutingListRow[]> {
  return unwrap<TechScoutingListRow[]>(await getTechScoutingListFn());
}

export async function fetchRecord(id: string): Promise<TechnologyScoutingRecord> {
  return unwrap<TechnologyScoutingRecord>(await getTechScoutingFn({ data: id }));
}

export async function fetchSourceOpportunities(): Promise<ScoutingSourceOpportunity[]> {
  return unwrap<ScoutingSourceOpportunity[]>(await getScoutingSourceOpportunitiesFn());
}

export async function saveDraft(
  input: TechScoutingFormInput,
  id?: string,
): Promise<TechnologyScoutingRecord> {
  return unwrap<TechnologyScoutingRecord>(await saveTechScoutingDraftFn({ data: { id, input } }));
}

export async function completeStage(
  id: string,
  stage: TechScoutingStage,
): Promise<TechnologyScoutingRecord> {
  return unwrap<TechnologyScoutingRecord>(
    await completeTechScoutingStageFn({ data: { id, stage } }),
  );
}

export async function submitForReview(id: string): Promise<TechnologyScoutingRecord> {
  return unwrap<TechnologyScoutingRecord>(await submitTechScoutingFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: TechScoutingApprovalDecision;
  nextAction?: string;
  comments?: string;
}): Promise<TechnologyScoutingRecord> {
  return unwrap<TechnologyScoutingRecord>(await reviewTechScoutingFn({ data: args }));
}

export async function runMonitoringScan(id: string): Promise<TechnologyScoutingRecord> {
  return unwrap<TechnologyScoutingRecord>(await monitorTechScoutingFn({ data: id }));
}

export async function closeRecord(id: string): Promise<TechnologyScoutingRecord> {
  return unwrap<TechnologyScoutingRecord>(await closeTechScoutingFn({ data: id }));
}
