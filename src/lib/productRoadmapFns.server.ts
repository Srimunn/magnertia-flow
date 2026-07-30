import { createServerFn } from "@tanstack/react-start";
import type {
  ProductRoadmapApprovalDecision,
  ProductRoadmapFormInput,
  ProductRoadmapRecord,
  ProductRoadmapStage,
  ProductRoadmapStatus,
} from "@/services/types";

/* ===========================================================================
   Product Roadmap — Server Functions & Workflow Engine
   ---------------------------------------------------------------------------
   Manages the 4-stage Product Roadmap lifecycle:
     Stage 1: Roadmap Planning
     Stage 2: Resource & Technology Planning
     Stage 3: Risk & Business Assessment
     Stage 4: Executive Review (Decision: Approved / Approved with Conditions / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Auto-creates linked Release Plan (e.g. RLP-2024-0042)
       and surfaces its ID.
   =========================================================================== */

export function calculateProductRoadmapScores(input: Partial<ProductRoadmapFormInput>) {
  // Strategic Progress (0-100)
  const completedReleases = input.releases?.filter((r) => r.status === "completed").length || 0;
  const totalReleases = input.releases?.length || 4;
  const strategicProgress = Math.min(100, Math.round(55 + (completedReleases / totalReleases) * 35));

  // Product Readiness (0-100)
  const featuresCount = input.features?.length || 4;
  const productReadiness = Math.min(100, Math.round(60 + featuresCount * 6));

  // Innovation Progress (0-100)
  const techHighCount = input.techInitiatives?.filter((t) => t.readiness === "High").length || 1;
  const innovationProgress = Math.min(100, Math.round(50 + techHighCount * 18));

  // Budget Health (0-100)
  const utilPct = input.budgetUtilizationPct || 82;
  const budgetHealth = Math.min(100, Math.round(Math.max(40, 100 - Math.abs(utilPct - 85) * 2)));

  // Overall Score
  const overallScore = Math.round(
    strategicProgress * 0.3 + productReadiness * 0.25 + innovationProgress * 0.25 + budgetHealth * 0.2
  );

  // Risk Score (32/100 default)
  const riskScore = input.risks?.overallScore || 32;

  // AI Release Priority Score & Confidence
  const aiReleasePriorityScore = Math.min(98, Math.max(70, Math.round(overallScore * 0.95 + 6)));
  const aiRoadmapConfidenceScore = Math.min(99, Math.max(68, Math.round(overallScore * 0.96 + 5)));

  return {
    sidebarSummary: {
      overallScore,
      strategicProgress,
      productReadiness,
      innovationProgress,
      budgetHealth,
    },
    businessImpact: {
      projectedRevenue: (input.devBudget || 45000000) * 15,
      revenueYoYDelta: "+34.5% vs FY24",
      grossMarginPct: 44.5,
      marginYoYDelta: "+2.8% expansion",
      marketSharePct: 28.5,
      marketShareYoYDelta: "+6.2% gain",
    },
    aiInsights: {
      aiReleasePriorityScore,
      aiRevenueForecast: (input.devBudget || 45000000) * 15,
      aiRoadmapConfidenceScore,
      aiRecommendations: [
        "Accelerate v2.2 DC Fast Charger beta deployment to Q4 2024 to capture early DISCOM tenders.",
        "Resource allocation on V2G Cloud Telemetry is optimal; maintain current sprint velocity.",
        "Grid interconnect regulatory approval risk requires proactive liaison with state DISCOMs.",
      ],
    },
  };
}

