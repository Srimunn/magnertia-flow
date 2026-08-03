export type LeanWorkflowStatus =
  | "Draft"
  | "Current State Assessment"
  | "Waste Identification"
  | "Implementation"
  | "Under Review"
  | "Executive Review"
  | "Approved — Continuous Improvement Active"
  | "Minor Improvements Required"
  | "Revision Required"
  | "Archived";

export type ProjectPriorityType = "Low" | "Medium" | "High" | "Critical";
export type ProjectStatusType = "Planning" | "Implementation" | "Review" | "Sustaining" | "Closed";
export type WasteSeverityType = "Low" | "Medium" | "High";
export type ActionPlanStatusType =
  | "Planned"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Required — Revision";

export type LeanApprovalDecision =
  | "Pending"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export type RecommendationOption =
  | "Scale Across Lines"
  | "Pilot Test in Another Area"
  | "Sustain Current State"
  | "Rework Project"
  | "Pending";

export interface WasteItem {
  checked: boolean;
  severity: WasteSeverityType;
}

export interface ActionPlanRow {
  id: string;
  activity: string;
  leanTool: string;
  owner: string;
  status: ActionPlanStatusType;
  dueDate: string;
  isRevisionRequired?: boolean;
}

export interface BeforeAfterMetric {
  id: string;
  metric: string;
  before?: number | string | null;
  after: number;
  unit?: string;
  polarity: "higher_is_better" | "lower_is_better";
  improvementPct: number;
}

export interface KaizenActivityRow {
  id: string;
  name: string;
  status: "Not Started" | "In Progress" | "Completed" | "On Hold";
}

export interface ReviewerRow {
  role: string;
  reviewer: string;
  status: "Approved" | "Pending" | "Rejected";
  comments?: string;
  decidedAt?: string;
}

export interface StandardWorkReleaseActions {
  releaseStandardWork?: { firedAt: string; firedBy: string } | null;
  deployNewStandards?: { firedAt: string; firedBy: string } | null;
  initiateContinuousImprovement?: { firedAt: string; firedBy: string } | null;
}

export interface CurrentStateSnapshot {
  mes?: { oee: number; cycleTime: number; downtime: number; productionLosses: string } | null;
  qms?: { fpy: number; defectRate: number; scrapRate: number } | null;
  inventory?: { wipInventory: string; materialFlow: string } | null;
  supplyChain?: { leadTime: number; supplierPerformance: number } | null;
  snapshotAt: string;
}

export interface AttachmentItem {
  id: string;
  filename: string;
  source: string;
  uploadedAt: string;
  url?: string;
  fileSize?: string;
  moduleName?: string;
}

export interface AuditTrailItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  description: string;
  stage?: string;
}

export interface LeanManufacturing {
  id: string; // LEAN-YYYY-NNNNN
  formCode: string; // LMRF-YYYY-NN
  leanProjectTitle: string;
  leanProjectNumber: string; // LM-<code>
  version: string; // "1.0"
  workflowStatus: LeanWorkflowStatus;

  // Metadata Row (no parent record chip)
  plant: string;
  productionLine: string;
  department: string;
  processOwner: string;
  projectPriority: ProjectPriorityType;
  projectStatus: ProjectStatusType;
  timelineStart: string;
  timelineEnd: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastUpdated: string;

  // Section 1: Overview
  improvementCategory:
    | "Productivity Improvement"
    | "Quality Improvement"
    | "Cost Reduction"
    | "Delivery Improvement"
    | "Safety Improvement"
    | "Sustainability";
  leanMethodologies: string[]; // multi-select: Kaizen, 5S, SMED, Kanban, etc.
  improvementObjective: string;
  currentStateSummary: string;
  targetState: string;

  // Section 2: Waste Identification (8 Wastes)
  wastes: {
    overproduction: WasteItem;
    waiting: WasteItem;
    transportation: WasteItem;
    overprocessing: WasteItem;
    inventory: WasteItem;
    motion: WasteItem;
    defects: WasteItem;
    underutilizedTalent: WasteItem;
  };
  wasteSeverityScore: number; // computed, inverted polarity (higher = worse)

  // Section 3: Process Analysis
  currentCycleTimeSec: number;
  taktTimeSec: number;
  leadTimeHr: number;
  changeoverTimeMin: number;
  bottleneckProcess: string;
  valueAddedRatio: number; // %
  processEfficiencyScore: number; // computed

  // Section 4: Lean Action Plan (Table)
  actionPlan: ActionPlanRow[];
  expectedCostSaving: number; // INR
  realizedCostSaving?: number; // INR
  totalActivities: number; // computed

  // Section 5: Operational Performance (Before/After Table)
  performanceMetrics: BeforeAfterMetric[];
  operationalScore: number; // computed

  // Section 6: Continuous Improvement (Kaizen)
  kaizenActivities: KaizenActivityRow[];
  continuousImprovementScore: number; // computed

  // Section 7: AI Lean Assessment
  aiWasteDetection: string;
  aiBottleneckAnalysis: string;
  aiProductivityForecast: string;
  aiProcessOptimization: string;
  aiCostReductionSuggestions: string;
  aiLeanHealthScore: number;

  // Section 8: Executive Summary
  overallLeanReadiness: number;
  recommendation: RecommendationOption; // user-selected
  recommendationSuggestion?: RecommendationOption; // computed hint

  // Frozen Current State Snapshot
  currentStateSnapshot: CurrentStateSnapshot;

  // Standard Work Release Actions State
  standardWorkReleaseActions: StandardWorkReleaseActions;
  continuousImprovementActive: boolean;

  // Section 9: Review & Approval (7 Roles)
  reviewers: ReviewerRow[];
  approvalDecision: LeanApprovalDecision;
  reviewComments: string;
  approvalDate?: string;

  // Attachments & History
  attachments: AttachmentItem[];
  auditTrail: AuditTrailItem[];
  activityHistory?: AuditTrailItem[];
  changeHistory?: AuditTrailItem[];
  workflowHistory?: AuditTrailItem[];
}
