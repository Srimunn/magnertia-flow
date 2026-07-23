import {
  getOpportunityLookupsFn,
  getOpportunitiesFn,
  getOpportunityFn,
  getLinkableIdeasFn,
  saveOpportunityDraftFn,
  submitOpportunityFn,
  reviewOpportunityFn,
} from "@/lib/opportunityDiscoveryFns.server";
import type {
  OpportunityDecision,
  OpportunityFormInput,
  OpportunityListRow,
  OpportunityLookups,
  OpportunityPriority,
  DiscoveryOpportunityRecord,
  OpportunityReviewStage,
} from "./types";

// Live, MongoDB-backed Opportunity Discovery service. Same envelope-unwrapping
// pattern as General Ledger / Idea Management.

export type LinkableIdea = {
  id: string;
  ideaCode: string;
  title: string;
  category: string;
  department: string;
  businessUnit: string;
  productLine: string;
  shortDescription: string;
  status: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchLookups(): Promise<OpportunityLookups> {
  return unwrap<OpportunityLookups>(await getOpportunityLookupsFn());
}

export async function fetchOpportunities(): Promise<OpportunityListRow[]> {
  return unwrap<OpportunityListRow[]>(await getOpportunitiesFn());
}

export async function fetchOpportunity(id: string): Promise<DiscoveryOpportunityRecord> {
  return unwrap<DiscoveryOpportunityRecord>(await getOpportunityFn({ data: id }));
}

export async function fetchLinkableIdeas(): Promise<LinkableIdea[]> {
  return unwrap<LinkableIdea[]>(await getLinkableIdeasFn());
}

export async function saveOpportunityDraft(
  input: OpportunityFormInput,
  id?: string,
): Promise<DiscoveryOpportunityRecord> {
  return unwrap<DiscoveryOpportunityRecord>(await saveOpportunityDraftFn({ data: { id, input } }));
}

export async function submitOpportunity(id: string): Promise<DiscoveryOpportunityRecord> {
  return unwrap<DiscoveryOpportunityRecord>(await submitOpportunityFn({ data: id }));
}

export async function reviewOpportunity(args: {
  id: string;
  stage: OpportunityReviewStage;
  decision: OpportunityDecision;
  comments?: string;
  priority?: OpportunityPriority;
}): Promise<DiscoveryOpportunityRecord> {
  return unwrap<DiscoveryOpportunityRecord>(await reviewOpportunityFn({ data: args }));
}
