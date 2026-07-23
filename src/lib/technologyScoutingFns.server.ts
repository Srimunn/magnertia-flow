import { createServerFn } from "@tanstack/react-start";
import type {
  TechnologyScoutingRecord,
  TechScoutingAIAnalysis,
  TechScoutingAlert,
  TechScoutingApprovalDecision,
  TechScoutingDecision,
  TechScoutingFormInput,
  TechScoutingListRow,
  TechScoutingLookups,
  TechScoutingReviewer,
  TechScoutingRiskLevel,
  TechScoutingStage,
  TechScoutingStageState,
  TechScoutingStatus,
} from "@/services/types";

/* ===========================================================================
   Technology Scouting — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   Opportunity Discovery (optional source) ─▶ create scouting record
     Stage 1 Identification ─▶ Stage 2 Technical ─▶ Stage 3 Market ─▶ Stage 4 IP & Risk
       (completing a stage advances the 9-step workflow status and re-runs the
        deterministic AI Technology Analysis for that stage's outputs)
     ──Submit Technology Evaluation──▶ executive_review
           ├─ Approved ▶ added to Innovation Portfolio rollup — notifies scout
           ├─ Monitor Technology ▶ watchlist + continuous monitoring
           ├─ Conduct Further Evaluation ▶ record editable again
           └─ Rejected ▶ archived
     Continuous monitoring (approved/monitoring) surfaces Technology Updates,
     New Competitors, Patent Alerts and Market Alerts from the record's data.

   Every AI score is a pure function of the entered fields — no LLM, nothing
   hardcoded in the UI.
   =========================================================================== */

async function getTSCollection() {
  const mod = await import("./mongodb.server");
  return mod.getTechnologyScoutingCollection();
}
async function getOppsCollection() {
  const mod = await import("./mongodb.server");
  return mod.getOpportunitiesCollection();
}
async function newObjectId(id: string) {
  const mod = await import("./mongodb.server");
  return new mod.ObjectId(id);
}

const CURRENT_USER = "Rohit Verma";
const nowISO = () => new Date().toISOString();
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n: number) => Math.round(Number.isFinite(n) ? n : 0);
const filled = (s: string | undefined | null) => Boolean(s && String(s).trim());

const STAGE_ORDER: TechScoutingStage[] = [
  "identification",
  "technical_assessment",
  "market_assessment",
  "ip_risk_assessment",
];
const STAGE_LABEL: Record<TechScoutingStage, string> = {
  identification: "Technology Identification",
  technical_assessment: "Technical Assessment",
  market_assessment: "Market Assessment",
  ip_risk_assessment: "IP & Risk Assessment",
};
/** Completing a stage advances the 9-step workflow status. */
const STATUS_AFTER_STAGE: Record<TechScoutingStage, TechScoutingStatus> = {
  identification: "under_evaluation",
  technical_assessment: "technical_review",
  market_assessment: "business_review",
  ip_risk_assessment: "ip_review",
};

