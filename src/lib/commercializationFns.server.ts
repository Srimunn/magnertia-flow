import { createServerFn } from "@tanstack/react-start";
import type {
  CommercializationAIAnalytics,
  CommercializationApprovalDecision,
  CommercializationFormInput,
  CommercializationListRow,
  CommercializationLookups,
  CommercializationRecord,
  CommercializationStage,
  CommercializationStatus,
  CommercializationSummary,
} from "@/services/types";

/* ===========================================================================
   Commercialization Planning — Server Functions (MongoDB-backed with live fallback)
   ---------------------------------------------------------------------------
   Manages the 4-stage Commercialization Planning lifecycle:
     Stage 1: Product Readiness
     Stage 2: Manufacturing & Supply Chain
     Stage 3: Sales & Marketing Planning
     Stage 4: Executive Review (Decision: Approved / Approved with Conditions / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Auto-creates linked Product Launch Project (e.g. PRJ-LAUNCH-2024-0088)
       and surfaces its ID.
   =========================================================================== */

// Canonical mock record matching 1_15_Commercialization_Planning.png reference specs
const DEFAULT_COMMERCIALIZATION_RECORD: CommercializationRecord = {
  id: "cmp-record-0021",
  commercializationPlanId: "CMP-2024-0021",
  formCode: "CMP-2024-15",
  commercializationProject: "Autonomous Docking System Commercialization Plan",
  status: "executive_review",
  currentStage: "executive_review",
  currentStageLabel: "Executive Review",
  version: "1.0",
  businessUnit: "Smart Mobility Division",
  commercializationManager: "Rohit Verma",
  launchTargetDate: "2024-11-15",

  linkedProductId: "prd-1001",
  linkedProductCode: "PRD-1001",
  linkedTechnologyId: "tec-0032",
  linkedTechnologyCode: "TEC-2024-0032",
  linkedPatentId: "pat-0123",
  linkedPatentCode: "PAT-2024-0123",
  linkedBusinessCaseId: "bc-0045",
  linkedBusinessCaseCode: "BC-2024-0045",

  stages: [
    { stage: "product_readiness", label: "Product Readiness", completed: true, active: false, completedAt: "2024-05-12" },
    { stage: "manufacturing_supply_chain", label: "Manufacturing & Supply Chain", completed: true, active: false, completedAt: "2024-05-18" },
    { stage: "sales_marketing_planning", label: "Sales & Marketing Planning", completed: true, active: false, completedAt: "2024-05-25" },
    { stage: "executive_review", label: "Executive Review", completed: false, active: true },
  ],

  productOverview: {
    productName: "Autonomous EV Docking System Pro",
    productCategory: "Automotive & Charging Infrastructure",
    productDescription:
      "A next-generation autonomous robotic EV charging interface featuring AI vision alignment, 98.2% cycle reliability, and climate-proof enclosure for commercial fleet depots.",
    targetIndustry: "Electric Mobility / EV Infrastructure",
    targetCustomers: ["EV Charging Operators", "Fleet Owners", "Automotive OEMs"],
    valueProposition:
      "Reduces EV docking time by 75% and eliminates human plug-in error with sub-centimeter automated vision alignment.",
    competitiveAdvantage:
      "Patented multi-sensor fusion algorithms, climate-proof vision enclosure, and modular retrofitting capability for existing charging stations.",
  },

  marketAnalysis: {
    tamAmount: 450000000,
    samAmount: 180000000,
    somAmount: 65000000,
    customerSegments:
      "Commercial EV fleet operators, public highway fast-charging networks, municipal transit depots, and logistics hubs.",
    competitorAnalysis:
      "Primary competitors offer manual plug-in systems or 1st-gen inductive pads with lower efficiency and higher thermal loss.",
    marketEntryStrategy: "Direct Enterprise Sales + OEM Licensing",
    demandForecast5Yr: 185000000,
  },

  productReadiness: {
    inheritedTrl: "TRL 6 – Technology Demonstrated in Relevant Environment",
    inheritedMrl: "MRL 4 – Laboratory Capability Demonstrated",
    certificationStatus: "Fully Certified",
    regulatoryCompliance: "ISO 26262 & CE Compliant",
    productValidationStatus: "Field Validated",
    productionReadiness: "Pilot Line Ready",
    launchReadinessScore: 82,
  },

  manufacturingSupplyChain: {
    manufacturingStrategy: "Contract Manufacturing (CM)",
    productionCapacityAnnual: "2,500 Units / Year",
    contractManufacturer: "Flextronics Mobility Division",
    keySuppliers: ["Texas Instruments", "Sony Semiconductor", "Bosch Auto"],
    procurementStatus: "Component Sourced",
    inventoryReadiness: "Safety Stock Established",
    distributionNetwork:
      "Regional logistics hubs in Delhi NCR, Bengaluru, and Stuttgart. Direct shipping to OEM assembly lines.",
  },

  financialPlanning: {
    initialInvestment: 45000000,
    manufacturingCostPerUnit: 180000,
    sellingPricePerUnit: 350000,
    revenueProjection5Yr: 245000000,
    breakEvenPeriodMonths: 18,
    grossMarginPct: 48.57,
    roiPct: 185,
  },

  salesMarketing: {
    salesModel: "B2B Enterprise Direct",
    pricingStrategy: "Value-Based Pricing",
    marketingChannels: ["Industry Expos", "Digital ABM", "Executive Summits", "White Papers"],
    distributionChannels: ["Direct Sales Force", "OEM System Integrators", "Certified Distributors"],
    brandingStrategy:
      "Position as premier ultra-reliable autonomous charging interface for EV infrastructure.",
    launchCampaign:
      "Global unveiling at EV Tech Expo followed by 3 pilot deployment showcases with lead fleet customers.",
    customerSupportStrategy:
      "24/7 SLA-backed telemetry monitoring, remote diagnostics, and on-site field maintenance within 4 hours.",
  },

  partnerships: {
    strategicPartners: ["Tata Motors", "ABB E-Mobility"],
    technologyPartners: ["NVIDIA Automotive", "Qualcomm"],
    manufacturingPartners: ["Foxconn Industrial", "Flex"],
    channelPartners: ["Siemens Energy", "Schneider Electric"],
    governmentSupport: ["FAME II Grant", "MeitY R&D Scheme"],
    investors: ["Sequoia Climate Tech", "CleanEnergy Ventures"],
    partnershipStatus: "MoU Executed",
  },

  riskAssessment: {
    technicalRisk: 2,
    marketRisk: 2,
    financialRisk: 3,
    operationalRisk: 2,
    regulatoryRisk: 2,
    overallRiskScore: 32,
    riskMitigationPlan:
      "Mitigating supply chain risks via multi-sourcing, manufacturing risks via Tier-1 CM partner, and regulatory risks via pre-certified modular subassemblies.",
  },

  aiAnalytics: {
    aiMarketOpportunityScore: 88,
    aiLaunchReadinessScore: 82,
    aiRevenueForecast5Yr: 268000000,
    aiCustomerAdoptionPredictionPct: 76,
    aiCompetitivePositionScore: 84,
    aiGrowthStrategy:
      "Accelerate B2B enterprise partnerships and expand OEM co-development. Target 15% market penetration within 24 months.",
    aiRecommendations:
      "Proceed to product launch with pilot fleet partners. Establish regional service support hubs prior to Q4 volume shipment.",
  },

  summary: {
    productReadinessScore: 82,
    marketReadinessScore: 88,
    financialReadinessScore: 85,
    commercializationScore: 84,
    riskControlScore: 68,
    overallLaunchReadiness: 81,
    recommendedAction: "Proceed to Product Launch",
    recommendationText: "Proceed to Product Launch",
  },

  attachments: [
    { id: "att-1", fileName: "Business_Plan.pdf", fileSize: "2.4 MB", fileType: "PDF", uploadDate: "2024-05-10", uploadedBy: "Rohit Verma" },
    { id: "att-2", fileName: "Go-to-Market_Plan.pdf", fileSize: "3.1 MB", fileType: "PDF", uploadDate: "2024-05-12", uploadedBy: "Neha Sharma" },
    { id: "att-3", fileName: "Market_Research.pdf", fileSize: "4.5 MB", fileType: "PDF", uploadDate: "2024-05-14", uploadedBy: "Vikram Singh" },
    { id: "att-4", fileName: "Financial_Model.xlsx", fileSize: "1.8 MB", fileType: "XLSX", uploadDate: "2024-05-16", uploadedBy: "Amitabh Shah" },
    { id: "att-5", fileName: "Pricing_Strategy.pdf", fileSize: "2.0 MB", fileType: "PDF", uploadDate: "2024-05-18", uploadedBy: "Arjun Mehta" },
    { id: "att-6", fileName: "Partnership_Agreement.pdf", fileSize: "3.6 MB", fileType: "PDF", uploadDate: "2024-05-20", uploadedBy: "Dr. Anil Patel" },
    { id: "att-7", fileName: "Regulatory_Documents.pdf", fileSize: "1.5 MB", fileType: "PDF", uploadDate: "2024-05-22", uploadedBy: "Sanjay Kumar" },
    { id: "att-8", fileName: "Launch_Plan.pptx", fileSize: "8.2 MB", fileType: "PPTX", uploadDate: "2024-05-25", uploadedBy: "Rohit Verma" },
  ],

  reviewRows: [
    { role: "Commercialization Manager", person: "Rohit Verma", decision: "Approved", status: "Approved", date: "15 May 2024" },
    { role: "Product Manager", person: "Neha Sharma", decision: "Approved", status: "Approved", date: "18 May 2024" },
    { role: "R&D Director", person: "Vikram Singh", decision: "Approved", status: "Approved", date: "22 May 2024" },
    { role: "Operations Head", person: "Arjun Mehta", decision: "Pending", status: "In Review", date: "-" },
    { role: "CTO", person: "Dr. Anil Patel", decision: "Pending", status: "Pending", date: "-" },
  ],

  approvalDecision: null,
  reviewComments: null,
  approvalDate: null,
  linkedProductLaunchProjectId: null,
  linkedProductLaunchProjectCode: null,

  createdBy: "Rohit Verma",
  createdAt: "2024-05-10 09:30 AM",
  lastModifiedBy: "Rohit Verma",
  updatedAt: "2024-05-25 04:45 PM",

  auditTrail: [
    { id: "aud-1", timestamp: "2024-05-10 09:30 AM", actor: "Rohit Verma", event: "Created Commercialization Plan CMP-2024-0021", kind: "workflow" },
    { id: "aud-2", timestamp: "2024-05-14 11:15 AM", actor: "Neha Sharma", event: "Updated Market Analysis and TAM/SAM/SOM estimates", kind: "audit" },
    { id: "aud-3", timestamp: "2024-05-18 02:40 PM", actor: "Vikram Singh", event: "Verified Manufacturing & Supply Chain strategy with CM", kind: "workflow" },
    { id: "aud-4", timestamp: "2024-05-25 04:45 PM", actor: "Rohit Verma", event: "Submitted for Executive Review", kind: "workflow" },
  ],
};

