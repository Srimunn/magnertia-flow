import {
  advanceProductRoadmapStageFn,
  getProductRoadmapFn,
  reviewProductRoadmapFn,
  saveProductRoadmapDraftFn,
  submitProductRoadmapFn,
} from "@/lib/productRoadmapFns.server";
import type {
  ProductRoadmapApprovalDecision,
  ProductRoadmapFormInput,
  ProductRoadmapRecord,
  ProductRoadmapStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ProductRoadmapRecord> {
  return unwrap<ProductRoadmapRecord>(await getProductRoadmapFn());
}

export async function saveDraft(input: ProductRoadmapFormInput, id?: string): Promise<ProductRoadmapRecord> {
  return unwrap<ProductRoadmapRecord>(await saveProductRoadmapDraftFn({ data: { id, input } }));
}

export async function advanceStage(id: string, targetStage: ProductRoadmapStage): Promise<ProductRoadmapRecord> {
  return unwrap<ProductRoadmapRecord>(await advanceProductRoadmapStageFn({ data: { id, targetStage } }));
}

export async function submitForReview(id: string): Promise<ProductRoadmapRecord> {
  return unwrap<ProductRoadmapRecord>(await submitProductRoadmapFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: ProductRoadmapApprovalDecision;
  comments?: string;
}): Promise<ProductRoadmapRecord> {
  return unwrap<ProductRoadmapRecord>(await reviewProductRoadmapFn({ data: args }));
}

export const productRoadmapService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
