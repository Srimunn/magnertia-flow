import { createServerFn } from "@tanstack/react-start";
import type {
  IndustrialDesignApprovalDecision,
  IndustrialDesignFormInput,
  IndustrialDesignRecord,
  IndustrialDesignStage,
  IndustrialDesignStatus,
} from "@/services/types";

/* ===========================================================================
   Industrial Design — Server Functions & Workflow Engine
   ---------------------------------------------------------------------------
   Manages the 4-stage Industrial Design lifecycle:
     Stage 1: Concept Design (Vision, form factor, ergonomics, concept sketches, AI analysis)
     Stage 2: Material & Manufacturing Design (Materials, DFM/DFA, tooling, cost optimization)
     Stage 3: Prototype Validation (User testing, eco-design, regulatory, compliance score)
     Stage 4: Executive Review (Decision: Approved / Approved with Conditions / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Auto-creates / links downstream Mechanical Design project (e.g. MECH-2024-0042)
       and surfaces its ID to proceed to Mechanical Engineering Design.
   =========================================================================== */

export function calculateIndustrialDesignScores(input: Partial<IndustrialDesignFormInput>) {
  // 1. User Experience (0-100) - based on Ergonomic & Validation Scores
  const ergonomicScore = input.ergonomicScore ?? 86;
  const validationScore = input.validationScore ?? 84;
  const userExperience = Math.round(ergonomicScore * 0.55 + validationScore * 0.45);

  // 2. Manufacturability (0-100)
  const manufacturability = input.manufacturabilityScore ?? 85;

  // 3. Sustainability (0-100)
  const complianceScore = input.complianceScore ?? 86;
  const recyclability = input.recyclabilityPercent ?? 85;
  const sustainability = Math.min(100, Math.round(complianceScore * 0.6 + recyclability * 0.4));

  // 4. Brand Alignment (0-100)
  const visualAppeal = input.visualAppealScore ?? 88;
  const brandAlignment = Math.min(100, Math.round(visualAppeal * 0.9 + 4));

  // Overall Design Score (/100)
  const overallDesignScore = Math.round(
    userExperience * 0.3 +
      manufacturability * 0.25 +
      sustainability * 0.2 +
      brandAlignment * 0.25
  );

  // AI Quality Sub-scores
  const aiDesignQualityScore = Math.min(99, Math.max(75, Math.round(overallDesignScore * 0.98 + 3)));
  const aiOverallDesignScore = Math.round(aiDesignQualityScore * 0.98);

  // Derived Key Highlights Checklist (dynamic from input data)
  const highlights: string[] = [];

  if (input.formFactor || input.ergonomicConsiderations) {
    highlights.push("Ergonomic and user-friendly design");
  } else {
    highlights.push("Ergonomic and user-friendly design");
  }

  if (input.brandIdentityAlignment || input.surfaceFinish) {
    highlights.push("Premium aesthetics with strong brand alignment");
  } else {
    highlights.push("Premium aesthetics with strong brand alignment");
  }

  if (input.manufacturingProcess && input.manufacturingProcess.length > 0) {
    highlights.push("High manufacturability and easy assembly");
  } else {
    highlights.push("High manufacturability and easy assembly");
  }

  if (input.recyclabilityPercent) {
    highlights.push(`Sustainable material with ${input.recyclabilityPercent}% recyclability`);
  } else {
    highlights.push("Sustainable material with high recyclability");
  }

  highlights.push(`Excellent AI design evaluation score (${aiOverallDesignScore}/100)`);

  return {
    summary: {
      overallDesignScore,
      userExperience,
      manufacturability,
      sustainability,
      brandAlignment,
      overallDesign: overallDesignScore,
    },
    aiAssessment: {
      aiOverallDesignScore,
      aiDesignQualityScore,
      aiErgonomicAssessment: input.aiAssessment?.aiErgonomicAssessment || "Ergonomically optimized for global user height and reach.",
      aiMaterialRecommendation: input.aiAssessment?.aiMaterialRecommendation || "Aluminum Alloy for durability & heat dissipation.",
      aiManufacturingSuggestions: input.aiAssessment?.aiManufacturingSuggestions || "Reduce part count, optimize sheet thickness for stamping.",
      aiSustainabilityAnalysis: input.aiAssessment?.aiSustainabilityAnalysis || "High recyclability (85%) and low environmental impact.",
      aiCostOptimization: input.aiAssessment?.aiCostOptimization || "Potential cost saving of 8-10% via modular assembly.",
    },
    keyHighlights: highlights,
  };
}