const INITIAL_INPUT: ProductRoadmapFormInput = {
  roadmapName: "Smart EV Charger Pro Product Roadmap (2024-2027)",
  linkedStrategyId: "PS-2024-0017",
  linkedStrategyName: "Smart EV Charger Pro Strategy 2024-2027",
  linkedProductId: "prd-1001",
  linkedProductName: "Smart EV Charger Pro",
  productLine: "Ultra-Fast Commercial Series",
  businessUnit: "Smart EV Infrastructure",
  productManagerId: "usr-104",
  productManagerName: "Vikram Sharma",
  roadmapPeriodStart: "2024-04-01",
  roadmapPeriodEnd: "2027-03-31",

  // Panel 1: Vision Alignment (inherited from Product Strategy PS-2024-0017)
  productVision: "To establish Magnertia as the premier provider of intelligent, ultra-fast commercial EV charging infrastructure in South Asia, enabling seamless fleet transition and grid stability.",
  targetMarket: ["EV Fleet Operators", "Commercial Hubs", "Highway Service Plazas", "Logistics & Delivery Hubs", "Government Operators"],
  valueProposition: "Sub-15 minute rapid charging with 99.8% uptime SLA, AI dynamic price optimization, and zero-downtime modular power stack replacement.",
  strategicAlignmentScore: 92,

  // Panel 2 & 3: Releases (Single source of truth)
  releases: [
    { id: "rel-01", version: "v2.1", releaseName: "AC Charger Core Upgrade", targetDate: "2024-06-30", startMonthIdx: 0, durationMonths: 3, status: "completed", priority: "P1 - Critical", color: "#10B981" },
    { id: "rel-02", version: "v2.2", releaseName: "240kW DC Fast Charger Stack", targetDate: "2024-11-15", startMonthIdx: 3, durationMonths: 5, status: "in_progress", priority: "P1 - Critical", color: "#0A3C75" },
    { id: "rel-03", version: "v2.3", releaseName: "Wireless RFID & Plug-and-Charge", targetDate: "2025-03-31", startMonthIdx: 8, durationMonths: 4, status: "upcoming", priority: "P2 - High", color: "#F59E0B" },
    { id: "rel-04", version: "v3.0", releaseName: "V2G Bi-Directional Grid Integration", targetDate: "2025-09-30", startMonthIdx: 12, durationMonths: 6, status: "planned", priority: "P2 - High", color: "#8B5CF6" },
  ],

  // Panel 4: Top Features
  features: [
    { id: "feat-01", featureName: "Dynamic Load Balancing Engine", category: "AI Telemetry", valueStars: 5, priority: "P1", status: "in_progress" },
    { id: "feat-02", featureName: "OCPP 2.0.1 Interoperability Stack", category: "Core Firmware", valueStars: 5, priority: "P1", status: "completed" },
    { id: "feat-03", featureName: "Modular Liquid-Cooled Dispenser", category: "Hardware", valueStars: 4, priority: "P2", status: "in_progress" },
    { id: "feat-04", featureName: "Fleet Billing & Subscription SaaS", category: "Cloud Platform", valueStars: 4, priority: "P2", status: "planned" },
  ],

  // Panel 5: Technology Roadmap
  techInitiatives: [
    { id: "tech-01", initiative: "Silicon Carbide (SiC) Power Module", area: "Power Electronics", readiness: "High", timeline: "2024 - 2025" },
    { id: "tech-02", initiative: "Edge AI Thermal Predictive Dispatch", area: "Embedded AI", readiness: "Medium", timeline: "2024 - 2026" },
    { id: "tech-03", initiative: "Solar Microgrid Direct DC Coupling", area: "Energy Storage", readiness: "High", timeline: "2025 - 2027" },
  ],

  // Panel 6: Resource & Budget Metrics
  devBudget: 45000000,
  rdBudget: 28000000,
  plannedInvestment: 185000000,
  budgetUtilizationPct: 82.4,
  resourceBudgetHistory: [
    { year: "FY24", budgetPlanned: 35000000, budgetUtilized: 34200000, utilizationPct: 97.7 },
    { year: "FY25", budgetPlanned: 45000000, budgetUtilized: 37100000, utilizationPct: 82.4 },
    { year: "FY26", budgetPlanned: 55000000, budgetUtilized: 0, utilizationPct: 0 },
  ],

  // Panel 7: Milestones & Dependencies
  milestones: [
    { id: "ms-01", milestoneName: "Alpha Prototype Verification & DISCOM Pilot", targetDate: "2024-09-15", dependency: "SiC Power Module Validation", status: "completed" },
    { id: "ms-02", milestoneName: "OCPP 2.0.1 Cloud Integration & Beta Trial", targetDate: "2024-11-15", dependency: "v2.2 DC Stack Release", status: "in_progress" },
    { id: "ms-03", milestoneName: "Commercial Manufacturing Release (150 Units)", targetDate: "2025-03-31", dependency: "ARAI Safety Certification", status: "pending" },
  ],

  // Panel 8: Risk Management
  risks: {
    strategicRisk: 2,
    technicalRisk: 2,
    marketRisk: 3,
    financialRisk: 2,
    overallScore: 32,
    mitigationStrategy: "Dual-sourced power modules; DISCOM pre-certification liaison; SLA guarantee insurance for 99.8% uptime.",
  },

  // Panel 9: Attachments
  attachments: [
    { id: "att-01", name: "Product_Strategy.pdf", size: "4.2 MB", type: "pdf", uploadedAt: "2024-04-20" },
    { id: "att-02", name: "Roadmap_Presentation.pptx", size: "12.8 MB", type: "pptx", uploadedAt: "2024-04-22" },
    { id: "att-03", name: "Release_Plan.xlsx", size: "1.8 MB", type: "xlsx", uploadedAt: "2024-04-25" },
    { id: "att-04", name: "Budget_Plan.xlsx", size: "2.4 MB", type: "xlsx", uploadedAt: "2024-04-26" },
  ],

  // Panel 10: Review & Approval Matrix
  reviewers: [
    { id: "rev-01", role: "Product Manager", name: "Vikram Sharma", decision: "Approved", status: "Verified", date: "2024-04-20" },
    { id: "rev-02", role: "Engineering Manager", name: "Dr. Rajesh Kumar", decision: "Approved", status: "Verified", date: "2024-04-21" },
    { id: "rev-03", role: "Marketing Director", name: "Priya Nair", decision: "Approved", status: "Verified", date: "2024-04-22" },
    { id: "rev-04", role: "CTO", name: "Dr. Aris Thorne", decision: "Approved", status: "Verified", date: "2024-04-24" },
    { id: "rev-05", role: "CEO", name: "Srinivas Rao", decision: "Pending", status: "Under Review", date: undefined },
  ],
  approvalDecision: null,
  reviewComments: "Comprehensive roadmap alignment with Product Strategy PS-2024-0017. Hardware timeline is achievable.",
  approvalDate: "2024-04-28",
};

