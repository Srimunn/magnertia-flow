import { createServerFn } from "@tanstack/react-start";
import type {
  SopApprovalDecision,
  SopAttachment,
  SopFormInput,
  SopRecord,
  SopResourceItem,
  SopReviewer,
  SopStepItem,
} from "@/services/types";

/* ===========================================================================
   SOP Development — Server Functions & Calculation Engine
   =========================================================================== */

export function calculateSopScores(record: Partial<SopRecord>) {
  const procedure = record.procedureReadinessScore ?? 85;
  const compliance = record.complianceScore ?? 90;
  const risk = record.riskScore ?? 82;
  const training = record.trainingScore ?? 88;
  const aiDoc = record.aiDocumentationScore ?? 91;

  const overallScore = Math.round(
    procedure * 0.20 + compliance * 0.25 + risk * 0.20 + training * 0.15 + aiDoc * 0.20
  );

  const totalMins = (record.steps || []).reduce(
    (sum, step) => sum + (step.durationMins || 0),
    0
  );

  return {
    procedureReadinessScore: procedure,
    complianceScore: compliance,
    riskScore: risk,
    trainingScore: training,
    aiDocumentationScore: aiDoc,
    overallReadinessScore: overallScore,
    totalDurationMins: totalMins > 0 ? totalMins : record.totalDurationMins ?? 45,
  };
}

export const DEFAULT_SOP_STEPS: SopStepItem[] = [
  {
    id: "sop-step-1",
    stepNumber: 1,
    description: "Review production plan and work order.",
    responsibleRole: "Production Supervisor",
    durationMins: 5,
    requiredDocuments: "Work Order WO-2024-889",
    notes: "Verify target quantities and shift schedule",
    safetyCheck: "Standard ESD attire",
    qualityCheck: "Work order sign-off",
  },
  {
    id: "sop-step-2",
    stepNumber: 2,
    description: "Verify material availability and quality.",
    responsibleRole: "Store In-charge",
    durationMins: 5,
    requiredDocuments: "BOM List v2.0",
    notes: "Check lot numbers and shelf life stickers",
    safetyCheck: "Material handling gloves",
    qualityCheck: "Visual raw material inspection",
  },
  {
    id: "sop-step-3",
    stepNumber: 3,
    description: "Setup machine and parameters as per process sheet.",
    responsibleRole: "Maintenance Technician",
    durationMins: 10,
    requiredDocuments: "Setup Guide SG-ACCU-01",
    notes: "Calibrate sensor limits and pneumatic pressure (6.0 Bar)",
    safetyCheck: "Check emergency stop button response",
    qualityCheck: "Parametric calibration check",
  },
  {
    id: "sop-step-4",
    stepNumber: 4,
    description: "Start production and monitor key parameters.",
    responsibleRole: "Operator",
    durationMins: 10,
    requiredDocuments: "Process Monitoring Log",
    notes: "Observe temperature telemetry and cycle times",
    safetyCheck: "Wear safety glasses and anti-static wristband",
    qualityCheck: "First-piece sample verification",
  },
  {
    id: "sop-step-5",
    stepNumber: 5,
    description: "In-process inspection and quality check.",
    responsibleRole: "Quality Inspector",
    durationMins: 5,
    requiredDocuments: "Control Plan CP-ACCU-001",
    notes: "Perform dimensional check using digital calipers",
    safetyCheck: "Insulated glove inspection",
    qualityCheck: "First-off inspection passed",
  },
  {
    id: "sop-step-6",
    stepNumber: 6,
    description: "Record and update production data.",
    responsibleRole: "Operator",
    durationMins: 5,
    requiredDocuments: "MES Digital Terminal Entry",
    notes: "Log completed quantity, scrap count, and downtime causes",
    safetyCheck: "Clear workspace debris",
    qualityCheck: "Traceability QR code tagged",
  },
  {
    id: "sop-step-7",
    stepNumber: 7,
    description: "Perform end-of-shift line clearance and 5S audit.",
    responsibleRole: "Operator",
    durationMins: 5,
    requiredDocuments: "5S Inspection Checklist",
    notes: "Clean workstation surfaces and return tools to shadow board",
    safetyCheck: "Power off non-essential machinery",
    qualityCheck: "Shadow board 100% complete",
  },
];

