import { createServerFn } from "@tanstack/react-start";
import type {
  FixtureApprovalDecision,
  FixtureFormInput,
  FixtureRecord,
  FixtureStatus,
} from "@/services/types";

/* ===========================================================================
   Fixture Development — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateFixtureScores(record: Partial<FixtureRecord>) {
  const designScore = record.designReviewScore ?? 88;
  const manufacturingScore = record.manufacturingReadinessScore ?? 85;
  const validationScore = record.validationScore ?? 87;
  const commissioningScore = record.commissioningScore ?? 86;
  const performanceScore = record.performanceScore ?? 84;
  const aiScore = record.aiEngineeringScore ?? 89;

  // Weighted score calculations
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
    overallFixtureReadiness: overallScore,
  };
}

export const DEFAULT_FIXTURE_RECORD: FixtureRecord = {
  id: "proc-fix-rec-0056",
  fixtureId: "FD-2024-0056",
  formCode: "FDF-2024-25",
  projectName: "EV Charger Assembly Fixture",
  fixtureVersion: "v1.2.0",
  workflowStatus: "In Progress",
  stage: 6, // Trial Validation Stage
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProduct: { id: "PRD-EV-7KW", name: "Smart EV Charger AC 7kW" },
  linkedAssemblyLine: { id: "proc-asm-rec-0045", code: "EV Charger Assembly Line - A" },
  fixtureDesignEngineer: {
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "rahul.sharma@magnertia.com",
  },
  fixtureNumber: "FIX-EVC-ASSY-A-001",
  manufacturingPlant: "Magnertia Plant - 01",
  productionLine: "EV Charger Assembly Line - A",
  nextReviewDate: "25 Jun 2024",

  fixtureName: "EV Charger Assembly Fixture",
  fixtureCategory: "Assembly Fixture",
  productFamily: "EV Chargers",
  workstation: "WS-30: Assembly Station",
  fixturePurpose: "Holds and locates EV charger housing for accurate assembly of components with high repeatability.",
  developmentStage: "Trial Validation",
  priority: "High",
  riskLevel: "Low",
  healthIndex: 92,

  // Section 2: Design
  cadModel: "evc_fixture_3d.step",
  assemblyDrawing: "evc_fixture_assembly.pdf",
  detailDrawings: "evc_fixture_details.pdf",
  bom: "evc_fixture_bom.xlsx",
  locatorDesign: "locator_design.pdf",
  clampDesign: "clamp_design.pdf",
  materialSpecification: "aisi_1045_spec.pdf",
  surfaceFinish: "Ground",
  designReviewScore: 88,

  // Section 3: Manufacturing
  manufacturingProcess: "CNC Machining",
  cncProgram: "cnc_program.nc",
  machineAllocation: ["CNC VMC", "CMM", "Grinding"],
  materialRequirements: "AISI 1045, EN24",
  heatTreatment: true,
  surfaceTreatment: "Black Oxide",
  manufacturingLeadTime: 15, // Days
  manufacturingReadinessScore: 85,

  // Section 4: Validation
  trialFixture: true,
  dimensionalInspection: true,
  positioningAccuracy: 0.025, // mm
  repeatabilityTest: 0.030, // mm
  ergonomicValidation: true,
  safetyValidation: true,
  validationRemarks: "All parameters within tolerance. Fixture meets accuracy and safety standards.",
  validationScore: 87,

  // Section 5: Installation & Commissioning
  installationCompleted: true,
  lineIntegration: true,
  operatorTraining: true,
  maintenancePlan: "maintenance_plan.pdf",
  calibrationSchedule: "calibration_schedule.pdf",
  commissioningApproval: true,
  readinessChecklist: [
    { id: "rc-1", label: "Installation Verification Check", completed: true, notes: "Passed on Line A." },
    { id: "rc-2", label: "Operator Safety & EHS Briefing", completed: true, notes: "5 operators certified." },
    { id: "rc-3", label: "Calibration Baseline Check", completed: true, notes: "Calibrated to 0.01mm tolerance." },
  ],
  commissioningScore: 86,

  // Section 6: Performance
  fixtureLife: 500000, // cycles
  productionCycles: 125000, // cycles
  downtime: 2.4, // Hrs/Month
  positioningAccuracyPerformance: 0.025, // mm
  preventiveMaintenanceFrequency: 30, // Days
  oeeContribution: 12.5, // %
  performanceScore: 84,
  kpiTrend: [
    { period: "Jan", fixtureLifeCount: 450000, cycles: 20000, downtimeHours: 2.8, positioningAccuracy: 0.027 },
    { period: "Feb", fixtureLifeCount: 465000, cycles: 45000, downtimeHours: 2.6, positioningAccuracy: 0.026 },
    { period: "Mar", fixtureLifeCount: 480000, cycles: 70000, downtimeHours: 2.5, positioningAccuracy: 0.025 },
    { period: "Apr", fixtureLifeCount: 490000, cycles: 95000, downtimeHours: 2.4, positioningAccuracy: 0.025 },
    { period: "May", fixtureLifeCount: 495000, cycles: 110000, downtimeHours: 2.4, positioningAccuracy: 0.025 },
    { period: "Jun", fixtureLifeCount: 500000, cycles: 125000, downtimeHours: 2.4, positioningAccuracy: 0.025 },
  ],

  // Section 7: AI Assessment
  aiFixtureOptimization: "Clamp force optimized for better stability and reduced cycle time.",
  aiWearPrediction: "Wear level low. Expected life: 520,000 cycles.",
  aiFailurePrediction: "Low failure risk. Monitor locator wear.",
  aiMaintenanceRecommendation: "Next preventive maintenance in 30 days.",
  aiCostOptimization: "Material cost optimized by 8%.",
  aiEngineeringScore: 89,

  overallFixtureReadiness: 87,
  recommendation: "Approve for Production",

  attachments: [
    { id: "fa-1", name: "evc_fixture_3d.step", size: "12.4 MB", type: "CAD Model", uploadDate: "18 Jun 2024" },
    { id: "fa-2", name: "assembly_drawing.pdf", size: "2.4 MB", type: "PDF Drawings", uploadDate: "18 Jun 2024" },
    { id: "fa-3", name: "inspection_report.pdf", size: "1.9 MB", type: "PDF Report", uploadDate: "18 Jun 2024" },
    { id: "fa-4", name: "validation_report.pdf", size: "2.1 MB", type: "PDF Report", uploadDate: "18 Jun 2024" },
    { id: "fa-5", name: "cnc_program.nc", size: "1.2 MB", type: "CNC Code", uploadDate: "18 Jun 2024" },
    { id: "fa-6", name: "calibration_record.pdf", size: "1.6 MB", type: "PDF Record", uploadDate: "18 Jun 2024" },
    { id: "fa-7", name: "maintenance_plan.pdf", size: "2.3 MB", type: "PDF Plan", uploadDate: "18 Jun 2024" },
    { id: "fa-8", name: "ai_assessment_report.pdf", size: "2.5 MB", type: "PDF Report", uploadDate: "18 Jun 2024" },
  ],

  reviewers: [
    { id: "fr-1", role: "Fixture Design Engineer", person: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Design verified.", status: "Completed" },
    { id: "fr-2", role: "Manufacturing Engineer", person: "Naresh Verma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Manufacturing plan ok.", status: "Completed" },
    { id: "fr-3", role: "Production Engineer", person: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Line integration ok.", status: "Completed" },
    { id: "fr-4", role: "Quality Engineer", person: "Amit Patel", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "All inspections ok.", status: "Completed" },
    { id: "fr-5", role: "Maintenance Engineer", person: "Neha Reddy", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80", decision: "Pending", date: "", comments: "Maintenance plan ready.", status: "In Progress" },
    { id: "fr-6", role: "Plant Head", person: "Arun Kumar", decision: "Pending", date: "", comments: "Awaiting review.", status: "Pending" },
    { id: "fr-7", role: "COO", person: "Sankaran R.", decision: "Pending", date: "", comments: "Final approval pending.", status: "Pending" },
    { id: "fr-8", role: "CEO", person: "Sankaran R.", decision: "Pending", date: "", comments: "Final approval pending.", status: "Pending" },
  ],
  approvalDecision: "Approved",
  reviewComments: "Fixture validated. Ready for production release.",
  approvalDate: "18 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 10:15 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "20 Jun 2024 04:25 PM",
  workflowStageLabel: "Review & Approval",

  timeline: [
    { id: "fm-1", title: "Concept Created", date: "05 Jun 2024", completed: true, stageNumber: 1 },
    { id: "fm-2", title: "CAD Design Completed", date: "07 Jun 2024", completed: true, stageNumber: 2 },
    { id: "fm-3", title: "Manufacturing Started", date: "10 Jun 2024", completed: true, stageNumber: 3 },
    { id: "fm-4", title: "Trial Fixture Completed", date: "14 Jun 2024", completed: true, stageNumber: 4 },
    { id: "fm-5", title: "Validation Completed", date: "17 Jun 2024", completed: true, stageNumber: 5 },
    { id: "fm-6", title: "Review & Approval", date: "18 Jun 2024", completed: false, stageNumber: 6 },
    { id: "fm-7", title: "Production Release", date: "", completed: false, stageNumber: 7 },
  ],
  auditTrail: [
    { id: "fa-1", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", action: "Record Initialized", details: "Fixture design form created.", ipAddress: "192.168.1.102" },
    { id: "fa-2", timestamp: "18 Jun 2024 11:30 AM", user: "Rahul Sharma", action: "CAD Uploaded", details: "evc_fixture_3d.step uploaded.", ipAddress: "192.168.1.102" },
    { id: "fa-3", timestamp: "19 Jun 2024 02:15 PM", user: "Vikram Singh", action: "Quality Verified", details: "Passed dimensional tolerance test.", ipAddress: "192.168.1.115" },
    { id: "fa-4", timestamp: "20 Jun 2024 04:25 PM", user: "Rahul Sharma", action: "Submitted to Review", details: "Awaiting board approvals.", ipAddress: "192.168.1.102" },
  ],
};

let activeRecordStore: FixtureRecord = { ...DEFAULT_FIXTURE_RECORD };

export const getFixtureFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: FixtureRecord }> => {
    return { success: true, data: activeRecordStore };
  }
);

export const saveFixtureDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<FixtureFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: FixtureRecord }> => {
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
    const calculated = calculateFixtureScores(activeRecordStore);
    activeRecordStore = {
      ...activeRecordStore,
      ...calculated,
    };

    return { success: true, data: activeRecordStore };
  });

export const submitFixtureFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: FixtureRecord }> => {
    activeRecordStore = {
      ...activeRecordStore,
      workflowStatus: "Executive Review" as FixtureStatus,
      lastUpdated: new Date().toLocaleString(),
    };

    return { success: true, data: activeRecordStore };
  });

export const reviewFixtureFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: FixtureApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: FixtureRecord }> => {
    const { decision, comments } = data;

    let finalStatus: FixtureStatus = "Executive Review";
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
      if (rev.role === "Fixture Design Engineer") {
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
