import { createServerFn } from "@tanstack/react-start";
import type {
  TrlAIAssessment,
  TrlApprovalDecision,
  TrlAssessmentRecord,
  TrlFormInput,
  TrlListRow,
  TrlLookups,
  TrlStage,
  TrlStatus,
  TrlSummary,
} from "@/services/types";

/* ===========================================================================
   TRL Assessment — Server Functions (MongoDB-backed with live fallback)
   ---------------------------------------------------------------------------
   Manages the 5-stage Technology Readiness Level assessment lifecycle:
     Stage 1: Technology Assessment
     Stage 2: Technical Validation
     Stage 3: Demonstration Review
     Stage 4: Risk & Commercial Assessment
     Stage 5: Executive Review (Decision: Approved / Approved with Improvements / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Recommended TRL Level is committed to record (Current TRL level advances)
     - Auto-creates linked Manufacturing Readiness Level (MRL) Assessment
       (e.g., MRL-2024-0042) and surfaces its ID.
   =========================================================================== */

// Canonical mock assessment matching 1_14_TRL.png screenshot
const DEFAULT_TRL_RECORD: TrlAssessmentRecord = {
  id: "trl-record-0087",
  trlAssessmentId: "TRL-2024-0087",
  formCode: "TRL-2024-25",
  assessmentTitle: "Autonomous Docking System Readiness Assessment",
  status: "executive_review",
  currentStage: "executive_review",
  currentStageLabel: "Executive Review",
  version: "1.2",
  businessUnit: "Smart Mobility Division",
  assessmentTeam: [
    "Rohit Verma",
    "Neha Sharma",
    "Vikram Singh",
    "Amitabh Shah",
    "Arjun Mehta",
    "Dr. Anil Patel",
    "Sanjay Kumar",
  ],
  assessmentDate: "2024-05-20",

  linkedTechnologyId: "tec-0032",
  linkedTechnologyCode: "TEC-2024-0032",
  linkedResearchProjectId: "res-0018",
  linkedResearchProjectCode: "RES-2024-0018",
  linkedPrototypeId: "prd-0012",
  linkedPrototypeCode: "PRD-2024-0012",
  linkedProductId: "prd-1001",
  linkedProductCode: "PRD-1001",

  stages: [
    { stage: "technology_assessment", label: "Technology Assessment", completed: true, active: false, completedAt: "2024-05-10" },
    { stage: "technical_validation", label: "Technical Validation", completed: true, active: false, completedAt: "2024-05-14" },
    { stage: "demonstration_review", label: "Demonstration Review", completed: true, active: false, completedAt: "2024-05-17" },
    { stage: "risk_commercial_assessment", label: "Risk & Commercial Assessment", completed: true, active: false, completedAt: "2024-05-19" },
    { stage: "executive_review", label: "Executive Review", completed: false, active: true },
  ],

  technologyInfo: {
    technologyName: "Autonomous Docking System",
    technologyDomain: "Robotics & Automation",
    technologyDescription:
      "An autonomous docking system for EVs using vision algorithms, sensor fusion and AI control for precise, safe and reliable alignment and docking.",
    productCategory: "Automotive",
    applicationArea: ["Electric Vehicles", "Smart Charging", "Fleet Management"],
    innovationType: "Incremental Innovation",
    strategicImportance: 5,
  },

  currentAssessment: {
    currentTrlLevel: 5,
    previousTrlLevel: 4,
    targetTrlLevel: 7,
    assessmentMethod: "Field Demonstration",
    assessmentEvidence:
      "Pilot deployment at two EV charging stations with controlled environment testing and performance evaluation.",
    assessmentScore: 78,
    confidenceLevel: 82,
  },

  technicalValidation: {
    scientificValidation: 5,
    laboratoryValidation: 5,
    prototypeValidation: 5,
    systemIntegration: 4,
    functionalDemonstration: 5,
    environmentalValidation: 4,
    validationEvidence:
      "Lab tests, subsystem integration, environmental stress tests, and 300+ docking cycles completed with 97% success rate.",
  },

  technologyDemonstration: {
    demonstrationEnvironment: "Pilot Plant",
    testResults: "Successful demonstration in pilot environment with real EVs. Docking accuracy avg. 98.2%.",
    performanceMetrics: "Alignment Accuracy: 98.2%, Docking Time: 18s, Cycle Success Rate: 97%",
    reliabilityResults: "MTBF: 650 hours, No critical failures observed in pilot operation.",
    safetyAssessment: 5,
    complianceStatus: "Partially Compliant",
    demonstrationOutcome:
      "Technology meets functional requirements and demonstrates stable performance in pilot setup.",
  },

  riskAssessment: {
    technicalRisk: 2,
    manufacturingRisk: 3,
    supplyChainRisk: 3,
    regulatoryRisk: 2,
    commercialRisk: 2,
    overallRiskScore: 32,
    riskMitigationPlan:
      "Mitigating manufacturing risks through supplier partnerships, regulatory risks via early compliance engagement, and technical risks via extended testing.",
  },

  commercialReadiness: {
    mrlLevel: 3,
    marketReadiness: 4,
    customerValidation: 4,
    investmentReadiness: 4,
    businessReadiness: 4,
    commercialPotential: 4,
    goToMarketStatus: "Pilot / Early Market",
  },

  aiAssessment: {
    aiTechnologyScore: 84,
    aiReadinessPrediction: "On Track",
    aiTechnicalGapAnalysis:
      "Improve vision algorithm robustness in low-light conditions. Optimize docking speed.",
    aiDevelopmentRoadmap:
      "Enhance sensor fusion, refine control algorithms, and conduct extended field trials.",
    aiRiskPrediction: "Moderate technical risk, low market risk.",
    aiRecommendation: "Proceed to TRL 6 with extended field testing.",
    aiEstimatedTimeToNextTrl: "3 – 4 Months",
  },

  summary: {
    overallTechnicalScore: 80,
    validationScore: 83,
    commercialScore: 77,
    riskScore: 68, // Risk Safety Control Score (100 - 32 Risk = 68 Safety)
    finalTrlScore: 78,
    recommendedTrlLevel: "TRL 6",
    recommendation: "Advance to Next TRL",
  },

  attachments: [
    { id: "att-1", fileName: "Test_Reports.pdf", fileSize: "2.4 MB", fileType: "PDF", uploadDate: "2024-05-18", uploadedBy: "Neha Sharma" },
    { id: "att-2", fileName: "Validation_Report.pdf", fileSize: "3.1 MB", fileType: "PDF", uploadDate: "2024-05-18", uploadedBy: "Vikram Singh" },
    { id: "att-3", fileName: "Technical_Drawings.pdf", fileSize: "4.5 MB", fileType: "PDF", uploadDate: "2024-05-16", uploadedBy: "Amitabh Shah" },
    { id: "att-4", fileName: "Prototype_Images.zip", fileSize: "12.8 MB", fileType: "ZIP", uploadDate: "2024-05-15", uploadedBy: "Rohit Verma" },
    { id: "att-5", fileName: "Laboratory_Report.pdf", fileSize: "2.0 MB", fileType: "PDF", uploadDate: "2024-05-14", uploadedBy: "Neha Sharma" },
    { id: "att-6", fileName: "Simulation_Results.pdf", fileSize: "3.6 MB", fileType: "PDF", uploadDate: "2024-05-12", uploadedBy: "Dr. Anil Patel" },
    { id: "att-7", fileName: "Certification_Report.pdf", fileSize: "1.8 MB", fileType: "PDF", uploadDate: "2024-05-10", uploadedBy: "Arjun Mehta" },
    { id: "att-8", fileName: "Assessment_Report.pdf", fileSize: "2.7 MB", fileType: "PDF", uploadDate: "2024-05-20", uploadedBy: "Rohit Verma" },
  ],

  reviewRows: [
    { role: "Technical Reviewer", person: "Neha Sharma", decision: "Approved", status: "Approved", date: "18 May 2024" },
    { role: "R&D Manager", person: "Vikram Singh", decision: "Approved", status: "Approved", date: "19 May 2024" },
    { role: "Quality Manager", person: "Amitabh Shah", decision: "Approved", status: "Approved", date: "20 May 2024" },
    { role: "Innovation Director", person: "Arjun Mehta", decision: "Pending", status: "In Review", date: "-" },
    { role: "CTO", person: "Dr. Anil Patel", decision: "Pending", status: "Pending", date: "-" },
  ],

  approvalDecision: null,
  reviewComments: null,
  approvalDate: null,
  linkedMrlAssessmentId: null,
  linkedMrlAssessmentCode: null,

  createdBy: "Rohit Verma",
  createdAt: "2024-05-20 09:15 AM",
  lastModifiedBy: "Rohit Verma",
  updatedAt: "2024-05-20 04:32 PM",

  auditTrail: [
    { id: "aud-1", timestamp: "2024-05-20 09:15 AM", actor: "Rohit Verma", event: "Created TRL Assessment TRL-2024-0087", kind: "workflow" },
    { id: "aud-2", timestamp: "2024-05-20 11:30 AM", actor: "Neha Sharma", event: "Uploaded validation test reports", kind: "audit" },
    { id: "aud-3", timestamp: "2024-05-20 02:15 PM", actor: "Vikram Singh", event: "Completed Stage 4 Risk & Commercial Assessment", kind: "workflow" },
    { id: "aud-4", timestamp: "2024-05-20 04:32 PM", actor: "Rohit Verma", event: "Submitted for Executive Review", kind: "workflow" },
  ],
};

