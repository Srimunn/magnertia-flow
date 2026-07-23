import {
  getDesignThinkingLookupsFn,
  getDesignThinkingListFn,
  getDesignThinkingFn,
  getApprovedOpportunitiesFn,
  saveDesignThinkingDraftFn,
  completeStageFn,
  generateAIInsightsFn,
  submitDesignThinkingFn,
  reviewDesignThinkingFn,
} from "@/lib/designThinkingFns.server";
import type {
  DesignThinkingFormInput,
  DesignThinkingListRow,
  DesignThinkingLookups,
  DesignThinkingRecord,
  DesignThinkingStage,
  DTOpportunityGlance,
} from "./types";

// Live, MongoDB-backed Design Thinking service. Same envelope-unwrapping
// pattern as Idea Management / Opportunity Discovery.

export type ApprovedOpportunityOption = {
  id: string;
  opportunityCode: string;
  name: string;
  category: string;
  strategicInitiative: string;
  businessUnit: string;
  department: string;
  marketPotential: string;
  overallOpportunityScore: number;
  ideaId: string | null;
  ideaCode: string | null;
  customerNeed: string;
  painPoints: string;
  targetCustomer: string;
};

/** Every mutation returns the record plus the resolved opportunity summary. */
export type DesignThinkingPayload = {
  record: DesignThinkingRecord;
  glance: DTOpportunityGlance | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchLookups(): Promise<DesignThinkingLookups> {
  return unwrap<DesignThinkingLookups>(await getDesignThinkingLookupsFn());
}

export async function fetchList(): Promise<DesignThinkingListRow[]> {
  return unwrap<DesignThinkingListRow[]>(await getDesignThinkingListFn());
}

export async function fetchProject(id: string): Promise<DesignThinkingPayload> {
  return unwrap<DesignThinkingPayload>(await getDesignThinkingFn({ data: id }));
}

export async function fetchApprovedOpportunities(): Promise<ApprovedOpportunityOption[]> {
  return unwrap<ApprovedOpportunityOption[]>(await getApprovedOpportunitiesFn());
}

export async function saveDraft(
  input: DesignThinkingFormInput,
  id?: string,
): Promise<DesignThinkingPayload> {
  return unwrap<DesignThinkingPayload>(await saveDesignThinkingDraftFn({ data: { id, input } }));
}

export async function completeStage(
  id: string,
  stage: DesignThinkingStage,
): Promise<DesignThinkingPayload> {
  return unwrap<DesignThinkingPayload>(await completeStageFn({ data: { id, stage } }));
}

export async function generateAIInsights(id: string): Promise<DesignThinkingPayload> {
  return unwrap<DesignThinkingPayload>(await generateAIInsightsFn({ data: id }));
}

export async function submitForReview(id: string): Promise<DesignThinkingPayload> {
  return unwrap<DesignThinkingPayload>(await submitDesignThinkingFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: "Approved" | "Revision Required" | "Rejected";
  comments?: string;
  returnToStage?: DesignThinkingStage;
}): Promise<DesignThinkingPayload> {
  return unwrap<DesignThinkingPayload>(await reviewDesignThinkingFn({ data: args }));
}
