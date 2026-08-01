import { createServerFn } from "@tanstack/react-start";
import type {
  ProcessValidationRecord,
  ProcessValidationFormInput,
  ValidationTrialRunSummary,
} from "@/services/types";

export const INITIAL_PROCESS_VALIDATION_RECORD: ProcessValidationRecord = {
  id: "pv-rec-00078",
  validationId: "PV-2024-00078",
  formCode: "PVDF-2024-25",
  validationTitle: "Enclosure Assembly Process Validation",
  validationNumber: "PV-ENCL-AW-001",
  version: 2.1,
  workflowStatus: "In Progress",

  // Form Information
  product: "Autonomous W-EVSE",
  productRevision: "REV-2.1",
  manufacturingProcess: "Enclosure Assembly",
  productionLine: "Line-02",
  apqpRef: "APQP-AW-EVSE-001",
  controlPlanRef: "CP-ENCL-AW-001",
  processOwner: "Rahul Sharma",

  // Validation Overview
  validationType: "Performance Qualification (PQ)",
  validationScope: "Enclosure assembly operations including welding, sealing, fastening, and final test.",
  validationObjective: "Validate that the process consistently produces conforming products that meet all specifications.",
  processOwnerName: "Vikram Singh",
  validationTeam: [
    { name: "Vikram Singh", role: "Manufacturing Engineer" },
    { name: "Neha Reddy", role: "Quality Engineer" },
    { name: "Rahul Sharma", role: "Quality Engineer" },
    { name: "Arun Kumar", role: "Process Engineer" },
    { name: "Priya Nair", role: "Production Manager" },
    { name: "Rakesh Patel", role: "APQP Manager" },
  ],
  location: "Plant-01",
  lifecycleStage: "Validation",
  priority: "High",

  // Manufacturing Process Information
  processFlowRef: "PFD-ENCL-AW-001",
  routingRef: "RTG-ENCL-AW-001",
  processStep: "OP-40 Enclosure Welding & Assembly",
  workCentre: "WC-ENCL-01",
  machineEquipment: "Robotic Weld Station #02",
  toolingRef: "TL-ENCL-WELD-04",
  workInstructionRef: "WI-ENCL-20",
  sopRef: "SOP-ENCL-05",

  // Validation Plan
  validationProtocolFile: "Validation Protocol v2.1.pdf",
  validationMethod: "Trial Run",
  acceptanceCriteria: "Zero critical defects, FPY >= 98.5%, Cp >= 1.5, Cpk >= 1.33 across 1,500 continuous trial parts.",
  sampleSize: 100,
  trialRunQuantity: 1500,
  startDate: "10 Jun 2024",
  endDate: "17 Jun 2024",
  validationStatus: "In Progress",

  trialRunSummary: {
    totalPartsProduced: 1500,
    conformingParts: 1487,
    nonConformingParts: 13,
    currentFpy: 99.13,
    defectRate: 0.87,
  },

  defectDistribution: [
    { category: "Weld Porosity", count: 5, percentage: 38.46, color: "#ef4444" },
    { category: "Seal Leakage", count: 3, percentage: 23.08, color: "#f59e0b" },
    { category: "Dim Out of Spec", count: 2, percentage: 15.38, color: "#3b82f6" },
    { category: "Surface Scratch", count: 2, percentage: 15.38, color: "#06b6d4" },
    { category: "Other", count: 1, percentage: 7.70, color: "#8b5cf6" },
  ],

  // Process Capability Verification
  cp: 1.67,
  cpk: 1.58,
  processStability: "Good",
  spcStatus: true,
  msaRef: "MSA-ENCL-001",
  gaugeRrrResult: "Acceptable",
  capabilityStatus: "Capable",
  capabilityScore: 87,

  // Quality Verification
  incomingInspection: true,
  inProcessInspection: true,
  finalInspection: true,
  defectRate: 0.87,
  fpy: 99.13,
  scrapRate: 0.40,
  reworkRate: 0.47,
  validationScore: 85,

  // Equipment & Production Readiness
  machineQualification: "Qualified",
  toolQualification: "Qualified",
  preventiveMaintenanceStatus: true,
  operatorQualification: "Qualified",
  trainingStatus: true,
  safetyVerification: true,
  productionReadinessScore: 86,

  // AI Assessment
  aiAssessment: {
    healthScore: 88,
    capabilityAnalysis: "Process capability is within acceptable limits (Cp: 1.67, Cpk: 1.58).",
    processStabilityPrediction: "High stability expected for next 30 days based on control charts.",
    defectPrediction: "Defect rate likely to remain below 1.0% under current parameters.",
    optimizationSuggestions: "Optimize welding current parameter by +3% to reduce porosity variation.",
    preventiveRecommendations: "Implement preventive maintenance for welding gun every 500 cycles.",
  },

  // Validation Summary & Recommendation
  recommendation: "Approve Process",
  overallValidationReadiness: 86,

  // Review & Approvals (7 Roles)
  approvalDecision: "Approved",
  reviewers: [
    { role: "Manufacturing Engineer", person: "Vikram Singh", decision: "Approved", date: "10 Jun 2024", comments: "Trial run metrics and machine qualifications verified.", status: "Approved" },
    { role: "Quality Engineer", person: "Neha Reddy", decision: "Approved", date: "12 Jun 2024", comments: "Cpk 1.58 exceeds 1.33 minimum requirement.", status: "Approved" },
    { role: "Production Manager", person: "Priya Nair", decision: "Approved", date: "14 Jun 2024", comments: "Production line throughput and operator qualifications confirmed.", status: "Approved" },
    { role: "Process Engineer", person: "Arun Kumar", decision: "Approved", date: "15 Jun 2024", comments: "Tooling and process parameters validated.", status: "Approved" },
    { role: "APQP Manager", person: "Rakesh Patel", decision: "Approved", date: "16 Jun 2024", comments: "APQP Gate 4 validation criteria met.", status: "Pending" },
    { role: "Plant Head", person: "Sankaran R.", decision: "Approved with Conditions", date: "17 Jun 2024", comments: "Pending final safety audit review.", status: "Pending" },
    { role: "COO", person: "Sankaran R.", decision: "Approved", date: "17 Jun 2024", comments: "Executive approval pending PPAP submission.", status: "Pending" },
  ],

  // Attachments (9 Files)
  attachments: [
    { id: "att-pv-01", fileName: "Validation Protocol v2.1.pdf", fileType: "PDF Document", documentType: "Validation Protocol", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "10 Jun 2024", fileSize: "2.8 MB", status: "Active" },
    { id: "att-pv-02", fileName: "Trial Run Report.pdf", fileType: "PDF Document", documentType: "Trial Run Report", version: "1.0", uploadedBy: "Vikram Singh", uploadedDate: "16 Jun 2024", fileSize: "4.2 MB", status: "Active" },
    { id: "att-pv-03", fileName: "SPC Reports.zip", fileType: "ZIP Archive", documentType: "SPC Reports", version: "1.0", uploadedBy: "Neha Reddy", uploadedDate: "16 Jun 2024", fileSize: "5.1 MB", status: "Active" },
    { id: "att-pv-04", fileName: "MSA Report.pdf", fileType: "PDF Document", documentType: "MSA Report", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "15 Jun 2024", fileSize: "3.4 MB", status: "Active" },
    { id: "att-pv-05", fileName: "Control Plan.pdf", fileType: "PDF Document", documentType: "Control Plan", version: "2.1", uploadedBy: "Arun Kumar", uploadedDate: "01 Jun 2024", fileSize: "1.8 MB", status: "Active" },
    { id: "att-pv-06", fileName: "PFMEA Report.pdf", fileType: "PDF Document", documentType: "PFMEA Report", version: "2.1", uploadedBy: "Vikram Singh", uploadedDate: "28 May 2024", fileSize: "2.6 MB", status: "Active" },
    { id: "att-pv-07", fileName: "PPAP Documents.pdf", fileType: "PDF Document", documentType: "PPAP Documents", version: "1.0", uploadedBy: "Neha Reddy", uploadedDate: "14 Jun 2024", fileSize: "6.2 MB", status: "Active" },
    { id: "att-pv-08", fileName: "Quality Reports.pdf", fileType: "PDF Document", documentType: "Quality Reports", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "16 Jun 2024", fileSize: "3.9 MB", status: "Active" },
    { id: "att-pv-09", fileName: "Supporting Documents.zip", fileType: "ZIP Archive", documentType: "Supporting Documents", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "16 Jun 2024", fileSize: "8.4 MB", status: "Active" },
  ],

  // System Information
  createdBy: "Rahul Sharma",
  createdDate: "10 Jun 2024 09:15 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "17 Jun 2024 03:45 PM",
  workflowStage: "Review",

  auditTrail: [
    { id: "log-pv-01", timestamp: "10 Jun 2024 09:15 AM", user: "Rahul Sharma", action: "Create Process Validation Project", description: "Created Validation Project PV-2024-00078 for Enclosure Assembly.", stage: "Stage 1 - Validation Planning" },
    { id: "log-pv-02", timestamp: "11 Jun 2024 11:30 AM", user: "Vikram Singh", action: "Upload Validation Protocol", description: "Uploaded Validation Protocol v2.1 and set trial run quantity to 1,500 units.", stage: "Stage 1 - Validation Planning" },
    { id: "log-pv-03", timestamp: "14 Jun 2024 02:15 PM", user: "Neha Reddy", action: "Execute Trial Production", description: "Completed 1,500 trial parts run with 1,487 conforming (99.13% FPY).", stage: "Stage 2 - Trial Production" },
    { id: "log-pv-04", timestamp: "16 Jun 2024 04:45 PM", user: "Arun Kumar", action: "Process Capability Verification", description: "Verified Cp = 1.67, Cpk = 1.58, and SPC charts.", stage: "Stage 3 - Capability Verification" },
    { id: "log-pv-05", timestamp: "17 Jun 2024 03:45 PM", user: "Rahul Sharma", action: "Submit for Executive Review", description: "Submitted Process Validation package for review board approval.", stage: "Stage 4 - Executive Review" },
  ],
};

