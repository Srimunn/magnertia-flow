import { createServerFn } from "@tanstack/react-start";
import type {
  ProductStrategyApprovalDecision,
  ProductStrategyFormInput,
  ProductStrategyRecord,
  ProductStrategyStage,
  ProductStrategyStatus,
} from "@/services/types";

/* ===========================================================================
   Product Strategy — Server Functions & Workflow Engine
   ---------------------------------------------------------------------------
   Manages the 4-stage Product Strategy lifecycle:
     Stage 1: Strategic Vision
     Stage 2: Market & Portfolio Strategy
     Stage 3: Financial & Innovation Strategy
     Stage 4: Executive Review (Decision: Approved / Revision Required / Additional Investigation / Rejected)

   Upon 'Approved' decision:
     - Auto-creates linked Product Roadmap (e.g. PRM-2024-0042)
       and surfaces its ID.
   =========================================================================== */

export function calculateProductStrategyScores(input: Partial<ProductStrategyFormInput>) {
  // Compute Market Readiness Score (0-100)
  const segmentsCount = input.marketSegments?.length || 0;
  const targetCount = input.targetCustomers?.length || 0;
  const marketReadiness = Math.min(100, Math.round(
    40 + (segmentsCount * 12) + (targetCount * 10) + (input.competitivePositioning || 3) * 6
  ));

  // Compute Innovation Score (0-100)
  const techCount = input.emergingTechnologies?.length || 0;
  const energyCount = input.energyStrategy?.length || 0;
  const innovationScore = Math.min(100, Math.round(
    35 + (techCount * 15) + (energyCount * 10) + (input.esgAlignment || 4) * 6
  ));

  // Compute Financial Score (0-100)
  const grossMargin = input.grossMargin || 42;
  const roi = input.roiYears || 3.2;
  const financialScore = Math.min(100, Math.round(
    Math.max(30, (grossMargin * 1.2) + Math.max(0, 30 - roi * 4) + ((input.revenueForecast || 50000000) > 20000000 ? 25 : 15))
  ));

  // Compute Strategic Score (0-100)
  const growthStar = input.growthPotential || 4.5;
  const visionLen = (input.productVision?.length || 50) > 30 ? 25 : 10;
  const strategicScore = Math.min(100, Math.round(
    25 + (growthStar * 12) + visionLen + (input.keyPartnerships?.length || 0) * 8
  ));

  // Overall Weighted Score
  const overallScore = Math.round(
    marketReadiness * 0.25 + innovationScore * 0.25 + financialScore * 0.30 + strategicScore * 0.20
  );

  // AI Score Tiles
  const aiMarketOpportunityScore = Math.min(98, Math.max(65, Math.round(marketReadiness * 0.95 + 5)));
  const aiProductDifferentiationScore = Math.min(99, Math.max(70, Math.round(innovationScore * 0.96 + 4)));
  const aiRevenuePredictionScore = Math.min(96, Math.max(60, Math.round(financialScore * 0.94 + 3)));
  const aiCompetitivePositionScore = Math.min(97, Math.max(68, Math.round(strategicScore * 0.97 + 2)));

  let aiRecommendation = "Proceed to Product Development";
  if (overallScore < 50) {
    aiRecommendation = "Conduct Further Market Research & Refine Financial Model";
  } else if (overallScore < 75) {
    aiRecommendation = "Optimize Revenue Strategy & ESG Alignment";
  }

  return {
    sidebarSummary: {
      overallScore,
      marketReadiness,
      innovationScore,
      financialScore,
      strategicScore,
    },
    aiAssessment: {
      aiMarketOpportunityScore,
      aiProductDifferentiationScore,
      aiRevenuePredictionScore,
      aiCompetitivePositionScore,
      aiStrategicRecommendations: `High alignment identified for ${input.productCategory || "EV Infrastructure"}. Recommend accelerating V2G bi-directional charging deployment to capture fleet market leadership ahead of regional mandates.`,
      aiEmergingOpportunity: `Unlocks ₹45 Cr subscription software potential by packaging AI-driven predictive fleet energy management with hardware installation.`,
      aiRiskPrediction: `Grid compliance approval cycle in Tier-1 metros presents a 60-day potential delay. Regulatory risk rating requires proactive liaison with state DISCOMs.`,
      aiRecommendation,
    },
    keyMetrics: {
      tam: input.marketOpportunitySize || 125000000,
      projectedRevenue: input.revenueForecast || 48000000,
      timeframe: "3-Year Horizon",
      grossMargin: input.grossMargin || 42.5,
      expectedRoi: Math.round(((input.revenueForecast || 48000000) / (input.investmentBudget3Y || 12000000)) * 100),
      breakevenMonths: input.breakevenPeriodMonths || 18,
      aiRecommendation,
    },
  };
}

