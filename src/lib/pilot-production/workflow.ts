import type { ApprovalDecision, PilotProductionRecord, PilotWorkflowStatus } from "./types";

export interface WorkflowTransitionResult {
  record: PilotProductionRecord;
  newChildRecord?: PilotProductionRecord;
  message: string;
}

/**
 * Handles workflow state machine transitions and decision side-effects
 */
export function handleWorkflowTransition(
  currentRecord: PilotProductionRecord,
  decision: ApprovalDecision,
  comments: string,
  actor: string
): WorkflowTransitionResult {
  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedRecord: PilotProductionRecord = {
    ...currentRecord,
    approvalDecision: decision,
    reviewComments: comments,
    approvalDate: timestamp,
    lastModifiedBy: actor,
    lastUpdated: timestamp,
  };

  const newAudit = {
    id: `log-${Date.now()}`,
    timestamp,
    user: actor,
    action: `Workflow Decision: ${decision}`,
    description: comments || `Approval decision set to ${decision}`,
    stage: "Review & Approval",
  };

  updatedRecord.auditTrail = [newAudit, ...(updatedRecord.auditTrail || [])];

  if (decision === "Approved") {
    updatedRecord.workflowStatus = "Ready for Mass Production";
    return {
      record: updatedRecord,
      message: "Approved! Workflow status updated to Ready for Mass Production. (Pending PPAP Management module)",
    };
  }

  if (decision === "Approved with Conditions") {
    updatedRecord.workflowStatus = "Minor Improvements Required";
    // Version increment
    const currentVersionNum = parseFloat(updatedRecord.version) || 1.0;
    updatedRecord.version = (currentVersionNum + 0.1).toFixed(1);
    return {
      record: updatedRecord,
      message: "Approved with Conditions. Record reopened in editable state for minor improvements (v" + updatedRecord.version + ").",
    };
  }

  if (decision === "Additional Pilot Required") {
    updatedRecord.workflowStatus = "Superseded — Repeat Scheduled";
    
    // Increment batch number e.g. PB-ENCL-AW-001 -> PB-ENCL-AW-002
    const currentBatchNum = updatedRecord.pilotBatchNumber;
    const match = currentBatchNum.match(/^(.*-)(\d+)$/);
    let nextBatchNum = `${currentBatchNum}-02`;
    if (match) {
      const prefix = match[1];
      const seq = parseInt(match[2], 10) + 1;
      nextBatchNum = `${prefix}${seq.toString().padStart(3, "0")}`;
    }

    const nextIdNum = Math.floor(10000 + Math.random() * 90000);
    const newChildRecord: PilotProductionRecord = {
      ...updatedRecord,
      id: `PILOT-2024-${nextIdNum}`,
      formCode: `PPFD-2024-${Math.floor(10 + Math.random() * 90)}`,
      pilotBatchTitle: `${updatedRecord.pilotBatchTitle} (Repeat Run)`,
      pilotBatchNumber: nextBatchNum,
      version: "1.0",
      workflowStatus: "Draft",
      parentPilotId: updatedRecord.id,
      createdDate: timestamp,
      lastUpdated: timestamp,
      createdBy: actor,
      approvalDecision: "Pending",
      reviewers: updatedRecord.reviewers.map((r) => ({ ...r, status: "Pending", comments: undefined })),
      auditTrail: [
        {
          id: `log-spawn-${Date.now()}`,
          timestamp,
          user: actor,
          action: "Repeat Pilot Spawned",
          description: `Created repeat pilot run automatically from parent ${updatedRecord.id}`,
        },
      ],
    };

    return {
      record: updatedRecord,
      newChildRecord,
      message: `Additional pilot required. Current record superseded and child record ${newChildRecord.id} generated.`,
    };
  }

  if (decision === "Rejected") {
    updatedRecord.workflowStatus = "Archived";
    return {
      record: updatedRecord,
      message: "Record rejected and archived.",
    };
  }

  return {
    record: updatedRecord,
    message: "Status updated.",
  };
}
