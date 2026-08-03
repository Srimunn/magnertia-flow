import type {
  MassProductionReadiness,
  ReadinessApprovalDecision,
  MassProductionWorkflowStatus,
} from "./types";

export interface SubmissionGateResult {
  canSubmit: boolean;
  failingGates: string[];
}

/**
 * Checks hard submission gates before record can move to Under Review
 */
export function checkSubmissionGates(record: MassProductionReadiness): SubmissionGateResult {
  const failingGates: string[] = [];

  if (record.ppapStatus !== "Customer Approved") {
    failingGates.push('PPAP Status must be "Customer Approved" (current: ' + record.ppapStatus + ')');
  }

  if (record.manufacturingReadinessScore < 80) {
    failingGates.push("Manufacturing Readiness Score must be ≥ 80 (current: " + record.manufacturingReadinessScore + ")");
  }

  if (record.qualityReadinessScore < 80) {
    failingGates.push("Quality Readiness Score must be ≥ 80 (current: " + record.qualityReadinessScore + ")");
  }

  if (record.supplyChainScore < 75) {
    failingGates.push("Supply Chain Score must be ≥ 75 (current: " + record.supplyChainScore + ")");
  }

  if (!record.pilotProductionRef) {
    failingGates.push("Pilot Production Reference is required");
  }

  return {
    canSubmit: failingGates.length === 0,
    failingGates,
  };
}

export interface WorkflowTransitionResult {
  record: MassProductionReadiness;
  message: string;
}

/**
 * Handles workflow transitions and decision side-effects
 */
export function handleWorkflowTransition(
  currentRecord: MassProductionReadiness,
  decision: ReadinessApprovalDecision,
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

  const updatedRecord: MassProductionReadiness = {
    ...currentRecord,
    approvalDecision: decision,
    executiveComments: comments,
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
    updatedRecord.workflowStatus = "Mass Production Authorized";
    return {
      record: updatedRecord,
      message: "Approved! Workflow status updated to Mass Production Authorized. SOP Release Panel unlocked.",
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

  if (decision === "Additional Validation Required") {
    // Reset to Stage 1 on SAME record with major version bump to 2.0
    updatedRecord.workflowStatus = "Revalidation Required";
    updatedRecord.version = "2.0";
    updatedRecord.approvalDecision = "Pending";
    updatedRecord.reviewers = updatedRecord.reviewers.map((r) => ({
      ...r,
      status: "Pending",
      comments: undefined,
    }));
    return {
      record: updatedRecord,
      message: "Additional validation required. Workflow reset to Stage 1 (v2.0) on the same record.",
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
 * Handles SOP Release Panel side-effect button actions
 */
export function fireSopReleaseAction(
  record: MassProductionReadiness,
  actionKey: "releaseProductionOrders" | "authorizeSupplierDeliveries" | "releaseProductionMaterials" | "releaseSop",
  actor: string
): MassProductionReadiness {
  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedActions = {
    ...record.sopActions,
    [actionKey]: { firedAt: timestamp, firedBy: actor },
  };

  const allFired =
    !!updatedActions.releaseProductionOrders &&
    !!updatedActions.authorizeSupplierDeliveries &&
    !!updatedActions.releaseProductionMaterials &&
    !!updatedActions.releaseSop;

  const actionLabels = {
    releaseProductionOrders: "Released Production Orders",
    authorizeSupplierDeliveries: "Authorized Supplier Deliveries",
    releaseProductionMaterials: "Released Production Materials",
    releaseSop: "Released Start of Production (SOP)",
  };

  const newAudit = {
    id: `log-sop-${Date.now()}`,
    timestamp,
    user: actor,
    action: `SOP Action: ${actionLabels[actionKey]}`,
    description: `Fired ${actionLabels[actionKey]} side-effect`,
    stage: "SOP Release Panel",
  };

  return {
    ...record,
    sopActions: updatedActions,
    sopReleasedAt: allFired ? timestamp : record.sopReleasedAt,
    lastUpdated: timestamp,
    lastModifiedBy: actor,
    auditTrail: [newAudit, ...(record.auditTrail || [])],
  };
}