const INITIAL_INPUT: ProductStrategyFormInput = {
  strategyName: "Smart EV Charger Pro Strategy 2024-2027",
  linkedProductId: "prd-1001",
  linkedProductName: "Smart EV Charger Pro",
  linkedCommercializationId: "cmp-0015",
  linkedCommercializationCode: "CMP-2024-0015",
  linkedBusinessPlanId: "bp-0002",
  linkedBusinessPlanCode: "BP-2024-0002",
  strategyPeriodStart: "2024-04-01",
  strategyPeriodEnd: "2027-03-31",
  businessUnit: "Smart EV Infrastructure",
  productManagerId: "usr-104",
  productManagerName: "Vikram Sharma",

  // Section 1: Product Vision
  productVision: "To establish Magnertia as the premier provider of intelligent, ultra-fast commercial EV charging infrastructure in South Asia, enabling seamless fleet transition and grid stability.",
  missionStatement: "Deliver ultra-reliable 240kW dual-dispenser charging stations integrated with AI cloud load balancing and microgrid solar compatibility.",
  strategicObjectives: "1. Capture 28% market share in commercial EV fleet charging by FY27.\n2. Achieve 42.5% gross margin on hardware + software suite.\n3. Deploy 1,500 active charge points across key logistics corridors.",
  valueProposition: "Sub-15 minute rapid charging with 99.8% uptime SLA, AI dynamic price optimization, and zero-downtime modular power stack replacement.",
  targetCustomers: ["EV Fleet Operators", "Commercial Hubs", "Highway Service Plazas", "Logistics & Delivery Hubs", "Government Operators"],

  // Section 2: Market Strategy
  marketSegments: ["Fleet Management (B2B)", "Commercial Real Estate", "Municipal Mobility", "Highway Corridors"],
  customerPersonas: "Fleet Manager: Needs maximum vehicle uptime & low TCO.\nFacility Manager: Requires load control without upgrading building transformer.\nEV Owner: Expects instant plug-and-charge authorization.\nGovernment Operator: Focuses on ESG compliance and public access tariffs.",
  customerJourney: "Discovery via Commercialization Portal → Site Assessment & Power Budgeting → Modular Deployment → Continuous Cloud Analytics & Automated Dispatch.",

  // Section 3: Product Portfolio Strategy
  productCategory: "EV Charging Infrastructure",
  productLine: "Ultra-Fast Commercial Series",
  growthPotential: 4.5,
  portfolioRole: "Core Flagship Growth Engine",
  productLifecycleStage: "Development & Scaling",
  portfolioPriority: "P1 - Critical Priority",

  // Section 4: Innovation Strategy
  emergingTechnologies: ["AI & Machine Learning", "IoT Cloud Telemetry", "Edge Computing", "V2G Grid Balancing", "Gallium Nitride Power Semiconductors"],
  aiBasedInnovations: "Predictive thermal management and AI dynamic load-shedding algorithm to optimize peak-hour electricity grid draw by up to 34%.",
  energyStrategy: ["Solar Microgrid Direct DC Coupling", "Battery Energy Storage Integration", "Peak Shaving Automation"],
  esgAlignment: 4.8,

  // Section 5: Business Strategy
  businessModel: "B2B Enterprise + Hardware-as-a-Service (HaaS)",
  revenueModel: "Direct Station Sales + Recurring SaaS Management Fee (₹1,500/month/port) + CPO Charging Session Margin.",
  keyPartnerships: ["State Electricity DISCOMs", "Logistics Fleet Chains", "Battery Cell Suppliers", "National Highway Authority"],
  competitivePositioning: 4.6,
  marketOpportunitySize: 1250000000,

  // Section 6: Financial Strategy
  investmentBudget3Y: 185000000,
  developmentCost: 45000000,
  revenueForecast: 680000000,
  grossMargin: 42.5,
  breakevenPeriodMonths: 18,
  roiYears: 2.4,
  pricingStrategy: "Tiered hardware pricing (₹14.5L standard station) with bundled 3-year AI fleet telemetry license and guaranteed 4-hour SLA dispatch.",

  // Section 7: Risk & Compliance
  technicalRisk: 2,
  marketRisk: 2,
  financialRisk: 3,
  regulatoryRisk: 2,
  cybersecurityRisk: 1,
  mitigationStrategy: "ISO 27001 end-to-end telemetry encryption; dual-sourced silicon carbide power modules; pre-negotiated DISCOM interconnect approvals.",
  complianceStatus: "Compliant & Pre-Certified",
  complianceComment: "ARAI & CE safety certifications completed; OCPP 2.0.1 interoperability validated.",
};

