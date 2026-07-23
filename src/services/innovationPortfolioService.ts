import {
  getPortfolioLookupsFn,
  getPortfolioListFn,
  getPortfolioFn,
  savePortfolioDraftFn,
  refreshPortfolioFn,
  submitPortfolioFn,
  reviewPortfolioFn,
  resolveBudgetReviewFn,
} from "@/lib/innovationPortfolioFns.server";
import type {
  ExecutiveDecision,
  FundingDecision,
  InnovationPortfolioRecord,
  PortfolioFormInput,
  PortfolioListRow,
  PortfolioLookups,
} from "./types";

// Live, MongoDB-backed Innovation Portfolio service — the executive rollup
// layer over Idea Management / Opportunity Discovery / Design Thinking /
// Problem Validation. Same envelope-unwrapping pattern as the other modules.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchLookups(): Promise<PortfolioLookups> {
  return unwrap<PortfolioLookups>(await getPortfolioLookupsFn());
}

export async function fetchList(): Promise<PortfolioListRow[]> {
  return unwrap<PortfolioListRow[]>(await getPortfolioListFn());
}

export async function fetchPortfolio(id: string): Promise<InnovationPortfolioRecord> {
  return unwrap<InnovationPortfolioRecord>(await getPortfolioFn({ data: id }));
}

export async function saveDraft(
  input: PortfolioFormInput,
  id?: string,
): Promise<InnovationPortfolioRecord> {
  return unwrap<InnovationPortfolioRecord>(await savePortfolioDraftFn({ data: { id, input } }));
}

export async function refresh(id: string): Promise<InnovationPortfolioRecord> {
  return unwrap<InnovationPortfolioRecord>(await refreshPortfolioFn({ data: id }));
}

export async function submitForReview(id: string): Promise<InnovationPortfolioRecord> {
  return unwrap<InnovationPortfolioRecord>(await submitPortfolioFn({ data: id }));
}

export async function review(args: {
  id: string;
  decision: ExecutiveDecision;
  fundingDecision?: FundingDecision;
  priority?: string;
  comments?: string;
}): Promise<InnovationPortfolioRecord> {
  return unwrap<InnovationPortfolioRecord>(await reviewPortfolioFn({ data: args }));
}

export async function resolveBudgetReview(
  id: string,
  fundingDecision: FundingDecision,
): Promise<InnovationPortfolioRecord> {
  return unwrap<InnovationPortfolioRecord>(
    await resolveBudgetReviewFn({ data: { id, fundingDecision } }),
  );
}
