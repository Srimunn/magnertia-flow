import {
  MOCK_ROBOTICS_RECORD_35,
  getRoboticsIntegrationFn,
  listRoboticsIntegrationFn,
  saveRoboticsIntegrationFn,
} from "@/lib/roboticsIntegrationFns.server";
import type {
  RoboticsIntegration,
  RoboticsApprovalDecision,
} from "@/lib/robotics-integration/types";
import {
  handleWorkflowTransition,
  fireDeploymentReleaseAction,
  checkSubmissionGates,
} from "@/lib/robotics-integration/workflow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRoboticsIntegration(id?: string): Promise<RoboticsIntegration> {
  try {
    const res = await getRoboticsIntegrationFn({ data: { id } });
    return unwrap<RoboticsIntegration>(res);
  } catch (err) {
    console.warn("roboticsIntegrationService fetchRecord fallback:", err);
    return MOCK_ROBOTICS_RECORD_35;
  }
}

export async function listRoboticsIntegrationRecords(): Promise<RoboticsIntegration[]> {
  try {
    const res = await listRoboticsIntegrationFn();
    return unwrap<RoboticsIntegration[]>(res);
  } catch (err) {
    return [MOCK_ROBOTICS_RECORD_35];
  }
}

export async function saveRoboticsIntegration(record: RoboticsIntegration): Promise<RoboticsIntegration> {
  const res = await saveRoboticsIntegrationFn({ data: { record } });
  return unwrap<RoboticsIntegration>(res);
}

export async function applyExecutiveDecision(
  record: RoboticsIntegration,
  decision: RoboticsApprovalDecision,
  comments: string,
  actor = "Rahul Sharma"
): Promise<{ record: RoboticsIntegration; message: string }> {
  const result = handleWorkflowTransition(record, decision, comments, actor);
  await saveRoboticsIntegration(result.record);
  return result;
}

export async function executeDeploymentReleaseAction(
  record: RoboticsIntegration,
  actionKey:
    | "releaseRoboticProductionCell"
    | "registerRoboticAssets"
    | "archiveRobotPrograms"
    | "markProductionDeploymentApproved",
  actor = "Rahul Sharma"
): Promise<RoboticsIntegration> {
  const updated = fireDeploymentReleaseAction(record, actionKey, actor);
  await saveRoboticsIntegration(updated);
  return updated;
}

export const roboticsIntegrationService = {
  fetchRecord: fetchRoboticsIntegration,
  listRecords: listRoboticsIntegrationRecords,
  saveRecord: saveRoboticsIntegration,
  applyDecision: applyExecutiveDecision,
  fireDeploymentAction: executeDeploymentReleaseAction,
  checkGates: checkSubmissionGates,
};
