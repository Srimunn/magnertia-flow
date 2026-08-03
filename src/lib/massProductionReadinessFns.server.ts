import { createServerFn } from "@tanstack/react-start";
import type { MassProductionReadiness } from "@/lib/mass-production-readiness/types";

export const MOCK_READINESS_RECORD_56: MassProductionReadiness = {
  id: "RDR-2024-00056",
  formCode: "MPRF-2024-25",
  readinessTitle: "Autonomous W-EVSE Mass Production Readiness",
  readinessNumber: "MR-ENCL-AW-001",
  version: "1.0",
  workflowStatus: "In Progress",
  sopReleasedAt: null,

  // Metadata Row
  product: "Autonomous W-EVSE",
  productRevision: "REV-2.1",
  manufacturingPlant: "Plant-01",
  productionLine: "Line-02",
  pilotProductionRef: "PILOT-2024-00078",
  ppapRef: "PPAP-ENCL-2024-01",
  productionProgramRef: "AW-EVSE-24",
  createdDate: "10 Jun 2024",
  lastUpdated: "17 Jun 2024",
  createdBy: "Rahul Sharma",
  lastModifiedBy: "Rahul Sharma",

  // Section 1: Overview
  productionLaunchTarget: "2024-07-01",
  manufacturingStrategy: "Make-to-Stock (MTS)",
  launchPhase: "Mass Production Readiness",
  processOwner: "Vikram Singh",
  crossFunctionalTeam: [
    { name: "Rahul Sharma", role: "Production Manager" },
    { name: "Vikram Singh", role: "Manufacturing Lead" },
    { name: "Neha Reddy", role: "Quality Head" },
    { name: "Rajesh Patel", role: "Supply Chain Lead" },
    { name: "Arun Kumar", role: "Maintenance Lead" },
    { name: "Sankaran R.", role: "Plant Head" },
  ],
  readinessPriority: "High",
  launchObjective:
    "Ensure all systems, processes, resources and quality requirements are validated and ready for successful start of mass production.",

  // Section 2: Manufacturing Readiness
  productionLineQualified: true,
  equipmentQualification: true,
  toolingQualification: true,
  manufacturingCapacityVerified: true,
  oeeTargetAchieved: true,
  cycleTimeVerified: true,
  standardWorkAvailable: true,
  manufacturingReadinessScore: 93,

  // Section 3: Quality Readiness
  pfmeaApproved: true,
  controlPlanApproved: true,
  spcActive: true,
  msaApproved: true,
  ppapStatus: "Customer Approved",
  qualityTargetsAchieved: true,
  customerRequirementsVerified: true,
  qualityReadinessScore: 91,

  // Section 4: Supply Chain Readiness
  supplierApprovalStatus: "Approved",
  rawMaterialAvailability: true,
  safetyStockAvailable: true,
  logisticsReadiness: true,
  packagingValidation: true,
  warehouseReady: true,
  supplyChainScore: 90,

  // Section 5: Performance (Carried from Pilot)
  plannedProductionCapacityUnitsPerMonth: 12000,
  expectedDailyOutputUnits: 400,
  oee: 87.6,
  fpy: 96.2,
  scrapRate: 0.42,
  cp: 1.72,
  cpk: 1.65,
  performanceScore: 89,

  // Section 6: Operational Readiness
  operatorTrainingCompleted: true,
  maintenanceTeamReady: true,
  sparePartsAvailable: true,
  safetyAuditCompleted: true,
  emergencyResponsePlan: true,
  itMesReady: true,
  operationalReadinessScore: 89,

  // Section 7: AI Readiness Assessment
  aiProductionRiskAnalysis: "All key risks are mitigated and controlled.",
  aiCapacityPrediction: "Available capacity is sufficient with 15% buffer.",
  aiBottleneckPrediction: "Welding station WC-05 may become a bottleneck at 92% load.",
  aiQualityPrediction: "Defect rate expected to remain below 0.45%.",
  aiDemandForecast: "High demand expected in Q3-2024 (Increase 18%).",
  aiProductionReadinessScore: 94,

  // Section 8: Executive Summary
  overallMassProductionReadiness: 92,
  recommendation: "Release for Mass Production",

  // Section 9: Review & Approval (7 Roles)
  approvalDecision: "Approved",
  reviewers: [
    { role: "Manufacturing Head", reviewer: "Vikram Singh", status: "Approved", comments: "Production line 02 fully qualified." },
    { role: "Production Manager", reviewer: "Priya Nair", status: "Approved", comments: "Shift rosters and capacity cleared." },
    { role: "Quality Head", reviewer: "Neha Reddy", status: "Approved", comments: "PPAP Customer Approved package verified." },
    { role: "Supply Chain Head", reviewer: "Rajesh Patel", status: "Approved", comments: "Raw material safety stock in place." },
    { role: "Maintenance Head", reviewer: "Arun Kumar", status: "Approved", comments: "PM schedule active for WC-01 through WC-05." },
    { role: "Plant Head", reviewer: "Sankaran R.", status: "Approved", comments: "Go for Start of Production." },
    { role: "COO", reviewer: "Sanjay Matel", status: "Pending" },
  ],
  executiveComments: "All systems cleared for mass release.",
  approvalDate: "17 Jun 2024",

  // SOP Release Panel State
  sopActions: {
    releaseProductionOrders: null,
    authorizeSupplierDeliveries: null,
    releaseProductionMaterials: null,
    releaseSop: null,
  },

  // Attachments
  attachments: [
    { id: "att-mpr-01", filename: "Pilot Production Report.pdf", source: "auto:pilot-production", uploadedAt: "17 Jun 2024", fileSize: "3.2 MB", moduleName: "Pilot Production" },
    { id: "att-mpr-02", filename: "PPAP Package.zip", source: "auto:ppap-management", uploadedAt: "16 Jun 2024", fileSize: "12.4 MB", moduleName: "PPAP Management" },
    { id: "att-mpr-03", filename: "Control Plan.pdf", source: "auto:control-plan", uploadedAt: "15 Jun 2024", fileSize: "1.8 MB", moduleName: "Control Plan" },
    { id: "att-mpr-04", filename: "PFMEA Report.pdf", source: "auto:pfmea", uploadedAt: "14 Jun 2024", fileSize: "2.7 MB", moduleName: "PFMEA Development" },
    { id: "att-mpr-05", filename: "Process Validation Report.pdf", source: "auto:process-validation", uploadedAt: "14 Jun 2024", fileSize: "2.1 MB", moduleName: "Process Validation" },
    { id: "att-mpr-06", filename: "Capacity Study.pdf", source: "auto:capacity-planning", uploadedAt: "13 Jun 2024", fileSize: "1.5 MB", moduleName: "Capacity Planning" },
    { id: "att-mpr-07", filename: "Supplier Approval.pdf", source: "auto:supplier-quality", uploadedAt: "12 Jun 2024", fileSize: "1.1 MB", moduleName: "Supplier Quality" },
    { id: "att-mpr-08", filename: "Safety Audit Report.pdf", source: "auto:ehs", uploadedAt: "11 Jun 2024", fileSize: "1.9 MB", moduleName: "EHS Safety" },
  ],

  // System Information & History
  auditTrail: [
    { id: "at-rdr-01", timestamp: "10 Jun 2024 09:18 AM", user: "Rahul Sharma", action: "Record Created", description: "Created Mass Production Readiness record RDR-2024-00056 from PILOT-2024-00078." },
    { id: "at-rdr-02", timestamp: "12 Jun 2024 11:45 AM", user: "Vikram Singh", action: "Manufacturing Readiness Qualified", description: "All 7 manufacturing readiness checks verified." },
    { id: "at-rdr-03", timestamp: "16 Jun 2024 02:30 PM", user: "Neha Reddy", action: "PPAP Customer Approved", description: "Verified PPAP status Customer Approved." },
    { id: "at-rdr-04", timestamp: "17 Jun 2024 03:55 PM", user: "Rahul Sharma", action: "Submitted for Executive Review", description: "Submitted package for executive sign-off." },
  ],
};

let mockReadinessDatabase: Record<string, MassProductionReadiness> = {
  "RDR-2024-00056": MOCK_READINESS_RECORD_56,
};

export const getMassProductionReadinessFn = createServerFn({ method: "GET" })
  .validator((data?: { id?: string }) => data)
  .handler(async ({ data }) => {
    const id = data?.id || "RDR-2024-00056";
    const record = mockReadinessDatabase[id] || MOCK_READINESS_RECORD_56;
    return { success: true, data: record };
  });

export const listMassProductionReadinessFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: Object.values(mockReadinessDatabase) };
});

export const saveMassProductionReadinessFn = createServerFn({ method: "POST" })
  .validator((data: { record: MassProductionReadiness }) => data)
  .handler(async ({ data }) => {
    const updated = {
      ...data.record,
      lastUpdated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    mockReadinessDatabase[updated.id] = updated;
    return { success: true, data: updated };
  });
