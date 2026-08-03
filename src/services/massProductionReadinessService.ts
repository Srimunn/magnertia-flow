import {
  MOCK_READINESS_RECORD_56,
  getMassProductionReadinessFn,
  listMassProductionReadinessFn,
  saveMassProductionReadinessFn,
} from "@/lib/massProductionReadinessFns.server";
import type {
  MassProductionReadiness,
  ReadinessApprovalDecision,
} from "@/lib/mass-production-readiness/types";
import {
  handleWorkflowTransition,
  fireSopReleaseAction,
  checkSubmissionGates,
} from "@/lib/mass-production-readiness/workflow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchMassProductionReadiness(id?: string): Promise<MassProductionReadiness> {
  try {
    const res = await getMassProductionReadinessFn({ data: { id } });
    return unwrap<MassProductionReadiness>(res);
  } catch (err) {
    console.warn("massProductionReadinessService fetchRecord fallback:", err);
    return MOCK_READINESS_RECORD_56;
  }
}

export async function listMassProductionReadinessRecords(): Promise<MassProductionReadiness[]> {
  try {
    const res = await listMassProductionReadinessFn();
    return unwrap<MassProductionReadiness[]>(res);
  } catch (err) {
    return [MOCK_READINESS_RECORD_56];
  }
}

export async function saveMassProductionReadiness(
  record: MassProductionReadiness
): Promise<MassProductionReadiness> {
  const res = await saveMassProductionReadinessFn({ data: { record } });
  return unwrap<MassProductionReadiness>(res);
}

export async function applyExecutiveDecision(
  record: MassProductionReadiness,
  decision: ReadinessApprovalDecision,
  comments: string,
  actor = "Rahul Sharma"
): Promise<{ record: MassProductionReadiness; message: string }> {
  const result = handleWorkflowTransition(record, decision, comments, actor);
  await saveMassProductionReadiness(result.record);
  return result;
}

export async function executeSopAction(
  record: MassProductionReadiness,
  actionKey: "releaseProductionOrders" | "authorizeSupplierDeliveries" | "releaseProductionMaterials" | "releaseSop",
  actor = "Rahul Sharma"
): Promise<MassProductionReadiness> {
  const updated = fireSopReleaseAction(record, actionKey, actor);
  await saveMassProductionReadiness(updated);
  return updated;
}

export const massProductionReadinessService = {
  fetchRecord: fetchMassProductionReadiness,
  listRecords: listMassProductionReadinessRecords,
  saveRecord: saveMassProductionReadiness,
  applyDecision: applyExecutiveDecision,
  fireSopAction: executeSopAction,
  checkGates: checkSubmissionGates,
};
