import type {
  LeanManufacturing,
  LeanApprovalDecision,
  ActionPlanRow,
} from "./types";

export interface SubmissionGateResult {
  canSubmit: boolean;
  failingGates: string[];
}

/**
 * Checks submission gates before record can move to Under Review
 */
export function checkSubmissionGates(record: LeanManufacturing): SubmissionGateResult {
  const failingGates: string[] = [];

  const checkedWastesCount = Object.values(record.wastes).filter((w) => w.checked).length;
  if (checkedWastesCount < 3) {
    failingGates.push("At least 3 wastes must be identified in Section 2 (current: " + checkedWastesCount + ")");
  }

  const activeActionItemsCount = record.actionPlan.filter(
    (a) => a.status === "Completed" || a.status === "In Progress"
  ).length;
  if (activeActionItemsCount < 3) {
    failingGates.push("At least 3 Action Plan activities must be 'In Progress' or 'Completed' (current: " + activeActionItemsCount + ")");
  }

  const hasOeeAndFpy = record.performanceMetrics.some((m) => m.metric.includes("OEE")) &&
    record.performanceMetrics.some((m) => m.metric.includes("FPY"));
  if (!hasOeeAndFpy) {
    failingGates.push("Section 5 Before/After performance table must include OEE and FPY metrics");
  }

  if (record.expectedCostSaving <= 0) {
    failingGates.push("Expected Cost Saving must be greater than ₹0");
  }

  return {
    canSubmit: failingGates.length === 0,
    failingGates,
  };
}

export interface WorkflowTransitionResult {
  record: LeanManufacturing;
  message: string;
}

/**
 * Handles Lean Manufacturing workflow transitions and decision side-effects
 */
export function handleWorkflowTransition(
  currentRecord: LeanManufacturing,
  decision: LeanApprovalDecision,
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

  const updatedRecord: LeanManufacturing = {
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
    action: `Executive Decision: ${decision}`,
    description: comments || `Approval decision updated to ${decision}`,
    stage: "Review & Approval",
  };

  updatedRecord.auditTrail = [newAudit, ...(updatedRecord.auditTrail || [])];

  if (decision === "Approved") {
    updatedRecord.workflowStatus = "Approved — Continuous Improvement Active";
    updatedRecord.continuousImprovementActive = true;
    return {
      record: updatedRecord,
      message: "Approved! Workflow status updated to Continuous Improvement Active. Standard Work Release Panel unlocked.",
    };
  }

  if (decision === "Approved with Conditions") {
    updatedRecord.workflowStatus = "Minor Improvements Required";
    const curVer = parseFloat(updatedRecord.version) || 1.0;
    updatedRecord.version = (curVer + 0.1).toFixed(1);
    return {
      record: updatedRecord,
      message: "Approved with Conditions. Record reopened in editable state (v" + updatedRecord.version + ").",
    };
  }

  if (decision === "Revision Required") {
    if (!comments || comments.trim() === "") {
      throw new Error("Executive Comments are mandatory when specifying 'Revision Required'.");
    }

    updatedRecord.workflowStatus = "Revision Required";
    const curVer = parseFloat(updatedRecord.version) || 1.0;
    updatedRecord.version = (curVer + 0.1).toFixed(1);

    // Auto-inject a new Kaizen Action Plan row with status "Required — Revision"
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const revisionRow: ActionPlanRow = {
      id: `act-rev-${Date.now()}`,
      activity: `Additional Kaizen — ${comments.substring(0, 45)}...`,
      leanTool: "Kaizen",
      owner: currentRecord.processOwner,
      status: "Required — Revision",
      dueDate: dueDateStr,
      isRevisionRequired: true,
    };

    updatedRecord.actionPlan = [revisionRow, ...updatedRecord.actionPlan];
    updatedRecord.totalActivities = updatedRecord.actionPlan.length;

    return {
      record: updatedRecord,
      message: "Revision Required. Injected required Kaizen action item into Action Plan table (v" + updatedRecord.version + ").",
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
    message: "Workflow state updated.",
  };
}

/**
 * Handles Standard Work Release Panel side-effect button actions
 */
export function fireStandardWorkReleaseAction(
  record: LeanManufacturing,
  actionKey: "releaseStandardWork" | "deployNewStandards" | "initiateContinuousImprovement",
  actor: string
): LeanManufacturing {
  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedActions = {
    ...record.standardWorkReleaseActions,
    [actionKey]: { firedAt: timestamp, firedBy: actor },
  };

  const actionLabels = {
    releaseStandardWork: "Released Standard Work",
    deployNewStandards: "Deployed New Manufacturing Standards",
    initiateContinuousImprovement: "Initiated Continuous Improvement Tracking",
  };

  const newAudit = {
    id: `log-sw-${Date.now()}`,
    timestamp,
    user: actor,
    action: `Standard Work Action: ${actionLabels[actionKey]}`,
    description: `Fired ${actionLabels[actionKey]} side-effect`,
    stage: "Standard Work Release Panel",
  };

  return {
    ...record,
    standardWorkReleaseActions: updatedActions,
    lastUpdated: timestamp,
    lastModifiedBy: actor,
    auditTrail: [newAudit, ...(record.auditTrail || [])],
  };
}
