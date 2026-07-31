import {
  DEFAULT_PRODUCT_DOCUMENTATION_RECORD,
  advanceStageFn,
  getProductDocumentationFn,
  reviewProductDocumentationFn,
  saveProductDocumentationDraftFn,
  submitProductDocumentationFn,
} from "@/lib/productDocumentationFns.server";
import type {
  ProductDocumentationApprovalDecision,
  ProductDocumentationFormInput,
  ProductDocumentationRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ProductDocumentationRecord> {
  try {
    const res = await getProductDocumentationFn();
    return unwrap<ProductDocumentationRecord>(res);
  } catch (err) {
    console.warn("productDocumentationService fetchRecord fallback:", err);
    return DEFAULT_PRODUCT_DOCUMENTATION_RECORD;
  }
}

export async function saveDraft(
  input: Partial<ProductDocumentationFormInput>,
  id?: string
): Promise<ProductDocumentationRecord> {
  return unwrap<ProductDocumentationRecord>(
    await saveProductDocumentationDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<ProductDocumentationRecord> {
  return unwrap<ProductDocumentationRecord>(await submitProductDocumentationFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: ProductDocumentationApprovalDecision;
  comments?: string;
}): Promise<ProductDocumentationRecord> {
  return unwrap<ProductDocumentationRecord>(await reviewProductDocumentationFn({ data: args }));
}

export async function advanceStage(targetStage: 1 | 2 | 3): Promise<ProductDocumentationRecord> {
  return unwrap<ProductDocumentationRecord>(await advanceStageFn({ data: { targetStage } }));
}

export const productDocumentationService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
  advanceStage,
};