const initialCalculated = calculateProductStrategyScores(INITIAL_INPUT);

let DEFAULT_PRODUCT_STRATEGY_RECORD: ProductStrategyRecord = {
  id: "ps-record-0017",
  strategyId: "PS-2024-0017",
  formCode: "PS-2024-08",
  strategyName: INITIAL_INPUT.strategyName,
  status: "executive_review",
  currentStage: "executive_review",
  currentStageLabel: "Executive Review",

  linkedProductId: INITIAL_INPUT.linkedProductId,
  linkedProductName: INITIAL_INPUT.linkedProductName,
  linkedCommercializationId: INITIAL_INPUT.linkedCommercializationId,
  linkedCommercializationCode: INITIAL_INPUT.linkedCommercializationCode,
  linkedBusinessPlanId: INITIAL_INPUT.linkedBusinessPlanId,
  linkedBusinessPlanCode: INITIAL_INPUT.linkedBusinessPlanCode,

  strategyPeriodStart: INITIAL_INPUT.strategyPeriodStart,
  strategyPeriodEnd: INITIAL_INPUT.strategyPeriodEnd,
  businessUnit: INITIAL_INPUT.businessUnit,
  productManagerId: INITIAL_INPUT.productManagerId,
  productManagerName: INITIAL_INPUT.productManagerName,
  productManagerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",

  dateCreated: "2024-04-01",
  lastModified: new Date().toISOString().split("T")[0],

  stages: [
    { stage: "strategic_vision", label: "Strategic Vision", completed: true, active: false, completedAt: "2024-04-05" },
    { stage: "market_portfolio_strategy", label: "Market & Portfolio Strategy", completed: true, active: false, completedAt: "2024-04-12" },
    { stage: "financial_innovation_strategy", label: "Financial & Innovation Strategy", completed: true, active: false, completedAt: "2024-04-20" },
    { stage: "executive_review", label: "Executive Review", completed: false, active: true },
  ],

  input: INITIAL_INPUT,
  aiAssessment: initialCalculated.aiAssessment,
  sidebarSummary: initialCalculated.sidebarSummary,
  keyMetrics: initialCalculated.keyMetrics,

  linkedProductRoadmapId: null,
  approvalDecision: null,
  approvalDate: null,
  reviewComments: null,

  auditTrail: [
    { id: "aud-001", timestamp: "2024-04-01 10:00", user: "Vikram Sharma", action: "Record Created", details: "Product Strategy auto-populated from Commercialization Plan CMP-2024-0015 and Business Plan BP-2024-0002" },
    { id: "aud-002", timestamp: "2024-04-05 14:30", user: "Vikram Sharma", action: "Stage Completed", details: "Stage 1: Strategic Vision completed with AI Vision Clarity score 92/100" },
    { id: "aud-003", timestamp: "2024-04-12 16:15", user: "Vikram Sharma", action: "Stage Completed", details: "Stage 2: Market & Portfolio Strategy completed" },
    { id: "aud-004", timestamp: "2024-04-20 11:00", user: "Vikram Sharma", action: "Stage Completed", details: "Stage 3: Financial & Innovation Strategy completed" },
    { id: "aud-005", timestamp: "2024-04-20 11:05", user: "Vikram Sharma", action: "Submitted for Review", details: "Submitted to Product Strategy Committee for Stage 4 Executive Review" },
  ],
};

