import {
  completeResearchStageFn,
  generateResearchReportFn,
  getResearchFn,
  getResearchListFn,
  getResearchLookupsFn,
  getResearchSourcesFn,
  reviewResearchFn,
  saveResearchDraftFn,
  submitResearchFn,
} from "@/lib/researchManagementFns.server";
import type {
  ResearchApprovalDecision,
  ResearchFormInput,
  ResearchListRow,
  ResearchLookups,
  ResearchManagementRecord,
  ResearchStage,
} from "./types";

// Live, MongoDB-backed Research Management service — the R&D execution engine
// that turns approved opportunities / scouted technologies into structured
// research programs and channels approved outcomes into Feasibility Studies.
// Same envelope-unwrapping pattern as the other innovation modules.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export interface ResearchSources {
  opportunities: {
    id: string;
    opportunityCode: string;
    name: string;
    category: string;
    description: string;
    technologyDomain: string;
    marketSize: number;
  }[];
  technologies: {
    id: string;
    scoutingId: string;
    technologyName: string;
    technologyDomain: string;
    trl: string;
    marketSize: number;
    marketTrend: string;
  }[];
  portfolios: {
    id: string;
    portfolioCode: string;
    portfolioName: string;
    strategicTheme: string;
  }[];
}

export async function fetchLookups(): Promise<ResearchLookups> {
  return unwrap<ResearchLookups>(await getResearchLookupsFn());
}

export async function fetchList(): Promise<ResearchListRow[]> {
  return unwrap<ResearchListRow[]>(await getResearchListFn());
}

export async function fetchRecord(id: string): Promise<ResearchManagementRecord> {
  return unwrap<ResearchManagementRecord>(await getResearchFn({ data: id }));
}

export async function fetchSources(): Promise<ResearchSources> {
  return unwrap<ResearchSources>(await getResearchSourcesFn());
}

export async function saveDraft(
  input: ResearchFormInput,
  id?: string,
): Promise<ResearchManagementRecord> {
  return unwrap<ResearchManagementRecord>(await saveResearchDraftFn({ data: { id, input } }));
}

export async function completeStage(
  id: string,
  stage: ResearchStage,
): Promise<ResearchManagementRecord> {
  return unwrap<ResearchManagementRecord>(await completeResearchStageFn({ data: { id, stage } }));
}

export async function submitForReview(id: string): Promise<ResearchManagementRecord> {
  return unwrap<ResearchManagementRecord>(await submitResearchFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: ResearchApprovalDecision;
  nextAction?: string;
  comments?: string;
  conditions?: string;
}): Promise<ResearchManagementRecord> {
  return unwrap<ResearchManagementRecord>(await reviewResearchFn({ data: args }));
}

export async function generateReport(id: string): Promise<ResearchManagementRecord> {
  return unwrap<ResearchManagementRecord>(await generateResearchReportFn({ data: id }));
}