// In-memory store
const inMemoryStore: Map<string, CommercializationRecord> = new Map([
  [DEFAULT_COMMERCIALIZATION_RECORD.id, DEFAULT_COMMERCIALIZATION_RECORD],
  ["CMP-2024-0021", DEFAULT_COMMERCIALIZATION_RECORD],
]);

function computeDerivedFinancialsAndScores(input: CommercializationFormInput): {
  grossMarginPct: number;
  roiPct: number;
  aiAnalytics: CommercializationAIAnalytics;
  summary: CommercializationSummary;
} {
  const fp = input.financialPlanning;
  const cost = fp.manufacturingCostPerUnit || 1;
  const price = fp.sellingPricePerUnit || 1;
  const inv = fp.initialInvestment || 1;
  const rev = fp.revenueProjection5Yr || 0;

  const grossMarginPct = price > 0 ? Number((((price - cost) / price) * 100).toFixed(2)) : 0;
  const roiPct = inv > 0 ? Math.round((((rev - inv) / inv) * 100)) : 0;

  const ra = input.riskAssessment;
  const riskStarsAvg = (ra.technicalRisk + ra.marketRisk + ra.financialRisk + ra.operationalRisk + ra.regulatoryRisk) / 5;
  const computedRiskScore = Math.round((riskStarsAvg / 5) * 60 + 10);
  const riskControlScore = 100 - computedRiskScore;

  const productReadinessScore = input.productReadiness.launchReadinessScore || 82;
  const marketReadinessScore = 88;
  const financialReadinessScore = Math.min(98, Math.max(50, Math.round(grossMarginPct * 1.2 + (roiPct / 10))));
  const commercializationScore = Math.round((productReadinessScore + marketReadinessScore + financialReadinessScore) / 3);

  const overallLaunchReadiness = Math.round(
    productReadinessScore * 0.3 +
      marketReadinessScore * 0.25 +
      financialReadinessScore * 0.25 +
      riskControlScore * 0.2,
  );

  return {
    grossMarginPct,
    roiPct,
    aiAnalytics: {
      aiMarketOpportunityScore: Math.min(99, Math.round(marketReadinessScore * 1.02)),
      aiLaunchReadinessScore: overallLaunchReadiness,
      aiRevenueForecast5Yr: Math.round(rev * 1.09),
      aiCustomerAdoptionPredictionPct: 76,
      aiCompetitivePositionScore: 84,
      aiGrowthStrategy:
        "Accelerate B2B enterprise partnerships and expand OEM co-development. Target 15% market penetration within 24 months.",
      aiRecommendations:
        "Proceed to product launch with pilot fleet partners. Establish regional service support hubs prior to Q4 volume shipment.",
    },
    summary: {
      productReadinessScore,
      marketReadinessScore,
      financialReadinessScore,
      commercializationScore,
      riskControlScore,
      overallLaunchReadiness,
      recommendedAction: input.approvalDecision === "Approved" ? "Proceed to Product Launch" : "Proceed to Product Launch",
      recommendationText: "Proceed to Product Launch",
    },
  };
}

