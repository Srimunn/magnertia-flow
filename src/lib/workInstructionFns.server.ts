import { createServerFn } from "@tanstack/react-start";
import type {
  WorkInstructionApprovalDecision,
  WorkInstructionAttachment,
  WorkInstructionFormInput,
  WorkInstructionRecord,
  WorkInstructionReviewer,
  WorkInstructionStepItem,
} from "@/services/types";

/* ===========================================================================
   Work Instruction Development — Server Functions & Calculation Engine
   =========================================================================== */

export function calculateWorkInstructionScores(record: Partial<WorkInstructionRecord>) {
  const quality = record.qualityScore ?? 85;
  const safety = record.safetyScore ?? 90;
  const competency = record.competencyScore ?? 84;
  const aiDoc = record.aiDocumentationScore ?? 88;

  const overallScore = Math.round(
    quality * 0.25 + safety * 0.30 + competency * 0.20 + aiDoc * 0.25
  );

  const totalTime = (record.steps || []).reduce(
    (sum, step) => sum + (step.timeSeconds || 0),
    0
  );

  return {
    qualityScore: quality,
    safetyScore: safety,
    competencyScore: competency,
    aiDocumentationScore: aiDoc,
    overallReadinessScore: overallScore,
    totalCycleTimeSec: totalTime > 0 ? totalTime : record.totalCycleTimeSec ?? 230,
  };
}

export const DEFAULT_WORK_INSTRUCTION_STEPS: WorkInstructionStepItem[] = [
  {
    id: "step-1",
    stepNumber: 1,
    instruction: "Verify all components as per BOM.",
    visualReferenceUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80",
    keyPoints: "Check quantity and part number.",
    timeSeconds: 20,
    safetyNotes: "Wear ESD anti-static wristband",
    qualityChecks: "Match BOM revision v2.0",
    requiredTools: "Barcode Scanner",
    requiredMaterials: "ACCU Components Kit",
  },
  {
    id: "step-2",
    stepNumber: 2,
    instruction: "Install PCB in bottom enclosure using M3 screws.",
    visualReferenceUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80",
    keyPoints: "Tighten screws with 0.8 Nm torque.",
    timeSeconds: 45,
    safetyNotes: "Avoid sharp enclosure edges",
    qualityChecks: "Check screw torque calibration",
    requiredTools: "Torque Screwdriver (0.5-2 Nm)",
    requiredMaterials: "PCB Assembly, M3 Screws",
  },
  {
    id: "step-3",
    stepNumber: 3,
    instruction: "Connect input power wires to terminal block.",
    visualReferenceUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=300&auto=format&fit=crop&q=80",
    keyPoints: "Check wire color code.",
    timeSeconds: 30,
    safetyNotes: "Verify zero voltage de-energized state",
    qualityChecks: "Pull test wire connections (50N)",
    requiredTools: "Wire Cutter, Multimeter",
    requiredMaterials: "Power Cable Set",
  },
  {
    id: "step-4",
    stepNumber: 4,
    instruction: "Connect signal cables to PCB connectors.",
    visualReferenceUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=80",
    keyPoints: "Ensure locking mechanism is secure.",
    timeSeconds: 40,
    safetyNotes: "Prevent pin bending",
    qualityChecks: "Visual connector latch engage check",
    requiredTools: "Tweezers",
    requiredMaterials: "Signal Harness Assembly",
  },
  {
    id: "step-5",
    stepNumber: 5,
    instruction: "Install top cover and tighten all screws.",
    visualReferenceUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=80",
    keyPoints: "Uniform torque 0.8 Nm.",
    timeSeconds: 35,
    safetyNotes: "Ensure gasket alignment for IP54 rating",
    qualityChecks: "No wire pinching under cover",
    requiredTools: "Torque Screwdriver",
    requiredMaterials: "Top Enclosure Cover, Gasket",
  },
  {
    id: "step-6",
    stepNumber: 6,
    instruction: "Perform functional test and verify LEDs.",
    visualReferenceUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=300&auto=format&fit=crop&q=80",
    keyPoints: "All LEDs should be ON.",
    timeSeconds: 60,
    safetyNotes: "Use high voltage insulated gloves during test",
    qualityChecks: "First-Off Inspection passed",
    requiredTools: "ATE Test Rig, Multimeter",
    requiredMaterials: "Test Certification Sticker",
  },
];

