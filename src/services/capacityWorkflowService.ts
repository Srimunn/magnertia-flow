import type { CapacityApprovalDecision } from "./types";

export async function advanceCapacityWorkflowStage(planningId: string, currentStage: number) {
  return { nextStage: currentStage + 1, stageLabel: "Approval & Sign-off" };
}

export async function processApprovalStep(
  planningId: string,
  role: string,
  decision: CapacityApprovalDecision,
  comments: string
) {
  return { role, decision, date: new Date().toLocaleDateString(), comments };
}

export const capacityWorkflowService = {
  advanceCapacityWorkflowStage,
  processApprovalStep,
};
