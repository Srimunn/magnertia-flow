import { createServerFn } from "@tanstack/react-start";
import type {
  MechanicalDesignApprovalDecision,
  MechanicalDesignFormInput,
  MechanicalDesignRecord,
  MechanicalDesignStage,
  MechanicalDesignStatus,
} from "@/services/types";

/* ===========================================================================
   Mechanical Design — Server Functions & Workflow Engine
   ---------------------------------------------------------------------------
   Manages the 4-stage Mechanical Design lifecycle:
     Stage 1: Mechanical Engineering Design (assembly structure, part design, mechanisms, 3D CAD)
     Stage 2: Material & Manufacturing Validation (material selection, DFM/DFA, GD&T, cost optimization)
     Stage 3: Simulation & Validation (FEA/CAE stress, thermal, fatigue, vibration simulation & quality validation)
     Stage 4: Engineering Review (Review Board decision: Approved / Approved with Conditions / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Auto-creates & links downstream Prototype Manufacturing project (e.g. PM-2024-0089 / PROTO-2024-0102)
       and surfaces its ID to proceed to Prototype Manufacturing.
   =========================================================================== */

export function calculateMechanicalDesignScores(input: Partial<MechanicalDesignFormInput>) {
  // 1. Structural Readiness (0-100)
  const validationScore = input.validationScore ?? 86;
  const numParts = input.numberOfComponents ?? 125;
  const structuralReadiness = Math.min(99, Math.max(70, Math.round(validationScore * 0.6 + 36)));

  // 2. Manufacturability (0-100)
  const isDfm = input.designMethodology?.includes("DFM") ?? true;
  const manufacturability = isDfm ? 86 : 78;

  // 3. Reliability (0-100)
  const relTarget = input.reliabilityTarget ?? 98;
  const reliability = Math.min(98, Math.max(70, Math.round(relTarget * 0.87)));

  // 4. Simulation (0-100)
  const completedAnalyses = (input.engineeringAnalyses || []).filter(
    (a) => a.status === "Completed"
  ).length;
  const totalAnalyses = (input.engineeringAnalyses || []).length || 6;
  const simulation = Math.min(98, Math.max(70, Math.round((completedAnalyses / totalAnalyses) * 30 + 65)));

  // Overall Mechanical Design Score (/100)
  const overallMechanicalDesignScore = Math.round(
    structuralReadiness * 0.3 +
      manufacturability * 0.25 +
      reliability * 0.25 +
      simulation * 0.2
  );

  // AI Mechanical Design Gauge Sub-scores
  const aiDesignQuality = Math.min(99, Math.max(75, Math.round(overallMechanicalDesignScore * 1.01)));
  const aiManufacturability = Math.min(99, Math.max(75, Math.round(manufacturability * 1.0)));
  const aiStructuralAssessment = Math.min(99, Math.max(75, Math.round(structuralReadiness * 1.02)));
  const aiCostOptimization = 84;
  const aiOverallScore = Math.round(
    (aiDesignQuality + aiManufacturability + aiStructuralAssessment + aiCostOptimization) / 4
  );

  // Dynamic Key Highlights Checklist derived from inputs
  const highlights: string[] = [];

  highlights.push("Optimized weight reduction of 12.5% achieved");
  highlights.push("Structural safety factor within target");
  if (input.designMethodology?.includes("DFM")) {
    highlights.push("DFM analysis indicates high manufacturability");
  } else {
    highlights.push("Manufacturability validation complete");
  }

  if (input.materialGrade) {
    highlights.push(`AI suggested material change (${input.materialGrade}) reduces cost by 8%`);
  } else {
    highlights.push("AI suggested material change reduces cost by 8%");
  }

  return {
    summary: {
      overallMechanicalDesignScore,
      structuralReadiness,
      manufacturability,
      reliability,
      simulation,
    },
    aiAssessment: {
      aiOverallScore,
      aiDesignQuality,
      aiManufacturability,
      aiStructuralAssessment,
      aiCostOptimization,
    },
    keyHighlights: highlights,
  };
}

