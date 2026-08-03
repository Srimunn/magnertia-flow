import { createServerFn } from "@tanstack/react-start";
import type { PilotProductionRecord } from "@/lib/pilot-production/types";
import { calculateReadinessScore, calculateOverallPilotReadiness, calculateRecommendation } from "./pilot-production/scoring";

export const MOCK_PILOT_RECORD_78: PilotProductionRecord = {
  id: "PILOT-2024-00078",
  formCode: "PPFD-2024-25",
  pilotBatchTitle: "Autonomous W-EVSE Pilot Production",
  pilotBatchNumber: "PB-ENCL-AW-001",
  version: "1.0",
  workflowStatus: "In Progress",

  // Metadata Row
  product: "Autonomous W-EVSE",
  productRevision: "REV-2.1",
  manufacturingProcess: "Enclosure Assembly",
  productionLine: "Line-02",
  processValidationRef: "PV-ENCL-AW-001",
  createdDate: "10 Jun 2024",
  lastUpdated: "17 Jun 2024",
  createdBy: "Rahul Sharma",
  lastModifiedBy: "Rahul Sharma",

  // Section 1: Overview
  pilotObjective: "Validate manufacturing readiness in real shop floor conditions before mass production.",
  productionScope: "Enclosure assembly including welding, sealing, fastening, and final test.",
  productionLocation: "Plant-01",
  pilotTeam: [
    { name: "Rahul Sharma", role: "Production Manager" },
    { name: "Vikram Singh", role: "Manufacturing Engineer" },
    { name: "Neha Reddy", role: "Quality Engineer" },
    { name: "Arun Kumar", role: "Process Engineer" },
    { name: "Sankaran R.", role: "Plant Head" },
    { name: "Priya Nair", role: "Operations Lead" },
    { name: "Rakesh Patel", role: "COO" },
  ],
  processOwner: "Vikram Singh",
  scheduleStart: "2024-06-10",
  scheduleEnd: "2024-06-18",
  lifecycleStage: "Pilot Production",
  priority: "High",

  // Section 2: Production Planning
  productionOrderRef: "PO-ENCL-240610",
  bomReference: "BOM-ENCL-REV2.1",
  routingReference: "RTG-ENCL-AW-001",
  plannedQuantity: 1000,
  actualQuantity: 982,
  materialAvailability: "Available",
  materialAvailabilityAuto: true,
  machineAllocations: ["WC-01", "WC-02", "WC-03", "WC-04", "WC-05"],
  operatorAssignment: "OP-Team-02",

  // Section 3: Production Execution
  productionStart: "2024-06-10T08:00",
  productionEnd: "2024-06-15T18:45",
  productionStatus: "Completed",
  machineUtilization: 82.4,
  cycleTimeMinutes: 4.35,
  throughputUnitsPerHour: 136.5,
  downtimeHours: 2.8,
  oee: 78.6,

  // Section 4: Quality Verification
  incomingInspectionPassed: true,
  incomingInspectionAuto: true,
  inProcessInspectionPassed: true,
  inProcessInspectionAuto: true,
  finalInspectionPassed: true,
  finalInspectionAuto: true,
  defectRate: 0.68,
  fpy: 96.40,
  scrapRate: 0.42,
  reworkRate: 0.56,
  qualityScore: 90,

  // Section 5: Process Performance
  cp: 1.67,
  cpk: 1.53,
  spcStatus: "Active",
  msaStatus: "Acceptable",
  processStabilityScore: 88,
  controlPlanRef: "CP-ENCL-REV2.1",
  controlPlanCompliance: "Compliant",
  performanceScore: 87,
  stabilityTrend: [
    { date: "11 Jun", score: 82 },
    { date: "12 Jun", score: 85 },
    { date: "13 Jun", score: 87 },
    { date: "14 Jun", score: 88 },
    { date: "15 Jun", score: 86 },
    { date: "16 Jun", score: 89 },
    { date: "17 Jun", score: 88 },
  ],

  // Section 6: Production Readiness
  equipmentReadiness: true,
  equipmentReadinessAuto: true,
  toolingReadiness: true,
  toolingReadinessAuto: true,
  operatorReadiness: true,
  operatorReadinessAuto: true,
  materialReadiness: true,
  materialReadinessAuto: true,
  safetyReadiness: true,
  safetyReadinessAuto: true,
  documentationComplete: true,
  documentationCompleteAuto: true,
  productionReadinessScore: 88,

  // Section 7: AI Production Assessment
  aiProductivityAnalysis: "Overall productivity is good with potential 8.2% improvement.",
  aiQualityPrediction: "Low defect trend expected to continue.",
  aiBottleneckDetection: "Welding station (WC-05) is the potential bottleneck.",
  aiDowntimeAnalysis: "Electrical downtime contributes 36% of total downtime.",
  aiOptimizationRecommendations: "Re-balance operators and optimize changeover time.",
  aiProductionHealthScore: 88,

  // Section 8: Summary & Recommendation
  productionScore: 85,
  overallPilotReadiness: 86,
  recommendation: "Release for Mass Production",

  // Section 10: Review & Approval (7 Roles)
  approvalDecision: "Approved",
  reviewers: [
    { role: "Manufacturing Engineer", reviewer: "Vikram Singh", status: "Approved", comments: "All tooling and machine allocations cleared." },
    { role: "Production Manager", reviewer: "Priya Nair", status: "Approved", comments: "Target throughput of 136.5 units/hr reached." },
    { role: "Quality Engineer", reviewer: "Neha Reddy", status: "Approved", comments: "First pass yield of 96.4% meets threshold." },
    { role: "Process Engineer", reviewer: "Arun Kumar", status: "Approved", comments: "Cp=1.67, Cpk=1.53 within specs." },
    { role: "Plant Head", reviewer: "Sankaran R.", status: "Pending" },
    { role: "Operations Head", reviewer: "Rakesh Patel", status: "Pending" },
    { role: "COO", reviewer: "Sankaran R.", status: "Pending" },
  ],
  reviewComments: "Pilot run executed within standards. Ready for mass production.",
  approvalDate: "17 Jun 2024",

  // Section 9: Attachments
  attachments: [
    { id: "att-01", filename: "Production Report.pdf", source: "auto:mes", uploadedAt: "17 Jun 2024", fileSize: "2.4 MB", moduleName: "MES" },
    { id: "att-02", filename: "Validation Report.pdf", source: "auto:process-validation", uploadedAt: "16 Jun 2024", fileSize: "1.8 MB", moduleName: "Process Validation" },
    { id: "att-03", filename: "Control Plan.pdf", source: "auto:control-plan", uploadedAt: "15 Jun 2024", fileSize: "1.2 MB", moduleName: "Control Plan" },
    { id: "att-04", filename: "PFMEA Report.pdf", source: "auto:pfmea", uploadedAt: "15 Jun 2024", fileSize: "3.1 MB", moduleName: "PFMEA Development" },
    { id: "att-05", filename: "SPC Reports.zip", source: "auto:spc", uploadedAt: "17 Jun 2024", fileSize: "5.6 MB", moduleName: "SPC Management" },
  ],

  // System Information & History
  auditTrail: [
    { id: "at-01", timestamp: "10 Jun 2024 09:15 AM", user: "Rahul Sharma", action: "Record Created", description: "Initial pilot production record created from PV-ENCL-AW-001." },
    { id: "at-02", timestamp: "10 Jun 2024 10:30 AM", user: "Vikram Singh", action: "Planning Configured", description: "Assigned Work Centers WC-01 to WC-05." },
    { id: "at-03", timestamp: "15 Jun 2024 06:45 PM", user: "Priya Nair", action: "Execution Completed", description: "Recorded 982 actual units produced." },
    { id: "at-04", timestamp: "17 Jun 2024 02:00 PM", user: "Neha Reddy", action: "Quality Verified", description: "Final inspection passed; FPY 96.4%." },
  ],
};

let mockPilotDatabase: Record<string, PilotProductionRecord> = {
  "PILOT-2024-00078": MOCK_PILOT_RECORD_78,
};

export const getPilotProductionRecordFn = createServerFn({ method: "GET" })
  .validator((data?: { id?: string }) => data)
  .handler(async ({ data }) => {
    const id = data?.id || "PILOT-2024-00078";
    const record = mockPilotDatabase[id] || MOCK_PILOT_RECORD_78;
    return { success: true, data: record };
  });

export const listPilotProductionRecordsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: Object.values(mockPilotDatabase) };
});

export const savePilotProductionDraftFn = createServerFn({ method: "POST" })
  .validator((data: { record: PilotProductionRecord }) => data)
  .handler(async ({ data }) => {
    const updated = {
      ...data.record,
      lastUpdated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    mockPilotDatabase[updated.id] = updated;
    return { success: true, data: updated };
  });
