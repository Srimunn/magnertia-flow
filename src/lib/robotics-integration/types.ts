export type RoboticsWorkflowStatus =
  | "Draft"
  | "Robot Cell Design"
  | "Robotics Programming"
  | "System Integration"
  | "Validation"
  | "Under Review"
  | "Executive Review"
  | "Approved — Deployment Authorized"
  | "Minor Improvements Required"
  | "Redesign Required"
  | "Archived";

export type ProjectPriorityType = "Low" | "Medium" | "High" | "Critical";
export type ProjectStatusType = "Planning" | "Development" | "Testing" | "Commissioning" | "Closed";

export type RoboticsCategoryType =
  | "Industrial Robot"
  | "Collaborative Robot (Cobot)"
  | "SCARA"
  | "Delta"
  | "Cartesian"
  | "AGV & AMR"
  | "Welding Robot"
  | "Painting Robot"
  | "Assembly Robot"
  | "Palletizing Robot";

export type RoboticsApprovalDecision =
  | "Pending"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export type RoboticsRecommendationOption =
  | "Approve Robotics Integration"
  | "Deploy After Minor Improvements"
  | "Redesign & Revalidate"
  | "Reject Project"
  | "Pending";

export interface VendorRobotProductChip {
  id: string;
  name: string;
  category: "Industrial Robot" | "Collaborative Robot (Cobot)";
  vendor: string;
  model: string;
  specSheetUrl?: string;
  isManual?: boolean;
}

export interface InlineFileAttachment {
  id: string;
  filename: string;
  uploadedAt: string;
  fileSize?: string;
  version: number;
  url?: string;
  allowedExtensions?: string[];
  source: string;
}

export interface ReviewerRow {
  role: string;
  reviewer: string;
  status: "Approved" | "Pending" | "Rejected";
  comments?: string;
  decidedAt?: string;
}

export interface RoboticsDeploymentReleaseActions {
  releaseRoboticProductionCell?: { firedAt: string; firedBy: string } | null;
  registerRoboticAssets?: { firedAt: string; firedBy: string } | null;
  archiveRobotPrograms?: { firedAt: string; firedBy: string } | null;
  markProductionDeploymentApproved?: { firedAt: string; firedBy: string } | null;
}

export interface ManufacturingContextSnapshot {
  processEngineering?: { processFlow: string; workSequence: string } | null;
  plm?: { cadModels: string; bom: string; assemblyData: string } | null;
  automationDev?: {
    automationDevId: string;
    plcPlatform: string;
    hmiPlatform: string;
    scadaPlatform: string;
    automationArchitecture: string;
  } | null;
  snapshotAt: string;
}

export interface AttachmentItem {
  id: string;
  filename: string;
  source: string;
  uploadedAt: string;
  fileSize?: string;
  revision?: number;
  url?: string;
}

export interface AuditTrailItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  description: string;
  stage?: string;
}

export interface RoboticsIntegration {
  id: string; // RIP-YYYY-NNNNN
  formCode: string; // RPF-YYYY-NN
  roboticsProjectTitle: string;
  projectNumber: string; // RW-INT-YY-NNN
  version: string; // "1.0"
  workflowStatus: RoboticsWorkflowStatus;

  // Upstream optional link
  automationDevelopmentId?: string | null;

  // Metadata Row
  productProcess: string; // "Chassis Assembly"
  manufacturingPlant: string; // "Plant-01"
  productionLine: string; // "Welding Line-03"
  roboticsEngineer: string; // "Vikram Singh"
  startDate: string; // "05 May 2024"
  targetDeployment: string; // "15 Sep 2024"
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastUpdated: string;

  // Section 1: Overview
  roboticsCategory: RoboticsCategoryType;
  businessObjective: string;
  manualProcess: string;
  automatedRoboticProcess: string;
  expectedProductivityGainPct: number; // 28.50%
  roiEstimateInr: number; // 4875000 (₹48,75,000.00)
  priority: ProjectPriorityType;
  projectStatus: ProjectStatusType;

  // Section 2: Robot Cell Design
  robotCellLayoutFile: InlineFileAttachment | null;
  robotModel: VendorRobotProductChip;
  robotPayloadKg: number; // 12.0 kg
  robotReachMm: number; // 1440 mm
  degreesOfFreedom: number; // 6
  eoatConfiguration: string; // "Welding Gun + Positioner"
  safetyZoneLayoutFile: InlineFileAttachment | null;
  cellReadinessScore: number; // 85

  // Section 3: System Integration (Checkboxes)
  plcIntegration: boolean;
  scadaIntegration: boolean;
  mesIntegration: boolean;
  erpIntegration: boolean;
  machineVisionIntegration: boolean;
  iiotConnectivity: boolean;
  digitalTwinAvailable: boolean;
  integrationScore: number; // 88

  // Section 4: Robot Programming
  robotProgramFile: InlineFileAttachment | null; // .vpp/.mod/.rapid
  motionSequenceFile: InlineFileAttachment | null;
  pathOptimization: boolean;
  collisionDetection: boolean;
  cycleTimeSec: number; // 45.60 s
  programVersion: string; // "v2.1"
  programmingScore: number; // 84

  // Section 5: Testing & Validation
  simulationCompleted: boolean;
  offlineProgrammingVerified: boolean;
  fatCompleted: boolean;
  satCompleted: boolean;
  safetyValidation: boolean;
  performanceValidation: boolean;
  oeeImprovementPct: number; // 22.80%
  validationScore: number; // 87

  // Section 6: Production Deployment
  installationStatus: "Not Started" | "In Progress" | "Installed" | "Handover Complete";
  robotCalibration: boolean;
  operatorTraining: boolean;
  maintenanceTraining: boolean;
  sopUpdated: boolean;
  productionHandover: boolean;
  commissioningScore: number; // 82

  // Section 7: AI Robotics Assessment
  aiMotionOptimization: string;
  aiCollisionPrediction: string;
  aiPredictiveMaintenance: string;
  aiVisionAccuracy: string;
  aiRobotPerformanceAnalysis: string;
  aiRoboticsHealthScore: number; // 89 (with AI hexagon donut)

  // Section 8: Robotics Project Summary (Sidebar)
  overallRoboticsReadiness: number; // 86
  recommendation: RoboticsRecommendationOption; // user-selected
  recommendationSuggestion?: RoboticsRecommendationOption; // computed hint

  // Snapshots & Release States
  manufacturingContextSnapshot: ManufacturingContextSnapshot;
  deploymentReleaseActions: RoboticsDeploymentReleaseActions;
  productionDeploymentApprovedAt?: string | null;

  // Section 9: Review & Approval (9 Approvers)
  reviewers: ReviewerRow[];
  approvalDecision: RoboticsApprovalDecision;
  reviewComments: string;
  approvalDate?: string;

  // Attachments & History
  attachments: AttachmentItem[];
  auditTrail: AuditTrailItem[];
  activityHistory?: AuditTrailItem[];
  changeHistory?: AuditTrailItem[];
  workflowHistory?: AuditTrailItem[];
}
