import { createServerFn } from "@tanstack/react-start";
import type {
  JigApprovalDecision,
  JigAttachment,
  JigFormInput,
  JigRecord,
  JigReviewer,
} from "@/services/types";

/* ===========================================================================
   Jig Development — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateJigScores(record: Partial<JigRecord>) {
  const designScore = record.designReviewScore ?? 88;
  const manufacturingScore = record.manufacturingReadinessScore ?? 85;
  const validationScore = record.validationScore ?? 87;
  const commissioningScore = record.commissioningScore ?? 86;
  const performanceScore = record.performanceScore ?? 84;
  const aiScore = record.aiEngineeringScore ?? 89;

  // Weighted score calculation
  const overallScore = Math.round(
    designScore * 0.20 +
      manufacturingScore * 0.20 +
      validationScore * 0.20 +
      commissioningScore * 0.20 +
      performanceScore * 0.20
  );

  return {
    designReviewScore: designScore,
    manufacturingReadinessScore: manufacturingScore,
    validationScore,
    commissioningScore,
    performanceScore,
    aiEngineeringScore: aiScore,
    overallJigReadiness: overallScore,
  };
}

export const DEFAULT_JIG_RECORD: JigRecord = {
  id: "proc-jig-rec-0067",
  jigId: "JD-2024-0067",
  formCode: "JDF-2024-25",
  projectName: "EV Charger Drilling Jig",
  jigVersion: "v1.2.0",
  workflowStatus: "In Progress",
  stage: 6, // Trial Validation / Review
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProduct: { id: "PRD-EV-7KW", name: "Smart EV Charger AC 7kW" },
  linkedProcess: { id: "proc-cnc-0012", name: "CNC Drilling - Top Cover" },
  jigDesignEngineer: {
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "rahul.sharma@magnertia.com",
  },
  jigNumber: "JIG-DRL-ASSY-A-001",
  manufacturingPlant: "Magnertia Plant - 01",
  productionLine: "EV Charger Assembly Line - A",
  nextReviewDate: "25 Jun 2024",

  // Section 1: Overview
  jigName: "EV Charger Top Cover Drilling Jig",
  jigCategory: "Drilling Jig",
  productFamily: "EV Chargers",
  workstation: "WS-12: Drilling Station",
  jigPurpose: "To guide drill operations on top cover for precise hole positioning with repeatability and accuracy.",
  developmentStage: "Trial Validation",
  priority: "High",
  riskLevel: "Low",
  healthIndex: 94,

  // Section 2: Design
  cadModel: "ev_drl_jig_3d.step",
  assemblyDrawing: "ev_drl_jig_assembly.pdf",
  detailDrawings: "ev_drl_jig_details.pdf",
  bom: "ev_drl_jig_bom.xlsx",
  bushDesign: "bush_design.pdf",
  locatorDesign: "locator_design.pdf",
  clampDesign: "clamp_design.pdf",
  materialSpecification: "aisi_1045_spec.pdf",
  surfaceFinish: "Ground N5",
  designReviewScore: 88,

  // Section 3: Manufacturing
  manufacturingProcess: "CNC Milling & Drilling",
  cncProgram: "ev_drl_jig.nc",
  machineAllocation: ["CNC VMC 1", "CNC VMC 2"],
  materialRequirements: "AISI 1045, EN24",
  heatTreatment: true,
  surfaceTreatment: "Black Oxide",
  manufacturingLeadTime: 15,
  manufacturingReadinessScore: 85,

  // Section 4: Validation
  trialJigCompleted: true,
  dimensionalInspection: true,
  toolGuidanceAccuracy: 0.025,
  repeatabilityTest: 0.008,
  processCapabilityCp: 1.67,
  processCapabilityCpk: 1.52,
  safetyValidation: true,
  validationRemarks: "All parameters are within tolerance. Jig performance is acceptable.",
  validationScore: 87,

  // Section 5: Commissioning
  installationCompleted: true,
  processIntegration: true,
  operatorTraining: true,
  maintenancePlan: "maintenance_plan.pdf",
  calibrationSchedule: "calibration_schedule.pdf",
  productionApproval: true,
  commissioningScore: 86,

  // Section 6: Performance
  jigLifeCycles: 500000,
  productionCycles: 135000,
  toolWearPercentage: 12,
  downtimeHoursPerMonth: 2.20,
  mtbfHours: 720,
  mttrHours: 1.15,
  oeeContribution: 13.2,
  performanceScore: 84,

  // Section 7: AI Assessment
  aiToolPathOptimization: "Drill path optimized for reduced cycle time by 6%.",
  aiWearPrediction: "Bush wear is normal. Replace after 330,000 cycles.",
  aiFailurePrediction: "Low risk. Monitor clamp mechanism.",
  aiMaintenanceRecommendation: "Next preventive maintenance in 28 days.",
  aiCostOptimization: "Material cost optimized by 7%.",
  aiEngineeringScore: 89,

  overallJigReadiness: 87,
  recommendation: "Approve for Production",

  attachments: [
    {
      id: "att-001",
      fileName: "ev_drl_jig_3d.step",
      fileType: "cad",
      documentType: "3D CAD Model",
      version: "v1.2",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "12.4 MB",
      status: "Active",
    },
    {
      id: "att-002",
      fileName: "ev_drl_jig_assembly.pdf",
      fileType: "pdf",
      documentType: "Assembly Drawing",
      version: "v1.2",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "2.6 MB",
      status: "Active",
    },
    {
      id: "att-003",
      fileName: "inspection_report.pdf",
      fileType: "pdf",
      documentType: "Inspection Report",
      version: "v1.0",
      uploadedBy: "Amit Patel",
      uploadedDate: "19 Jun 2024",
      fileSize: "1.7 MB",
      status: "Active",
    },
    {
      id: "att-004",
      fileName: "validation_report.pdf",
      fileType: "pdf",
      documentType: "Trial Validation Report",
      version: "v1.0",
      uploadedBy: "Vikram Singh",
      uploadedDate: "19 Jun 2024",
      fileSize: "3.1 MB",
      status: "Active",
    },
    {
      id: "att-005",
      fileName: "cnc_program.nc",
      fileType: "cnc",
      documentType: "CNC Program",
      version: "v1.1",
      uploadedBy: "Naresh Verma",
      uploadedDate: "18 Jun 2024",
      fileSize: "1.2 MB",
      status: "Active",
    },
    {
      id: "att-006",
      fileName: "calibration_record.pdf",
      fileType: "pdf",
      documentType: "Calibration Record",
      version: "v1.0",
      uploadedBy: "Neha Reddy",
      uploadedDate: "20 Jun 2024",
      fileSize: "1.5 MB",
      status: "Active",
    },
    {
      id: "att-007",
      fileName: "maintenance_plan.pdf",
      fileType: "pdf",
      documentType: "Maintenance Schedule",
      version: "v1.0",
      uploadedBy: "Neha Reddy",
      uploadedDate: "20 Jun 2024",
      fileSize: "2.3 MB",
      status: "Active",
    },
    {
      id: "att-008",
      fileName: "ai_assessment_report.pdf",
      fileType: "pdf",
      documentType: "AI Feasibility Report",
      version: "v1.0",
      uploadedBy: "AI Assistant",
      uploadedDate: "20 Jun 2024",
      fileSize: "2.4 MB",
      status: "Active",
    },
  ],

  reviewers: [
    {
      role: "Jig Design Engineer",
      person: "Rahul Sharma",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Design verified",
      status: "Approved",
    },
    {
      role: "Manufacturing Engineer",
      person: "Naresh Verma",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Manufacturing plan ok",
      status: "Approved",
    },
    {
      role: "Production Engineer",
      person: "Vikram Singh",
      decision: "Approved",
      date: "19 Jun 2024",
      comments: "Line integration ok",
      status: "Approved",
    },
    {
      role: "Quality Engineer",
      person: "Amit Patel",
      decision: "Approved",
      date: "19 Jun 2024",
      comments: "All inspections ok",
      status: "Approved",
    },
    {
      role: "Maintenance Engineer",
      person: "Neha Reddy",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Maintenance plan ready",
      status: "Approved",
    },
    {
      role: "Plant Head",
      person: "Arun Kumar",
      decision: "Pending",
      date: "-",
      comments: "Awaiting review",
      status: "Pending",
    },
    {
      role: "COO",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Final approval pending",
      status: "Pending",
    },
    {
      role: "CEO",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Final approval pending",
      status: "Pending",
    },
  ],

  approvalDecision: "Approved",
  reviewComments: "Design and trial validation successfully completed. Ready for production release.",
  approvalDate: "20 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 10:15 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "20 Jun 2024 04:25 PM",
  workflowStageLabel: "Review & Approval",

  timeline: [
    { label: "Concept Created", date: "05 Jun 2024", status: "Completed" },
    { label: "CAD Design Completed", date: "07 Jun 2024", status: "Completed" },
    { label: "Manufacturing Started", date: "10 Jun 2024", status: "Completed" },
    { label: "Trial Jig Completed", date: "14 Jun 2024", status: "Completed" },
    { label: "Validation Completed", date: "17 Jun 2024", status: "Completed" },
    { label: "Review & Approval", date: "18 Jun 2024", status: "In Progress" },
    { label: "Production Release", date: "Pending", status: "Pending" },
  ],

  auditTrail: [
    {
      id: "log-001",
      timestamp: "18 Jun 2024 10:15 AM",
      user: "Rahul Sharma",
      action: "Created Jig Development Project",
      description: "Initial creation of EV Charger Drilling Jig (JD-2024-0067).",
    },
    {
      id: "log-002",
      timestamp: "18 Jun 2024 02:30 PM",
      user: "Rahul Sharma",
      action: "Uploaded CAD Model",
      description: "Uploaded 3D CAD model ev_drl_jig_3d.step (v1.2).",
    },
    {
      id: "log-003",
      timestamp: "19 Jun 2024 11:00 AM",
      user: "Vikram Singh",
      action: "Completed Trial Validation",
      description: "Validation score recorded as 87/100.",
    },
    {
      id: "log-004",
      timestamp: "20 Jun 2024 04:25 PM",
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "Record submitted to Review & Approval workflow.",
      prevStatus: "In Progress",
      newStatus: "Under Review",
    },
  ],
};

let currentJigRecord = { ...DEFAULT_JIG_RECORD };

export const getJigFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentJigRecord };
});

export const saveJigDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id?: string; input: Partial<JigFormInput> })
  .handler(async ({ data }) => {
    const updated = {
      ...currentJigRecord,
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
    const scores = calculateJigScores(updated);
    currentJigRecord = {
      ...updated,
      ...scores,
    };
    return { success: true, data: currentJigRecord };
  });

export const submitJigFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as string | undefined)
  .handler(async () => {
    currentJigRecord = {
      ...currentJigRecord,
      workflowStatus: "Under Review",
      lastUpdated: new Date().toLocaleString(),
    };
    currentJigRecord.auditTrail.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "Jig Development submitted for executive sign-off.",
      prevStatus: "In Progress",
      newStatus: "Under Review",
    });
    return { success: true, data: currentJigRecord };
  });

export const reviewJigFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as { id: string; decision: JigApprovalDecision; comments?: string }
  )
  .handler(async ({ data }) => {
    let nextStatus: JigRecord["workflowStatus"] = currentJigRecord.workflowStatus;
    if (data.decision === "Approved") nextStatus = "Approved";
    else if (data.decision === "Revision Required") nextStatus = "Revision Required";
    else if (data.decision === "Rejected") nextStatus = "Draft";

    currentJigRecord = {
      ...currentJigRecord,
      workflowStatus: nextStatus,
      approvalDecision: data.decision,
      reviewComments: data.comments ?? currentJigRecord.reviewComments,
      approvalDate: new Date().toLocaleDateString(),
    };

    currentJigRecord.auditTrail.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Current User",
      action: `Review Decision: ${data.decision}`,
      description: data.comments || `Approval step updated to ${data.decision}`,
      newStatus: nextStatus,
    });

    return { success: true, data: currentJigRecord };
  });
