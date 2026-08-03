import { createServerFn } from "@tanstack/react-start";
import type { LeanManufacturing } from "@/lib/lean-manufacturing/types";

export const MOCK_LEAN_RECORD_123: LeanManufacturing = {
  id: "LEAN-2024-00123",
  formCode: "LMRF-2024-25",
  leanProjectTitle: "Reduce Changeover Time in Assembly Line",
  leanProjectNumber: "LM-ENCL-LN02-001",
  version: "1.0",
  workflowStatus: "In Progress",

  // Metadata Row (no parent record chip)
  plant: "Plant-01",
  productionLine: "Assembly Line-02",
  department: "Production",
  processOwner: "Vikram Singh",
  projectPriority: "High",
  projectStatus: "Implementation",
  timelineStart: "2024-05-01",
  timelineEnd: "2024-06-30",
  createdBy: "Rahul Sharma",
  createdDate: "10 Jun 2024",
  lastModifiedBy: "Rahul Sharma",
  lastUpdated: "17 Jun 2024",

  // Section 1: Overview
  improvementCategory: "Productivity Improvement",
  leanMethodologies: ["Kaizen", "5S", "SMED", "Kanban", "Standard Work", "Poka-Yoke"],
  improvementObjective: "Reduce changeover time from 120 min to 45 min and improve OEE.",
  currentStateSummary: "High setup time, excess motion, waiting and inventory.",
  targetState: "Streamlined setup, standard work, pull system with Kanban.",

  // Section 2: Waste Identification (8 Wastes)
  wastes: {
    overproduction: { checked: true, severity: "High" },
    waiting: { checked: true, severity: "High" },
    transportation: { checked: true, severity: "Medium" },
    overprocessing: { checked: false, severity: "Low" },
    inventory: { checked: true, severity: "Medium" },
    motion: { checked: true, severity: "High" },
    defects: { checked: true, severity: "Medium" },
    underutilizedTalent: { checked: false, severity: "Low" },
  },
  wasteSeverityScore: 72,

  // Section 3: Process Analysis
  currentCycleTimeSec: 320.0,
  taktTimeSec: 240.0,
  leadTimeHr: 8.2,
  changeoverTimeMin: 120.0,
  bottleneckProcess: "Setup Station-02",
  valueAddedRatio: 38.5,
  processEfficiencyScore: 78,

  // Section 4: Lean Action Plan
  actionPlan: [
    { id: "act-01", activity: "Reduce Cycle Time", leanTool: "SMED", owner: "Vikram Singh", status: "In Progress", dueDate: "20 May 2024" },
    { id: "act-02", activity: "5S Workplace", leanTool: "5S", owner: "Neha Reddy", status: "Completed", dueDate: "10 May 2024" },
    { id: "act-03", activity: "Implement Kanban", leanTool: "Kanban", owner: "Arun Kumar", status: "In Progress", dueDate: "25 May 2024" },
    { id: "act-04", activity: "Standard Work", leanTool: "Standard Work", owner: "Priya Nair", status: "In Progress", dueDate: "30 May 2024" },
    { id: "act-05", activity: "Poka-Yoke in Assembly", leanTool: "Poka-Yoke", owner: "Rakesh Patel", status: "Planned", dueDate: "15 Jun 2024" },
  ],
  expectedCostSaving: 1245000, // ₹12,45,000
  realizedCostSaving: 980000,
  totalActivities: 5,

  // Section 5: Operational Performance (Before/After Table)
  performanceMetrics: [
    { id: "m-01", metric: "OEE (%)", before: 68.2, after: 82.4, polarity: "higher_is_better", improvementPct: 20.82 },
    { id: "m-02", metric: "FPY (%)", before: 89.1, after: 95.3, polarity: "higher_is_better", improvementPct: 6.2 },
    { id: "m-03", metric: "Productivity Improvement (%)", before: null, after: 18.4, polarity: "higher_is_better", improvementPct: 18.4 },
    { id: "m-04", metric: "Scrap Reduction (%)", before: 3.2, after: 1.2, polarity: "lower_is_better", improvementPct: -62.5 },
    { id: "m-05", metric: "Downtime Reduction (%)", before: 15.4, after: 7.2, polarity: "lower_is_better", improvementPct: -53.25 },
    { id: "m-06", metric: "Inventory Reduction (%)", before: 22.0, after: 11.6, polarity: "lower_is_better", improvementPct: -47.27 },
  ],
  operationalScore: 82,

  // Section 6: Continuous Improvement (Kaizen)
  kaizenActivities: [
    { id: "k-01", name: "Kaizen Event", status: "Completed" },
    { id: "k-02", name: "5S Audit Completed", status: "Completed" },
    { id: "k-03", name: "TPM Activity", status: "In Progress" },
    { id: "k-04", name: "SMED Implemented", status: "In Progress" },
    { id: "k-05", name: "Kanban Active", status: "In Progress" },
    { id: "k-06", name: "Poka-Yoke Implemented", status: "Completed" },
  ],
  continuousImprovementScore: 85,

  // Section 7: AI Lean Assessment
  aiWasteDetection: "High waste due to waiting and setup.",
  aiBottleneckAnalysis: "Setup Station-02 is the bottleneck.",
  aiProductivityForecast: "Expected productivity up by 18%.",
  aiProcessOptimization: "Recommend SMED + Kanban sync.",
  aiCostReductionSuggestions: "Potential saving of ₹12.45 Lakhs.",
  aiLeanHealthScore: 88,

  // Section 8: Executive Summary
  overallLeanReadiness: 81,
  recommendation: "Scale Across Lines",
  recommendationSuggestion: "Scale Across Lines",

  // Frozen Current State Snapshot
  currentStateSnapshot: {
    mes: { oee: 68.2, cycleTime: 320, downtime: 15.4, productionLosses: "Setup delays at Station-02" },
    qms: { fpy: 89.1, defectRate: 2.1, scrapRate: 3.2 },
    inventory: { wipInventory: "1,200 units", materialFlow: "Batch push system" },
    supplyChain: { leadTime: 8.2, supplierPerformance: 92.5 },
    snapshotAt: "10 Jun 2024 09:20 AM",
  },

  // Standard Work Release Actions State
  standardWorkReleaseActions: {
    releaseStandardWork: null,
    deployNewStandards: null,
    initiateContinuousImprovement: null,
  },
  continuousImprovementActive: false,

  // Section 9: Review & Approval (7 Roles)
  approvalDecision: "Approved",
  reviewers: [
    { role: "Lean Champion", reviewer: "Vikram Singh", status: "Approved", comments: "Kaizen event & SMED completed." },
    { role: "Manufacturing Engineer", reviewer: "Neha Reddy", status: "Approved", comments: "5S workplace layout verified." },
    { role: "Production Manager", reviewer: "Arun Kumar", status: "Approved", comments: "Shift output increased by 18.4%." },
    { role: "Quality Manager", reviewer: "Priya Nair", status: "Approved", comments: "FPY reached 95.3% target." },
    { role: "Maintenance Manager", reviewer: "Rakesh Patel", status: "Approved", comments: "PM routines updated." },
    { role: "Plant Head", reviewer: "Sankaran R.", status: "Pending" },
    { role: "COO", reviewer: "Sanjay Patel", status: "Pending" },
  ],
  reviewComments: "Project targets achieved. Ready for standard work release.",
  approvalDate: "17 Jun 2024",

  // Attachments
  attachments: [
    { id: "att-lm-01", filename: "Value Stream Map.pdf", source: "auto:vsm", uploadedAt: "17 Jun 2024", fileSize: "4.1 MB", moduleName: "VSM" },
    { id: "att-lm-02", filename: "Current State Analysis.pdf", source: "auto:current-state", uploadedAt: "16 Jun 2024", fileSize: "2.8 MB", moduleName: "MES Analysis" },
    { id: "att-lm-03", filename: "Future State Map.pdf", source: "auto:future-state", uploadedAt: "16 Jun 2024", fileSize: "3.5 MB", moduleName: "VSM" },
    { id: "att-lm-04", filename: "Kaizen Report_01.pdf", source: "auto:kaizen", uploadedAt: "15 Jun 2024", fileSize: "1.9 MB", moduleName: "Kaizen" },
    { id: "att-lm-05", filename: "5S Audit Report.pdf", source: "auto:5s", uploadedAt: "14 Jun 2024", fileSize: "1.2 MB", moduleName: "5S Audit" },
    { id: "att-lm-06", filename: "OEE Report_May2024.pdf", source: "auto:oee", uploadedAt: "13 Jun 2024", fileSize: "2.3 MB", moduleName: "MES" },
    { id: "att-lm-07", filename: "Cost Saving Analysis.xlsx", source: "auto:finance", uploadedAt: "12 Jun 2024", fileSize: "850 KB", moduleName: "Costing" },
    { id: "att-lm-08", filename: "Before After Photos.zip", source: "auto:photos", uploadedAt: "10 Jun 2024", fileSize: "8.4 MB", moduleName: "Gemba Photos" },
  ],

  // System Information & History
  auditTrail: [
    { id: "at-lm-01", timestamp: "10 Jun 2024 09:20 AM", user: "Rahul Sharma", action: "Record Created", description: "Created Lean Manufacturing record LEAN-2024-00123." },
    { id: "at-lm-02", timestamp: "12 Jun 2024 02:15 PM", user: "Vikram Singh", action: "Baseline Snapshotted", description: "Snapshotted current state operational metrics from MES/QMS." },
    { id: "at-lm-03", timestamp: "15 Jun 2024 05:30 PM", user: "Neha Reddy", action: "5S Audit Completed", description: "Completed 5S workplace audit." },
    { id: "at-lm-04", timestamp: "17 Jun 2024 03:45 PM", user: "Rahul Sharma", action: "Submitted for Approval", description: "Submitted package for executive review." },
  ],
};

let mockLeanDatabase: Record<string, LeanManufacturing> = {
  "LEAN-2024-00123": MOCK_LEAN_RECORD_123,
};

export const getLeanManufacturingFn = createServerFn({ method: "GET" })
  .validator((data?: { id?: string }) => data)
  .handler(async ({ data }) => {
    const id = data?.id || "LEAN-2024-00123";
    const record = mockLeanDatabase[id] || MOCK_LEAN_RECORD_123;
    return { success: true, data: record };
  });

export const listLeanManufacturingFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: Object.values(mockLeanDatabase) };
});

export const saveLeanManufacturingFn = createServerFn({ method: "POST" })
  .validator((data: { record: LeanManufacturing }) => data)
  .handler(async ({ data }) => {
    const updated = {
      ...data.record,
      lastUpdated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    mockLeanDatabase[updated.id] = updated;
    return { success: true, data: updated };
  });