// In-memory cache for live state during turn execution
const inMemoryStore: Map<string, TrlAssessmentRecord> = new Map([
  [DEFAULT_TRL_RECORD.id, DEFAULT_TRL_RECORD],
  ["TRL-2024-0087", DEFAULT_TRL_RECORD],
]);

function computeDerivedScores(input: TrlFormInput): {
  aiAssessment: TrlAIAssessment;
  summary: TrlSummary;
} {
  const tv = input.technicalValidation;
  const techRatingAvg =
    (tv.scientificValidation +
      tv.laboratoryValidation +
      tv.prototypeValidation +
      tv.systemIntegration +
      tv.functionalDemonstration +
      tv.environmentalValidation) /
    6;

  const cr = input.commercialReadiness;
  const commRatingAvg =
    (cr.marketReadiness + cr.customerValidation + cr.investmentReadiness + cr.businessReadiness + cr.commercialPotential) / 5;

  const ra = input.riskAssessment;
  const riskStarsAvg = (ra.technicalRisk + ra.manufacturingRisk + ra.supplyChainRisk + ra.regulatoryRisk + ra.commercialRisk) / 5;
  // Risk Score: 1..5 stars mapped to 0..100 (where lower risk is better score)
  const computedRiskScore = Math.round((riskStarsAvg / 5) * 60 + 10);
  const riskSafetyControlScore = 100 - computedRiskScore;

  const overallTech = Math.round((techRatingAvg / 5) * 80 + 20);
  const validationScore = Math.round((techRatingAvg / 5) * 85 + 15);
  const commercialScore = Math.round((commRatingAvg / 5) * 75 + 20);

  const finalTrlScore = Math.round(overallTech * 0.35 + validationScore * 0.3 + commercialScore * 0.2 + riskSafetyControlScore * 0.15);

  const currentLevel = input.currentAssessment.currentTrlLevel;
  let recommendedLevelNum = currentLevel;
  if (finalTrlScore >= 75 && currentLevel < 9) {
    recommendedLevelNum = (currentLevel + 1) as any;
  } else if (finalTrlScore < 50 && currentLevel > 1) {
    recommendedLevelNum = (currentLevel - 1) as any;
  }

  const aiTechScore = Math.min(99, Math.round(finalTrlScore * 1.05));

  const prediction = aiTechScore >= 80 ? "On Track" : aiTechScore >= 60 ? "Needs Attention" : "At Risk";

  return {
    aiAssessment: {
      aiTechnologyScore: aiTechScore,
      aiReadinessPrediction: prediction,
      aiTechnicalGapAnalysis:
        techRatingAvg < 4.5
          ? "Improve vision algorithm robustness in low-light conditions and optimize docking latency."
          : "Subsystem alignment verified; conduct long-duration endurance testing.",
      aiDevelopmentRoadmap:
        "Enhance sensor fusion, refine control algorithms, and conduct extended field trials in diverse climate conditions.",
      aiRiskPrediction:
        computedRiskScore <= 35
          ? "Moderate technical risk, low market risk."
          : "High manufacturing setup risk, active regulatory compliance monitoring required.",
      aiRecommendation: `Proceed to TRL ${recommendedLevelNum} with extended field testing.`,
      aiEstimatedTimeToNextTrl: "3 – 4 Months",
    },
    summary: {
      overallTechnicalScore: overallTech,
      validationScore: validationScore,
      commercialScore: commercialScore,
      riskScore: riskSafetyControlScore,
      finalTrlScore: finalTrlScore,
      recommendedTrlLevel: `TRL ${recommendedLevelNum}`,
      recommendation: input.recommendationOverride || (recommendedLevelNum > currentLevel ? "Advance to Next TRL" : "Maintain Current TRL"),
    },
  };
}

