import { createServerFn } from "@tanstack/react-start";
import type {
  PilotProductionRecord,
  PilotProductionFormInput,
} from "@/services/types";

export const INITIAL_PILOT_PRODUCTION_RECORD: PilotProductionRecord = {
  id: "pilot-rec-00078",
  pilotId: "PILOT-2024-00078",
  formCode: "PPFD-2024-25",
  pilotTitle: "Autonomous W-EVSE Pilot Production",
  pilotNumber: "PB-ENCL-AW-001",
  version: 1.0,
  workflowStatus: "In Progress",

  // Form Information
  product: "Autonomous W-EVSE",
  productRevision: "REV-2.1",
  manufacturingProcess: "Enclosure Assembly",
  productionLine: "Line-02",
  processValidationRef: "PV-ENCL-AW-001",
  processOwner: "Rahul Sharma",
  createdDate: "10 Jun 2024",
  lastUpdated: "17 Jun 2024",

  // Pilot Production Overview
  objective: "Validate manufacturing readiness in real shop floor conditions before mass production.",
  scope: "Enclosure assembly including welding, sealing, fastening, and final test.",
  location: "Plant-01",
  pilotTeam: [
    { name: "Rahul Sharma", role: "Production Manager" },
    { name: "Vikram Singh", role: "Manufacturing Engineer" },
    { name: "Neha Reddy", role: "Quality Engineer" },
    { name: "Arun Kumar", role: "Process Engineer" },
  ],
  processOwnerName: "Vikram Singh",
  startDate: "10 Jun 2024",
  endDate: "15 Jun 2024",
  lifecycleStage: "Pilot Production",
  priority: "High",

  // Production Planning
  productionOrder: "PO-ENCL-240610",
  plannedQuantity: 1000,
  actualQuantity: 982,
  bomRef: "BOM-ENCL-REV2.1",
  routingRef: "RTG-ENCL-AW-001",
  materialAvailability: true,
  machineAllocation: "WC-01, WC-02, WC-03, WC-04, WC-05",
  operatorAssignment: "OP-Team-02",

  // Production Execution
  executionStart: "10 Jun 2024 06:00 AM",
  executionEnd: "15 Jun 2024 06:45 PM",
  productionStatus: "Completed",
  machineUtilization: 82.4,
  cycleTime: 4.35,
  throughput: 136.5,
  downtime: 2.8,
  oee: 78.6,

  // Quality Verification
  incomingInspection: true,
  inProcessInspection: true,
  finalInspection: true,
  defectRate: 0.68,
  fpy: 96.40,
  scrapRate: 0.42,
  reworkRate: 0.56,
  qualityScore: 90,

  // Process Performance
  cp: 1.67,
  cpk: 1.53,
  spcStatus: true,
  msaStatus: "Acceptable",
  processStability: "Good",
  controlPlanCompliance: "Compliant",
  performanceScore: 87,
  trendHistory: [
    { date: "11 Jun", score: 82 },
    { date: "12 Jun", score: 85 },
    { date: "13 Jun", score: 87 },
    { date: "14 Jun", score: 88 },
    { date: "15 Jun", score: 90 },
    { date: "16 Jun", score: 88 },
    { date: "17 Jun", score: 88 },
  ],

  // Production Readiness
  equipmentReadiness: true,
  toolingReadiness: true,
  operatorReadiness: true,
  materialReadiness: true,
  safetyReadiness: true,
  documentationComplete: true,
  productionReadinessScore: 88,

  // AI Assessment
  aiAssessment: {
    healthScore: 88,
    productivityAnalysis: "Overall productivity is good with potential 8.2% improvement.",
    qualityPrediction: "Low defect trend expected to continue (defect rate predicted < 1%).",
    bottleneckDetection: "Welding station (WC-05) is the primary potential bottleneck.",
    downtimeAnalysis: "Electrical downtime contributes 38% of total recorded downtime.",
    optimizationRecommendations: "Re-balance operator allocation between WC-03 and WC-04 and optimize changeover time.",
  },

  // Summary & Recommendation
  productionScore: 85,
  processPerformanceScore: 87,
  readinessScore: 88,
  aiHealthScore: 88,
  overallPilotReadiness: 86,
  recommendation: "Release for Mass Production",

  // Review & Approvals (7 Roles)
  approvalDecision: "Approved",
  reviewers: [
    { role: "Manufacturing Engineer", person: "Vikram Singh", decision: "Approved", date: "10 Jun 2024", comments: "Machine allocations and line throughput verified.", status: "Approved" },
    { role: "Production Manager", person: "Priya Nair", decision: "Approved", date: "12 Jun 2024", comments: "Shift completion rate and operator assignments confirmed.", status: "Approved" },
    { role: "Quality Engineer", person: "Neha Reddy", decision: "Approved", date: "14 Jun 2024", comments: "FPY 96.4% and Cpk 1.53 meet pilot exit gate criteria.", status: "Approved" },
    { role: "Process Engineer", person: "Arun Kumar", decision: "Approved", date: "15 Jun 2024", comments: "Cycle time and tool wear within expected limits.", status: "Approved" },
    { role: "Plant Head", person: "Sankaran R.", decision: "Approved", date: "16 Jun 2024", comments: "Shop floor readiness approved for mass release.", status: "Pending" },
    { role: "Operations Head", person: "Rakesh Patel", decision: "Approved", date: "17 Jun 2024", comments: "Capacity allocation confirmed.", status: "Pending" },
    { role: "COO", person: "Sankaran R.", decision: "Approved", date: "17 Jun 2024", comments: "Executive approval for mass production transition.", status: "Pending" },
  ],

  // Attachments (9 Files)
  attachments: [
    { id: "att-pl-01", fileName: "Production Report.pdf", fileType: "PDF Document", documentType: "Production Report", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "17 Jun 2024", fileSize: "3.8 MB", status: "Active" },
    { id: "att-pl-02", fileName: "Validation Report.pdf", fileType: "PDF Document", documentType: "Validation Report", version: "2.1", uploadedBy: "Vikram Singh", uploadedDate: "16 Jun 2024", fileSize: "4.2 MB", status: "Active" },
    { id: "att-pl-03", fileName: "Control Plan.pdf", fileType: "PDF Document", documentType: "Control Plan", version: "2.1", uploadedBy: "Neha Reddy", uploadedDate: "15 Jun 2024", fileSize: "1.8 MB", status: "Active" },
    { id: "att-pl-04", fileName: "PFMEA Report.pdf", fileType: "PDF Document", documentType: "PFMEA Report", version: "2.1", uploadedBy: "Arun Kumar", uploadedDate: "15 Jun 2024", fileSize: "2.5 MB", status: "Active" },
    { id: "att-pl-05", fileName: "SPC Reports.zip", fileType: "ZIP Archive", documentType: "SPC Reports", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "17 Jun 2024", fileSize: "5.4 MB", status: "Active" },
    { id: "att-pl-06", fileName: "MSA Reports.pdf", fileType: "PDF Document", documentType: "MSA Reports", version: "1.0", uploadedBy: "Neha Reddy", uploadedDate: "14 Jun 2024", fileSize: "3.1 MB", status: "Active" },
    { id: "att-pl-07", fileName: "Quality Reports.pdf", fileType: "PDF Document", documentType: "Quality Reports", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "16 Jun 2024", fileSize: "3.6 MB", status: "Active" },
    { id: "att-pl-08", fileName: "PPAP Documents.pdf", fileType: "PDF Document", documentType: "PPAP Documents", version: "1.0", uploadedBy: "Rakesh Patel", uploadedDate: "16 Jun 2024", fileSize: "6.8 MB", status: "Active" },
    { id: "att-pl-09", fileName: "Supporting Documents.zip", fileType: "ZIP Archive", documentType: "Supporting Documents", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "17 Jun 2024", fileSize: "8.9 MB", status: "Active" },
  ],

  // System Information
  createdBy: "Rahul Sharma",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "17 Jun 2024 03:45 PM",
  workflowStage: "Review",

  auditTrail: [
    { id: "log-pl-01", timestamp: "10 Jun 2024 09:15 AM", user: "Rahul Sharma", action: "Create Pilot Production Project", description: "Created Pilot Production PILOT-2024-0078 for Autonomous W-EVSE.", stage: "Stage 1 - Production Planning" },
    { id: "log-pl-02", timestamp: "11 Jun 2024 11:30 AM", user: "Vikram Singh", action: "Production Allocation", description: "Allocated Production Line-02 and assigned OP-Team-02.", stage: "Stage 1 - Production Planning" },
    { id: "log-pl-03", timestamp: "14 Jun 2024 02:15 PM", user: "Priya Nair", action: "Execute Pilot Manufacturing", description: "Completed 982 actual units out of 1,000 planned.", stage: "Stage 2 - Pilot Manufacturing" },
    { id: "log-pl-04", timestamp: "16 Jun 2024 04:45 PM", user: "Neha Reddy", action: "Quality & Process Performance Verification", description: "Verified FPY 96.4%, Cpk 1.53, and 6 readiness checks.", stage: "Stage 3 - Quality Verification" },
    { id: "log-pl-05", timestamp: "17 Jun 2024 03:45 PM", user: "Rahul Sharma", action: "Submit for Executive Review", description: "Submitted Pilot Production package for Review Board sign-off.", stage: "Stage 4 - Executive Review" },
  ],
};

let currentPilotProductionRecordState: PilotProductionRecord = { ...INITIAL_PILOT_PRODUCTION_RECORD };

export const getPilotProductionRecordFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentPilotProductionRecordState };
});

export const savePilotProductionDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { input: PilotProductionFormInput })
  .handler(async ({ data }) => {
    currentPilotProductionRecordState = {
      ...currentPilotProductionRecordState,
      ...data.input,
      lastModifiedBy: "Current User",
      lastModifiedDate: new Date().toLocaleString(),
      workflowStatus: "Draft",
    };
    return { success: true, data: currentPilotProductionRecordState };
  });

export const submitPilotProductionFn = createServerFn({ method: "POST" }).handler(async () => {
  currentPilotProductionRecordState = {
    ...currentPilotProductionRecordState,
    workflowStatus: "In Review",
    workflowStage: "Review",
    lastModifiedBy: "Current User",
    lastModifiedDate: new Date().toLocaleString(),
  };
  return { success: true, data: currentPilotProductionRecordState };
});