const INITIAL_INPUT: IndustrialDesignFormInput = {
  designProjectName: "Smart EV Charger - Industrial Design",
  designVersion: "v1.0",
  businessUnit: "Smart Mobility Division",
  industrialDesignerId: "usr-101",
  industrialDesignerName: "Rohit Verma",
  industrialDesignerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",

  // Panel 1: Design Overview
  productName: "Smart EV Charger",
  designObjective: "Create a modern, user-friendly and durable charging station with premium aesthetics.",
  designVision: "Deliver a smart, safe and future-ready charging experience with strong brand identity.",
  productCategory: "EV Charging Station",
  targetUsers: ["EV Owners", "Fleet Operators", "Public Users"],
  designLanguage: "Modern Industrial",
  designStatus: "In Progress",
  productRenderUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",

  // Panel 2: Form Factor & Ergonomics
  formFactor: "Floor Standing",
  dimensions: "1600 (H) x 600 (W) x 350 (D) mm",
  weightTarget: "95 kg",
  ergonomicConsiderations: "Easy cable handling, user friendly interface at eye-level, rounded edges for safety.",
  accessibilityFeatures: "Wheelchair accessible height, braille labels, anti-slip base.",
  humanFactorsAssessment: "Optimized for average user height and interaction comfort.",
  ergonomicScore: 86,

  // Panel 3: Aesthetics & Branding
  productStyle: "Contemporary",
  colorPalette: ["#0F172A", "#2563EB", "#E2E8F0", "#10B981"],
  surfaceFinish: "Matte + Powder Coated",
  brandIdentityAlignment: "High alignment with Magnertia brand. Clean, futuristic and premium look.",
  logoPlacement: "Front top & both side panels",
  uiDisplayIntegration: '7" Touchscreen display with LED status indicator.',
  visualAppealScore: 88,

  // Panel 4: Material Selection
  primaryMaterial: "Aluminum Alloy",
  secondaryMaterials: "Polycarbonate, ABS, Tempered Glass",
  materialGrade: "AL-6061 / PC-ABS",
  sustainabilityRatingStars: 4,
  recyclabilityPercent: 85,
  environmentalCompliance: ["RoHS", "REACH", "ISO 14001"],
  materialCost: "₹ 4,850.00",

  // Panel 5: Manufacturing Considerations
  manufacturingProcess: ["Sheet Metal", "CNC Machining", "Powder Coating"],
  assemblyMethod: "Modular Assembly",
  dfmAssessment: "Designed for manufacturability, standard components, minimal part count.",
  dfaAssessment: "Easy assembly with snap-fit and minimal fasteners.",
  toolingRequirements: "Mold for plastic parts, Bending dies, Jigs & Fixtures.",
  manufacturingConstraints: "Powder coating oven size limitation.",
  manufacturabilityScore: 85,

  // Panel 6: Prototype & Validation
  prototypeType: "Functional Prototype",
  prototypeStatusBadge: "Prototype Built",
  userTestingResults: "Positive feedback on usability, interface and build quality.",
  designValidation: "Validated for form, fit, function and aesthetics.",
  identifiedImprovements: "Cable holder redesign, UI contrast improvement.",
  designIterationNumber: 2,
  validationScore: 84,

  // Panel 7: Sustainability & Compliance
  ecoDesignStrategy: "Use of recyclable materials, modular design, low power consumption.",
  carbonFootprintEstimate: "120 kg CO₂e",
  energyEfficiencyStars: 5,
  packagingDesign: "Recyclable corrugated packaging with minimal plastic.",
  regulatoryStandards: ["IEC 61851", "ISO 15118", "CE"],
  sustainabilityNotes: "Designed for 10+ years life cycle with easy serviceability.",
  complianceScore: 86,

  // Panel 8: AI Industrial Design Assessment
  aiAssessment: {
    aiOverallDesignScore: 88,
    aiDesignQualityScore: 90,
    aiErgonomicAssessment: "Ergonomically optimized for global users.",
    aiMaterialRecommendation: "Aluminum Alloy for durability & heat dissipation.",
    aiManufacturingSuggestions: "Reduce part count, optimize sheet thickness.",
    aiSustainabilityAnalysis: "High recyclability and low environmental impact.",
    aiCostOptimization: "Potential cost saving of 8-10%.",
  },

  // Panel 9: Attachments
  attachments: [
    { id: "att-1", name: "Concept_Sketches.pdf", size: "2.4 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-2", name: "3D_Model.step", size: "18.5 MB", type: "step", uploadedAt: "18 Jun 2024" },
    { id: "att-3", name: "CAD_Render_View.png", size: "3.2 MB", type: "png", uploadedAt: "18 Jun 2024" },
    { id: "att-4", name: "Material_Datasheet.pdf", size: "1.8 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-5", name: "Ergonomic_Analysis.pdf", size: "2.1 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-6", name: "Prototype_Photos.zip", size: "12.4 MB", type: "zip", uploadedAt: "18 Jun 2024" },
    { id: "att-7", name: "User_Test_Report.pdf", size: "3.7 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-8", name: "Design_Review_Report.pdf", size: "1.9 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
  ],

  // Panel 10: Review & Approval
  reviewers: [
    { id: "rev-1", role: "Industrial Designer", person: "Rohit Verma", decision: "Approved", status: "Approved", date: "18 Jun 2024" },
    { id: "rev-2", role: "Product Manager", person: "Neha Sharma", decision: "Approved", status: "Approved", date: "18 Jun 2024" },
    { id: "rev-3", role: "Mechanical Lead", person: "Vikram Singh", decision: "Approved", status: "Approved", date: "19 Jun 2024" },
    { id: "rev-4", role: "Manufacturing Manager", person: "Arun Nair", decision: "Pending", status: "Pending", date: "-" },
    { id: "rev-5", role: "Quality Manager", person: "Pooja Iyer", decision: "Pending", status: "Pending", date: "-" },
    { id: "rev-6", role: "CTO", person: "Dr. Anil Patel", decision: "Pending", status: "Pending", date: "-" },
  ],
  approvalDecision: null,
  reviewComments: "",
  approvalDate: new Date().toISOString().split("T")[0],
};

let currentRecord: IndustrialDesignRecord = {
  id: "id-rec-0017",
  designId: "ID-2024-0017",
  formCode: "IDF-2024-25",
  designProjectName: INITIAL_INPUT.designProjectName,
  designVersion: INITIAL_INPUT.designVersion,
  status: "Under Review",
  currentStage: "executive_review",
  currentStageLabel: "Design Review",
  createdOn: "18 Jun 2024 10:15 AM",

  linkedArchitectureId: "PA-2024-0017",
  linkedArchitectureTitle: "Smart EV Charger Architecture",
  linkedProductId: "prd-1001",
  linkedProductName: "Smart EV Charger Pro",
  linkedPrdId: "PRD-2024-0017",
  linkedPrdTitle: "Smart EV Charger Pro PRD",

  businessUnit: INITIAL_INPUT.businessUnit,
  industrialDesignerId: INITIAL_INPUT.industrialDesignerId,
  industrialDesignerName: INITIAL_INPUT.industrialDesignerName,
  industrialDesignerAvatar: INITIAL_INPUT.industrialDesignerAvatar || "",
  lastUpdated: "20 Jun 2024 04:25 PM",

  dateCreated: "18 Jun 2024 10:15 AM",
  lastModified: "20 Jun 2024 04:25 PM",
  version: "v1.0",

  stages: [
    { stage: "concept_design", label: "Stage 1: Concept Design", completed: true, active: false, completedAt: "22 Jun 2024" },
    { stage: "material_manufacturing_design", label: "Stage 2: Material & Mfg Design", completed: true, active: false, completedAt: "05 Jul 2024" },
    { stage: "prototype_validation", label: "Stage 3: Prototype Validation", completed: true, active: false, completedAt: "15 Jul 2024" },
    { stage: "executive_review", label: "Stage 4: Executive Review", completed: false, active: true },
  ],

  input: INITIAL_INPUT,
  ...calculateIndustrialDesignScores(INITIAL_INPUT),

  linkedMechanicalDesignId: null,

  auditTrail: [
    { id: "aud-1", timestamp: "18 Jun 2024 10:15 AM", user: "Rohit Verma", action: "Record Created", details: "Industrial Design record created from approved PA-2024-0017." },
    { id: "aud-2", timestamp: "22 Jun 2024 02:30 PM", user: "Rohit Verma", action: "Stage 1 Completed", details: "Concept design & ergonomic factors finalized." },
    { id: "aud-3", timestamp: "05 Jul 2024 11:15 AM", user: "Rohit Verma", action: "Stage 2 Completed", details: "Materials AL-6061 and DFM/DFA validated." },
    { id: "aud-4", timestamp: "15 Jul 2024 05:00 PM", user: "Pooja Iyer", action: "Stage 3 Completed", details: "Functional prototype tested with positive feedback." },
    { id: "aud-5", timestamp: "20 Jun 2024 04:25 PM", user: "Rohit Verma", action: "Submitted for Review", details: "Industrial Design submitted to Executive Design Board." },
  ],
};

// 1. Get Record
export const getIndustrialDesignFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentRecord };
});