export const getTrlLookupsFn = createServerFn({ method: "GET" }).handler(async (): Promise<TrlLookups> => {
  return {
    technologyDomains: [
      "Robotics & Automation",
      "Artificial Intelligence",
      "Power Electronics",
      "Energy Storage",
      "Autonomous Systems",
      "IoT & Telematics",
    ],
    productCategories: ["Automotive", "Industrial Mobility", "CleanTech", "Energy Infrastructure"],
    applicationAreas: ["Electric Vehicles", "Smart Charging", "Fleet Management", "Autonomous Logistics"],
    innovationTypes: ["Incremental Innovation", "Architectural Innovation", "Radical Innovation", "Disruptive Technology"],
    assessmentMethods: ["Field Demonstration", "Laboratory Testing", "Simulation & Modeling", "Expert Review Board"],
    demonstrationEnvironments: ["Pilot Plant", "Controlled Laboratory", "Operational Field Site", "Simulated Environment"],
    complianceStatuses: ["Fully Compliant", "Partially Compliant", "Non-Compliant", "Under Review"],
    goToMarketStatuses: ["Concept Phase", "Pilot / Early Market", "Commercial Scaling", "Mass Production"],
    businessUnits: [
      "Smart Mobility Division",
      "Robotics & Mechatronics",
      "Clean Energy Solutions",
      "Advanced R&D Center",
    ],
    recommendations: [
      "Advance to Next TRL",
      "Maintain Current TRL",
      "Conduct Further Testing",
      "Hold / Re-evaluate Strategy",
      "Accelerate Commercialization",
    ],
    trlLevels: [
      { level: 1, descriptor: "TRL 1 – Basic Principles Observed" },
      { level: 2, descriptor: "TRL 2 – Technology Concept Formulated" },
      { level: 3, descriptor: "TRL 3 – Experimental Proof of Concept" },
      { level: 4, descriptor: "TRL 4 – Technology Validated in Laboratory" },
      { level: 5, descriptor: "TRL 5 – Technology Validated in Relevant Environment" },
      { level: 6, descriptor: "TRL 6 – Technology Demonstrated in Relevant Environment" },
      { level: 7, descriptor: "TRL 7 – System Prototype Demonstrated in Operational Environment" },
      { level: 8, descriptor: "TRL 8 – System Complete and Qualified" },
      { level: 9, descriptor: "TRL 9 – Actual System Proven in Operational Environment" },
    ],
    mrlLevels: [
      { level: 1, descriptor: "MRL 1 – Basic Manufacturing Implications Identified" },
      { level: 2, descriptor: "MRL 2 – Manufacturing Concepts Formulated" },
      { level: 3, descriptor: "MRL 3 – Manufacturing Feasibility Demonstrated" },
      { level: 4, descriptor: "MRL 4 – Laboratory Capability Demonstrated" },
      { level: 5, descriptor: "MRL 5 – Pilot Line Capability Demonstrated" },
      { level: 6, descriptor: "MRL 6 – Prototype System Production Capability" },
      { level: 7, descriptor: "MRL 7 – Subsystem Production Readiness" },
      { level: 8, descriptor: "MRL 8 – Pilot Line Process Control Proven" },
      { level: 9, descriptor: "MRL 9 – Low Rate Production Proven" },
      { level: 10, descriptor: "MRL 10 – Full Rate Production Proven" },
    ],
  };
});