const initialCalculated = calculateProductRoadmapScores(INITIAL_INPUT);

let DEFAULT_PRODUCT_ROADMAP_RECORD: ProductRoadmapRecord = {
  id: "prm-record-0017",
  roadmapId: "PRM-2024-0017",
  formCode: "PRM-2024-08",
  roadmapName: INITIAL_INPUT.roadmapName,
  status: "executive_review",
  currentStage: "executive_review",
  currentStageLabel: "Executive Review",

  linkedStrategyId: INITIAL_INPUT.linkedStrategyId,
  linkedStrategyName: INITIAL_INPUT.linkedStrategyName,
  linkedProductId: INITIAL_INPUT.linkedProductId,
  linkedProductName: INITIAL_INPUT.linkedProductName,
  productLine: INITIAL_INPUT.productLine,
  businessUnit: INITIAL_INPUT.businessUnit,
  productManagerId: INITIAL_INPUT.productManagerId,
  productManagerName: INITIAL_INPUT.productManagerName,
  productManagerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  roadmapPeriodStart: INITIAL_INPUT.roadmapPeriodStart,
  roadmapPeriodEnd: INITIAL_INPUT.roadmapPeriodEnd,

  dateCreated: "2024-04-20",
  lastModified: new Date().toISOString().split("T")[0],
  version: "v1.4",

  stages: [
    { stage: "roadmap_planning", label: "Roadmap Planning", completed: true, active: false, completedAt: "2024-04-22" },
    { stage: "resource_technology_planning", label: "Resource & Technology", completed: true, active: false, completedAt: "2024-04-24" },
    { stage: "risk_business_assessment", label: "Risk & Business Assessment", completed: true, active: false, completedAt: "2024-04-26" },
    { stage: "executive_review", label: "Executive Review", completed: false, active: true },
  ],

  input: INITIAL_INPUT,
  aiInsights: initialCalculated.aiInsights,
  sidebarSummary: initialCalculated.sidebarSummary,
  businessImpact: initialCalculated.businessImpact,

  linkedReleasePlanId: null,
  approvalDecision: null,
  approvalDate: null,
  reviewComments: null,

  auditTrail: [
    { id: "aud-001", timestamp: "2024-04-20 10:00", user: "Vikram Sharma", action: "Record Created", details: "Product Roadmap created from Approved Product Strategy PS-2024-0017." },
    { id: "aud-002", timestamp: "2024-04-22 14:30", user: "Vikram Sharma", action: "Stage Completed", details: "Stage 1: Roadmap Planning completed with 4 release initiatives." },
    { id: "aud-003", timestamp: "2024-04-24 16:15", user: "Vikram Sharma", action: "Stage Completed", details: "Stage 2: Resource & Technology Planning validated dependencies." },
    { id: "aud-004", timestamp: "2024-04-26 11:00", user: "Vikram Sharma", action: "Stage Completed", details: "Stage 3: Risk & Business Assessment score computed." },
    { id: "aud-005", timestamp: "2024-04-26 11:05", user: "Vikram Sharma", action: "Submitted for Review", details: "Submitted to Roadmap Review Committee for Executive Review." },
  ],
};

