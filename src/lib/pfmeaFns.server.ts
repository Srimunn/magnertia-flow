import { createServerFn } from "@tanstack/react-start";
import type {
  PfmeaRecord,
  PfmeaFormInput,
  PfmeaFailureMode,
  PfmeaApprovalDecision,
} from "@/services/types";

export const INITIAL_PFMEA_RECORD: PfmeaRecord = {
  id: "pfmea-rec-00078",
  pfmeaId: "PFMEA-2024-00078",
  formCode: "PFMEA-2024-25",
  pfmeaTitle: "Enclosure Assembly Process PFMEA",
  pfmeaNumber: "PFMEA-AW-EVSE-001",
  pfmeaVersion: "2.1",
  product: "Autonomous W-EVSE",
  productRevision: "REV-2.1",
  manufacturingProcess: "Enclosure Assembly",
  processOwner: "Rahul Sharma",
  apqpRef: "APQP-AW-EVSE-001",
  workflowStatus: "In Progress",

  // PFMEA Overview
  productFamily: "EV Charging Solutions",
  productionLine: "EV Assembly Line 2",
  workCentre: "MC-01 to AS-03",
  processFlowRef: "PFD-AW-EVSE-001",
  routingRef: "RTG-AW-EVSE-001",
  projectScope: "Process Failure Mode and Effects Analysis covering sheet metal cutting, bending, robotic MIG welding, surface grinding, powder coating, SMT assembly, sub-assemblies, and final 22kW testing.",
  lifecycleStage: "Risk Analysis",
  priority: "High",

  // Scores & Key Stats
  functionReadinessScore: 86,
  validationScore: 82,
  aiHealthScore: 88,
  openHighRiskItems: 6,
  overallPfmeaReadinessScore: 84,
  topRpnBefore: 384,
  topRpnAfter: 96,

  // 8 Failure Modes (Matching Mockup Image)
  failureModes: [
    {
      id: "fm-01",
      stepNo: 1,
      processStep: "Incoming Material Inspection",
      potentialFailureMode: "Incorrect Material",
      severity: 8,
      potentialEffect: "Assembly failure, poor fit",
      occurrence: 3,
      potentialCause: "Supplier mix-up",
      currentControls: "Incoming inspection, COA check",
      detection: 4,
      actionPriority: "High (H)",
      rpnBefore: 96,
      rpnAfter: 24,
      status: "In Progress",
    },
    {
      id: "fm-02",
      stepNo: 2,
      processStep: "Enclosure Body Cutting",
      potentialFailureMode: "Dimensional Deviation",
      severity: 7,
      potentialEffect: "Poor assembly fit",
      occurrence: 4,
      potentialCause: "Machine misalignment",
      currentControls: "First off check, in-process check",
      detection: 5,
      actionPriority: "High (H)",
      rpnBefore: 140,
      rpnAfter: 40,
      status: "In Progress",
    },
    {
      id: "fm-03",
      stepNo: 3,
      processStep: "Enclosure Bending",
      potentialFailureMode: "Bend Angle Out of Spec",
      severity: 8,
      potentialEffect: "Gap in assembly, IP rating issue",
      occurrence: 3,
      potentialCause: "Tool wear, wrong setup",
      currentControls: "Setup verification, angle check",
      detection: 4,
      actionPriority: "High (H)",
      rpnBefore: 96,
      rpnAfter: 32,
      status: "Open",
    },
    {
      id: "fm-04",
      stepNo: 4,
      processStep: "Enclosure Welding",
      potentialFailureMode: "Porosity in Weld",
      severity: 9,
      potentialEffect: "Leakage, structural failure",
      occurrence: 2,
      potentialCause: "Improper welding parameter",
      currentControls: "Weld parameter check, VT",
      detection: 3,
      actionPriority: "High (H)",
      rpnBefore: 54,
      rpnAfter: 18,
      status: "Open",
    },
    {
      id: "fm-05",
      stepNo: 5,
      processStep: "Surface Grinding",
      potentialFailureMode: "Surface Roughness High",
      severity: 6,
      potentialEffect: "Poor finish, aesthetic issue",
      occurrence: 4,
      potentialCause: "Abrasive wheel wear",
      currentControls: "Roughness check, wheel change",
      detection: 4,
      actionPriority: "Medium (M)",
      rpnBefore: 96,
      rpnAfter: 32,
      status: "In Progress",
    },
    {
      id: "fm-06",
      stepNo: 6,
      processStep: "Powder Coating",
      potentialFailureMode: "Coating Thickness Low",
      severity: 7,
      potentialEffect: "Corrosion risk",
      occurrence: 3,
      potentialCause: "Insufficient coating",
      currentControls: "Thickness check, adhesion test",
      detection: 4,
      actionPriority: "Medium (M)",
      rpnBefore: 84,
      rpnAfter: 28,
      status: "In Progress",
    },
    {
      id: "fm-07",
      stepNo: 7,
      processStep: "PCB Assembly",
      potentialFailureMode: "Solder Joint Defect",
      severity: 9,
      potentialEffect: "Electrical failure",
      occurrence: 3,
      potentialCause: "Incorrect solder profile",
      currentControls: "AOI, SPI, solder profile check",
      detection: 3,
      actionPriority: "High (H)",
      rpnBefore: 81,
      rpnAfter: 27,
      status: "In Progress",
    },
    {
      id: "fm-08",
      stepNo: 8,
      processStep: "Final Assembly",
      potentialFailureMode: "Loose Fastener",
      severity: 6,
      potentialEffect: "Rattle, component damage",
      occurrence: 5,
      potentialCause: "Improper tightening",
      currentControls: "Torque check, visual check",
      detection: 4,
      actionPriority: "Medium (M)",
      rpnBefore: 120,
      rpnAfter: 48,
      status: "Open",
    },
  ],

  // Top 5 Recommended Actions (Matching Mockup Image)
  recommendedActions: [
    {
      id: "act-01",
      action: "Implement inline weld monitoring sensor",
      responsible: "Vikram Singh",
      targetDate: "15 Jul 2024",
      status: "In Progress",
      rpnAfter: 18,
    },
    {
      id: "act-02",
      action: "Add poka-yoke for raw material loading",
      responsible: "Neha Reddy",
      targetDate: "10 Jul 2024",
      status: "Open",
      rpnAfter: 24,
    },
    {
      id: "act-03",
      action: "Standardize CNC press brake machine setup",
      responsible: "Arun Kumar",
      targetDate: "12 Jul 2024",
      status: "In Progress",
      rpnAfter: 40,
    },
    {
      id: "act-04",
      action: "Improve SMT reflow solder profile control",
      responsible: "Priya Nair",
      targetDate: "18 Jul 2024",
      status: "In Progress",
      rpnAfter: 27,
    },
    {
      id: "act-05",
      action: "Torque control wrench for final assembly",
      responsible: "Rakesh Patel",
      targetDate: "11 Jul 2024",
      status: "Open",
      rpnAfter: 48,
    },
  ],

  // Manufacturing Validation
  processValidationStatus: true,
  pilotProductionStatus: true,
  capacityCpk: 1.67,
  msaRef: "MSA-ENCL-001",
  controlPlanRef: "CP-ENCL-001",
  validationNotes: "Pilot trial completed on 50 units. Cp/Cpk 1.67/1.58 achieved on critical weld seam and IP67 torque.",

  // AI Risk Assessment
  aiAssessment: {
    healthScore: 88,
    failurePrediction: "6 failure modes with high RPN identified in welding and SMT reflow operations.",
    riskPatternAnalysis: "Enclosure Welding is top risk area (RPN 54 after action vs 140 before). Overall risk reduced by 24%.",
    correctiveActionSuggestions: "Improve welding parameter control and add inline optical monitoring sensor.",
    processOptimization: "Defect rate likely to reduce by 15% after implementation of poka-yoke fixtures.",
    preventiveRecommendations: "Mandate daily calibration of MIG welding gas flow meters.",
  },

  // PFMEA Summary
  recommendation: "Release for Production",

  // Review & Approvals
  approvalDecision: "Approved with Conditions",
  reviewers: [
    { role: "Manufacturing Engineer", person: "Rahul Sharma", decision: "Approved", date: "18 Jun 2024", comments: "Process functions and failure modes validated.", status: "Approved" },
    { role: "Process Engineer", person: "Vikram Singh", decision: "Approved", date: "19 Jun 2024", comments: "Controls and recommended actions approved.", status: "Approved" },
    { role: "Quality Engineer", person: "Neha Reddy", decision: "Approved", date: "19 Jun 2024", comments: "Severity and Occurrence ratings verified.", status: "Approved" },
    { role: "Production Manager", person: "Arun Kumar", decision: "Approved", date: "20 Jun 2024", comments: "Target completion dates for actions confirmed.", status: "Approved" },
    { role: "APQP Manager", person: "Rahul Sharma", decision: "Approved", date: "21 Jun 2024", comments: "PFMEA aligned with APQP Phase 3 deliverables.", status: "Approved" },
    { role: "Plant Head", person: "Sankaran R.", decision: "Approved with Conditions", date: "24 Jun 2024", comments: "Approved subject to inline weld sensor installation.", status: "Approved" },
    { role: "COO", person: "Sankaran R.", decision: "Approved", date: "25 Jun 2024", comments: "Executive approval granted for production release.", status: "Approved" },
  ],

  attachments: [
    { id: "att-pfmea-01", fileName: "pfmea_worksheet_v2.1.pdf", fileType: "PDF Document", documentType: "PFMEA Worksheet", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "01 Jul 2024", fileSize: "2.4 MB", status: "Active" },
    { id: "att-pfmea-02", fileName: "process_flow.pdf", fileType: "PDF Document", documentType: "Process Flow Diagram", version: "2.1", uploadedBy: "Neha Reddy", uploadedDate: "25 Jun 2024", fileSize: "3.1 MB", status: "Active" },
    { id: "att-pfmea-03", fileName: "control_plan_ref.pdf", fileType: "PDF Document", documentType: "Control Plan Ref", version: "1.0", uploadedBy: "Arun Kumar", uploadedDate: "25 Jun 2024", fileSize: "1.8 MB", status: "Active" },
    { id: "att-pfmea-04", fileName: "work_instructions.pdf", fileType: "PDF Document", documentType: "Work Instructions", version: "2.0", uploadedBy: "Vikram Singh", uploadedDate: "20 Jun 2024", fileSize: "4.5 MB", status: "Active" },
    { id: "att-pfmea-05", fileName: "validation_report.pdf", fileType: "PDF Document", documentType: "Validation Report", version: "1.0", uploadedBy: "Arun Kumar", uploadedDate: "30 Jun 2024", fileSize: "2.9 MB", status: "Active" },
    { id: "att-pfmea-06", fileName: "apqp_ref.pdf", fileType: "PDF Document", documentType: "APQP Reference", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "18 Jun 2024", fileSize: "1.9 MB", status: "Active" },
    { id: "att-pfmea-07", fileName: "sop_documents.pdf", fileType: "PDF Document", documentType: "SOP Documents", version: "1.5", uploadedBy: "Neha Reddy", uploadedDate: "19 Jun 2024", fileSize: "3.6 MB", status: "Active" },
    { id: "att-pfmea-08", fileName: "supporting_docs.zip", fileType: "ZIP Archive", documentType: "Supporting Documents", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "20 Jun 2024", fileSize: "8.2 MB", status: "Active" },
  ],

  // System Information
  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 09:15 AM",
  effectiveDate: "18 Jun 2024",
  nextReviewDate: "18 Dec 2024",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "01 Aug 2026 10:30 AM",
  workflowStage: "Review by PFMEA Board",
  version: 2.1,
  distribution: ["Manufacturing", "Quality", "Process Engineering", "APQP"],

  auditTrail: [
    { id: "log-pfmea-01", timestamp: "18 Jun 2024 09:15 AM", user: "Rahul Sharma", action: "Create PFMEA Project", description: "Created PFMEA Project PFMEA-2024-00078 for Enclosure Assembly.", stage: "Stage 1 - Process Function Analysis" },
    { id: "log-pfmea-02", timestamp: "19 Jun 2024 11:30 AM", user: "Vikram Singh", action: "Identify Failure Modes", description: "Defined 8 process failure modes across steps 1 to 8.", stage: "Stage 2 - Failure Mode Analysis" },
    { id: "log-pfmea-03", timestamp: "20 Jun 2024 02:15 PM", user: "Neha Reddy", action: "RPN Calculation", description: "Calculated S x O x D ratings. High RPN items identified.", stage: "Stage 2 - Failure Mode Analysis" },
    { id: "log-pfmea-04", timestamp: "21 Jun 2024 04:45 PM", user: "Arun Kumar", action: "Recommended Actions", description: "Created 5 recommended actions to reduce welding and assembly RPN.", stage: "Stage 3 - Risk Mitigation" },
    { id: "log-pfmea-05", timestamp: "25 Jun 2024 05:00 PM", user: "Sankaran R.", action: "Executive Approval", description: "PFMEA Review Board approved risk mitigation plan.", stage: "Stage 4 - Executive Review" },
  ],
};

