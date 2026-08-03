import type {
  AutomationDevelopment,
  AutomationApprovalDecision,
} from "./types";

export interface SubmissionGateResult {
  canSubmit: boolean;
  failingGates: string[];
}

/**
 * Checks submission gates before record can move to Under Review
 */
export function checkSubmissionGates(record: AutomationDevelopment): SubmissionGateResult {
  const failingGates: string[] = [];

  const chipsSet =
    !!record.plcPlatform.name &&
    !!record.hmiPlatform.name &&
    !!record.scadaPlatform.name &&
    !!record.robotCobotModel.name &&
    !!record.machineVisionSystem.name;

  if (!chipsSet) {
    failingGates.push("Section 3: All 5 hardware/software platform chips must be specified (PLC, HMI, SCADA, Robot, Vision)");
  }

  const filesUploaded =
    !!record.electricalPanelDesignFile &&
    !!record.plcProgramFile &&
    !!record.hmiScreensFile &&
    !!record.scadaConfigurationFile &&
    !!record.robotProgrammingFile;

  if (!filesUploaded) {
    failingGates.push("Section 4: All 5 hardware/software files must be uploaded (Panel Design, PLC, HMI, SCADA, Robot)");
  }

  if (!record.fatCompleted || !record.satCompleted || !record.safetyValidation) {
    failingGates.push("Section 5: FAT Completed, SAT Completed, and Safety Validation must be checked");
  }

  if (record.iiotConnectivity !== "Connected") {
    failingGates.push("Section 4: IIoT Connectivity must be 'Connected'");
  }

  if (record.cybersecurityValidation !== "Validated") {
    failingGates.push("Section 4: Cybersecurity Validation must be 'Validated'");
  }

  return {
    canSubmit: failingGates.length === 0,
    failingGates,
  };
}

export interface WorkflowTransitionResult {
  record: AutomationDevelopment;
  message: string;
}

/**
 * Handles Automation Development workflow transitions and decision side-effects
 */
export function handleWorkflowTransition(
  currentRecord: AutomationDevelopment,
  decision: AutomationApprovalDecision,
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

  const updatedRecord: AutomationDevelopment = {
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
      message: "Approved! Workflow status updated to Deployment Authorized. Deployment Release Panel unlocked.",
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
    // Redesign Required: Reset workflow to Stage 2 (System Design), clear Sections 5 & 6, bump version to 2.0
    updatedRecord.workflowStatus = "Redesign Required";
    updatedRecord.version = "2.0";

    // Clear Testing, Validation & Commissioning checkboxes
    updatedRecord.fatCompleted = false;
    updatedRecord.satCompleted = false;
    updatedRecord.dryRunCompleted = false;
    updatedRecord.performanceTest = false;
    updatedRecord.safetyValidation = false;
    updatedRecord.operatorTraining = false;
    updatedRecord.maintenanceTraining = false;
    updatedRecord.documentationCompleted = false;
    updatedRecord.sopUpdated = false;
    updatedRecord.productionHandover = false;
    updatedRecord.installationStatus = "In Progress";

    return {
      record: updatedRecord,
      message: "Redesign Required. Workflow reset to Stage 2 (System Design). Sections 5 & 6 cleared for re-validation (v2.0).",
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
 * Handles Automation Deployment Release Panel side-effect actions
 */
export function fireDeploymentReleaseAction(
  record: AutomationDevelopment,
  actionKey:
    | "releaseAutomatedProduction"
    | "registerAutomationAssets"
    | "archiveAutomationDocumentation"
    | "markProductionDeploymentApproved",
  actor: string
): AutomationDevelopment {
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
    releaseAutomatedProduction: "Released Automated Production to MES",
    registerAutomationAssets: "Registered Automation Assets in Maintenance",
    archiveAutomationDocumentation: "Archived Automation Documentation",
    markProductionDeploymentApproved: "Marked Production Deployment Approved",
  };

  const newAudit = {
    id: `log-dep-${Date.now()}`,
    timestamp,
    user: actor,
    action: `Deployment Action: ${actionLabels[actionKey]}`,
    description: `Fired ${actionLabels[actionKey]} side-effect`,
    stage: "Deployment Release Panel",
  };

  return {
    ...record,
    deploymentReleaseActions: updatedActions,
    lastUpdated: timestamp,
    lastModifiedBy: actor,
    auditTrail: [newAudit, ...(record.auditTrail || [])],
  };
}