export const DEFAULT_SOP_RESOURCES: SopResourceItem[] = [
  { id: "res-1", category: "Required Equipment", name: "SMT Pick & Place Machine", itemCount: 2, status: "Verified" },
  { id: "res-2", category: "Required Equipment", name: "Automatic Reflow Oven", itemCount: 1, status: "Verified" },
  { id: "res-3", category: "Required Tools", name: "Calibrated Torque Screwdrivers", itemCount: 8, status: "Verified" },
  { id: "res-4", category: "Required Tools", name: "Digital Multimeters", itemCount: 4, status: "Verified" },
  { id: "res-5", category: "Software Systems", name: "Magnertia MES & ERP System", itemCount: 1, status: "Verified" },
  { id: "res-6", category: "Forms & Templates", name: "First-Off Inspection Form", itemCount: 6, status: "Verified" },
  { id: "res-7", category: "Input Documents", name: "Engineering Design Drawings", itemCount: 4, status: "Verified" },
  { id: "res-8", category: "Output Documents", name: "Batch Production Record", itemCount: 5, status: "Verified" },
];

export const DEFAULT_SOP_RECORD: SopRecord = {
  id: "sop-rec-00123",
  sopId: "SOP-2024-00123",
  formCode: "SOPD-2024-25",
  title: "Manufacturing Process Control & Monitoring SOP",
  sopNumber: "SOP-MFG-001",
  revision: "2.0",
  workflowStatus: "In Review",
  stage: 2,
  createdOn: "18 Jun 2024 09:15 AM",
  dateCreated: "2024-06-18T09:15:00Z",
  effectiveDate: "01 Jul 2024",
  nextReviewDate: "30 Jun 2025",
  lastModified: "2024-06-20T14:45:00Z",
  lastUpdated: "20 Jun 2024 02:45 PM",

  department: "Manufacturing",
  processOwner: "Rahul Sharma",
  processOwnerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  sopCategory: "Manufacturing",
  businessFunction: "Manufacturing Operations",
  processName: "Production Process Control",
  processObjective: "Ensure standardized monitoring and control of manufacturing processes to achieve consistent quality, productivity and safety across production lines.",
  scope: "Applies to all production lines and related support functions within the manufacturing plant.",
  applicability: "All Operators, Technicians, Engineers and Supervisors involved in production operations.",
  triggerEvent: "Start of production shift / Process deviation / Equipment changeover / Quality alert.",
  expectedOutput: "Controlled and monitored production with quality output, safety compliance and data traceability.",
  priority: "High",

  totalDurationMins: 45,
  overallReadinessScore: 87,
  procedureReadinessScore: 85,
  complianceScore: 90,
  riskScore: 82,
  trainingScore: 88,
  aiDocumentationScore: 91,
  recommendation: "Publish & Release SOP",

  steps: DEFAULT_SOP_STEPS,
  resources: DEFAULT_SOP_RESOURCES,

  applicableStandards: ["ISO 9001:2015", "ISO 14001:2015", "IATF 16949"],
  regulatoryRequirements: ["Factories Act", "OSHA Compliance", "BIS Standards"],
  internalPolicies: ["Quality Policy", "EHS Policy", "Cleanroom Protocol"],
  auditRequirements: ["Internal Audit", "Customer Audit", "Third-Party ISO Audit"],
  complianceChecklist: [
    "ISO 9001:2015 Process Control Clause 8.5 ✓",
    "OSHA Workplace Safety Standard Verified ✓",
    "Cleanroom Class 10,000 Certification ✓",
    "Environmental Emission Compliance ✓",
  ],

  riskLevel: "Medium",
  riskAssessmentReport: "Risk_Assessment_Report_RA-SOP-001.pdf",
  ehsRequirements: ["PPE Required", "Machine Guarding", "Proper Ventilation", "ESD Anti-Static Wristband"],
  emergencyProcedure: "Machine Stop, First Aid, Building Evacuation Route 4",

  trainingRequired: true,
  trainingMaterial: "SOP_Training_Presentation.pdf",
  targetAudience: "Operators, Technicians, Engineers & Supervisors",
  competencyRequirement: "Level 2 Certified Operator",
  implementationDate: "01 Jul 2024",
  effectivenessVerification: true,

  aiSopReview: "SOP is well-structured, comprehensive, and follows international manufacturing best practices.",
  aiComplianceAnalysis: "Fully meets ISO 9001:2015 and ISO 14001:2015 regulatory documentation standards.",
  aiProcessOptimization: "Suggest adding automated telemetry data capture step to improve shopfloor efficiency by 12%.",
  aiRiskPrediction: "Medium risk detected in manual data entry step. Recommend barcode verification.",
  aiRevisionRecommendation: "Recommended annual review schedule: Next review due in 12 months (30 Jun 2025).",

  attachments: [
    {
      id: "sopatt-1",
      fileName: "SOP_Document_v2.0.pdf",
      fileType: "pdf",
      documentType: "SOP Document",
      version: "v2.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "1.8 MB",
      status: "Active",
    },
    {
      id: "sopatt-2",
      fileName: "Process_Flow_Diagram.png",
      fileType: "png",
      documentType: "Flowchart Diagram",
      version: "v2.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "550 KB",
      status: "Active",
    },
    {
      id: "sopatt-3",
      fileName: "Work_Instructions.zip",
      fileType: "zip",
      documentType: "Instruction Package",
      version: "v2.0",
      uploadedBy: "Vikram Singh",
      uploadedDate: "19 Jun 2024",
      fileSize: "3.2 MB",
      status: "Active",
    },
    {
      id: "sopatt-4",
      fileName: "Forms_Templates.zip",
      fileType: "zip",
      documentType: "Checklist Templates",
      version: "v1.0",
      uploadedBy: "Neha Reddy",
      uploadedDate: "19 Jun 2024",
      fileSize: "2.8 MB",
      status: "Active",
    },
    {
      id: "sopatt-5",
      fileName: "Risk_Assessment.pdf",
      fileType: "pdf",
      documentType: "Risk Report",
      version: "v1.1",
      uploadedBy: "Arun Kumar",
      uploadedDate: "20 Jun 2024",
      fileSize: "1.3 MB",
      status: "Active",
    },
    {
      id: "sopatt-6",
      fileName: "Training_Presentation.pdf",
      fileType: "pdf",
      documentType: "Training Deck",
      version: "v1.0",
      uploadedBy: "Nisha Patel",
      uploadedDate: "20 Jun 2024",
      fileSize: "4.5 MB",
      status: "Active",
    },
  ],

  reviewers: [
    { role: "Process Owner", person: "Rahul Sharma", decision: "Approved", date: "18 Jun 2024", comments: "SOP authored and validated", status: "Approved" },
    { role: "Dept. Head", person: "Vikram Singh", decision: "Approved", date: "19 Jun 2024", comments: "Process flow approved", status: "Approved" },
    { role: "Quality Manager", person: "Neha Reddy", decision: "Approved", date: "19 Jun 2024", comments: "ISO compliance verified", status: "Approved" },
    { role: "EHS Manager", person: "Arun Kumar", decision: "Approved", date: "20 Jun 2024", comments: "Safety & risk assessment cleared", status: "Approved" },
    { role: "Compliance Officer", person: "Priya Nair", decision: "Approved", date: "20 Jun 2024", comments: "Regulatory compliance confirmed", status: "Approved" },
    { role: "HR / Training Manager", person: "Nisha Patel", decision: "Pending", date: "-", comments: "Training materials under review", status: "Pending" },
    { role: "COO", person: "Sankaran R.", decision: "Pending", date: "-", comments: "Executive board review pending", status: "Pending" },
    { role: "CEO", person: "Sankaran R.", decision: "Pending", date: "-", comments: "Final release approval pending", status: "Pending" },
  ],

  approvalDecision: "Approved",
  reviewComments: "SOP-MFG-001 v2.0 approved for organization-wide manufacturing distribution.",
  approvalDate: "20 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 09:15 AM",
  lastModifiedBy: "Neha Reddy",
  lastModifiedDate: "20 Jun 2024 02:45 PM",
  workflowStageLabel: "Under Review",

  timeline: [
    { label: "SOP Authoring & Drafting", date: "18 Jun 2024", status: "Completed" },
    { label: "Compliance & Quality Review", date: "19 Jun 2024", status: "Completed" },
    { label: "Risk & Safety Assessment", date: "20 Jun 2024", status: "Completed" },
    { label: "Training Content Preparation", date: "20 Jun 2024", status: "Completed" },
    { label: "Document Control Verification", date: "In Progress", status: "In Progress" },
    { label: "Executive Board Approval", date: "Pending", status: "Pending" },
    { label: "Controlled Release to Shopfloor", date: "Pending", status: "Pending" },
  ],

  auditTrail: [
    {
      id: "soplog-001",
      timestamp: "18 Jun 2024 09:15 AM",
      user: "Rahul Sharma",
      action: "Created SOP Draft",
      description: "Authoring initiated for Manufacturing Process Control & Monitoring SOP (SOP-2024-00123).",
    },
    {
      id: "soplog-002",
      timestamp: "18 Jun 2024 02:30 PM",
      user: "Rahul Sharma",
      action: "Updated Procedure Steps",
      description: "Configured 12 step procedure sequence with responsible roles and duration.",
    },
    {
      id: "soplog-003",
      timestamp: "19 Jun 2024 11:15 AM",
      user: "Neha Reddy",
      action: "Validated ISO Compliance",
      description: "ISO 9001:2015 and ISO 14001:2015 standards verified.",
    },
    {
      id: "soplog-004",
      timestamp: "20 Jun 2024 02:45 PM",
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "SOP submitted for executive review and document control sign-off.",
      prevStatus: "Draft",
      newStatus: "Under Review",
    },
  ],
};