export const DEFAULT_WORK_INSTRUCTION_RECORD: WorkInstructionRecord = {
  id: "proc-wi-rec-000256",
  instructionId: "WI-2024-000256",
  formCode: "WID-2024-25",
  title: "Assembly of AC Charging Control Unit",
  documentNumber: "WI-MAG-ACCU-001",
  revision: "2.0",
  workflowStatus: "In Review",
  stage: 2, // Quality Review / In Review
  createdOn: "18 Jun 2024 09:15 AM",
  dateCreated: "2024-06-18T09:15:00Z",
  effectiveDate: "20 Jun 2024",
  nextReviewDate: "20 Jun 2025",
  lastModified: "2024-06-20T14:45:00Z",
  lastUpdated: "20 Jun 2024 02:45 PM",

  plantName: "Magnertia Plant - 01",
  department: "Manufacturing",
  processOwner: "Rahul Sharma",
  processOwnerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  workstation: "WS-ACCU-01",
  productionLine: "Line-ACCU-01",
  productFamily: "AC Charger",
  productModel: "ACCU-7KW V1.0",
  processName: "Control Unit Assembly",
  operationNumber: "OP-20",
  operationDescription: "Assemble and test the AC Charging Control Unit including PCB installation, wiring, and enclosure assembly as per engineering specification.",
  instructionCategory: "Assembly",
  priority: "High",

  totalCycleTimeSec: 230,
  overallReadinessScore: 87,
  qualityScore: 85,
  safetyScore: 90,
  competencyScore: 84,
  aiDocumentationScore: 88,
  recommendation: "Approve Work Instruction",

  steps: DEFAULT_WORK_INSTRUCTION_STEPS,

  requiredTools: [
    "Torque Screwdriver (0.5-2 Nm)",
    "Phillips Screwdriver",
    "Wire Cutter",
    "Multimeter",
  ],
  fixturesJigs: ["PCB Assembly Jig", "Insulated Unit Enclosure"],
  measuringInstruments: ["Digital Caliper", "Multimeter", "Torque Meter"],
  materials: [
    "PCB Assembly",
    "M3 Screws",
    "Power Cable Set",
    "First-Off Inspection Sticker",
  ],
  ppeRequirements: [
    "ESD Anti-static Wristband",
    "Safety Glasses",
    "Insulated Gloves",
  ],

  inspectionPoints: [
    "Visual PCB placement & orientation",
    "Screw torque 0.8 Nm verification",
    "Wire pull test 50N",
    "LED indicator status test",
  ],
  acceptanceCriteria: "Zero wire pinching, all 4 LEDs green, screw torque within +/-0.05 Nm tolerance.",
  qualityChecklist: [
    "BOM Part Number verification ✓",
    "Torque calibration check ✓",
    "First-off inspection signoff ✓",
    "Hi-pot electrical safety test ✓",
  ],

  hazardsIdentified: 3,
  lockoutTagoutRequired: false,
  ergonomicAssessment: "Ergonomic seating & anti-fatigue matting defined",
  regulatoryCompliance: true,

  trainingRequired: true,
  skillLevel: "Intermediate",
  authorizedOperators: 12,
  certificationRequired: true,

  aiInstructionReview: "All assembly steps are clear, complete, and properly sequenced.",
  aiRiskAssessment: "Low risk operation. Ensure ESD safety precautions during PCB placement.",
  aiProcessOptimization: "Use pre-assembled cable harness to reduce cycle time by 8%.",
  aiKnowledgeGapAnalysis: "Add reference image for screw torque setting knob.",
  aiTrainingRecommendation: "Refresher training recommended for 3 newly assigned operators.",

  attachments: [
    {
      id: "wiatt-001",
      fileName: "SOP_Control_Unit_Assembly.pdf",
      fileType: "pdf",
      documentType: "SOP Document",
      version: "v2.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "1.2 MB",
      status: "Active",
    },
    {
      id: "wiatt-002",
      fileName: "Assembly_Video.mp4",
      fileType: "mp4",
      documentType: "Instruction Video",
      version: "v2.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "25.3 MB",
      status: "Active",
    },
    {
      id: "wiatt-003",
      fileName: "Process_Flow_Diagram.vsdx",
      fileType: "vsdx",
      documentType: "Process Diagram",
      version: "v1.0",
      uploadedBy: "Vikram Singh",
      uploadedDate: "19 Jun 2024",
      fileSize: "850 KB",
      status: "Active",
    },
    {
      id: "wiatt-004",
      fileName: "Control_Plan_CP-ACCU-001.pdf",
      fileType: "pdf",
      documentType: "Control Plan",
      version: "v1.1",
      uploadedBy: "Neha Reddy",
      uploadedDate: "19 Jun 2024",
      fileSize: "1.6 MB",
      status: "Active",
    },
    {
      id: "wiatt-005",
      fileName: "ACCU_Assembly_Drawings.pdf",
      fileType: "pdf",
      documentType: "CAD Drawings",
      version: "v2.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "20 Jun 2024",
      fileSize: "2.4 MB",
      status: "Active",
    },
    {
      id: "wiatt-006",
      fileName: "Training_Module.pdf",
      fileType: "pdf",
      documentType: "Training Guide",
      version: "v1.0",
      uploadedBy: "Priya Nair",
      uploadedDate: "20 Jun 2024",
      fileSize: "3.2 MB",
      status: "Active",
    },
  ],

  reviewers: [
    {
      role: "Process Engineer",
      person: "Rahul Sharma",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Instructions created",
      status: "Approved",
    },
    {
      role: "Manufacturing Engineer",
      person: "Vikram Singh",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Process validated",
      status: "Approved",
    },
    {
      role: "Quality Manager",
      person: "Neha Reddy",
      decision: "Approved",
      date: "19 Jun 2024",
      comments: "Quality criteria set",
      status: "Approved",
    },
    {
      role: "EHS Manager",
      person: "Arun Kumar",
      decision: "Approved",
      date: "19 Jun 2024",
      comments: "Safety risks cleared",
      status: "Approved",
    },
    {
      role: "Training Manager",
      person: "Priya Nair",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Training content ready",
      status: "Approved",
    },
    {
      role: "Plant Head",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Under review",
      status: "Pending",
    },
    {
      role: "COO",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Awaiting review",
      status: "Pending",
    },
    {
      role: "CEO",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Awaiting approval",
      status: "Pending",
    },
  ],

  approvalDecision: "Approved",
  reviewComments: "Work Instruction WI-2024-000256 approved for shop floor assembly release.",
  approvalDate: "20 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 09:15 AM",
  lastModifiedBy: "Neha Reddy",
  lastModifiedDate: "20 Jun 2024 02:45 PM",
  workflowStageLabel: "Under Review",

  timeline: [
    { label: "Instruction Authoring", date: "18 Jun 2024", status: "Completed" },
    { label: "Quality & Safety Review", date: "19 Jun 2024", status: "Completed" },
    { label: "Training Content Preparation", date: "20 Jun 2024", status: "Completed" },
    { label: "Document Control Verification", date: "In Progress", status: "In Progress" },
    { label: "Executive Approval", date: "Pending", status: "Pending" },
    { label: "Shop Floor Release", date: "Pending", status: "Pending" },
  ],

  auditTrail: [
    {
      id: "wilog-001",
      timestamp: "18 Jun 2024 09:15 AM",
      user: "Rahul Sharma",
      action: "Created Work Instruction",
      description: "Initial authoring of Assembly of AC Charging Control Unit (WI-2024-000256).",
    },
    {
      id: "wilog-002",
      timestamp: "18 Jun 2024 02:30 PM",
      user: "Rahul Sharma",
      action: "Added Assembly Steps",
      description: "Created 6 step-by-step instructions with visual reference images.",
    },
    {
      id: "wilog-003",
      timestamp: "19 Jun 2024 11:15 AM",
      user: "Neha Reddy",
      action: "Approved Quality Criteria",
      description: "Quality inspection points and acceptance criteria validated.",
    },
    {
      id: "wilog-004",
      timestamp: "20 Jun 2024 02:45 PM",
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "Work instruction submitted for document control approval.",
      prevStatus: "Draft",
      newStatus: "Under Review",
    },
  ],
};