/* ===========================================================================
   Server Functions
   =========================================================================== */

export const getProductRoadmapFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: DEFAULT_PRODUCT_ROADMAP_RECORD };
});

export const saveProductRoadmapDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: ProductRoadmapFormInput }) => data)
  .handler(async ({ data }) => {
    const updatedCalc = calculateProductRoadmapScores(data.input);

    DEFAULT_PRODUCT_ROADMAP_RECORD = {
      ...DEFAULT_PRODUCT_ROADMAP_RECORD,
      roadmapName: data.input.roadmapName,
      input: data.input,
      sidebarSummary: updatedCalc.sidebarSummary,
      aiInsights: updatedCalc.aiInsights,
      businessImpact: updatedCalc.businessImpact,
      lastModified: new Date().toISOString().split("T")[0],
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          user: data.input.productManagerName || "Product Manager",
          action: "Saved Draft",
          details: "Updated roadmap form inputs, timeline releases, and recalculated AI metrics.",
        },
        ...DEFAULT_PRODUCT_ROADMAP_RECORD.auditTrail,
      ],
    };
    return { success: true, data: DEFAULT_PRODUCT_ROADMAP_RECORD };
  });

export const advanceProductRoadmapStageFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; targetStage: ProductRoadmapStage }) => data)
  .handler(async ({ data }) => {
    const stageOrder: ProductRoadmapStage[] = [
      "roadmap_planning",
      "resource_technology_planning",
      "risk_business_assessment",
      "executive_review",
    ];

    const targetIdx = stageOrder.indexOf(data.targetStage);
    const today = new Date().toISOString().split("T")[0];

    const newStages = DEFAULT_PRODUCT_ROADMAP_RECORD.stages.map((s, idx) => {
      if (idx < targetIdx) return { ...s, completed: true, active: false, completedAt: s.completedAt || today };
      if (idx === targetIdx) return { ...s, active: true, completed: false };
      return { ...s, active: false, completed: false };
    });

    DEFAULT_PRODUCT_ROADMAP_RECORD = {
      ...DEFAULT_PRODUCT_ROADMAP_RECORD,
      currentStage: data.targetStage,
      currentStageLabel:
        data.targetStage === "roadmap_planning"
          ? "Roadmap Planning"
          : data.targetStage === "resource_technology_planning"
          ? "Resource & Technology"
          : data.targetStage === "risk_business_assessment"
          ? "Risk & Business Assessment"
          : "Executive Review",
      status: data.targetStage as ProductRoadmapStatus,
      stages: newStages,
      lastModified: today,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          user: DEFAULT_PRODUCT_ROADMAP_RECORD.productManagerName,
          action: "Stage Advanced",
          details: `Advanced workflow stage to ${data.targetStage}.`,
        },
        ...DEFAULT_PRODUCT_ROADMAP_RECORD.auditTrail,
      ],
    };

    return { success: true, data: DEFAULT_PRODUCT_ROADMAP_RECORD };
  });

