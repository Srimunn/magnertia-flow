import {
  MOCK_AUTOMATION_RECORD_45,
  getAutomationDevelopmentFn,
  listAutomationDevelopmentFn,
  saveAutomationDevelopmentFn,
} from "@/lib/automationDevelopmentFns.server";
import type {
  AutomationDevelopment,
  AutomationApprovalDecision,
} from "@/lib/automation-development/types";
import {
  handleWorkflowTransition,
  fireDeploymentReleaseAction,
  checkSubmissionGates,
} from "@/lib/automation-development/workflow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchAutomationDevelopment(id?: string): Promise<AutomationDevelopment> {
  try {
    const res = await getAutomationDevelopmentFn({ data: { id } });
    return unwrap<AutomationDevelopment>(res);
  } catch (err) {
    console.warn("automationDevelopmentService fetchRecord fallback:", err);
    return MOCK_AUTOMATION_RECORD_45;
  }
}

export async function listAutomationDevelopmentRecords(): Promise<AutomationDevelopment[]> {
  try {
    const res = await listAutomationDevelopmentFn();
    return unwrap<AutomationDevelopment[]>(res);
  } catch (err) {
    return [MOCK_AUTOMATION_RECORD_45];
  }
}

export async function saveAutomationDevelopment(record: AutomationDevelopment): Promise<AutomationDevelopment> {
  const res = await saveAutomationDevelopmentFn({ data: { record } });
  return unwrap<AutomationDevelopment>(res);
}

export async function applyExecutiveDecision(
  record: AutomationDevelopment,
  decision: AutomationApprovalDecision,
  comments: string,
  actor = "Rahul Sharma"
): Promise<{ record: AutomationDevelopment; message: string }> {
  const result = handleWorkflowTransition(record, decision, comments, actor);
  await saveAutomationDevelopment(result.record);
  return result;
}

export async function executeDeploymentReleaseAction(
  record: AutomationDevelopment,
  actionKey:
    | "releaseAutomatedProduction"
    | "registerAutomationAssets"
    | "archiveAutomationDocumentation"
    | "markProductionDeploymentApproved",
  actor = "Rahul Sharma"
): Promise<AutomationDevelopment> {
  const updated = fireDeploymentReleaseAction(record, actionKey, actor);
  await saveAutomationDevelopment(updated);
  return updated;
}

export const automationDevelopmentService = {
  fetchRecord: fetchAutomationDevelopment,
  listRecords: listAutomationDevelopmentRecords,
  saveRecord: saveAutomationDevelopment,
  applyDecision: applyExecutiveDecision,
  fireDeploymentAction: executeDeploymentReleaseAction,
  checkGates: checkSubmissionGates,
};
