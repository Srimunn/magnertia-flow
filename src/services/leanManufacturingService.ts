import {
  MOCK_LEAN_RECORD_123,
  getLeanManufacturingFn,
  listLeanManufacturingFn,
  saveLeanManufacturingFn,
} from "@/lib/leanManufacturingFns.server";
import type { LeanManufacturing, LeanApprovalDecision } from "@/lib/lean-manufacturing/types";
import {
  handleWorkflowTransition,
  fireStandardWorkReleaseAction,
  checkSubmissionGates,
} from "@/lib/lean-manufacturing/workflow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchLeanManufacturing(id?: string): Promise<LeanManufacturing> {
  try {
    const res = await getLeanManufacturingFn({ data: { id } });
    return unwrap<LeanManufacturing>(res);
  } catch (err) {
    console.warn("leanManufacturingService fetchRecord fallback:", err);
    return MOCK_LEAN_RECORD_123;
  }
}

export async function listLeanManufacturingRecords(): Promise<LeanManufacturing[]> {
  try {
    const res = await listLeanManufacturingFn();
    return unwrap<LeanManufacturing[]>(res);
  } catch (err) {
    return [MOCK_LEAN_RECORD_123];
  }
}

export async function saveLeanManufacturing(record: LeanManufacturing): Promise<LeanManufacturing> {
  const res = await saveLeanManufacturingFn({ data: { record } });
  return unwrap<LeanManufacturing>(res);
}

export async function applyExecutiveDecision(
  record: LeanManufacturing,
  decision: LeanApprovalDecision,
  comments: string,
  actor = "Rahul Sharma"
): Promise<{ record: LeanManufacturing; message: string }> {
  const result = handleWorkflowTransition(record, decision, comments, actor);
  await saveLeanManufacturing(result.record);
  return result;
}

export async function executeStandardWorkAction(
  record: LeanManufacturing,
  actionKey: "releaseStandardWork" | "deployNewStandards" | "initiateContinuousImprovement",
  actor = "Rahul Sharma"
): Promise<LeanManufacturing> {
  const updated = fireStandardWorkReleaseAction(record, actionKey, actor);
  await saveLeanManufacturing(updated);
  return updated;
}

export const leanManufacturingService = {
  fetchRecord: fetchLeanManufacturing,
  listRecords: listLeanManufacturingRecords,
  saveRecord: saveLeanManufacturing,
  applyDecision: applyExecutiveDecision,
  fireStandardWorkAction: executeStandardWorkAction,
  checkGates: checkSubmissionGates,
};