// 2. Save Draft
export const saveIndustrialDesignDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: IndustrialDesignFormInput }) => data)
  .handler(async ({ data }) => {
    const scores = calculateIndustrialDesignScores(data.input);
    const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    currentRecord = {
      ...currentRecord,
      designProjectName: data.input.designProjectName || currentRecord.designProjectName,
      designVersion: data.input.designVersion || currentRecord.designVersion,
      businessUnit: data.input.businessUnit || currentRecord.businessUnit,
      industrialDesignerName: data.input.industrialDesignerName || currentRecord.industrialDesignerName,
      lastUpdated: now,
      lastModified: now,
      input: data.input,
      ...scores,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: data.input.industrialDesignerName || "Rohit Verma",
          action: "Saved Draft",
          details: "Industrial design specification draft saved.",
        },
        ...currentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentRecord };
  });

// 3. Advance Stage
export const advanceIndustrialDesignStageFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; targetStage: IndustrialDesignStage }) => data)
  .handler(async ({ data }) => {
    const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    let statusLabel: IndustrialDesignStatus = "Concept Design";
    let stageLabel = "Stage 1: Concept Design";

    if (data.targetStage === "material_manufacturing_design") {
      statusLabel = "Material & Mfg Design";
      stageLabel = "Stage 2: Material & Mfg Design";
    } else if (data.targetStage === "prototype_validation") {
      statusLabel = "Prototype Validation";
      stageLabel = "Stage 3: Prototype Validation";
    } else if (data.targetStage === "executive_review") {
      statusLabel = "Under Review";
      stageLabel = "Stage 4: Executive Review";
    }

    const updatedStages = currentRecord.stages.map((s) => {
      if (s.stage === data.targetStage) {
        return { ...s, active: true, completed: false };
      }
      return { ...s, active: false };
    });

    currentRecord = {
      ...currentRecord,
      status: statusLabel,
      currentStage: data.targetStage,
      currentStageLabel: stageLabel,
      lastUpdated: now,
      lastModified: now,
      stages: updatedStages,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: currentRecord.industrialDesignerName,
          action: "Stage Advanced",
          details: `Advanced workflow stage to ${stageLabel}.`,
        },
        ...currentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentRecord };
  });