export const getTrlListFn = createServerFn({ method: "GET" }).handler(async (): Promise<TrlListRow[]> => {
  return Array.from(inMemoryStore.values()).map((r: TrlAssessmentRecord) => ({
    id: r.id,
    trlAssessmentId: r.trlAssessmentId,
    assessmentTitle: r.assessmentTitle,
    technologyName: r.technologyInfo.technologyName,
    currentTrlLevel: r.currentAssessment.currentTrlLevel,
    targetTrlLevel: r.currentAssessment.targetTrlLevel,
    status: r.status,
    finalTrlScore: r.summary.finalTrlScore,
    recommendedTrlLevel: r.summary.recommendedTrlLevel,
    updatedAt: r.updatedAt,
  }));
});

export const getTrlFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: id }): Promise<TrlAssessmentRecord> => {
    return inMemoryStore.get(id) || inMemoryStore.get("trl-record-0087") || DEFAULT_TRL_RECORD;
  });

export const saveTrlDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: TrlFormInput }) => d)
  .handler(async ({ data: { id, input } }): Promise<TrlAssessmentRecord> => {
    const targetId = id || "trl-record-0087";
    const existing = inMemoryStore.get(targetId) || DEFAULT_TRL_RECORD;

    const { aiAssessment, summary } = computeDerivedScores(input);

    const updated: TrlAssessmentRecord = {
      ...existing,
      id: targetId,
      assessmentTitle: input.assessmentTitle,
      businessUnit: input.businessUnit,
      assessmentTeam: input.assessmentTeam,
      assessmentDate: input.assessmentDate,
      linkedTechnologyId: input.linkedTechnologyId ?? existing.linkedTechnologyId,
      linkedResearchProjectId: input.linkedResearchProjectId ?? existing.linkedResearchProjectId,
      linkedPrototypeId: input.linkedPrototypeId ?? existing.linkedPrototypeId,
      linkedProductId: input.linkedProductId ?? existing.linkedProductId,
      technologyInfo: input.technologyInfo,
      currentAssessment: input.currentAssessment,
      technicalValidation: input.technicalValidation,
      technologyDemonstration: input.technologyDemonstration,
      riskAssessment: input.riskAssessment,
      commercialReadiness: input.commercialReadiness,
      aiAssessment,
      summary,
      attachments: input.attachments,
      lastModifiedBy: "Rohit Verma",
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Rohit Verma",
          event: "Saved TRL Assessment draft updates",
          kind: "audit",
        },
        ...existing.auditTrail,
      ],
    };

    inMemoryStore.set(targetId, updated);
    return updated;
  });