let currentSopRecord = { ...DEFAULT_SOP_RECORD };

export const getSopFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentSopRecord };
});

export const saveSopDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id?: string; input: Partial<SopFormInput> })
  .handler(async ({ data }) => {
    const updated = {
      ...currentSopRecord,
      ...data.input,
      lastModified: new Date().toISOString(),
      lastUpdated: new Date().toLocaleTimeString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const scores = calculateSopScores(updated);
    currentSopRecord = {
      ...updated,
      ...scores,
    };
    return { success: true, data: currentSopRecord };
  });

export const submitSopFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as string | undefined)
  .handler(async () => {
    currentSopRecord = {
      ...currentSopRecord,
      workflowStatus: "Under Review",
      lastUpdated: new Date().toLocaleString(),
    };
    currentSopRecord.auditTrail.unshift({
      id: `soplog-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "SOP submitted for executive board sign-off.",
      prevStatus: "Draft",
      newStatus: "Under Review",
    });
    return { success: true, data: currentSopRecord };
  });

export const reviewSopFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as { id: string; decision: SopApprovalDecision; comments?: string }
  )
  .handler(async ({ data }) => {
    let nextStatus = currentSopRecord.workflowStatus;
    if (data.decision === "Approved") nextStatus = "Approved";
    else if (data.decision === "Revision Required") nextStatus = "Revision Required";
    else if (data.decision === "Rejected") nextStatus = "Draft";

    currentSopRecord = {
      ...currentSopRecord,
      workflowStatus: nextStatus,
      approvalDecision: data.decision,
      reviewComments: data.comments ?? currentSopRecord.reviewComments,
      approvalDate: new Date().toLocaleDateString(),
    };

    currentSopRecord.auditTrail.unshift({
      id: `soplog-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Current User",
      action: `Review Decision: ${data.decision}`,
      description: data.comments || `Approval decision updated to ${data.decision}`,
      newStatus: nextStatus,
    });

    return { success: true, data: currentSopRecord };
  });