const DEFAULT_MECHANICAL_DESIGN_INPUT: MechanicalDesignFormInput = {
  // Panel 1: Mechanical Design Overview
  productName: "Smart EV Charger",
  designObjective:
    "Develop a robust, safe and cost-effective mechanical structure for Smart EV Charger.",
  designScope:
    "Includes enclosure, internal structure, mounting system, cooling mechanism and connectors.",
  designStandards: ["ISO 9001", "ISO 13100", "IEC 61851", "RoHS"],
  designMethodology: "Design for Manufacturing (DFM)",
  productCategory: "EV Charging Station",
  designStatus: "In Progress",
  productRenderUrl:
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",

  // Panel 2: Assembly Design
  assemblyName: "Main Assembly",
  assemblyNumber: "ASM-001",
  assemblyType: "Main Assembly",
  parentAssembly: "—",
  numberOfComponents: 125,
  assemblyWeight: "18.45 kg",
  assemblyStatus: "In Progress",
  assemblyExplodedViewUrl:
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",

  // Panel 3: Part Design (Top Parts)
  topParts: [
    {
      id: "part-1",
      partNumber: "PRT-001",
      partName: "Enclosure Front",
      material: "Aluminum 6061",
      process: "CNC Machining",
      revision: "A",
      status: "In Progress",
    },
    {
      id: "part-2",
      partNumber: "PRT-002",
      partName: "Enclosure Body",
      material: "Aluminum 6061",
      process: "Sheet Metal",
      revision: "B",
      status: "Approved",
    },
    {
      id: "part-3",
      partNumber: "PRT-003",
      partName: "Mounting Bracket",
      material: "Mild Steel",
      process: "Laser Cutting",
      revision: "A",
      status: "In Progress",
    },
    {
      id: "part-4",
      partNumber: "PRT-004",
      partName: "Cooling Fan Housing",
      material: "ABS",
      process: "Injection Molding",
      revision: "A",
      status: "In Progress",
    },
    {
      id: "part-5",
      partNumber: "PRT-005",
      partName: "Connector Cover",
      material: "PC",
      process: "Injection Molding",
      revision: "A",
      status: "Approved",
    },
  ],

  // Panel 4: Mechanism Design
  mechanismName: "Cable Management System",
  motionType: "Linear",
  degreesOfFreedom: 2,
  actuationMethod: "Spring Loaded",
  transmissionType: "Guide Rail + Slider",
  safetyMechanism: "Auto Lock & Stopper",
  reliabilityTarget: 98.0,

  // Panel 5: Material & Manufacturing
  materialGrade: "Aluminum 6061-T6",
  materialStandard: "ASTM B221",
  heatTreatment: "T6",
  surfaceFinish: "Powder Coated",
  toleranceClass: "Medium",
  gdtRequirement: "As per ISO 1101",
  estManufacturingCost: "₹ 4,850.00",

  // Panel 6: Engineering Analysis
  engineeringAnalyses: [
    { id: "ea-1", name: "Static Analysis", status: "Completed" },
    { id: "ea-2", name: "Dynamic Analysis", status: "Completed" },
    { id: "ea-3", name: "Structural Analysis", status: "Completed" },
    { id: "ea-4", name: "Thermal Analysis", status: "In Progress" },
    { id: "ea-5", name: "Fatigue Analysis", status: "Completed" },
    { id: "ea-6", name: "Vibration Analysis", status: "In Progress" },
  ],
  simulationStatus: "In Progress",
  feaStressPlotUrl:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",

  // Panel 7: Design Validation
  designVerificationMethod: "FEA + Prototype Testing",
  prototypeValidation: "Functional Prototype",
  testResults: "All critical tests passed",
  designIssues: "Minor fitment adjustment",
  correctiveActions: "Bracket thickness optimized",
  validationScore: 86,
  approvalStatusBadge: "Under Review",

  // Panel 8: Attachments
  attachments: [
    {
      id: "att-1",
      name: "3D_CAD_Assembly.step",
      typeIcon: "step",
      size: "24.6 MB",
      category: "3D Model",
      fileType: "application/step",
      url: "#",
      uploadedAt: "18 Jun 2024",
    },
    {
      id: "att-2",
      name: "Part_Drawings.zip",
      typeIcon: "zip",
      size: "18.2 MB",
      category: "Drawings",
      fileType: "application/zip",
      url: "#",
      uploadedAt: "18 Jun 2024",
    },
    {
      id: "att-3",
      name: "Assembly_Drawings.pdf",
      typeIcon: "pdf",
      size: "14.2 MB",
      category: "Drawings",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "19 Jun 2024",
    },
    {
      id: "att-4",
      name: "BOM.xlsx",
      typeIcon: "xlsx",
      size: "11.5 MB",
      category: "BOM",
      fileType: "application/vnd.ms-excel",
      url: "#",
      uploadedAt: "19 Jun 2024",
    },
    {
      id: "att-5",
      name: "FEA_Report.pdf",
      typeIcon: "pdf",
      size: "8.7 MB",
      category: "Analysis",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-6",
      name: "Thermal_Analysis.pdf",
      typeIcon: "pdf",
      size: "6.3 MB",
      category: "Analysis",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-7",
      name: "GD&T_Drawings.pdf",
      typeIcon: "pdf",
      size: "9.1 MB",
      category: "Drawings",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-8",
      name: "Design_Review_Report.pdf",
      typeIcon: "pdf",
      size: "5.4 MB",
      category: "Report",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
  ],

  // Panel 9: AI Recommendations
  aiRecommendations: [
    {
      id: "rec-1",
      iconType: "material",
      title: "Consider using Al 6083 for better extrudability.",
      description:
        "Switching from Al 6061 to Al 6083 yields 14% higher extrusion throughput with minimal impact on structural yield strength.",
      impactScore: "Cost -8%",
    },
    {
      id: "rec-2",
      iconType: "dimension",
      title: "Reduce bracket thickness from 4 mm to 3.5 mm.",
      description:
        "FEA static load simulation demonstrates margin of safety = 2.45 at 3.5 mm thickness, saving 280g per unit.",
      impactScore: "Weight -12.5%",
    },
    {
      id: "rec-3",
      iconType: "rib",
      title: "Optimize rib design to improve stiffness.",
      description:
        "Adding 2 cross-ribs on the rear enclosure mounting panel increases torsional stiffness by 34%.",
      impactScore: "Stiffness +34%",
    },
    {
      id: "rec-4",
      iconType: "cost",
      title: "Potential cost saving of ₹350 per unit.",
      description:
        "Standardizing internal M4 fastener types across the assembly reduces BOM line items and inventory holding cost.",
      impactScore: "₹350 / unit",
    },
  ],

  // Panel 10: Review & Approval Table
  reviewers: [
    {
      id: "rev-1",
      role: "Mechanical Engineer",
      person: "Rahul Sharma",
      decision: "Approved",
      status: "Approved",
      date: "18 Jun 2024",
    },
    {
      id: "rev-2",
      role: "Lead Design Engineer",
      person: "Vikram Singh",
      decision: "Approved",
      status: "Approved",
      date: "19 Jun 2024",
    },
    {
      id: "rev-3",
      role: "Manufacturing Engineer",
      person: "Arun Nair",
      decision: "Pending",
      status: "Pending",
      date: null,
    },
    {
      id: "rev-4",
      role: "Quality Engineer",
      person: "Pooja Iyer",
      decision: "Pending",
      status: "Pending",
      date: null,
    },
    {
      id: "rev-5",
      role: "Engineering Manager",
      person: "Neha Sharma",
      decision: "Pending",
      status: "Pending",
      date: null,
    },
    {
      id: "rev-6",
      role: "CTO",
      person: "Dr. Anil Patel",
      decision: "Pending",
      status: "Pending",
      date: null,
    },
  ],
  approvalDecision: null,
  reviewComments: "",
  approvalDate: "2024-06-20",
};

let currentMechanicalDesignRecord: MechanicalDesignRecord = {
  id: "md-rec-2024-0017",
  designId: "MD-2024-0017",
  formCode: "MDF-2024-25",
  designProjectName: "Smart EV Charger – Mechanical Design",
  designVersion: "v1.0",
  status: "Under Review",
  currentStage: "engineering_review",
  currentStageLabel: "Stage 4: Engineering Review",
  createdOn: "18 Jun 2024 10:15 AM",

  linkedIndustrialDesignId: "ID-2024-0012",
  linkedIndustrialDesignTitle: "Smart EV Charger – Industrial Design",
  linkedProductArchitectureId: "PA-2024-0017",
  linkedProductArchitectureTitle: "Smart EV Charger – System Architecture",
  linkedPrdId: "PRD-2024-0017",
  linkedPrdTitle: "Smart EV Charger – Product Requirements Document",
  linkedProductId: "PROD-2024-009",
  linkedProductName: "Smart EV Charger Pro",

  businessUnit: "Smart Mobility Division",
  mechanicalEngineerId: "usr-rahul-sharma",
  mechanicalEngineerName: "Rahul Sharma",
  mechanicalEngineerAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  lastUpdated: "20 Jun 2024 04:25 PM",

  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  version: "1.0",

  stages: [
    {
      id: "mechanical_engineering_design",
      label: "Stage 1: Mechanical Engineering Design",
      stageNumber: 1,
      status: "completed",
      description: "Assembly structure, part models, mechanisms & 3D CAD modeling",
    },
    {
      id: "material_manufacturing_validation",
      label: "Stage 2: Material & Manufacturing Validation",
      stageNumber: 2,
      status: "completed",
      description: "Material grades, DFM/DFA assessment, GD&T & manufacturing cost",
    },
    {
      id: "simulation_validation",
      label: "Stage 3: Simulation & Validation",
      stageNumber: 3,
      status: "completed",
      description: "Structural/FEA, thermal, fatigue simulation & prototype testing",
    },
    {
      id: "engineering_review",
      label: "Stage 4: Engineering Review",
      stageNumber: 4,
      status: "in_progress",
      description: "Review Board approval & downstream Prototype Manufacturing trigger",
    },
  ],

  input: DEFAULT_MECHANICAL_DESIGN_INPUT,
  ...calculateMechanicalDesignScores(DEFAULT_MECHANICAL_DESIGN_INPUT),

  linkedPrototypeManufacturingId: null,
  approvalDecision: null,
  approvalDate: "2024-06-20",
  reviewComments: "",

  auditTrail: [
    {
      at: "18 Jun 2024 10:15 AM",
      actor: "Rahul Sharma",
      event: "Mechanical Design record created from approved Industrial Design ID-2024-0012, PA-2024-0017, PRD-2024-0017",
      stage: "mechanical_engineering_design",
      status: "Draft",
    },
    {
      at: "19 Jun 2024 02:30 PM",
      actor: "Rahul Sharma",
      event: "Completed Stage 1 & Stage 2 DFM & Material validations",
      stage: "material_manufacturing_validation",
      status: "Draft",
    },
    {
      at: "20 Jun 2024 11:00 AM",
      actor: "Rahul Sharma",
      event: "Completed FEA Structural simulation & prototype testing score (86/100)",
      stage: "simulation_validation",
      status: "Draft",
    },
    {
      at: "20 Jun 2024 04:25 PM",
      actor: "Rahul Sharma",
      event: "Submitted Mechanical Design for Stage 4 Engineering Review",
      stage: "engineering_review",
      status: "Under Review",
    },
  ],
};

/** Get current Mechanical Design Record */
export const getMechanicalDesignFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: MechanicalDesignRecord }> => {
    return { success: true, data: currentMechanicalDesignRecord };
  }
);

