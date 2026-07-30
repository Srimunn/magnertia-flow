import {
  advanceProductStrategyStageFn,
  generateProductStrategyReportFn,
  getProductStrategyFn,
  reviewProductStrategyFn,
  saveProductStrategyDraftFn,
  submitProductStrategyFn,
} from "@/lib/productStrategyFns.server";
import type {
  ProductStrategyApprovalDecision,
  ProductStrategyFormInput,
  ProductStrategyRecord,
  ProductStrategyStage,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<ProductStrategyRecord> {
  return unwrap<ProductStrategyRecord>(await getProductStrategyFn());
}

export async function saveDraft(input: ProductStrategyFormInput, id?: string): Promise<ProductStrategyRecord> {
  return unwrap<ProductStrategyRecord>(await saveProductStrategyDraftFn({ data: { id, input } }));
}

export async function advanceStage(id: string, targetStage: ProductStrategyStage): Promise<ProductStrategyRecord> {
  return unwrap<ProductStrategyRecord>(await advanceProductStrategyStageFn({ data: { id, targetStage } }));
}

export async function submitForReview(id: string): Promise<ProductStrategyRecord> {
  return unwrap<ProductStrategyRecord>(await submitProductStrategyFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: ProductStrategyApprovalDecision;
  comments?: string;
}): Promise<ProductStrategyRecord> {
  return unwrap<ProductStrategyRecord>(await reviewProductStrategyFn({ data: args }));
}

export async function generateReport(id: string): Promise<ProductStrategyRecord> {
  return unwrap<ProductStrategyRecord>(await generateProductStrategyReportFn({ data: id }));
}

export const productStrategyService = {
  fetchRecord,
  saveDraft,
  advanceStage,
  submitForReview,
  reviewDecision,
  generateReport,
};