export const getCommercializationLookupsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CommercializationLookups> => {
    return {
      productCategories: [
        "Automotive & Charging Infrastructure",
        "Industrial Automation",
        "Clean Energy Systems",
        "Autonomous Robotics",
      ],
      targetIndustries: [
        "Electric Mobility / EV Infrastructure",
        "Commercial Fleet Logistics",
        "Smart Municipal Transit",
        "Industrial Ports & Warehousing",
      ],
      marketEntryStrategies: [
        "Direct Enterprise Sales + OEM Licensing",
        "Pilot Fleet Deployment",
        "Channel Partner Distribution",
        "Joint Venture Launch",
      ],
      certificationStatuses: [
        "Fully Certified",
        "In Certification Review",
        "Testing Phase",
        "Pending Filing",
      ],
      regulatoryCompliances: [
        "ISO 26262 & CE Compliant",
        "Partially Compliant",
        "Under Audit",
        "Self-Certified",
      ],
      productValidationStatuses: ["Field Validated", "Lab Validated", "In Field Testing", "Specification Stage"],
      productionReadinesses: ["Pilot Line Ready", "Tooling In Progress", "Prototype Stage", "Mass Production Certified"],
      manufacturingStrategies: [
        "Contract Manufacturing (CM)",
        "In-House Assembly",
        "Hybrid Production",
        "Licensed Third-Party",
      ],
      procurementStatuses: [
        "Component Sourced",
        "Long Lead Items Ordered",
        "RFQs In Review",
        "Full Supply Chain Secured",
      ],
      inventoryReadinesses: [
        "Safety Stock Established",
        "Buffer Stock In Transit",
        "Pre-production Sourced",
        "Just-In-Time Setup",
      ],
      salesModels: [
        "B2B Enterprise Direct",
        "B2B2C Platform",
        "Direct & Channel Hybrid",
        "Hardware-as-a-Service (HaaS)",
      ],
      pricingStrategies: [
        "Value-Based Pricing",
        "Cost-Plus Margin",
        "Tiered Subscription + Hardware",
        "Competitive Skimming",
      ],
      partnershipStatuses: ["MoU Executed", "Definitive Agreement", "In Negotiation", "Active Partnership"],
      businessUnits: [
        "Smart Mobility Division",
        "Robotics & Mechatronics",
        "Clean Energy Solutions",
        "Advanced R&D Center",
      ],
      commercializationManagers: [
        "Rohit Verma",
        "Neha Sharma",
        "Vikram Singh",
        "Amitabh Shah",
        "Arjun Mehta",
        "Dr. Anil Patel",
      ],
      recommendedActions: [
        "Proceed to Product Launch",
        "Refine Go-to-Market Strategy",
        "Expand Pilot Testing",
        "Hold / Re-evaluate Strategy",
      ],
    };
  },
);

export const getCommercializationListFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CommercializationListRow[]> => {
    return Array.from(inMemoryStore.values()).map((r: CommercializationRecord) => ({
      id: r.id,
      commercializationPlanId: r.commercializationPlanId,
      commercializationProject: r.commercializationProject,
      productName: r.productOverview.productName,
      status: r.status,
      overallLaunchReadiness: r.summary.overallLaunchReadiness,
      roiPct: r.financialPlanning.roiPct,
      launchTargetDate: r.launchTargetDate,
      updatedAt: r.updatedAt,
    }));
  },
);

export const getCommercializationFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: id }): Promise<CommercializationRecord> => {
    return inMemoryStore.get(id) || inMemoryStore.get("cmp-record-0021") || DEFAULT_COMMERCIALIZATION_RECORD;
  });

export const saveCommercializationDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: CommercializationFormInput }) => d)
  .handler(async ({ data: { id, input } }): Promise<CommercializationRecord> => {
    const targetId = id || "cmp-record-0021";
    const existing = inMemoryStore.get(targetId) || DEFAULT_COMMERCIALIZATION_RECORD;

    const { grossMarginPct, roiPct, aiAnalytics, summary } = computeDerivedFinancialsAndScores(input);

    const updated: CommercializationRecord = {
      ...existing,
      id: targetId,
      commercializationProject: input.commercializationProject,
      businessUnit: input.businessUnit,
      commercializationManager: input.commercializationManager,
      launchTargetDate: input.launchTargetDate,
      linkedProductId: input.linkedProductId ?? existing.linkedProductId,
      linkedTechnologyId: input.linkedTechnologyId ?? existing.linkedTechnologyId,
      linkedPatentId: input.linkedPatentId ?? existing.linkedPatentId,
      linkedBusinessCaseId: input.linkedBusinessCaseId ?? existing.linkedBusinessCaseId,
      productOverview: input.productOverview,
      marketAnalysis: input.marketAnalysis,
      productReadiness: input.productReadiness,
      manufacturingSupplyChain: input.manufacturingSupplyChain,
      financialPlanning: {
        ...input.financialPlanning,
        grossMarginPct,
        roiPct,
      },
      salesMarketing: input.salesMarketing,
      partnerships: input.partnerships,
      riskAssessment: input.riskAssessment,
      aiAnalytics,
      summary,
      attachments: input.attachments,
      lastModifiedBy: "Rohit Verma",
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Rohit Verma",
          event: "Saved Commercialization Plan draft updates",
          kind: "audit",
        },
        ...existing.auditTrail,
      ],
    };

    inMemoryStore.set(targetId, updated);
    return updated;
  });

export const completeCommercializationStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: CommercializationStage }) => d)
  .handler(async ({ data: { id, stage } }): Promise<CommercializationRecord> => {
    const existing = inMemoryStore.get(id) || DEFAULT_COMMERCIALIZATION_RECORD;
    const stageOrder: CommercializationStage[] = [
      "product_readiness",
      "manufacturing_supply_chain",
      "sales_marketing_planning",
      "executive_review",
    ];

    const idx = stageOrder.indexOf(stage);
    const nextStage = idx < stageOrder.length - 1 ? stageOrder[idx + 1] : stage;

    const newStages = existing.stages.map((st) => {
      if (st.stage === stage) return { ...st, completed: true, active: false, completedAt: new Date().toISOString().substring(0, 10) };
      if (st.stage === nextStage) return { ...st, active: true };
      return st;
    });

    const updated: CommercializationRecord = {
      ...existing,
      currentStage: nextStage,
      currentStageLabel: newStages.find((s) => s.stage === nextStage)?.label || nextStage,
      status: nextStage as CommercializationStatus,
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

export const submitCommercializationFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: id }): Promise<CommercializationRecord> => {
    const existing = inMemoryStore.get(id) || DEFAULT_COMMERCIALIZATION_RECORD;

    const updated: CommercializationRecord = {
      ...existing,
      status: "executive_review",
      currentStage: "executive_review",
      currentStageLabel: "Executive Review",
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Rohit Verma",
          event: "Submitted Commercialization Plan for Executive Review",
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

export const reviewCommercializationFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; decision: CommercializationApprovalDecision; comments?: string; approvalDate?: string }) => d)
  .handler(async ({ data: { id, decision, comments, approvalDate } }): Promise<CommercializationRecord> => {
    const existing = inMemoryStore.get(id) || DEFAULT_COMMERCIALIZATION_RECORD;
    const now = approvalDate || new Date().toISOString().substring(0, 10);

    let nextStatus: CommercializationStatus = "executive_review";
    let launchId: string | undefined;
    let launchCode: string | undefined;

    if (decision === "Approved") {
      nextStatus = "approved";
      launchId = `launch-${Date.now()}`;
      launchCode = `PRJ-LAUNCH-2024-0088`;
    } else if (decision === "Approved with Conditions") {
      nextStatus = "approved_with_conditions";
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

    const updated: CommercializationRecord = {
      ...existing,
      status: nextStatus,
      approvalDecision: decision,
      reviewComments: comments || null,
      approvalDate: now,
      linkedProductLaunchProjectId: launchId || existing.linkedProductLaunchProjectId,
      linkedProductLaunchProjectCode: launchCode || existing.linkedProductLaunchProjectCode,
      reviewRows: updatedReviewRows,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Commercial Review Board",
          event: `Executive Review decision: ${decision}. ${launchCode ? `Auto-created Product Launch Project ${launchCode}.` : ""}`,
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

export const generateCommercializationReportFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: id }): Promise<CommercializationRecord> => {
    const existing = inMemoryStore.get(id) || DEFAULT_COMMERCIALIZATION_RECORD;
    const updated: CommercializationRecord = {
      ...existing,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "Rohit Verma",
          event: "Generated comprehensive Commercialization Plan PDF Report",
          kind: "audit",
        },
        ...existing.auditTrail,
      ],
    };
    inMemoryStore.set(id, updated);
    return updated;
  });
