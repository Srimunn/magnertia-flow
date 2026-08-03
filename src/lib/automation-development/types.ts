export type AutomationWorkflowStatus =
  | "Draft"
  | "Process Analysis"
  | "System Design"
  | "Integration & Testing"
  | "Validation"
  | "Under Review"
  | "Executive Review"
  | "Approved — Deployment Authorized"
  | "Minor Improvements Required"
  | "Redesign Required"
  | "Archived";

export type ProjectPriorityType = "Low" | "Medium" | "High" | "Critical";
export type ProjectStatusType = "Planning" | "Development" | "Testing" | "Commissioning" | "Closed";

export type AutomationCategoryType =
  | "Industrial Robotics"
  | "Collaborative Robotics"
  | "Machine Vision"
  | "AGV & AMR"
  | "PLC-based Automation"
  | "SCADA Integration"
  | "IIoT"
  | "Full Cell Automation";

export type AutomationApprovalDecision =
  | "Pending"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export type AutomationRecommendationOption =
  | "Approve Automation Project"
  | "Deploy After Minor Improvements"
  | "Redesign & Revalidate"
  | "Reject Project"
  | "Pending";

export interface VendorProductChip {
  id: string;
  name: string;
  category: "PLC" | "HMI" | "SCADA" | "Industrial Robot" | "Machine Vision";
  vendor: string;
  model: string;
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
  source: string; // e.g. "inline:section-3"
}

export interface ReviewerRow {
  role: string;
  reviewer: string;
  status: "Approved" | "Pending" | "Rejected";
  comments?: string;
  decidedAt?: string;
}

export interface DeploymentReleaseActions {
  releaseAutomatedProduction?: { firedAt: string; firedBy: string } | null;
  registerAutomationAssets?: { firedAt: string; firedBy: string } | null;
  archiveAutomationDocumentation?: { firedAt: string; firedBy: string } | null;
  markProductionDeploymentApproved?: { firedAt: string; firedBy: string } | null;
}

export interface ManufacturingContextSnapshot {
  processEngineering?: { processFlow: string; cycleTime: number } | null;
  plm?: { bomReference: string; drawingsReference: string; specificationsReference: string } | null;
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

export interface AutomationDevelopment {
  id: string; // APD-YYYY-NNNNN
  formCode: string; // APDF-YYYY-NN
  automationProjectTitle: string;
  projectNumber: string; // AP-<code>
  version: string; // "1.0"
  workflowStatus: AutomationWorkflowStatus;

  // Metadata Row
  productProcess: string; // "Battery Assembly"
  manufacturingPlant: string; // "Plant-01"
  productionLine: string; // "Battery Assembly Line-02"
  automationEngineer: string; // "Vikram Singh"
  startDate: string; // "05 May 2024"
  targetDeployment: string; // "30 Aug 2024"
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastUpdated: string;

  // Section 1: Overview
  automationCategory: AutomationCategoryType;
  automationObjective: string;
  existingManualProcess: string;
  proposedAutomatedProcess: string;
  businessJustification: string;
  expectedBenefits: string;
  priority: ProjectPriorityType;
  projectStatus: ProjectStatusType;

  // Section 2: Process Analysis
  currentProcessFlowFile: InlineFileAttachment | null;
  targetProcessFlowFile: InlineFileAttachment | null;
  cycleTimeCurrentSec: number;
  cycleTimeTargetSec: number;
  bottleneckProcess: string;
  automationPotential: number; // 88/100
  roiEstimateInr: number; // 487500000 (₹48,75,00,000)
  processReadinessScore: number; // 82

  // Section 3: System Design (Hardware/Software Chips & Drawings)
  automationArchitectureFile: InlineFileAttachment | null;
  plcPlatform: VendorProductChip;
  hmiPlatform: VendorProductChip;
  scadaPlatform: VendorProductChip;
  robotCobotModel: VendorProductChip;
  machineVisionSystem: VendorProductChip;
  sensorConfigurationFile: InlineFileAttachment | null;
  controlLogicReferenceFile: InlineFileAttachment | null;

  // Section 4: Hardware & Software Development
  electricalPanelDesignFile: InlineFileAttachment | null;
  plcProgramFile: InlineFileAttachment | null; // .a17/.l5x
  hmiScreensFile: InlineFileAttachment | null; // .zip/.mer
  scadaConfigurationFile: InlineFileAttachment | null; // .pdf/.zip
  robotProgrammingFile: InlineFileAttachment | null; // .mod/.rapid/.src
  iiotConnectivity: "Not Connected" | "Connecting" | "Connected" | "Error";
  cybersecurityValidation: "Not Started" | "In Progress" | "Validated" | "Failed";
  developmentScore: number; // 88

  // Section 5: Testing & Validation
  fatCompleted: boolean;
  satCompleted: boolean;
  dryRunCompleted: boolean;
  performanceTest: boolean;
  safetyValidation: boolean;
  oeeImprovementPct: number; // 22.50%
  validationScore: number; // 85

  // Section 6: Deployment & Commissioning
  installationStatus: "Not Started" | "In Progress" | "Installed" | "Handover Complete";
  operatorTraining: boolean;
  maintenanceTraining: boolean;
  documentationCompleted: boolean;
  sopUpdated: boolean;
  productionHandover: boolean;
  commissioningScore: number; // 79

  // Section 7: AI Automation Assessment
  aiProcessOptimization: string;
  aiCycleTimePrediction: string;
  aiPredictiveMaintenance: string;
  aiEnergyOptimization: string;
  aiAutomationRecommendations: string;
  aiAutomationHealthScore: number; // 86 (with AI hexagon donut)

  // Section 8: Project Benefits Summary (Sidebar)
  productivityScore: number; // 88
  qualityImprovementScore: number; // 86
  costSavingScore: number; // 84
  energyEfficiencyScore: number; // 82
  overallAutomationReadiness: number; // 84
  recommendation: AutomationRecommendationOption; // user-selected
  recommendationSuggestion?: AutomationRecommendationOption; // computed hint

  // Snapshots & Release States
  manufacturingContextSnapshot: ManufacturingContextSnapshot;
  deploymentReleaseActions: DeploymentReleaseActions;
  productionDeploymentApprovedAt?: string | null;

  // Section 9: Review & Approval (8 Approvers)
  reviewers: ReviewerRow[];
  approvalDecision: AutomationApprovalDecision;
  reviewComments: string;
  approvalDate?: string;

  // Attachments & History
  attachments: AttachmentItem[];
  auditTrail: AuditTrailItem[];
  activityHistory?: AuditTrailItem[];
  changeHistory?: AuditTrailItem[];
  workflowHistory?: AuditTrailItem[];
}