/* ===========================================================================
   Server Functions (React Start createServerFn)
   =========================================================================== */

export const getProductStrategyFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: DEFAULT_PRODUCT_STRATEGY_RECORD };
});

export const saveProductStrategyDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: ProductStrategyFormInput }) => data)
  .handler(async ({ data }) => {
    const updatedCalc = calculateProductStrategyScores(data.input);
    
    DEFAULT_PRODUCT_STRATEGY_RECORD = {
      ...DEFAULT_PRODUCT_STRATEGY_RECORD,
      strategyName: data.input.strategyName,
      input: data.input,
      sidebarSummary: updatedCalc.sidebarSummary,
      aiAssessment: updatedCalc.aiAssessment,
      keyMetrics: updatedCalc.keyMetrics,
      lastModified: new Date().toISOString().split("T")[0],
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          user: data.input.productManagerName || "Product Manager",
          action: "Saved Draft",
          details: "Updated strategy form inputs and recalculated AI metrics.",
        },
        ...DEFAULT_PRODUCT_STRATEGY_RECORD.auditTrail,
      ],
    };
    return { success: true, data: DEFAULT_PRODUCT_STRATEGY_RECORD };
  });

export const advanceProductStrategyStageFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; targetStage: ProductStrategyStage }) => data)
  .handler(async ({ data }) => {
    const stageOrder: ProductStrategyStage[] = [
      "strategic_vision",
      "market_portfolio_strategy",
      "financial_innovation_strategy",
      "executive_review",
    ];

    const targetIdx = stageOrder.indexOf(data.targetStage);
    const today = new Date().toISOString().split("T")[0];

    const newStages = DEFAULT_PRODUCT_STRATEGY_RECORD.stages.map((s, idx) => {
      if (idx < targetIdx) return { ...s, completed: true, active: false, completedAt: s.completedAt || today };
      if (idx === targetIdx) return { ...s, active: true, completed: false };
      return { ...s, active: false, completed: false };
    });

    DEFAULT_PRODUCT_STRATEGY_RECORD = {
      ...DEFAULT_PRODUCT_STRATEGY_RECORD,
      currentStage: data.targetStage,
      currentStageLabel:
        data.targetStage === "strategic_vision"
          ? "Strategic Vision"
          : data.targetStage === "market_portfolio_strategy"
          ? "Market & Portfolio Strategy"
          : data.targetStage === "financial_innovation_strategy"
          ? "Financial & Innovation Strategy"
          : "Executive Review",
      status: data.targetStage as ProductStrategyStatus,
      stages: newStages,
      lastModified: today,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          user: DEFAULT_PRODUCT_STRATEGY_RECORD.productManagerName,
          action: "Stage Advanced",
          details: `Advanced workflow stage to ${data.targetStage}.`,
        },
        ...DEFAULT_PRODUCT_STRATEGY_RECORD.auditTrail,
      ],
    };

    return { success: true, data: DEFAULT_PRODUCT_STRATEGY_RECORD };
  });