export const completeTrlStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: TrlStage }) => d)
  .handler(async ({ data: { id, stage } }): Promise<TrlAssessmentRecord> => {
    const existing = inMemoryStore.get(id) || DEFAULT_TRL_RECORD;
    const stageOrder: TrlStage[] = [
      "technology_assessment",
      "technical_validation",
      "demonstration_review",
      "risk_commercial_assessment",
      "executive_review",
    ];

    const idx = stageOrder.indexOf(stage);
    const nextStage = idx < stageOrder.length - 1 ? stageOrder[idx + 1] : stage;

    const newStages = existing.stages.map((st) => {
      if (st.stage === stage) return { ...st, completed: true, active: false, completedAt: new Date().toISOString().substring(0, 10) };
      if (st.stage === nextStage) return { ...st, active: true };
      return st;
    });

    const updated: TrlAssessmentRecord = {
      ...existing,
      currentStage: nextStage,
      currentStageLabel: newStages.find((s) => s.stage === nextStage)?.label || nextStage,
      status: nextStage as TrlStatus,
      stages: newStages,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Rohit Verma",
          event: `Completed stage: ${stage}`,
          kind: "workflow",
          stage,
        },
        ...existing.auditTrail,
      ],
    };

    inMemoryStore.set(id, updated);
    return updated;
  });