const EDITABLE_STATUSES: TechScoutingStatus[] = [
  "identified",
  "under_evaluation",
  "technical_review",
  "business_review",
  "ip_review",
];

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: TechScoutingLookups = {
  technologyCategories: [
    "Artificial Intelligence",
    "Robotics",
    "Automation",
    "Wireless Power Transfer",
    "Electric Vehicles",
    "Battery Technology",
    "Electronics",
    "Embedded Systems",
    "Semiconductor",
    "IoT",
    "Cloud Computing",
    "Cybersecurity",
    "Additive Manufacturing",
    "Materials",
    "Renewable Energy",
    "Digital Twin",
    "Quantum Computing",
    "Biotechnology",
  ],
  technologySubcategories: [
    "Solid-State Battery",
    "Lithium-Ion",
    "Sodium-Ion",
    "Fuel Cell",
    "Machine Learning",
    "Computer Vision",
    "Industrial Robotics",
    "Power Electronics",
    "Fast Charging",
    "Battery Management Systems",
    "Edge Computing",
    "Predictive Analytics",
  ],
  technologyDomains: [
    "Energy Storage",
    "Propulsion",
    "Charging",
    "Autonomy",
    "Connectivity",
    "Manufacturing",
    "Materials",
    "Software & AI",
    "Safety Systems",
  ],
  technologyMaturities: [
    "Emerging",
    "Experimental",
    "Early Adoption",
    "Growing",
    "Mature",
    "Declining",
  ],
  trlLevels: [
    "TRL 1 - Basic Principles",
    "TRL 2 - Technology Concept",
    "TRL 3 - Experimental Proof",
    "TRL 4 - Validated in Lab",
    "TRL 5 - Validated in Relevant Environment",
    "TRL 6 - Demonstrated in Relevant Environment",
    "TRL 7 - System Prototype Demonstration",
    "TRL 8 - System Complete & Qualified",
    "TRL 9 - Proven in Operations",
  ],
  sourceTypes: [
    "University",
    "Research Institute",
    "Startup",
    "Corporate R&D",
    "Patent Database",
    "Scientific Journal",
    "Conference",
    "Government Laboratory",
    "Standards Organization",
    "Technology Vendor",
    "Open Source Community",
  ],
  countries: [
    "United States",
    "India",
    "Germany",
    "Japan",
    "South Korea",
    "China",
    "United Kingdom",
    "France",
    "Israel",
    "Sweden",
  ],
  contactPersons: [
    "Dr. Emily Carter",
    "Prof. Rajesh Iyer",
    "Dr. Hans Weber",
    "Dr. Yuki Tanaka",
    "Sarah Mitchell",
  ],
  industries: ["Automotive", "Energy", "Manufacturing", "Electronics", "Aerospace", "Industrial"],
  targetMarkets: [
    "Electric Vehicles",
    "Energy Storage",
    "Consumer Electronics",
    "Grid Infrastructure",
    "Industrial Automation",
    "Charging Networks",
  ],
  marketTrends: ["Disruptive", "High Growth", "Stable", "Declining", "Niche"],
  adoptionLevels: [
    "Experimental",
    "Early Adoption",
    "Growing Adoption",
    "Mainstream",
    "Late Majority",
  ],
  integrationComplexities: ["Very Low", "Low", "Medium", "High", "Very High"],
  ipStatuses: [
    "Public Domain",
    "Patent Pending",
    "Patented",
    "Licensed",
    "Proprietary",
    "Trade Secret",
  ],
  ftoOptions: ["Available", "Limited", "Requires Legal Review", "Restricted"],
  licensingOptions: [
    "Open Source",
    "Commercial License",
    "Partnership Required",
    "Exclusive License",
    "Not Available",
  ],
  recommendedActions: [
    "Watch",
    "Benchmark",
    "Evaluate",
    "Acquire",
    "License",
    "Partner",
    "Prototype",
    "Conduct Feasibility Study",
    "Start PoC",
    "Reject",
  ],
  nextActions: [
    "Technical Review",
    "Business Review",
    "IP Review",
    "Executive Review",
    "Conduct Feasibility Study",
    "Start PoC",
    "Additional Assessment",
    "Archive",
  ],
  approvalDecisions: ["Approved", "Monitor Technology", "Conduct Further Evaluation", "Rejected"],
  scouts: ["Rohit Verma", "Priya Sharma", "Neha Sharma", "Vikram Singh", "Arjun Mehta"],
  businessUnits: [
    "Smart Mobility",
    "EV Powertrain",
    "Battery Systems",
    "Charging Infrastructure",
    "Corporate",
  ],
  departments: [
    "R&D Engineering",
    "Research & Innovation Development",
    "Product Management",
    "Advanced Engineering",
  ],
  targetProjects: [
    "NextGen EV Battery Platform",
    "Smart Charging Network",
    "Autonomous Fleet Program",
    "Digital Twin Initiative",
    "Lightweight Chassis Program",
  ],
  attachmentCategories: [
    "Research Papers",
    "Patent Documents",
    "Technical Datasheets",
    "Benchmark Reports",
    "Vendor Brochures",
    "Technology Roadmap",
    "Presentation",
  ],
  keywordSuggestions: [
    "Solid Electrolyte",
    "High Energy Density",
    "Safety",
    "EV",
    "Fast Charging",
    "AI",
    "Predictive Maintenance",
    "Sustainability",
    "IoT",
    "Digital Twin",
  ],
};

/* -------------------------- Scoring dictionaries -------------------------- */
const MATURITY_INNOVATION: Record<string, number> = {
  Emerging: 90,
  Experimental: 80,
  "Early Adoption": 70,
  Growing: 60,
  Mature: 40,
  Declining: 15,
};
const TREND_SCORE: Record<string, number> = {
  Disruptive: 95,
  "High Growth": 85,
  Stable: 60,
  Niche: 45,
  Declining: 20,
};
const ADOPTION_SCORE: Record<string, number> = {
  Experimental: 40,
  "Early Adoption": 65,
  "Growing Adoption": 80,
  Mainstream: 70,
  "Late Majority": 45,
};
const COMPLEXITY_SCORE: Record<string, number> = {
  "Very Low": 15,
  Low: 30,
  Medium: 55,
  High: 75,
  "Very High": 92,
};
const FTO_SCORE: Record<string, number> = {
  Available: 90,
  Limited: 60,
  "Requires Legal Review": 45,
  Restricted: 20,
};