/** Save Draft */
export const saveMechanicalDesignDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<MechanicalDesignFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: MechanicalDesignRecord }> => {
    const updatedInput = { ...currentMechanicalDesignRecord.input, ...data.input };
    const scores = calculateMechanicalDesignScores(updatedInput);

    currentMechanicalDesignRecord = {
      ...currentMechanicalDesignRecord,
      input: updatedInput,
      ...scores,
      lastUpdated: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      lastModified: new Date().toISOString(),
      auditTrail: [
        {
          at: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: "Rahul Sharma",
          event: "Saved draft updates to Mechanical Design Form",
          stage: currentMechanicalDesignRecord.currentStage,
          status: currentMechanicalDesignRecord.status,
        },
        ...currentMechanicalDesignRecord.auditTrail,
      ],
    };

    return { success: true, data: currentMechanicalDesignRecord };
  });

/** Advance Stage */
export const advanceMechanicalDesignStageFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; targetStage: MechanicalDesignStage }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: MechanicalDesignRecord }> => {
    const stageMap: Record<MechanicalDesignStage, { label: string; stageNumber: number }> = {
      mechanical_engineering_design: {
        label: "Stage 1: Mechanical Engineering Design",
        stageNumber: 1,
      },
      material_manufacturing_validation: {
        label: "Stage 2: Material & Manufacturing Validation",
        stageNumber: 2,
      },
      simulation_validation: {
        label: "Stage 3: Simulation & Validation",
        stageNumber: 3,
      },
      engineering_review: {
        label: "Stage 4: Engineering Review",
        stageNumber: 4,
      },
    };

    const target = stageMap[data.targetStage];

    currentMechanicalDesignRecord = {
      ...currentMechanicalDesignRecord,
      currentStage: data.targetStage,
      currentStageLabel: target.label,
      stages: currentMechanicalDesignRecord.stages.map((stg) => {
        if (stg.stageNumber < target.stageNumber) return { ...stg, status: "completed" };
        if (stg.stageNumber === target.stageNumber) return { ...stg, status: "in_progress" };
        return { ...stg, status: "pending" };
      }),
      auditTrail: [
        {
          at: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: "Rahul Sharma",
          event: `Advanced to ${target.label}`,
          stage: data.targetStage,
          status: currentMechanicalDesignRecord.status,
        },
        ...currentMechanicalDesignRecord.auditTrail,
      ],
    };

    return { success: true, data: currentMechanicalDesignRecord };
  });

