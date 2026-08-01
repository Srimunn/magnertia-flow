import { createServerFn } from "@tanstack/react-start";
import type {
  ApqpRecord,
  ApqpFormInput,
  ApqpApprovalDecision,
  ApqpRecommendation,
} from "@/services/types";

export const INITIAL_APQP_RECORD: ApqpRecord = {
  id: "apqp-rec-00056",
  apqpId: "APQP-2024-00056",
  formCode: "AQPL-2024-25",
  apqpProjectName: "Autonomous W-EVSE Quality Program",
  apqpNumber: "APQP-AW-EVSE-001",
  product: "Autonomous W-EVSE",
  productRevision: "REV-2.1",
  customer: "EcoVolt Mobility Pvt. Ltd.",
  apqpPhase: "Phase 3 – Process Design & Development",
  projectManager: "Rahul Sharma",
  workflowStatus: "In Progress",

  // Project Overview
  productFamily: "EV Charging Solutions",
  productModel: "AW-EVSE-7KW",
  projectScope: "Design, develop and launch of 7kW Smart EVSE Wall-Mounted Charger with IP67 weatherproof rating and 22kW resonant Wireless EV power transfer capability.",
  customerRequirements: "As per EcoVolt technical specification Rev 2.1, ISO 9001:2015, IEC 61851-1, and 5-year outdoor warranty performance requirements.",
  targetSopDate: "15 Jul 2024",
  programStatus: "In Progress",
  priority: "High",
  overallApqpScore: 84,

  // Phase Planning
  phase1Completed: true,
  phase2Completed: true,
  phase3Completed: false,
  phase4Completed: false,
  phase5Completed: false,
  phaseOwner: "Rahul Sharma",
  phaseCompletionPercentage: 65,
  phaseReadinessScore: 84,

  deliverables: [
    {
      phaseNumber: 1,
      phaseName: "Phase 1: Plan & Define Program",
      keyDeliverables: "Project Plan, Team, Scope, Customer Requirements",
      owner: "Rahul Sharma",
      targetDate: "20 Apr 2024",
      status: "Completed",
      completionPercentage: 100,
    },
    {
      phaseNumber: 2,
      phaseName: "Phase 2: Product Design & Development",
      keyDeliverables: "DFMEA, Design Review, Design Validation Plan",
      owner: "Neha Reddy",
      targetDate: "20 May 2024",
      status: "Completed",
      completionPercentage: 100,
    },
    {
      phaseNumber: 3,
      phaseName: "Phase 3: Process Design & Development",
      keyDeliverables: "PFMEA, Control Plan, Process Flow, MSA Plan",
      owner: "Vikram Singh",
      targetDate: "15 Jun 2024",
      status: "In Progress",
      completionPercentage: 65,
    },
    {
      phaseNumber: 4,
      phaseName: "Phase 4: Product & Process Validation",
      keyDeliverables: "Process Validation, PPAP, Capability Study",
      owner: "Arun Kumar",
      targetDate: "15 Jul 2024",
      status: "Pending",
      completionPercentage: 25,
    },
    {
      phaseNumber: 5,
      phaseName: "Phase 5: Launch & Continuous Improvement",
      keyDeliverables: "Launch, Lessons Learned, Continuous Improvement",
      owner: "Priya Nair",
      targetDate: "20 Aug 2024",
      status: "Pending",
      completionPercentage: 0,
    },
  ],

  // Design & Process Inputs
  dfmeaRef: "DFMEA-AW-EVSE-001",
  pfmeaRef: "PFMEA-AW-EVSE-002",
  controlPlanRef: "CP-AW-EVSE-001",
  bomRef: "BOM-AW-EVSE-001",
  routingRef: "RTG-AW-EVSE-001",
  processFlowDiagramFile: "process_flow.png",
  engineeringSpecsFile: "engineering_specs.pdf",
  designReadinessScore: 85,

  // Manufacturing & Validation
  prototypeBuildStatus: true,
  pilotBuildStatus: true,
  processCapabilityCpk: 1.67,
  msaStatus: true,
  productionTrialStatus: true,
  ppapStatus: "In Preparation",
  validationReadinessScore: 82,

  // Supplier Quality Management
  approvedSupplier: "EcoComponent Technologies",
  supplierApqpStatus: "Approved",
  supplierPpapStatus: "Submitted",
  supplierAuditScore: 92,
  incomingQualityPlanFile: "iqc_plan.pdf",
  supplierRisks: "Low risk. Dual sourcing verified for SiC MOSFET power modules.",

  // Quality Risk Assessment
  highRiskCharacteristics: "Transmitter coil assembly alignment, IP67 enclosure seam weld integrity, 22kW high voltage insulation resistance.",
  criticalControlPoints: "OP-40 Robotic MIG Welding, OP-70 SMT Reflow Soldering, OP-110 High Voltage Hi-Pot & CAN Test Bench.",
  openRisks: "3 medium risks identified in SMT thermal reflow profile under peak ambient temperatures.",
  correctiveActions: "Optimized reflow zone 4 temperature setpoint from 240°C to 245°C.",
  preventiveActions: "Automated optical inspection (AOI) feeder added to SMT line 2.",
  lessonsLearned: "Use pre-baked PCB boards to eliminate delamination during reflow pass.",
  riskReadinessScore: 78,
  costReadinessScore: 83,

  // AI Quality Assessment
  aiAssessment: {
    healthScore: 84,
    riskPrediction: "Low risk. 3 medium risks identified in thermal dissipation.",
    qualityTrendAnalysis: "Defect trend is within acceptable limits across 50 pilot units.",
    defectPrediction: "Potential defect rate: 0.42% (Low - World Class Range).",
    processOptimization: "Cycle time can be improved by 6.3% in curing oven pass.",
    supplierRiskAnalysis: "Supplier risk level: Low. Approved vendor list certified.",
  },

  // APQP Summary
  designScore: 85,
  validationScore: 82,
  supplierQualityScore: 80,
  riskScore: 78,
  apqpHealthScore: 84,
  overallProjectReadiness: 84,
  recommendation: "Release for Production",

  // Review & Approvals
  approvalDecision: "Approved with Conditions",
  reviewers: [
    { role: "APQP Manager", person: "Rahul Sharma", decision: "Approved", date: "18 Jun 2024", comments: "Project plan and milestones validated.", status: "Approved" },
    { role: "Design Manager", person: "Neha Reddy", decision: "Approved", date: "19 Jun 2024", comments: "DFMEA Rev 2.1 completed with zero high RPN items.", status: "Approved" },
    { role: "Manufacturing Manager", person: "Vikram Singh", decision: "Approved", date: "19 Jun 2024", comments: "PFMEA and Line 2 layout approved.", status: "Approved" },
    { role: "Quality Manager", person: "Arun Kumar", decision: "Approved", date: "20 Jun 2024", comments: "Control Plan and MSA Gage R&R approved.", status: "Approved" },
    { role: "Supplier Quality Manager", person: "Priya Nair", decision: "Approved", date: "21 Jun 2024", comments: "Supplier PPAP Level 3 documentation submitted.", status: "Approved" },
    { role: "Program Manager", person: "Priya Nair", decision: "Approved", date: "22 Jun 2024", comments: "Program schedule aligned for SOP on 15 Jul 2024.", status: "Approved" },
    { role: "Plant Head", person: "Sankaran R.", decision: "Approved with Conditions", date: "24 Jun 2024", comments: "Approved subject to pilot build completion by 25 Jun 2024.", status: "Approved" },
    { role: "COO", person: "Sankaran R.", decision: "Approved", date: "25 Jun 2024", comments: "Executive approval granted for production ramp-up.", status: "Approved" },
  ],

  attachments: [
    { id: "att-apqp-01", fileName: "apqp_checklist.pdf", fileType: "PDF Document", documentType: "APQP Checklist", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "18 Jun 2024", fileSize: "1.5 MB", status: "Active" },
    { id: "att-apqp-02", fileName: "dfmea_v2.pdf", fileType: "PDF Document", documentType: "DFMEA", version: "2.0", uploadedBy: "Neha Reddy", uploadedDate: "19 Jun 2024", fileSize: "3.4 MB", status: "Active" },
    { id: "att-apqp-03", fileName: "pfmea_v1.pdf", fileType: "PDF Document", documentType: "PFMEA", version: "1.2", uploadedBy: "Vikram Singh", uploadedDate: "19 Jun 2024", fileSize: "2.8 MB", status: "Active" },
    { id: "att-apqp-04", fileName: "control_plan.pdf", fileType: "PDF Document", documentType: "Control Plan", version: "1.0", uploadedBy: "Arun Kumar", uploadedDate: "20 Jun 2024", fileSize: "2.1 MB", status: "Active" },
    { id: "att-apqp-05", fileName: "process_flow.png", fileType: "PNG Image", documentType: "Process Flow Diagram", version: "2.1", uploadedBy: "Neha Reddy", uploadedDate: "18 Jun 2024", fileSize: "3.2 MB", status: "Active" },
    { id: "att-apqp-06", fileName: "ppap_folder.zip", fileType: "ZIP Archive", documentType: "PPAP Documents", version: "1.0", uploadedBy: "Priya Nair", uploadedDate: "21 Jun 2024", fileSize: "18.5 MB", status: "Active" },
    { id: "att-apqp-07", fileName: "customer_specs.pdf", fileType: "PDF Document", documentType: "Customer Requirements", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "18 Jun 2024", fileSize: "4.2 MB", status: "Active" },
    { id: "att-apqp-08", fileName: "supporting_docs.zip", fileType: "ZIP Archive", documentType: "Supporting Documents", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "20 Jun 2024", fileSize: "9.6 MB", status: "Active" },
  ],

  // System Information
  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 09:15 AM",
  effectiveDate: "18 Jun 2024",
  nextReviewDate: "18 Dec 2024",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "01 Aug 2026 10:30 AM",
  workflowStage: "Review by APQP Board",
  version: 2.1,
  distribution: ["Engineering", "Quality", "Manufacturing", "Supplier"],

  auditTrail: [
    { id: "log-apqp-01", timestamp: "18 Jun 2024 09:15 AM", user: "Rahul Sharma", action: "Create APQP Project", description: "Created APQP Project APQP-2024-00056 for Autonomous W-EVSE.", stage: "Phase 1 - Plan & Define Program" },
    { id: "log-apqp-02", timestamp: "19 Jun 2024 11:30 AM", user: "Neha Reddy", action: "Complete DFMEA", description: "DFMEA Rev 2.0 approved with 0 high severity risks.", stage: "Phase 2 - Product Design" },
    { id: "log-apqp-03", timestamp: "20 Jun 2024 02:15 PM", user: "Vikram Singh", action: "Complete PFMEA", description: "PFMEA Rev 1.2 completed and control plan linked.", stage: "Phase 3 - Process Design" },
    { id: "log-apqp-04", timestamp: "21 Jun 2024 04:45 PM", user: "Priya Nair", action: "Submit Supplier PPAP", description: "Supplier PPAP Level 3 package submitted by EcoComponent Technologies.", stage: "Phase 3 - Process Design" },
    { id: "log-apqp-05", timestamp: "25 Jun 2024 05:00 PM", user: "Sankaran R.", action: "Executive Approval", description: "Executive Review Board approved APQP for pilot build execution.", stage: "Phase 4 - Product & Process Validation" },
  ],

  upcomingMilestones: [
    { id: "ms-01", title: "Pilot Build Completion", targetDate: "25 Jun 2024", status: "In Progress" },
    { id: "ms-02", title: "PPAP Submission", targetDate: "05 Jul 2024", status: "Pending" },
    { id: "ms-03", title: "Customer Approval", targetDate: "15 Jul 2024", status: "Pending" },
    { id: "ms-04", title: "SOP Achievement", targetDate: "16 Jul 2024", status: "Pending" },
    { id: "ms-05", title: "Production Launch", targetDate: "20 Jul 2024", status: "Pending" },
  ],

  recentActivities: [
    { id: "act-01", timestamp: "2h ago", user: "Vikram Singh", action: "PFMEA Linked", description: "PFMEA linked to APQP Project", timeAgo: "2h ago" },
    { id: "act-02", timestamp: "5h ago", user: "Neha Reddy", action: "Process Flow Uploaded", description: "Process Flow Diagram uploaded v2.1", timeAgo: "5h ago" },
    { id: "act-03", timestamp: "1d ago", user: "Arun Kumar", action: "Supplier Audit Updated", description: "Supplier audit score updated to 92/100", timeAgo: "1d ago" },
    { id: "act-04", timestamp: "1d ago", user: "Rahul Sharma", action: "Phase 3 Progress", description: "APQP Phase 3 progress updated to 65%", timeAgo: "1d ago" },
  ],
};

let currentApqpRecordState: ApqpRecord = { ...INITIAL_APQP_RECORD };

export const getApqpRecordFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentApqpRecordState };
});

export const saveApqpDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { input: ApqpFormInput })
  .handler(async ({ data }) => {
    currentApqpRecordState = {
      ...currentApqpRecordState,
      ...data.input,
      lastModifiedBy: "Current User",
      lastModifiedDate: new Date().toLocaleString(),
      workflowStatus: "Draft",
    };
    return { success: true, data: currentApqpRecordState };
  });

export const submitApqpFn = createServerFn({ method: "POST" }).handler(async () => {
  currentApqpRecordState = {
    ...currentApqpRecordState,
    workflowStatus: "In Review",
    workflowStage: "Review by APQP Board",
    lastModifiedBy: "Current User",
    lastModifiedDate: new Date().toLocaleString(),
  };
  return { success: true, data: currentApqpRecordState };
});
