import {
  MOCK_PILOT_RECORD_78,
  getPilotProductionRecordFn,
  listPilotProductionRecordsFn,
  savePilotProductionDraftFn,
} from "@/lib/pilotProductionFns.server";
import type { PilotProductionRecord, ApprovalDecision } from "@/lib/pilot-production/types";
import { handleWorkflowTransition } from "@/lib/pilot-production/workflow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchPilotProductionRecord(id?: string): Promise<PilotProductionRecord> {
  try {
    const res = await getPilotProductionRecordFn({ data: { id } });
    return unwrap<PilotProductionRecord>(res);
  } catch (err) {
    console.warn("pilotProductionService fetchRecord fallback:", err);
    return MOCK_PILOT_RECORD_78;
  }
}

export async function listPilotProductionRecords(): Promise<PilotProductionRecord[]> {
  try {
    const res = await listPilotProductionRecordsFn();
    return unwrap<PilotProductionRecord[]>(res);
  } catch (err) {
    return [MOCK_PILOT_RECORD_78];
  }
}

export async function savePilotProductionRecord(
  record: PilotProductionRecord
): Promise<PilotProductionRecord> {
  const res = await savePilotProductionDraftFn({ data: { record } });
  return unwrap<PilotProductionRecord>(res);
}

export async function applyWorkflowDecision(
  record: PilotProductionRecord,
  decision: ApprovalDecision,
  comments: string,
  actor = "Rahul Sharma"
): Promise<{ record: PilotProductionRecord; newChildRecord?: PilotProductionRecord; message: string }> {
  const result = handleWorkflowTransition(record, decision, comments, actor);
  await savePilotProductionRecord(result.record);
  if (result.newChildRecord) {
    await savePilotProductionRecord(result.newChildRecord);
  }
  return result;
}

export const pilotProductionService = {
  fetchRecord: fetchPilotProductionRecord,
  listRecords: listPilotProductionRecords,
  saveRecord: savePilotProductionRecord,
  applyDecision: applyWorkflowDecision,
};