let currentProcessValidationRecordState: ProcessValidationRecord = { ...INITIAL_PROCESS_VALIDATION_RECORD };

export const getProcessValidationRecordFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentProcessValidationRecordState };
});

export const saveProcessValidationDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { input: ProcessValidationFormInput })
  .handler(async ({ data }) => {
    currentProcessValidationRecordState = {
      ...currentProcessValidationRecordState,
      ...data.input,
      lastModifiedBy: "Current User",
      lastModifiedDate: new Date().toLocaleString(),
      workflowStatus: "Draft",
    };
    return { success: true, data: currentProcessValidationRecordState };
  });

export const submitProcessValidationFn = createServerFn({ method: "POST" }).handler(async () => {
  currentProcessValidationRecordState = {
    ...currentProcessValidationRecordState,
    workflowStatus: "In Review",
    workflowStage: "Review",
    lastModifiedBy: "Current User",
    lastModifiedDate: new Date().toLocaleString(),
  };
  return { success: true, data: currentProcessValidationRecordState };
});

export const updateTrialRunSummaryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as ValidationTrialRunSummary)
  .handler(async ({ data }) => {
    currentProcessValidationRecordState = {
      ...currentProcessValidationRecordState,
      trialRunSummary: data,
      lastModifiedDate: new Date().toLocaleString(),
    };
    return { success: true, data: currentProcessValidationRecordState };
  });