function trlNumber(trl: string): number {
  const m = /TRL\s*(\d)/i.exec(trl || "");
  return m ? Number(m[1]) : 0;
}
function tamScore(value: number): number {
  return value <= 0 ? 15 : clamp((Math.log10(value) / 12) * 100);
}
/** StarRating fields store 1..10 (5 stars, half-star precision). */
function stars(n: number): number {
  return clamp((n || 0) * 10);
}
function listDepth(text: string): number {
  if (!filled(text)) return 0;
  return String(text)
    .split(/[,;\n]/)
    .filter((s) => s.trim()).length;
}

/* ------------------- AI Technology Analysis (computed) -------------------- */
function computeAI(input: TechScoutingFormInput): TechScoutingAIAnalysis {
  const { info, source, market, technical, ip, business } = input;
  const trl = trlNumber(info.trl);
  const trlScore = clamp((trl / 9) * 100);
  const complexity = COMPLEXITY_SCORE[technical.integrationComplexity] ?? 55;
  const trend = TREND_SCORE[market.marketTrend] ?? 55;
  const maturity = MATURITY_INNOVATION[info.technologyMaturity] ?? 55;
  const adoption = ADOPTION_SCORE[market.adoptionLevel] ?? 55;

  const detailDepth =
    [
      info.technologyDescription,
      technical.coreTechnology,
      technical.keyFeatures,
      technical.technicalAdvantages,
      technical.requiredInfrastructure,
    ].filter(filled).length / 5;

  // Technology strength: readiness + evidence depth + compatibility + source trust.
  const aiTechnologyScore = clamp(
    round(
      0.35 * trlScore +
        0.25 * detailDepth * 100 +
        0.2 * stars(technical.compatibility) +
        0.2 * stars(source.sourceReliability),
    ),
  );

  // Novelty: emerging maturity + disruptive trend + keyword/patent signals.
  const aiInnovationScore = clamp(
    round(
      0.35 * maturity +
        0.35 * trend +
        0.15 * clamp((info.keywords.length / 8) * 100) +
        (ip.patentAvailable ? 15 : 5),
    ),
  );

  // Market potential: market size + growth + trend + adoption stage.
  const aiMarketPotential = clamp(
    round(
      0.35 * tamScore(market.marketSize) +
        0.3 * clamp((market.marketGrowthRate / 40) * 100) +
        0.2 * trend +
        0.15 * adoption,
    ),
  );

  // Feasibility: readiness net of integration complexity, plus compatibility.
  const aiTechnicalFeasibility = clamp(
    round(
      0.4 * trlScore +
        0.3 * (100 - complexity) +
        0.2 * stars(technical.compatibility) +
        (filled(technical.requiredInfrastructure) ? 10 : 0),
    ),
  );

  // Alignment: strategic fit + a named target project + revenue weight.
  const aiStrategicAlignment = clamp(
    round(
      0.5 * stars(business.strategicFit) +
        0.25 * (filled(input.targetProject) ? 90 : 40) +
        0.25 * tamScore(business.revenuePotential),
    ),
  );

  // Advantage: stated advantages + IP position net of competitor pressure.
  const competitorPressure = clamp(listDepth(market.competitorsUsingTechnology) * 18);
  const ipStrength = ip.patentAvailable
    ? 0.6 * (FTO_SCORE[ip.freedomToOperate] ?? 50) + 40
    : (FTO_SCORE[ip.freedomToOperate] ?? 50) * 0.6;
  const aiCompetitiveAdvantage = clamp(
    round(
      0.3 * clamp(listDepth(technical.technicalAdvantages) * 25) +
        0.3 * clamp(ipStrength) +
        0.2 * (100 - competitorPressure) +
        0.2 * trend,
    ),
  );

  // Stage outputs (populated deterministically as each stage completes).
  const technologyClassification = [info.technologyCategory, info.technologySubcategory]
    .filter(filled)
    .join(" / ");
  const emergingTrendAnalysis = filled(info.technologyMaturity)
    ? `${info.technologyMaturity} technology in a ${market.marketTrend || "developing"} market growing at ${market.marketGrowthRate || 0}% annually.`
    : "";
  const integrationDifficulty =
    complexity >= 75 ? "High effort" : complexity >= 50 ? "Moderate effort" : "Low effort";
  const marketOpportunityScore = clamp(
    round(
      0.5 * tamScore(market.marketSize) +
        0.3 * clamp((market.marketGrowthRate / 40) * 100) +
        0.2 * adoption,
    ),
  );
  const competitiveAdvantageBand =
    aiCompetitiveAdvantage >= 75 ? "Strong" : aiCompetitiveAdvantage >= 55 ? "Moderate" : "Limited";
  const patentLandscape = ip.patentAvailable
    ? `${ip.ipStatus || "Patented"} (${ip.patentNumber || "no number"}) held by ${ip.patentOwner || "unknown owner"}; FTO ${ip.freedomToOperate || "unassessed"}, licensing ${ip.licensingAvailability || "unassessed"}.`
    : `No patent on record; FTO ${ip.freedomToOperate || "unassessed"}.`;

  const parts: string[] = [];
  const headline = round(
    0.25 * aiTechnologyScore +
      0.2 * aiMarketPotential +
      0.2 * aiTechnicalFeasibility +
      0.2 * aiStrategicAlignment +
      0.15 * aiCompetitiveAdvantage,
  );
  if (headline >= 75)
    parts.push(
      `High potential technology for ${market.targetMarket || "the target market"}. Recommended to conduct feasibility study and partner with technology leaders.`,
    );
  else if (headline >= 55)
    parts.push(
      "Promising technology — benchmark against alternatives and evaluate a focused pilot before committing investment.",
    );
  else
    parts.push(
      "Early-stage signal only. Keep on the watchlist and re-assess when maturity or market traction improves.",
    );
  if ((FTO_SCORE[ip.freedomToOperate] ?? 50) <= 45)
    parts.push("IP freedom-to-operate is constrained; legal review advised before adoption.");
  if (complexity >= 75)
    parts.push("Integration complexity is high — plan infrastructure and skills early.");

  return {
    aiTechnologyScore,
    aiInnovationScore,
    aiMarketPotential,
    aiTechnicalFeasibility,
    aiStrategicAlignment,
    aiCompetitiveAdvantage,
    recommendation: parts.join(" "),
    technologyClassification,
    emergingTrendAnalysis,
    technicalComplexity: technical.integrationComplexity || "—",
    integrationDifficulty,
    infrastructureRequirements: technical.requiredInfrastructure || "Standard facilities",
    marketOpportunityScore,
    competitiveAdvantageBand,
    patentLandscape,
    generatedAt: nowISO(),
  };
}