let currentWorkInstructionRecord = { ...DEFAULT_WORK_INSTRUCTION_RECORD };

export const getWorkInstructionFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentWorkInstructionRecord };
});

export const saveWorkInstructionDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id?: string; input: Partial<WorkInstructionFormInput> })
  .handler(async ({ data }) => {
    const updated = {
      ...currentWorkInstructionRecord,
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
    const scores = calculateWorkInstructionScores(updated);
    currentWorkInstructionRecord = {
      ...updated,
      ...scores,
    };
    return { success: true, data: currentWorkInstructionRecord };
  });

export const submitWorkInstructionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as string | undefined)
  .handler(async () => {
    currentWorkInstructionRecord = {
      ...currentWorkInstructionRecord,
      workflowStatus: "Under Review",
      lastUpdated: new Date().toLocaleString(),
    };
    currentWorkInstructionRecord.auditTrail.unshift({
      id: `wilog-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "Work Instruction submitted for executive board sign-off.",
      prevStatus: "Draft",
      newStatus: "Under Review",
    });
    return { success: true, data: currentWorkInstructionRecord };
  });

export const reviewWorkInstructionFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as { id: string; decision: WorkInstructionApprovalDecision; comments?: string }
  )
  .handler(async ({ data }) => {
    let nextStatus = currentWorkInstructionRecord.workflowStatus;
    if (data.decision === "Approved") nextStatus = "Approved";
    else if (data.decision === "Revision Required") nextStatus = "Revision Required";
    else if (data.decision === "Rejected") nextStatus = "Draft";

    currentWorkInstructionRecord = {
      ...currentWorkInstructionRecord,
      workflowStatus: nextStatus,
      approvalDecision: data.decision,
      reviewComments: data.comments ?? currentWorkInstructionRecord.reviewComments,
      approvalDate: new Date().toLocaleDateString(),
    };

    currentWorkInstructionRecord.auditTrail.unshift({
      id: `wilog-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Current User",
      action: `Review Decision: ${data.decision}`,
      description: data.comments || `Approval decision updated to ${data.decision}`,
      newStatus: nextStatus,
    });

    return { success: true, data: currentWorkInstructionRecord };
  });