export const submitProductRoadmapFn = createServerFn({ method: "POST" })
  .validator((data: string) => data)
  .handler(async () => {
    const today = new Date().toISOString().split("T")[0];
    const newStages = DEFAULT_PRODUCT_ROADMAP_RECORD.stages.map((s) => {
      if (s.stage === "executive_review") return { ...s, active: true, completed: false };
      return { ...s, completed: true, active: false, completedAt: s.completedAt || today };
    });

    DEFAULT_PRODUCT_ROADMAP_RECORD = {
      ...DEFAULT_PRODUCT_ROADMAP_RECORD,
      status: "executive_review",
      currentStage: "executive_review",
      currentStageLabel: "Executive Review",
      stages: newStages,
      lastModified: today,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          user: DEFAULT_PRODUCT_ROADMAP_RECORD.productManagerName,
          action: "Submitted for Executive Review",
          details: "Submitted roadmap package to Executive Roadmap Review Committee.",
        },
        ...DEFAULT_PRODUCT_ROADMAP_RECORD.auditTrail,
      ],
    };

    return { success: true, data: DEFAULT_PRODUCT_ROADMAP_RECORD };
  });

export const reviewProductRoadmapFn = createServerFn({ method: "POST" })
  .validator((data: {
    id: string;
    decision: ProductRoadmapApprovalDecision;
    comments?: string;
  }) => data)
  .handler(async ({ data }) => {
    const today = new Date().toISOString().split("T")[0];
    let newStatus: ProductRoadmapStatus = "executive_review";
    let linkedReleasePlanId: string | null = DEFAULT_PRODUCT_ROADMAP_RECORD.linkedReleasePlanId || null;

    if (data.decision === "approved") {
      newStatus = "approved";
      linkedReleasePlanId = linkedReleasePlanId || `RLP-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (data.decision === "approved_with_conditions") {
      newStatus = "approved_with_conditions";
      linkedReleasePlanId = linkedReleasePlanId || `RLP-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (data.decision === "revision_required") {
      newStatus = "revision_required";
    } else if (data.decision === "rejected") {
      newStatus = "rejected";
    }

    const newStages = DEFAULT_PRODUCT_ROADMAP_RECORD.stages.map((s) => {
      if (s.stage === "executive_review") {
        return {
          ...s,
          completed: data.decision === "approved" || data.decision === "approved_with_conditions",
          active: data.decision === "revision_required",
          completedAt: data.decision === "approved" || data.decision === "approved_with_conditions" ? today : undefined,
        };
      }
      return s;
    });

    DEFAULT_PRODUCT_ROADMAP_RECORD = {
      ...DEFAULT_PRODUCT_ROADMAP_RECORD,
      status: newStatus,
      approvalDecision: data.decision,
      approvalDate: today,
      reviewComments: data.comments || null,
      linkedReleasePlanId: linkedReleasePlanId,
      stages: newStages,
      lastModified: today,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          user: "Roadmap Review Committee",
          action: `Executive Review Decision: ${data.decision.toUpperCase()}`,
          details: `Decision: ${data.decision}. Comments: ${data.comments || "None"}. ${
            linkedReleasePlanId ? `Release Plan ${linkedReleasePlanId} auto-created.` : ""
          }`,
        },
        ...DEFAULT_PRODUCT_ROADMAP_RECORD.auditTrail,
      ],
    };

    return { success: true, data: DEFAULT_PRODUCT_ROADMAP_RECORD };
  });