function computeRiskLevel(risk: TechScoutingFormInput["risk"]): TechScoutingRiskLevel {
  const avg =
    (risk.technologyRisk +
      risk.marketRisk +
      risk.regulatoryRisk +
      risk.supplyChainRisk +
      risk.cybersecurityRisk) /
    5;
  if (avg >= 6.5) return "High";
  if (avg >= 4) return "Moderate";
  return "Low";
}

/** Overall Technology Score — the six AI dimensions net of the risk profile. */
function computeOverallScore(
  ai: TechScoutingAIAnalysis,
  risk: TechScoutingFormInput["risk"],
): number {
  const riskAvg =
    (risk.technologyRisk +
      risk.marketRisk +
      risk.regulatoryRisk +
      risk.supplyChainRisk +
      risk.cybersecurityRisk) /
    5;
  const base =
    0.2 * ai.aiTechnologyScore +
    0.15 * ai.aiInnovationScore +
    0.2 * ai.aiMarketPotential +
    0.15 * ai.aiTechnicalFeasibility +
    0.15 * ai.aiStrategicAlignment +
    0.15 * ai.aiCompetitiveAdvantage;
  return clamp(round(base - Math.max(0, riskAvg - 2) * 2));
}

function defaultRecommendedAction(score: number): string {
  if (score >= 75) return "Conduct Feasibility Study";
  if (score >= 65) return "Prototype";
  if (score >= 55) return "Evaluate";
  if (score >= 45) return "Benchmark";
  if (score >= 35) return "Watch";
  return "Reject";
}

function computeNextAction(status: TechScoutingStatus, stage: TechScoutingStage): string {
  switch (status) {
    case "identified":
    case "under_evaluation":
    case "technical_review":
    case "business_review":
      return `Complete the ${STAGE_LABEL[stage]} stage`;
    case "ip_review":
      return "All assessments complete — Submit Technology Evaluation";
    case "executive_review":
      return "Awaiting executive technology review";
    case "approved":
      return "Added to Innovation Portfolio — proceed to Feasibility Study";
    case "monitoring":
      return "On watchlist — continuous technology monitoring active";
    case "rejected":
      return "Rejected — archived for reference";
    case "closed":
      return "Closed";
    default:
      return "—";
  }
}

