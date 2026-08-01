import {
  DEFAULT_PRODUCTION_ENGINEERING_RECORD,
  getProductionEngineeringFn,
  reviewProductionEngineeringFn,
  saveProductionEngineeringDraftFn,
  submitProductionEngineeringFn,
} from "@/lib/productionEngineeringFns.server";
import type {
  ProductionEngineeringApprovalDecision,
  ProductionEngineeringFormInput,
  ProductionEngineeringRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ProductionEngineeringRecord> {
  try {
    const res = await getProductionEngineeringFn();
    return unwrap<ProductionEngineeringRecord>(res);
  } catch (err) {
    console.warn("productionEngineeringService fetchRecord fallback:", err);
    return DEFAULT_PRODUCTION_ENGINEERING_RECORD;
  }
}

export async function saveDraft(
  input: Partial<ProductionEngineeringFormInput>,
  id?: string
): Promise<ProductionEngineeringRecord> {
  return unwrap<ProductionEngineeringRecord>(
    await saveProductionEngineeringDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<ProductionEngineeringRecord> {
  return unwrap<ProductionEngineeringRecord>(await submitProductionEngineeringFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: ProductionEngineeringApprovalDecision;
  comments?: string;
}): Promise<ProductionEngineeringRecord> {
  return unwrap<ProductionEngineeringRecord>(await reviewProductionEngineeringFn({ data: args }));
}

export const productionEngineeringService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