/** Submit for Review */
export const submitMechanicalDesignFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: MechanicalDesignRecord }> => {
    currentMechanicalDesignRecord = {
      ...currentMechanicalDesignRecord,
      status: "Under Review",
      currentStage: "engineering_review",
      currentStageLabel: "Stage 4: Engineering Review",
      stages: currentMechanicalDesignRecord.stages.map((stg) =>
        stg.id === "engineering_review" ? { ...stg, status: "in_progress" } : { ...stg, status: "completed" }
      ),
      auditTrail: [
        {
          at: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: "Rahul Sharma",
          event: "Submitted Mechanical Design for Stage 4 Engineering Review Board",
          stage: "engineering_review",
          status: "Under Review",
        },
        ...currentMechanicalDesignRecord.auditTrail,
      ],
    };

    return { success: true, data: currentMechanicalDesignRecord };
  });

/** Review Board Decision */
export const reviewMechanicalDesignFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: MechanicalDesignApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: MechanicalDesignRecord }> => {
    let newStatus: MechanicalDesignStatus = "Under Review";
    let linkedPrototypeId: string | null = currentMechanicalDesignRecord.linkedPrototypeManufacturingId ?? null;
    let eventMessage = "";

    if (data.decision === "Approved") {
      newStatus = "Approved";
      linkedPrototypeId = "PM-2024-0089";
      eventMessage = "Review Board Approved Mechanical Design. Auto-created downstream Prototype Manufacturing project PM-2024-0089. Mechanical Engineer notified: 'Proceed to Prototype Manufacturing'.";
    } else if (data.decision === "Approved with Conditions") {
      newStatus = "Approved with Conditions";
      eventMessage = "Review Board Approved with Conditions. Mechanical Engineer notified: 'Improve Design'. Record remains editable.";
    } else if (data.decision === "Revision Required") {
      newStatus = "Revision Required";
      eventMessage = "Review Board requested revisions. Mechanical Engineer notified: 'Reassess Engineering Analysis / Update Mechanical Design'. Returned to Simulation & Validation stage.";
    } else if (data.decision === "Rejected") {
      newStatus = "Rejected";
      eventMessage = "Review Board Rejected Mechanical Design. Record archived. Mechanical Engineer notified: 'Close Design Project'.";
    }

    const updatedReviewers = currentMechanicalDesignRecord.input.reviewers.map((rev) => {
      if (rev.role === "Lead Design Engineer" || rev.role === "Engineering Manager") {
        return {
          ...rev,
          decision: data.decision === "Approved" || data.decision === "Approved with Conditions" ? ("Approved" as const) : ("Rejected" as const),
          status: data.decision,
          date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        };
      }
      return rev;
    });

    currentMechanicalDesignRecord = {
      ...currentMechanicalDesignRecord,
      status: newStatus,
      approvalDecision: data.decision,
      approvalDate: new Date().toLocaleDateString("en-CA"),
      reviewComments: data.comments || "",
      linkedPrototypeManufacturingId: linkedPrototypeId,
      stages: currentMechanicalDesignRecord.stages.map((stg) => {
        if (data.decision === "Approved" || data.decision === "Approved with Conditions") {
          return { ...stg, status: "completed" };
        }
        if (data.decision === "Revision Required" && stg.id === "engineering_review") {
          return { ...stg, status: "pending" };
        }
        return stg;
      }),
      currentStage:
        data.decision === "Revision Required"
          ? "simulation_validation"
          : "engineering_review",
      input: {
        ...currentMechanicalDesignRecord.input,
        approvalDecision: data.decision,
        reviewComments: data.comments || "",
        approvalDate: new Date().toLocaleDateString("en-CA"),
        reviewers: updatedReviewers,
      },
      auditTrail: [
        {
          at: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: "Lead Design Engineer (Review Board)",
          event: eventMessage,
          stage: currentMechanicalDesignRecord.currentStage,
          status: newStatus,
        },
        ...currentMechanicalDesignRecord.auditTrail,
      ],
    };

    return { success: true, data: currentMechanicalDesignRecord };
  });
