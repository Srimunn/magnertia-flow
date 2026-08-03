export type MassProductionWorkflowStatus =
  | "Draft"
  | "In Progress"
  | "Under Review"
  | "Executive Review"
  | "Mass Production Authorized"
  | "Minor Improvements Required"
  | "Revalidation Required"
  | "Archived";

export type PpapStatusType = "Not Submitted" | "Submitted" | "Customer Approved" | "Rejected";
export type SupplierApprovalStatusType = "Approved" | "Conditional" | "Pending" | "Rejected";
export type ManufacturingStrategyType =
  | "Make-to-Stock (MTS)"
  | "Make-to-Order (MTO)"
  | "Assemble-to-Order (ATO)"
  | "Engineer-to-Order (ETO)";

export type ReadinessApprovalDecision =
  | "Pending"
  | "Approved"
  | "Approved with Conditions"
  | "Additional Validation Required"
  | "Rejected";

export interface ReviewerRow {
  role: string;
  reviewer: string;
  status: "Approved" | "Pending" | "Rejected";
  comments?: string;
  decidedAt?: string;
}

export interface SopActionState {
  releaseProductionOrders?: { firedAt: string; firedBy: string } | null;
  authorizeSupplierDeliveries?: { firedAt: string; firedBy: string } | null;
  releaseProductionMaterials?: { firedAt: string; firedBy: string } | null;
  releaseSop?: { firedAt: string; firedBy: string } | null;
}

export interface AttachmentItem {
  id: string;
  filename: string;
  source: string;
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

export interface MassProductionReadiness {
  id: string; // RDR-YYYY-NNNNN
  formCode: string; // MPRF-YYYY-NN
  readinessTitle: string;
  readinessNumber: string; // MR-<code>
  version: string; // "1.0"
  workflowStatus: MassProductionWorkflowStatus;
  sopReleasedAt?: string | null;

  // Metadata Row
  product: string;
  productRevision: string;
  manufacturingPlant: string;
  productionLine: string;
  pilotProductionRef: string; // REQUIRED
  ppapRef: string; // REQUIRED
  productionProgramRef: string;
  createdDate: string;
  lastUpdated: string;
  createdBy: string;
  lastModifiedBy: string;

  // Section 1: Overview
  productionLaunchTarget: string; // date
  manufacturingStrategy: ManufacturingStrategyType;
  launchPhase: string; // "Mass Production Readiness"
  processOwner: string;
  crossFunctionalTeam: Array<{ name: string; role?: string; avatar?: string }>;
  readinessPriority: "Low" | "Medium" | "High" | "Critical";
  launchObjective: string;

  // Section 2: Manufacturing Readiness
  productionLineQualified: boolean;
  equipmentQualification: boolean;
  toolingQualification: boolean;
  manufacturingCapacityVerified: boolean;
  oeeTargetAchieved: boolean;
  cycleTimeVerified: boolean;
  standardWorkAvailable: boolean;
  manufacturingReadinessScore: number; // computed

  // Section 3: Quality Readiness
  pfmeaApproved: boolean;
  controlPlanApproved: boolean;
  spcActive: boolean;
  msaApproved: boolean;
  ppapStatus: PpapStatusType;
  qualityTargetsAchieved: boolean;
  customerRequirementsVerified: boolean;
  qualityReadinessScore: number; // computed

  // Section 4: Supply Chain Readiness
  supplierApprovalStatus: SupplierApprovalStatusType;
  rawMaterialAvailability: boolean;
  safetyStockAvailable: boolean;
  logisticsReadiness: boolean;
  packagingValidation: boolean;
  warehouseReady: boolean;
  supplyChainScore: number; // computed

  // Section 5: Production Performance (Carried from Pilot)
  plannedProductionCapacityUnitsPerMonth: number;
  expectedDailyOutputUnits: number;
  oee: number; // carried
  fpy: number; // carried
  scrapRate: number; // carried
  cp: number; // carried
  cpk: number; // carried
  performanceScore: number; // computed

  // Section 6: Operational Readiness
  operatorTrainingCompleted: boolean;
  maintenanceTeamReady: boolean;
  sparePartsAvailable: boolean;
  safetyAuditCompleted: boolean;
  emergencyResponsePlan: boolean;
  itMesReady: boolean;
  operationalReadinessScore: number; // computed

  // Section 7: AI Production Readiness Assessment
  aiProductionRiskAnalysis: string;
  aiCapacityPrediction: string;
  aiBottleneckPrediction: string;
  aiQualityPrediction: string;
  aiDemandForecast: string;
  aiProductionReadinessScore: number;

  // Section 8: Executive Summary (Computed)
  overallMassProductionReadiness: number;
  recommendation: string;
  recommendationOverride?: string | null;

  // Section 9: Review & Approval (7 Roles)
  reviewers: ReviewerRow[];
  approvalDecision: ReadinessApprovalDecision;
  executiveComments: string;
  approvalDate?: string;

  // SOP Release Panel State
  sopActions: SopActionState;

  // Attachments & History
  attachments: AttachmentItem[];
  auditTrail: AuditTrailItem[];
  activityHistory?: AuditTrailItem[];
  changeHistory?: AuditTrailItem[];
  workflowHistory?: AuditTrailItem[];
}