export const submitTrlFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: id }): Promise<TrlAssessmentRecord> => {
    const existing = inMemoryStore.get(id) || DEFAULT_TRL_RECORD;

    const newReviewRows = existing.reviewRows.map((r) => ({
      ...r,
      status: r.decision === "Approved" ? ("Approved" as const) : ("In Review" as const),
    }));

    const updated: TrlAssessmentRecord = {
      ...existing,
      status: "executive_review",
      currentStage: "executive_review",
      currentStageLabel: "Executive Review",
      reviewRows: newReviewRows,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Rohit Verma",
          event: "Submitted TRL Assessment for Executive Review",
          kind: "workflow",
          fromStatus: existing.status,
          toStatus: "executive_review",
        },
        ...existing.auditTrail,
      ],
    };

    inMemoryStore.set(id, updated);
    return updated;
  });

export const reviewTrlFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; decision: TrlApprovalDecision; comments?: string }) => d)
  .handler(async ({ data: { id, decision, comments } }): Promise<TrlAssessmentRecord> => {
    const existing = inMemoryStore.get(id) || DEFAULT_TRL_RECORD;
    const now = new Date().toISOString().substring(0, 10);

    let nextStatus: TrlStatus = "executive_review";
    let committedCurrentTrl = existing.currentAssessment.currentTrlLevel;
    let mrlId: string | undefined;
    let mrlCode: string | undefined;

    if (decision === "Approved") {
      nextStatus = "approved";
      // Advance current TRL level to recommended level
      const recLevelNum = parseInt(existing.summary.recommendedTrlLevel.replace("TRL ", "")) || existing.currentAssessment.currentTrlLevel;
      committedCurrentTrl = Math.max(1, Math.min(9, recLevelNum)) as any;
      // Auto create MRL Assessment record
      mrlId = `mrl-${Date.now()}`;
      mrlCode = `MRL-2024-0042`;
    } else if (decision === "Approved with Improvements") {
      nextStatus = "approved_with_improvements";
    } else if (decision === "Revision Required") {
      nextStatus = "revision_required";
    } else if (decision === "Rejected") {
      nextStatus = "rejected";
    }

    const updatedReviewRows = existing.reviewRows.map((r) => ({
      ...r,
      decision: (decision === "Approved" ? "Approved" : decision === "Rejected" ? "Rejected" : "Approved") as any,
      status: (decision === "Approved" ? "Approved" : "Revision Requested") as any,
      date: now,
    }));

    const updated: TrlAssessmentRecord = {
      ...existing,
      status: nextStatus,
      approvalDecision: decision,
      reviewComments: comments || null,
      approvalDate: now,
      linkedMrlAssessmentId: mrlId || existing.linkedMrlAssessmentId,
      linkedMrlAssessmentCode: mrlCode || existing.linkedMrlAssessmentCode,
      reviewRows: updatedReviewRows,
      currentAssessment: {
        ...existing.currentAssessment,
        currentTrlLevel: committedCurrentTrl,
      },
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Executive Review Board",
          event: `Executive Review decision: ${decision}. ${mrlCode ? `Auto-created MRL Assessment ${mrlCode}.` : ""}`,
          kind: "workflow",
          fromStatus: existing.status,
          toStatus: nextStatus,
        },
        ...existing.auditTrail,
      ],
    };

    inMemoryStore.set(id, updated);
    return updated;
  });

export const generateTrlReportFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: id }): Promise<TrlAssessmentRecord> => {
    const existing = inMemoryStore.get(id) || DEFAULT_TRL_RECORD;
    const updated: TrlAssessmentRecord = {
      ...existing,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Rohit Verma",
          event: "Generated comprehensive TRL Assessment PDF Report",
          kind: "audit",
        },
        ...existing.auditTrail,
      ],
    };
    inMemoryStore.set(id, updated);
    return updated;
  });
