import {
  DEFAULT_PRODUCT_RELEASE_RECORD,
  advanceReleaseStageFn,
  getProductReleaseFn,
  reviewProductReleaseFn,
  saveProductReleaseDraftFn,
  submitProductReleaseFn,
  toggleChecklistItemFn,
} from "@/lib/productReleaseFns.server";
import type {
  ProductReleaseApprovalDecision,
  ProductReleaseFormInput,
  ProductReleaseRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ProductReleaseRecord> {
  try {
    const res = await getProductReleaseFn();
    return unwrap<ProductReleaseRecord>(res);
  } catch (err) {
    console.warn("productReleaseService fetchRecord fallback:", err);
    return DEFAULT_PRODUCT_RELEASE_RECORD;
  }
}

export async function saveDraft(
  input: Partial<ProductReleaseFormInput>,
  id?: string
): Promise<ProductReleaseRecord> {
  return unwrap<ProductReleaseRecord>(
    await saveProductReleaseDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<ProductReleaseRecord> {
  return unwrap<ProductReleaseRecord>(await submitProductReleaseFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: ProductReleaseApprovalDecision;
  comments?: string;
}): Promise<ProductReleaseRecord> {
  return unwrap<ProductReleaseRecord>(await reviewProductReleaseFn({ data: args }));
}

export async function advanceStage(targetStage: 1 | 2 | 3): Promise<ProductReleaseRecord> {
  return unwrap<ProductReleaseRecord>(await advanceReleaseStageFn({ data: { targetStage } }));
}

export async function toggleChecklistItem(section: "engineering" | "manufacturing" | "commercial", itemId: string): Promise<ProductReleaseRecord> {
  return unwrap<ProductReleaseRecord>(await toggleChecklistItemFn({ data: { section, itemId } }));
}

export const productReleaseService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  advanceStage,
  toggleChecklistItem,
};