let currentPfmeaRecordState: PfmeaRecord = { ...INITIAL_PFMEA_RECORD };

export const getPfmeaRecordFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentPfmeaRecordState };
});

export const savePfmeaDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { input: PfmeaFormInput })
  .handler(async ({ data }) => {
    currentPfmeaRecordState = {
      ...currentPfmeaRecordState,
      ...data.input,
      lastModifiedBy: "Current User",
      lastModifiedDate: new Date().toLocaleString(),
      workflowStatus: "Draft",
    };
    return { success: true, data: currentPfmeaRecordState };
  });

export const submitPfmeaFn = createServerFn({ method: "POST" }).handler(async () => {
  currentPfmeaRecordState = {
    ...currentPfmeaRecordState,
    workflowStatus: "In Review",
    workflowStage: "Review by PFMEA Board",
    lastModifiedBy: "Current User",
    lastModifiedDate: new Date().toLocaleString(),
  };
  return { success: true, data: currentPfmeaRecordState };
});

export const addFailureModeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as Omit<PfmeaFailureMode, "id">)
  .handler(async ({ data }) => {
    const rpnBefore = data.severity * data.occurrence * data.detection;
    const newFm: PfmeaFailureMode = {
      ...data,
      id: `fm-${Date.now()}`,
      rpnBefore,
    };
    const updatedFms = [...currentPfmeaRecordState.failureModes, newFm];
    currentPfmeaRecordState = {
      ...currentPfmeaRecordState,
      failureModes: updatedFms,
      lastModifiedDate: new Date().toLocaleString(),
    };
    return { success: true, data: currentPfmeaRecordState };
  });
