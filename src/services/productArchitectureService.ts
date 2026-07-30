import {
  advanceProductArchitectureStageFn,
  getProductArchitectureFn,
  reviewProductArchitectureFn,
  saveProductArchitectureDraftFn,
  submitProductArchitectureFn,
} from "@/lib/productArchitectureFns.server";
import type {
  ProductArchitectureApprovalDecision,
  ProductArchitectureFormInput,
  ProductArchitectureRecord,
  ProductArchitectureStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ProductArchitectureRecord> {
  return unwrap<ProductArchitectureRecord>(await getProductArchitectureFn());
}

export async function saveDraft(
  input: ProductArchitectureFormInput,
  id?: string
): Promise<ProductArchitectureRecord> {
  return unwrap<ProductArchitectureRecord>(
    await saveProductArchitectureDraftFn({ data: { id, input } })
  );
}

export async function advanceStage(
  id: string,
  targetStage: ProductArchitectureStage
): Promise<ProductArchitectureRecord> {
  return unwrap<ProductArchitectureRecord>(
    await advanceProductArchitectureStageFn({ data: { id, targetStage } })
  );
}

export async function submitForReview(id?: string): Promise<ProductArchitectureRecord> {
  return unwrap<ProductArchitectureRecord>(
    await submitProductArchitectureFn({ data: id })
  );
}

export async function reviewDecision(args: {
  id: string;
  decision: ProductArchitectureApprovalDecision;
  comments?: string;
}): Promise<ProductArchitectureRecord> {
  return unwrap<ProductArchitectureRecord>(
    await reviewProductArchitectureFn({ data: args })
  );
}

export const productArchitectureService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
};
