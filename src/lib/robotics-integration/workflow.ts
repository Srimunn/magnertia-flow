import type {
  RoboticsIntegration,
  RoboticsApprovalDecision,
} from "./types";

export interface SubmissionGateResult {
  canSubmit: boolean;
  failingGates: string[];
}

/**
 * Checks submission gates before record can move to Under Review
 */
export function checkSubmissionGates(record: RoboticsIntegration): SubmissionGateResult {
  const failingGates: string[] = [];

  if (!record.robotModel.name) {
    failingGates.push("Section 2: Robot Model must be selected");
  }

  if (!record.robotProgramFile) {
    failingGates.push("Section 4: Robot Program file must be uploaded");
  }

  const integrationCount = [
    record.plcIntegration,
    record.scadaIntegration,
    record.mesIntegration,
    record.erpIntegration,
    record.machineVisionIntegration,
    record.iiotConnectivity,
    record.digitalTwinAvailable,
  ].filter(Boolean).length;

  if (integrationCount < 5) {
    failingGates.push("Section 3: At least 5 of 7 integration points must be checked (current: " + integrationCount + ")");
  }

  if (!record.fatCompleted || !record.satCompleted || !record.safetyValidation) {
    failingGates.push("Section 5: FAT Completed, SAT Completed, and Safety Validation must be checked");
  }

  if (!record.collisionDetection) {
    failingGates.push("Section 4: Collision Detection must be verified and checked");
  }

  return {
    canSubmit: failingGates.length === 0,
    failingGates,
  };
}

export interface WorkflowTransitionResult {
  record: RoboticsIntegration;
  message: string;
}

/**
 * Handles Robotics Integration workflow transitions and decision side-effects
 */
export function handleWorkflowTransition(
  currentRecord: RoboticsIntegration,
  decision: RoboticsApprovalDecision,
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

  const updatedRecord: RoboticsIntegration = {
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
    updatedRecord.workflowStatus = "Approved — Deployment Authorized";
    updatedRecord.productionDeploymentApprovedAt = timestamp;
    return {
      record: updatedRecord,
      message: "Approved! Workflow status updated to Deployment Authorized. Robotics Release Panel unlocked.",
    };
  }

  if (decision === "Approved with Conditions") {
    updatedRecord.workflowStatus = "Minor Improvements Required";
    const curVer = parseFloat(updatedRecord.version) || 1.0;
    updatedRecord.version = (curVer + 0.1).toFixed(1);
    return {
      record: updatedRecord,
      message: "Approved with Conditions. Record reopened for minor adjustments (v" + updatedRecord.version + ").",
    };
  }

  if (decision === "Revision Required") {
    // Redesign Required: Reset workflow to Stage 1 (Robot Cell Design), clear Sections 5 & 6, bump version to 2.0
    updatedRecord.workflowStatus = "Redesign Required";
    updatedRecord.version = "2.0";

    // Clear Testing, Validation & Commissioning checkboxes
    updatedRecord.simulationCompleted = false;
    updatedRecord.offlineProgrammingVerified = false;
    updatedRecord.fatCompleted = false;
    updatedRecord.satCompleted = false;
    updatedRecord.safetyValidation = false;
    updatedRecord.performanceValidation = false;
    updatedRecord.robotCalibration = false;
    updatedRecord.operatorTraining = false;
    updatedRecord.maintenanceTraining = false;
    updatedRecord.sopUpdated = false;
    updatedRecord.productionHandover = false;
    updatedRecord.installationStatus = "In Progress";

    return {
      record: updatedRecord,
      message: "Redesign Required. Workflow reset to Stage 1 (Robot Cell Design). Sections 5 & 6 cleared for re-validation (v2.0).",
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
 * Handles Robotics Deployment Release Panel side-effect actions
 */
export function fireDeploymentReleaseAction(
  record: RoboticsIntegration,
  actionKey:
    | "releaseRoboticProductionCell"
    | "registerRoboticAssets"
    | "archiveRobotPrograms"
    | "markProductionDeploymentApproved",
  actor: string
): RoboticsIntegration {
  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedActions = {
    ...record.deploymentReleaseActions,
    [actionKey]: { firedAt: timestamp, firedBy: actor },
  };

  const actionLabels = {
    releaseRoboticProductionCell: "Released Robotic Production Cell to MES",
    registerRoboticAssets: "Registered Robotic Assets in Maintenance",
    archiveRobotPrograms: "Archived Robot Programs in Enterprise Repository",
    markProductionDeploymentApproved: "Marked Production Deployment Approved",
  };

  const newAudit = {
    id: `log-rob-${Date.now()}`,
    timestamp,
    user: actor,
    action: `Robotics Action: ${actionLabels[actionKey]}`,
    description: `Fired ${actionLabels[actionKey]} side-effect`,
    stage: "Robotics Deployment Release Panel",
  };

  return {
    ...record,
    deploymentReleaseActions: updatedActions,
    lastUpdated: timestamp,
    lastModifiedBy: actor,
    auditTrail: [newAudit, ...(record.auditTrail || [])],
  };
}