function initialStages(): TechScoutingStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function initialReviewers(): TechScoutingReviewer[] {
  return [
    { role: "R&D Manager", name: "Rohit Verma", status: "pending", date: null },
    { role: "Technical Reviewer", name: "Neha Sharma", status: "pending", date: null },
    { role: "Innovation Director", name: "Vikram Singh", status: "pending", date: null },
    { role: "CTO", name: "Arjun Mehta", status: "pending", date: null },
  ];
}

/* ------------------------------- Shaping ---------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): TechnologyScoutingRecord {
  if (!doc) throw new Error("Technology Scouting record not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<TechnologyScoutingRecord, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}
function toListRow(r: TechnologyScoutingRecord): TechScoutingListRow {
  return {
    id: r.id,
    scoutingId: r.scoutingId,
    technologyName: r.info.technologyName,
    technologyCategory: r.info.technologyCategory,
    status: r.status,
    currentStage: r.currentStage,
    technologyScout: r.technologyScout,
    overallTechnologyScore: r.decision.overallTechnologyScore,
    priorityRanking: r.decision.priorityRanking,
    trl: r.info.trl,
    updatedAt: r.updatedAt,
  };
}

function recordToInput(r: TechnologyScoutingRecord): TechScoutingFormInput {
  return {
    technologyScout: r.technologyScout,
    businessUnit: r.businessUnit,
    department: r.department,
    scoutingDate: r.scoutingDate,
    linkedOpportunityId: r.linkedOpportunityId,
    info: r.info,
    source: r.source,
    market: r.market,
    technical: r.technical,
    ip: r.ip,
    business: r.business,
    risk: r.risk,
    attachments: r.attachments,
    technologyOwner: r.decision.technologyOwner,
    targetProject: r.decision.targetProject,
    followUpDate: r.decision.followUpDate,
    recommendedAction: r.decision.recommendedAction,
  };
}

/** Priority ranking = position by overall score across all scouting records. */
async function reassignRanks() {
  const coll = await getTSCollection();
  const docs = await coll.find({}).toArray();
  const all: TechnologyScoutingRecord[] = docs.map((d: unknown) => shape(d));
  const scored = all
    .filter((r) => r.decision.overallTechnologyScore > 0)
    .sort((a, b) => b.decision.overallTechnologyScore - a.decision.overallTechnologyScore);
  for (let i = 0; i < scored.length; i++) {
    const rank = i + 1;
    if (scored[i].decision.priorityRanking === rank) continue;
    const { id, ...body } = {
      ...scored[i],
      decision: { ...scored[i].decision, priorityRanking: rank },
    };
    await coll.updateOne({ _id: await newObjectId(id) }, { $set: body });
  }
}

/** Recompute rollups on every portfolio so an approved technology shows up
 *  there immediately — the real Innovation Portfolio hand-off. */
async function refreshPortfolioRollups() {
  const mod = await import("./innovationPortfolioFns.server");
  await mod.recomputeAllPortfolioRollups();
}

/* ============================= Read endpoints ============================= */
export const getTechScoutingLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getTechScoutingListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getTSCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as TechScoutingListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getTechScoutingFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getTSCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Technology Scouting record not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Approved technology opportunities available as scouting sources. */
export const getScoutingSourceOpportunitiesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const coll = await getOppsCollection();
      const docs = await coll.find({ status: "approved" }).toArray();
      const items = docs.map((d: Record<string, unknown>) => {
        const info = (d.information ?? {}) as Record<string, string>;
        const tech = (d.technology ?? {}) as Record<string, string>;
        const mkt = (d.market ?? {}) as Record<string, unknown>;
        return {
          id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
          opportunityCode: d.opportunityCode as string,
          name: d.name as string,
          category: info.category ?? "",
          description: info.description ?? "",
          technologyDomain: tech.technologyDomain ?? "",
          emergingTechnology: tech.emergingTechnology ?? "",
          industry: (mkt.industry as string) ?? "",
          targetMarket: (mkt.targetMarket as string) ?? "",
          marketSize: (mkt.marketSize as number) ?? 0,
          growthRate: (mkt.growthRate as number) ?? 0,
        };
      });
      return { success: true as const, data: items };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  },
);