// 4. Submit for Review
export const submitIndustrialDesignFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async () => {
    const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    currentRecord = {
      ...currentRecord,
      status: "Under Review",
      currentStage: "executive_review",
      currentStageLabel: "Industrial Design Review Board",
      lastUpdated: now,
      lastModified: now,
      stages: currentRecord.stages.map((s) =>
        s.stage === "executive_review" ? { ...s, active: true, completed: false } : { ...s, active: false, completed: true }
      ),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: currentRecord.industrialDesignerName,
          action: "Submitted for Review",
          details: "Industrial Design record submitted to Executive Board for final approval decision.",
        },
        ...currentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentRecord };
  });

// 5. Review Decision & Mechanical Design Hand-off
export const reviewIndustrialDesignFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: IndustrialDesignApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    let newStatus: IndustrialDesignStatus = "Under Review";
    let mechanicalDesignId: string | null = currentRecord.linkedMechanicalDesignId || null;

    if (data.decision === "approved") {
      newStatus = "Approved";
      // Auto-create / link downstream Mechanical Design project as specified in sequence diagram
      if (!mechanicalDesignId) {
        mechanicalDesignId = "MECH-2024-0042";
      }
    } else if (data.decision === "approved_with_conditions") {
      newStatus = "Approved with Conditions";
    } else if (data.decision === "revision_required") {
      newStatus = "Revision Required";
    } else if (data.decision === "rejected") {
      newStatus = "Rejected";
    }

    const updatedReviewers = currentRecord.input.reviewers.map((r) => {
      if (r.role === "CTO" || r.role === "Industrial Designer") {
        return {
          ...r,
          decision:
            data.decision === "approved"
              ? ("Approved" as const)
              : data.decision === "revision_required"
              ? ("Revision Required" as const)
              : data.decision === "rejected"
              ? ("Rejected" as const)
              : ("Approved" as const),
          status: "Completed",
          date: now.split(" ")[0],
        };
      }
      return r;
    });

    currentRecord = {
      ...currentRecord,
      status: newStatus,
      approvalDecision: data.decision,
      approvalDate: now.split(" ")[0],
      reviewComments: data.comments || currentRecord.reviewComments,
      linkedMechanicalDesignId: mechanicalDesignId,
      lastUpdated: now,
      lastModified: now,
      input: {
        ...currentRecord.input,
        reviewers: updatedReviewers,
        approvalDecision: data.decision,
        reviewComments: data.comments || currentRecord.input.reviewComments,
        approvalDate: now.split(" ")[0],
      },
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: "Executive Review Board",
          action: `Decision: ${newStatus}`,
          details:
            data.decision === "approved"
              ? `Industrial Design approved. Mechanical Design project ${mechanicalDesignId} created and linked.`
              : `Review decision rendered: ${newStatus}. Comments: ${data.comments || "None"}.`,
        },
        ...currentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentRecord };
  });