export const submitProductStrategyFn = createServerFn({ method: "POST" })
  .validator((data: string) => data)
  .handler(async () => {
    const today = new Date().toISOString().split("T")[0];
    const newStages = DEFAULT_PRODUCT_STRATEGY_RECORD.stages.map((s) => {
      if (s.stage === "executive_review") return { ...s, active: true, completed: false };
      return { ...s, completed: true, active: false, completedAt: s.completedAt || today };
    });

    DEFAULT_PRODUCT_STRATEGY_RECORD = {
      ...DEFAULT_PRODUCT_STRATEGY_RECORD,
      status: "executive_review",
      currentStage: "executive_review",
      currentStageLabel: "Executive Review",
      stages: newStages,
      lastModified: today,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          user: DEFAULT_PRODUCT_STRATEGY_RECORD.productManagerName,
          action: "Submitted for Executive Review",
          details: "Submitted strategy package to Executive Product Strategy Committee.",
        },
        ...DEFAULT_PRODUCT_STRATEGY_RECORD.auditTrail,
      ],
    };

    return { success: true, data: DEFAULT_PRODUCT_STRATEGY_RECORD };
  });

export const reviewProductStrategyFn = createServerFn({ method: "POST" })
  .validator((data: {
    id: string;
    decision: ProductStrategyApprovalDecision;
    comments?: string;
  }) => data)
  .handler(async ({ data }) => {
    const today = new Date().toISOString().split("T")[0];
    let newStatus: ProductStrategyStatus = "executive_review";
    let linkedRoadmapId: string | null = DEFAULT_PRODUCT_STRATEGY_RECORD.linkedProductRoadmapId || null;

    if (data.decision === "approved") {
      newStatus = "approved";
      linkedRoadmapId = linkedRoadmapId || `PRM-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (data.decision === "revision_required") {
      newStatus = "revision_required";
    } else if (data.decision === "additional_investigation") {
      newStatus = "additional_investigation";
    } else if (data.decision === "rejected") {
      newStatus = "rejected";
    }

    const newStages = DEFAULT_PRODUCT_STRATEGY_RECORD.stages.map((s) => {
      if (s.stage === "executive_review") {
        return {
          ...s,
          completed: data.decision === "approved",
          active: data.decision !== "approved" && data.decision !== "rejected",
          completedAt: data.decision === "approved" ? today : undefined,
        };
      }
      return s;
    });

    const recommendationText =
      data.decision === "approved"
        ? `APPROVED — Proceed to Product Development. Product Roadmap ${linkedRoadmapId} created.`
        : data.decision === "revision_required"
        ? "REVISION REQUIRED — Product Manager notified to update specific strategy sections."
        : data.decision === "additional_investigation"
        ? "ADDITIONAL INVESTIGATION — Product Manager notified to conduct further market research."
        : "REJECTED — Strategy closed and archived.";

    DEFAULT_PRODUCT_STRATEGY_RECORD = {
      ...DEFAULT_PRODUCT_STRATEGY_RECORD,
      status: newStatus,
      approvalDecision: data.decision,
      approvalDate: today,
      reviewComments: data.comments || null,
      linkedProductRoadmapId: linkedRoadmapId,
      stages: newStages,
      lastModified: today,
      aiAssessment: {
        ...DEFAULT_PRODUCT_STRATEGY_RECORD.aiAssessment,
        aiRecommendation: recommendationText,
      },
      keyMetrics: {
        ...DEFAULT_PRODUCT_STRATEGY_RECORD.keyMetrics,
        aiRecommendation: recommendationText,
      },
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          user: "Product Strategy Committee",
          action: `Executive Review Decision: ${data.decision.toUpperCase()}`,
          details: `Decision: ${data.decision}. Comments: ${data.comments || "None"}. ${
            linkedRoadmapId ? `Product Roadmap ${linkedRoadmapId} auto-created.` : ""
          }`,
        },
        ...DEFAULT_PRODUCT_STRATEGY_RECORD.auditTrail,
      ],
    };

    return { success: true, data: DEFAULT_PRODUCT_STRATEGY_RECORD };
  });

export const generateProductStrategyReportFn = createServerFn({ method: "POST" })
  .validator((data: string) => data)
  .handler(async () => {
    return {
      success: true,
      data: {
        ...DEFAULT_PRODUCT_STRATEGY_RECORD,
        reportGeneratedAt: new Date().toISOString(),
      },
    };
  });