/* ============================ Create / update ============================ */
export const saveTechScoutingDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: TechScoutingFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getTSCollection();
      const now = nowISO();
      const ai = computeAI(data.input);
      const overallRiskLevel = computeRiskLevel(data.input.risk);
      const overall = computeOverallScore(ai, data.input.risk);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Technology Scouting record not found.");
        const current = shape(existing);
        if (!EDITABLE_STATUSES.includes(current.status)) {
          throw new Error(`Record in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<TechnologyScoutingRecord, "id"> = {
          ...current,
          technologyScout: data.input.technologyScout,
          businessUnit: data.input.businessUnit,
          department: data.input.department,
          scoutingDate: data.input.scoutingDate,
          info: data.input.info,
          source: data.input.source,
          market: data.input.market,
          technical: data.input.technical,
          ip: data.input.ip,
          business: data.input.business,
          risk: data.input.risk,
          overallRiskLevel,
          attachments: data.input.attachments,
          aiAnalysis: ai,
          decision: {
            ...current.decision,
            overallTechnologyScore: overall,
            recommendedAction: data.input.recommendedAction || defaultRecommendedAction(overall),
            technologyOwner: data.input.technologyOwner,
            targetProject: data.input.targetProject,
            followUpDate: data.input.followUpDate,
          },
          lastModifiedBy: CURRENT_USER,
          updatedAt: now,
          nextAction: computeNextAction(current.status, current.currentStage),
          auditTrail: [
            ...current.auditTrail,
            { at: now, actor: CURRENT_USER, event: "Draft saved", stage: current.currentStage },
          ],
        };
        await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
        await reassignRanks();
        const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
        return { success: true as const, data: shape(fresh) };
      }

      // Create — optionally seeded from an approved technology opportunity.
      let linkedOpportunityId: string | null = null;
      let linkedOpportunityCode: string | null = null;
      let linkedOpportunityName: string | null = null;
      if (data.input.linkedOpportunityId) {
        const oppColl = await getOppsCollection();
        const oppDoc = await oppColl.findOne({
          _id: await newObjectId(data.input.linkedOpportunityId),
        });
        if (!oppDoc) throw new Error("Linked opportunity not found.");
        linkedOpportunityId = oppDoc._id?.toString?.() ?? String(oppDoc._id);
        linkedOpportunityCode = (oppDoc.opportunityCode as string) ?? null;
        linkedOpportunityName = (oppDoc.name as string) ?? null;
      }

      const count = await coll.countDocuments();
      const year = new Date().getFullYear();
      const scoutingId = `TS-${year}-${String(count + 1).padStart(4, "0")}`;

      const record: Omit<TechnologyScoutingRecord, "id"> = {
        scoutingId,
        status: "identified",
        currentStage: "identification",
        stages: initialStages(),
        version: 1,
        technologyScout: data.input.technologyScout,
        businessUnit: data.input.businessUnit,
        department: data.input.department,
        scoutingDate: data.input.scoutingDate,
        linkedOpportunityId,
        linkedOpportunityCode,
        linkedOpportunityName,
        info: data.input.info,
        source: data.input.source,
        market: data.input.market,
        technical: data.input.technical,
        ip: data.input.ip,
        business: data.input.business,
        risk: data.input.risk,
        overallRiskLevel,
        aiAnalysis: ai,
        decision: {
          overallTechnologyScore: overall,
          priorityRanking: 0,
          recommendedAction: data.input.recommendedAction || defaultRecommendedAction(overall),
          technologyOwner: data.input.technologyOwner,
          targetProject: data.input.targetProject,
          followUpDate: data.input.followUpDate,
        },
        monitoring: { watchlisted: false, lastCheckedAt: null, alerts: [] },
        attachments: data.input.attachments,
        reviewers: initialReviewers(),
        approvalDecision: null,
        reviewNextAction: null,
        reviewComments: null,
        approvalDate: null,
        nextAction: computeNextAction("identified", "identification"),
        addedToPortfolioAt: null,
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: linkedOpportunityCode
              ? `Technology Scouting ${scoutingId} created from opportunity ${linkedOpportunityCode}`
              : `Technology Scouting ${scoutingId} created`,
          },
          {
            at: now,
            actor: "System",
            event:
              "Context retrieved — existing technologies, research activities, patent landscape, market trends, vendor and strategy data",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Technology Identification stage started",
            stage: "identification",
          },
        ],
      };
      const res = await coll.insertOne(record);
      await reassignRanks();
      const fresh = await coll.findOne({ _id: res.insertedId });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* =========================== Stage progression =========================== */
export const completeTechScoutingStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: TechScoutingStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getTSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Technology Scouting record not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Record in "${current.status}" cannot change stage.`);
      }
      const idx = STAGE_ORDER.indexOf(data.stage);
      if (idx === -1) throw new Error(`Unknown stage "${data.stage}".`);
      if (idx > 0) {
        const prev = current.stages.find((s) => s.stage === STAGE_ORDER[idx - 1]);
        if (prev?.status !== "completed") {
          throw new Error(`Complete the ${STAGE_LABEL[STAGE_ORDER[idx - 1]]} stage first.`);
        }
      }

      const now = nowISO();
      const nextStage = STAGE_ORDER[idx + 1] ?? data.stage;
      const advanced = idx < STAGE_ORDER.length - 1;
      const stages: TechScoutingStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });

      const input = recordToInput(current);
      const ai = computeAI(input);
      const overall = computeOverallScore(ai, current.risk);
      const status = STATUS_AFTER_STAGE[data.stage];

      const stageOutput: Record<TechScoutingStage, string> = {
        identification: `AI classification: ${ai.technologyClassification || "n/a"} — innovation score ${ai.aiInnovationScore}/100, ${current.info.trl || "TRL n/a"}`,
        technical_assessment: `Feasibility evaluated — complexity ${ai.technicalComplexity}, integration ${ai.integrationDifficulty.toLowerCase()}`,
        market_assessment: `Market validated — opportunity score ${ai.marketOpportunityScore}/100, competitive advantage ${ai.competitiveAdvantageBand.toLowerCase()}`,
        ip_risk_assessment: `Patent landscape and risks assessed — overall technology score ${overall}/100`,
      };

      const updated: Omit<TechnologyScoutingRecord, "id"> = {
        ...current,
        stages,
        currentStage: advanced ? nextStage : data.stage,
        status,
        aiAnalysis: ai,
        overallRiskLevel: computeRiskLevel(current.risk),
        decision: {
          ...current.decision,
          overallTechnologyScore: overall,
          recommendedAction:
            current.decision.recommendedAction || defaultRecommendedAction(overall),
        },
        nextAction: computeNextAction(status, advanced ? nextStage : data.stage),
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: `${STAGE_LABEL[data.stage]} completed`,
            stage: data.stage,
            fromStatus: current.status,
            toStatus: status,
          },
          { at: now, actor: "System", event: stageOutput[data.stage], stage: data.stage },
          ...(advanced
            ? [
                {
                  at: now,
                  actor: CURRENT_USER,
                  event: `${STAGE_LABEL[nextStage]} stage started`,
                  stage: nextStage,
                },
              ]
            : []),
        ],
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      await reassignRanks();
      const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Review workflow ============================ */
