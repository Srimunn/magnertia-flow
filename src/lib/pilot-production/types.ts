export type PilotWorkflowStatus =
  | "Draft"
  | "In Progress"
  | "Under Review"
  | "Ready for Mass Production"
  | "Minor Improvements Required"
  | "Superseded — Repeat Scheduled"
  | "Archived";

export type PilotProductionStatus = "Not Started" | "In Progress" | "Completed" | "Paused";
export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";
export type ApprovalDecision =
  | "Pending"
  | "Approved"
  | "Approved with Conditions"
  | "Additional Pilot Required"
  | "Rejected";

export interface ReviewerRow {
  role: string;
  reviewer: string;
  status: "Approved" | "Pending" | "Rejected";
  comments?: string;
  decidedAt?: string;
}

export interface AttachmentItem {
  id: string;
  filename: string;
  source: "auto:process-validation" | "auto:control-plan" | "auto:pfmea" | "auto:spc" | "auto:mes" | "manual";
  uploadedAt: string;
  url?: string;
  fileSize?: string;
  moduleName?: string;
  available?: boolean;
}

export interface AuditTrailItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  description: string;
  stage?: string;
}

export interface StabilityTrendPoint {
  date: string;
  score: number;
}

export interface PilotProductionRecord {
  id: string; // PILOT-YYYY-NNNNN
  formCode: string; // PPFD-YYYY-NN
  pilotBatchTitle: string;
  pilotBatchNumber: string; // PB-<code>
  version: string; // "1.0"
  workflowStatus: PilotWorkflowStatus;
  parentPilotId?: string | null;

  // Metadata Row
  product: string;
  productRevision: string;
  manufacturingProcess: string;
  productionLine: string;
  processValidationRef: string;
  createdDate: string;
  lastUpdated: string;
  createdBy: string;
  lastModifiedBy: string;

  // Section 1: Overview
  pilotObjective: string;
  productionScope: string;
  productionLocation: string;
  pilotTeam: Array<{ name: string; role?: string; avatar?: string }>;
  processOwner: string;
  scheduleStart: string;
  scheduleEnd: string;
  lifecycleStage: string; // "Pilot Production"
  priority: PriorityLevel;

  // Section 2: Production Planning
  productionOrderRef: string;
  bomReference: string;
  routingReference: string;
  plannedQuantity: number;
  actualQuantity: number;
  materialAvailability: "Available" | "Partial" | "Not Available";
  materialAvailabilityAuto: boolean; // if false, (manual) badge shown
  machineAllocations: string[]; // WC-01, WC-02, ...
  operatorAssignment: string;

  // Section 3: Production Execution
  productionStart: string;
  productionEnd: string;
  productionStatus: PilotProductionStatus;
  machineUtilization: number; // %
  cycleTimeMinutes: number;
  throughputUnitsPerHour: number;
  downtimeHours: number;
  oee: number; // %

  // Section 4: Quality Verification
  incomingInspectionPassed: boolean;
  incomingInspectionAuto: boolean;
  inProcessInspectionPassed: boolean;
  inProcessInspectionAuto: boolean;
  finalInspectionPassed: boolean;
  finalInspectionAuto: boolean;
  defectRate: number; // %
  fpy: number; // %
  scrapRate: number; // %
  reworkRate: number; // %
  qualityScore: number; // 0-100

  // Section 5: Process Performance
  cp: number;
  cpk: number;
  spcStatus: "Active" | "Inactive" | "Pending";
  msaStatus: "Acceptable" | "Marginal" | "Unacceptable";
  processStabilityScore: number;
  controlPlanRef: string;
  controlPlanCompliance: "Compliant" | "Non-Compliant";
  performanceScore: number;
  stabilityTrend: StabilityTrendPoint[];

  // Section 6: Production Readiness
  equipmentReadiness: boolean;
  equipmentReadinessAuto: boolean;
  toolingReadiness: boolean;
  toolingReadinessAuto: boolean;
  operatorReadiness: boolean;
  operatorReadinessAuto: boolean;
  materialReadiness: boolean;
  materialReadinessAuto: boolean;
  safetyReadiness: boolean;
  safetyReadinessAuto: boolean;
  documentationComplete: boolean;
  documentationCompleteAuto: boolean;
  productionReadinessScore: number; // computed

  // Section 7: AI Production Assessment
  aiProductivityAnalysis: string;
  aiQualityPrediction: string;
  aiBottleneckDetection: string;
  aiDowntimeAnalysis: string;
  aiOptimizationRecommendations: string;
  aiProductionHealthScore: number;

  // Section 8: Summary & Recommendation
  productionScore: number;
  overallPilotReadiness: number; // computed
  recommendation: string; // computed
  recommendationOverride?: string | null;

  // Section 10: Review & Approval
  reviewers: ReviewerRow[];
  approvalDecision: ApprovalDecision;
  reviewComments: string;
  approvalDate?: string;

  // Attachments & History
  attachments: AttachmentItem[];
  auditTrail: AuditTrailItem[];
  activityHistory?: AuditTrailItem[];
  changeHistory?: AuditTrailItem[];
  workflowHistory?: AuditTrailItem[];
}
