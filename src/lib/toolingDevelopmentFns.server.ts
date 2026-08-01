import { createServerFn } from "@tanstack/react-start";
import type {
  ToolingApprovalDecision,
  ToolingFormInput,
  ToolingRecord,
  ToolingStatus,
} from "@/services/types";

/* ===========================================================================
   Tooling Development — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateToolingScores(record: Partial<ToolingRecord>) {
  const designScore = record.designReviewScore ?? 88;
  const manufacturingScore = record.manufacturingReadinessScore ?? 85;
  const validationScore = record.validationScore ?? 87;
  const readinessScore = record.readinessScore ?? 86;
  const performanceScore = record.performanceScore ?? 84;
  const aiScore = record.aiEngineeringScore ?? 89;

  // Weighted score calculations
  const overallScore = Math.round(
    designScore * 0.20 +
      manufacturingScore * 0.20 +
      validationScore * 0.20 +
      readinessScore * 0.20 +
      performanceScore * 0.20
  );

  return {
    designReviewScore: designScore,
    manufacturingReadinessScore: manufacturingScore,
    validationScore,
    readinessScore,
    performanceScore,
    aiEngineeringScore: aiScore,
    overallToolReadiness: overallScore,
  };
}

export const DEFAULT_TOOLING_RECORD: ToolingRecord = {
  id: "proc-tool-rec-0078",
  toolingId: "TD-2024-0078",
  formCode: "TDF-2024-25",
  projectName: "EV Charger Assembly Fixture",
  toolVersion: "v1.2.0",
  workflowStatus: "In Progress" as ToolingStatus,
  stage: 5, // Validation Stage
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProduct: { id: "PRD-EV-7KW", name: "Smart EV Charger AC 7kW" },
  linkedAssemblyLine: { id: "proc-asm-rec-0045", code: "EV Charger Assembly Line - A" },
  toolDesignEngineer: {
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "rahul.sharma@magnertia.com",
  },
  manufacturingPlant: "Magnertia Plant - 01",
  productionLine: "EV Charger Assembly Line - A",
  nextReviewDate: "25 Jun 2024",

  toolName: "EV Charger Assembly Fixture",
  toolNumber: "FIX-EVC-ASSY-A-001",
  toolCategory: "Assembly Fixture",
  productFamily: "EV Chargers",
  purpose: "Fixture used for holding EV charger housing and components during final assembly and screw fastening.",
  developmentStage: "Trial Tool",
  priority: "High",
  riskLevel: "Low",
  healthIndex: 92,

  // Section 2: Design
  assemblyDrawing: "evo_fixture_assembly.pdf",
  detailDrawings: "evo_fixture_details.pdf",
  bom: "evo_fixture_bom.xlsx",
  materialSpecification: "aisi_1045_spec.pdf",
  surfaceFinish: "Ground",
  designReviewScore: 88,

  // Section 3: Planning
  manufacturingProcess: "CNC Machining",
  machineAllocation: ["CNC VMC", "Grinding", "EDM Wire Cut"],
  materialRequirements: "AISI 1045, EN24, SKD11",
  heatTreatment: true,
  surfaceCoating: "Black Oxide",
  manufacturingLeadTime: 15, // Days
  manufacturingReadinessScore: 85,

  // Section 4: Validation
  trialToolCompleted: true,
  dimensionalInspection: true,
  functionalValidation: true,
  toolAccuracy: 0.025, // mm
  repeatability: 0.030, // mm
  validationRemarks: "Trial tool passed all dimensional and functional tests. Ready for installation.",
  validationScore: 87,

  // Section 5: Readiness
  installationCompleted: true,
  operatorTraining: true,
  maintenancePlan: "fixture_maintenance_plan.pdf",
  sparePartsList: "fixture_spare_parts.xlsx",
  calibrationSchedule: "fixture_calibration_plan.pdf",
  productionRelease: true,
  readinessChecklist: [
    { id: "rc-1", label: "Installation Verification Check", completed: true, notes: "Passed on Line A." },
    { id: "rc-2", label: "Operator Safety & EHS Briefing", completed: true, notes: "5 operators certified." },
    { id: "rc-3", label: "Calibration Baseline Check", completed: true, notes: "Calibrated to 0.01mm tolerance." },
  ],
  readinessScore: 86,

  // Section 6: Performance
  toolLife: 500000, // cycles
  cycleTime: 45, // seconds
  productionCycles: 125000,
  downtime: 2.4, // Hrs/Month
  mtbf: 720, // Hrs
  mttr: 1.2, // Hrs
  oeeContribution: 12.5, // %
  performanceScore: 84,
  kpiTrend: [
    { period: "Jan", toolLifeCount: 450000, cycleTime: 46, downtimeHours: 2.8, mtbf: 700 },
    { period: "Feb", toolLifeCount: 465000, cycleTime: 46, downtimeHours: 2.6, mtbf: 710 },
    { period: "Mar", toolLifeCount: 480000, cycleTime: 45, downtimeHours: 2.5, mtbf: 720 },
    { period: "Apr", toolLifeCount: 490000, cycleTime: 45, downtimeHours: 2.4, mtbf: 720 },
    { period: "May", toolLifeCount: 495000, cycleTime: 45, downtimeHours: 2.4, mtbf: 720 },
    { period: "Jun", toolLifeCount: 500000, cycleTime: 45, downtimeHours: 2.4, mtbf: 720 },
  ],

  // Section 7: AI
  aiWearPrediction: "Wear level normal. Replace after 480,000 cycles.",
  aiMaintenanceRecommendation: "Lubricate guide pins every 10,000 cycles and inspect clamps.",
  aiToolOptimization: "Reduce cycle time by optimizing clamp actuation sequence.",
  aiCostOptimization: "Material usage optimized. Estimated cost savings: 6.2%.",
  aiFailurePrediction: "Low failure risk. Monitor clamp actuation system.",
  aiEngineeringScore: 89,

  overallToolReadiness: 87,
  recommendation: "Approve for Production",

  attachments: [
    { id: "ta-1", name: "evo_fixture_cad.step", size: "12.4 MB", type: "CAD Model", uploadDate: "18 Jun 2024" },
    { id: "ta-2", name: "evo_fixture_drawings.pdf", size: "2.8 MB", type: "PDF Drawings", uploadDate: "18 Jun 2024" },
    { id: "ta-3", name: "inspection_report.pdf", size: "1.9 MB", type: "PDF Report", uploadDate: "18 Jun 2024" },
    { id: "ta-4", name: "trial_report.pdf", size: "2.1 MB", type: "PDF Report", uploadDate: "18 Jun 2024" },
    { id: "ta-5", name: "calibration_record.pdf", size: "1.6 MB", type: "PDF Record", uploadDate: "18 Jun 2024" },
    { id: "ta-6", name: "maintenance_plan.pdf", size: "2.3 MB", type: "PDF Plan", uploadDate: "18 Jun 2024" },
    { id: "ta-7", name: "ai_assessment_report.pdf", size: "2.5 MB", type: "PDF Report", uploadDate: "18 Jun 2024" },
    { id: "ta-8", name: "supporting_documents.zip", size: "3.5 MB", type: "ZIP Archive", uploadDate: "18 Jun 2024" },
  ],

  reviewers: [
    { id: "tr-1", role: "Tool Design Engineer", person: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Tool design verified.", status: "Completed" },
    { id: "tr-2", role: "Manufacturing Engineer", person: "Naresh Verma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Manufacturing plan ok.", status: "Completed" },
    { id: "tr-3", role: "Quality Engineer", person: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Passed all inspections.", status: "Completed" },
    { id: "tr-4", role: "Maintenance Engineer", person: "Anil Patel", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Maintenance plan ready.", status: "Completed" },
    { id: "tr-5", role: "Production Manager", person: "Neha Reddy", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80", decision: "Pending", date: "", comments: "Awaiting review.", status: "In Progress" },
    { id: "tr-6", role: "Plant Head", person: "Arun Kumar", decision: "Pending", date: "", comments: "Awaiting review.", status: "Pending" },
    { id: "tr-7", role: "COO", person: "Sankaran R.", decision: "Pending", date: "", comments: "Awaiting final review.", status: "Pending" },
    { id: "tr-8", role: "CEO", person: "Sankaran R.", decision: "Pending", date: "", comments: "Final approval pending.", status: "Pending" },
  ],
  approvalDecision: "Approved",
  reviewComments: "Tooling validated. Ready for production release.",
  approvalDate: "18 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 10:15 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "20 Jun 2024 04:25 PM",
  workflowStageLabel: "Review & Approval",

  timeline: [
    { id: "tm-1", title: "Tool Concept Created", date: "05 Jun 2024", completed: true, stageNumber: 1 },
    { id: "tm-2", title: "CAD Design Completed", date: "07 Jun 2024", completed: true, stageNumber: 2 },
    { id: "tm-3", title: "Manufacturing Started", date: "10 Jun 2024", completed: true, stageNumber: 3 },
    { id: "tm-4", title: "Trial Tool Completed", date: "14 Jun 2024", completed: true, stageNumber: 4 },
    { id: "tm-5", title: "Validation Completed", date: "17 Jun 2024", completed: true, stageNumber: 5 },
    { id: "tm-6", title: "Review & Approval", date: "18 Jun 2024", completed: false, stageNumber: 6 },
    { id: "tm-7", title: "Production Release", date: "", completed: false, stageNumber: 7 },
  ],
  auditTrail: [
    { id: "ta-1", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", action: "Record Initialized", details: "Tooling design form created.", ipAddress: "192.168.1.102" },
    { id: "ta-2", timestamp: "18 Jun 2024 11:30 AM", user: "Rahul Sharma", action: "CAD Uploaded", details: "evo_fixture_cad.step uploaded.", ipAddress: "192.168.1.102" },
    { id: "ta-3", timestamp: "19 Jun 2024 02:15 PM", user: "Vikram Singh", action: "Quality Verified", details: "Passed dimensional tolerance test.", ipAddress: "192.168.1.115" },
    { id: "ta-4", timestamp: "20 Jun 2024 04:25 PM", user: "Rahul Sharma", action: "Submitted to Review", details: "Awaiting board approvals.", ipAddress: "192.168.1.102" },
  ],
};

let activeRecordStore: ToolingRecord = { ...DEFAULT_TOOLING_RECORD };

export const getToolingFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: ToolingRecord }> => {
    return { success: true, data: activeRecordStore };
  }
);

export const saveToolingDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<ToolingFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: ToolingRecord }> => {
    const { input } = data;
    const { ...rest } = input;

    // Apply changes
    activeRecordStore = {
      ...activeRecordStore,
      ...rest,
      lastModified: new Date().toISOString(),
      lastUpdated: new Date().toLocaleString(),
    };

    // Recalculate scores
    const calculated = calculateToolingScores(activeRecordStore);
    activeRecordStore = {
      ...activeRecordStore,
      ...calculated,
    };

    return { success: true, data: activeRecordStore };
  });

export const submitToolingFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: ToolingRecord }> => {
    activeRecordStore = {
      ...activeRecordStore,
      workflowStatus: "Executive Review" as ToolingStatus,
      lastUpdated: new Date().toLocaleString(),
    };

    return { success: true, data: activeRecordStore };
  });

export const reviewToolingFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: ToolingApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: ToolingRecord }> => {
    const { decision, comments } = data;

    let finalStatus: ToolingStatus = "Executive Review";
    if (decision === "Approved") {
      finalStatus = "Production Release";
    } else if (decision === "Changes Requested") {
      finalStatus = "CAD Design";
    } else if (decision === "Rejected") {
      finalStatus = "Completed"; // Aborted / Finished
    }

    activeRecordStore = {
      ...activeRecordStore,
      approvalDecision: decision,
      reviewComments: comments || "",
      workflowStatus: finalStatus,
      approvalDate: new Date().toLocaleDateString(),
      lastUpdated: new Date().toLocaleString(),
    };

    // Update reviewer state
    activeRecordStore.reviewers = activeRecordStore.reviewers.map((rev) => {
      if (rev.role === "Tool Design Engineer") {
        return {
          ...rev,
          decision,
          comments: comments || "Reviewed design.",
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          status: "Completed" as const,
        };
      }
      return rev;
    });

    return { success: true, data: activeRecordStore };
  });