export const submitTechScoutingFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getTSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Technology Scouting record not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Record is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(
          `Complete all assessment stages first. Outstanding: ${incomplete.join(", ")}.`,
        );
      }
      const now = nowISO();
      const reviewers: TechScoutingReviewer[] = current.reviewers.map((r) =>
        r.role === "R&D Manager" || r.role === "Technical Reviewer"
          ? { ...r, status: "reviewed", date: now }
          : r,
      );
      const updated: Omit<TechnologyScoutingRecord, "id"> = {
        ...current,
        status: "executive_review",
        reviewers,
        nextAction: computeNextAction("executive_review", current.currentStage),
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "Technology evaluation submitted for executive review",
            fromStatus: current.status,
            toStatus: "executive_review",
          },
          {
            at: now,
            actor: "System",
            event: "R&D Manager and Technical Reviewer sign-off recorded",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewTechScoutingFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: TechScoutingApprovalDecision;
      nextAction?: string;
      comments?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getTSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Technology Scouting record not found.");
      const current = shape(existing);
      if (current.status !== "executive_review") {
        throw new Error(`Record is "${current.status}", not under executive review.`);
      }
      const now = nowISO();
      const auditTrail = [...current.auditTrail];
      let status: TechScoutingStatus;
      let approvalDate: string | null = current.approvalDate;
      let addedToPortfolioAt = current.addedToPortfolioAt;
      let monitoring = current.monitoring;
      let version = current.version;

      if (data.decision === "Approved") {
        status = "approved";
        approvalDate = now;
        addedToPortfolioAt = now;
        monitoring = { ...monitoring, watchlisted: false, lastCheckedAt: now };
        auditTrail.push({
          at: now,
          actor: "Executive Review",
          event: `Technology approved${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Technology added to the Innovation Portfolio",
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Technology Scout notified: Technology Approved`,
        });
      } else if (data.decision === "Monitor Technology") {
        status = "monitoring";
        monitoring = { ...monitoring, watchlisted: true, lastCheckedAt: now };
        auditTrail.push({
          at: now,
          actor: "Executive Review",
          event: `Decision: monitor technology${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Technology added to the monitoring watchlist",
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Technology Scout notified: Technology on Watchlist",
        });
      } else if (data.decision === "Conduct Further Evaluation") {
        status = "under_evaluation";
        version = current.version + 1;
        auditTrail.push({
          at: now,
          actor: "Executive Review",
          event: `Further evaluation requested${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Additional assessment requested — record reopened for detailed analysis",
        });
      } else {
        status = "rejected";
        auditTrail.push({
          at: now,
          actor: "Executive Review",
          event: `Technology rejected${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Record archived to repository" });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Technology Scout notified: Technology Rejected",
        });
      }

      const reviewers: TechScoutingReviewer[] = current.reviewers.map((r) =>
        data.decision === "Conduct Further Evaluation"
          ? r
          : r.status === "pending"
            ? { ...r, status: "reviewed", date: now }
            : r,
      );

      const updated: Omit<TechnologyScoutingRecord, "id"> = {
        ...current,
        status,
        version,
        reviewers,
        approvalDecision: data.decision,
        reviewNextAction: data.nextAction ?? current.reviewNextAction,
        reviewComments: data.comments ?? current.reviewComments,
        approvalDate,
        addedToPortfolioAt,
        monitoring,
        nextAction: computeNextAction(status, current.currentStage),
        lastModifiedBy: "Executive Review",
        updatedAt: now,
        auditTrail,
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });

      // Real hand-off: an approved technology must appear in the Innovation
      // Portfolio rollup immediately, not on the portfolio's next manual refresh.
      if (data.decision === "Approved") {
        await refreshPortfolioRollups();
      }

      const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ======================= Continuous monitoring scan ======================= */
export const monitorTechScoutingFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getTSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Technology Scouting record not found.");
      const current = shape(existing);
      if (!["approved", "monitoring"].includes(current.status)) {
        throw new Error("Monitoring runs only for approved or watchlisted technologies.");
      }
      const now = nowISO();

      // Alerts are derived from the record's own data — deterministic, no LLM.
      const alerts: TechScoutingAlert[] = [];
      const competitors = String(current.market.competitorsUsingTechnology || "")
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (competitors.length > 0) {
        alerts.push({
          type: "New Competitor",
          message: `${competitors.length} competitor${competitors.length > 1 ? "s" : ""} tracked (${competitors.slice(0, 3).join(", ")}${competitors.length > 3 ? ", …" : ""})`,
          at: now,
        });
      }
      if (current.ip.patentAvailable || current.ip.ipStatus === "Patent Pending") {
        alerts.push({
          type: "Patent Alert",
          message: `${current.ip.ipStatus || "Patent"} status watched — FTO ${current.ip.freedomToOperate || "unassessed"}`,
          at: now,
        });
      }
      if (
        (TREND_SCORE[current.market.marketTrend] ?? 0) >= 85 ||
        current.market.marketGrowthRate >= 20
      ) {
        alerts.push({
          type: "Market Alert",
          message: `${current.market.marketTrend || "Growth"} market at ${current.market.marketGrowthRate}% CAGR in ${current.market.targetMarket || "target market"}`,
          at: now,
        });
      }
      alerts.push({
        type: "Technology Update",
        message: `${current.info.technologyMaturity || "—"} maturity at ${current.info.trl || "TRL n/a"} — trends re-scanned`,
        at: now,
      });

      const updated: Omit<TechnologyScoutingRecord, "id"> = {
        ...current,
        monitoring: {
          watchlisted: current.monitoring.watchlisted || current.status === "monitoring",
          lastCheckedAt: now,
          alerts: [...alerts, ...current.monitoring.alerts].slice(0, 12),
        },
        lastModifiedBy: "System",
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: "System",
            event: `Technology monitoring scan completed — ${alerts.length} alert${alerts.length === 1 ? "" : "s"} raised`,
          },
          { at: now, actor: "System", event: "Technology dashboard and scouting report updated" },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ================================ Close ================================== */
export const closeTechScoutingFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getTSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Technology Scouting record not found.");
      const current = shape(existing);
      if (!["approved", "monitoring", "rejected"].includes(current.status)) {
        throw new Error(`Record in "${current.status}" cannot be closed.`);
      }
      const now = nowISO();
      const updated: Omit<TechnologyScoutingRecord, "id"> = {
        ...current,
        status: "closed",
        monitoring: { ...current.monitoring, watchlisted: false },
        nextAction: computeNextAction("closed", current.currentStage),
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "Scouting record closed",
            fromStatus: current.status,
            toStatus: "closed",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      // A closed technology drops out of the portfolio rollup.
      if (current.addedToPortfolioAt) await refreshPortfolioRollups();
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });
