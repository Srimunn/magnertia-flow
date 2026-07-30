import {
  completeCIStageFn,
  generateCIReportFn,
  getCICyclesForProductFn,
  getCIFn,
  getCIListFn,
  getCILookupsFn,
  getCIProductsFn,
  reviewCIFn,
  saveCIDraftFn,
  submitCIFn,
  toggleCIMilestoneFn,
} from "@/lib/continuousInnovationFns.server";
import type {
  CIApprovalDecision,
  CIFormInput,
  CIListRow,
  CILookups,
  CIProductGlance,
  CIStage,
  ContinuousInnovationRecord,
} from "./types";

// Live, MongoDB-backed Continuous Innovation service — the closed-loop,
// period-scoped CYCLE engine: a product accumulates many cycles, and approval
// spawns the next release + roadmap update. Same envelope-unwrapping pattern.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export interface CIProductCycle {
  id: string;
  cycleId: string;
  cycleNumber: number;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  status: string;
  overallInnovationScore: number;
}

export async function fetchLookups(): Promise<CILookups> {
  return unwrap<CILookups>(await getCILookupsFn());
}
export async function fetchList(): Promise<CIListRow[]> {
  return unwrap<CIListRow[]>(await getCIListFn());
}
export async function fetchRecord(id: string): Promise<ContinuousInnovationRecord> {
  return unwrap<ContinuousInnovationRecord>(await getCIFn({ data: id }));
}
export async function fetchProducts(): Promise<CIProductGlance[]> {
  return unwrap<CIProductGlance[]>(await getCIProductsFn());
}
export async function fetchCyclesForProduct(productId: string): Promise<CIProductCycle[]> {
  return unwrap<CIProductCycle[]>(await getCICyclesForProductFn({ data: productId }));
}
export async function saveDraft(input: CIFormInput, id?: string): Promise<ContinuousInnovationRecord> {
  return unwrap<ContinuousInnovationRecord>(await saveCIDraftFn({ data: { id, input } }));
}
export async function completeStage(id: string, stage: CIStage): Promise<ContinuousInnovationRecord> {
  return unwrap<ContinuousInnovationRecord>(await completeCIStageFn({ data: { id, stage } }));
}
export async function toggleMilestone(id: string, milestoneId: string): Promise<ContinuousInnovationRecord> {
  return unwrap<ContinuousInnovationRecord>(await toggleCIMilestoneFn({ data: { id, milestoneId } }));
}
export async function submitForReview(id: string): Promise<ContinuousInnovationRecord> {
  return unwrap<ContinuousInnovationRecord>(await submitCIFn({ data: id }));
}
export async function review(args: {
  id: string;
  decision: CIApprovalDecision;
  comments?: string;
}): Promise<ContinuousInnovationRecord> {
  return unwrap<ContinuousInnovationRecord>(await reviewCIFn({ data: args }));
}
export async function generateReport(id: string): Promise<ContinuousInnovationRecord> {
  return unwrap<ContinuousInnovationRecord>(await generateCIReportFn({ data: id }));
}
