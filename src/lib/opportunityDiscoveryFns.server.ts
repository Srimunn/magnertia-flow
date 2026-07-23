import { createServerFn } from "@tanstack/react-start";
import type {
  FeasibilityProjectRecord,
  ImpactLevel,
  OpportunityAIAnalysis,
  OpportunityBusiness,
  OpportunityDecision,
  OpportunityEvaluation,
  OpportunityFormInput,
  OpportunityListRow,
  OpportunityLookups,
  DiscoveryOpportunityRecord,
  OpportunityReviewStage,
  OpportunityStatus,
} from "@/services/types";

/* ===========================================================================
   Opportunity Discovery — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   Implements the workflow from the sequence diagram as a real state machine:

     draft ──Submit──▶ [AI analysis] ──▶ Initial Review
                                          ├─ incomplete ──▶ revision_required
                                          └─ qualified ──▶ under_review
                                                 Market Validation
                                               → Business Validation
                                               → Innovation Committee Review
                                                   ├─ Approved  ▶ +Feasibility Study
                                                   ├─ Revision Required
                                                   ├─ On Hold
                                                   └─ Rejected ▶ archived

   Every "AI" score is a deterministic function of the entered fields — there is
   no LLM here. Writes replace whole top-level fields (never $set dot-paths) so
   the in-memory mock fallback stays correct.
   =========================================================================== */

async function getOpportunitiesCollection() {
  const mod = await import("./mongodb.server");
  return mod.getOpportunitiesCollection();
}
async function getIdeasCollection() {
  const mod = await import("./mongodb.server");
  return mod.getIdeasCollection();
}
async function getFeasibilityProjectsCollection() {
  const mod = await import("./mongodb.server");
  return mod.getFeasibilityProjectsCollection();
}
async function newObjectId(id: string) {
  const mod = await import("./mongodb.server");
  return new mod.ObjectId(id);
}

export const CURRENT_USER = "Priya Sharma";

const nowISO = () => new Date().toISOString();
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n: number, dp = 0) => {
  const f = Math.pow(10, dp);
  return Math.round((Number.isFinite(n) ? n : 0) * f) / f;
};

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: OpportunityLookups = {
  categories: [
    {
      name: "Product Innovation",
      subCategories: ["AI / ML Solutions", "New Product", "Feature Extension"],
    },
    { name: "Process Innovation", subCategories: ["Manufacturing", "Supply Chain", "Quality"] },
    { name: "Business Model", subCategories: ["Service", "Subscription", "Partnership"] },
    { name: "Sustainability", subCategories: ["Energy", "Materials", "Circular Economy"] },
    { name: "Technology Platform", subCategories: ["Software", "Hardware", "Data"] },
  ],
  sources: [
    "Market Research",
    "Customer Request",
    "Competitor Analysis",
    "Technology Trend",
    "Government Policy",
    "Internal Suggestion",
    "Research Publication",
    "Startup Ecosystem",
  ],
  businessUnits: [
    "Smart Manufacturing",
    "EV Powertrain",
    "Battery Systems",
    "Charging Infrastructure",
    "Corporate",
  ],
  departments: [
    "R&D",
    "Research & Innovation Development",
    "Engineering",
    "Manufacturing",
    "Product Management",
    "Sales & Marketing",
  ],
  productLines: [
    "Industrial IoT Platform",
    "Magnertia One",
    "PowerCell 800",
    "FastCharge DC",
    "HomeCharge AC",
  ],
  strategicInitiatives: [
    "Digital Transformation",
    "Cost Leadership",
    "Net-Zero 2030",
    "Software-Defined Vehicle",
    "Global Expansion",
  ],
  targetCustomers: [
    "Manufacturing Companies",
    "Fleet Operators",
    "Utilities",
    "Government Bodies",
    "Consumers",
  ],
  customerSegments: ["Mid to Large Enterprises", "SME", "Enterprise", "Public Sector", "Retail"],
  industries: ["Manufacturing", "Automotive", "Energy", "Logistics", "Industrial"],
  targetMarkets: [
    "Predictive Maintenance Market",
    "EV Charging Market",
    "Grid Storage Market",
    "Fleet Telematics Market",
  ],
  marketMaturities: ["Emerging", "Growth Stage", "Mature", "Declining"],
  marketReadinessLevels: ["Low", "Medium", "High"],
  technologyDomains: [
    "Artificial Intelligence",
    "IoT",
    "Power Electronics",
    "Materials Science",
    "Cloud Computing",
  ],
  emergingTechnologies: [
    "Machine Learning",
    "Digital Twin",
    "Edge Computing",
    "Solid-State Batteries",
    "Generative Design",
  ],
  technologyReadinessLevels: [
    "TRL 1 – Basic principles",
    "TRL 2 – Technology concept",
    "TRL 3 – Proof of concept",
    "TRL 4 – Validated in Lab",
    "TRL 5 – Relevant environment",
    "TRL 6 – Prototype demo",
    "TRL 7 – Operational prototype",
    "TRL 8 – System complete",
    "TRL 9 – Proven in operations",
  ],
  technologyPartners: [
    "TechNova Analytics Pvt Ltd",
    "IIT Research Cell",
    "Siemens Digital",
    "None",
  ],
  applicableStandards: ["ISO 55000", "IEC 62443", "ISO 27001", "ISO 9001", "ISO 14001", "GDPR"],
  attachmentCategories: [
    "Market Research Report",
    "Customer Survey",
    "Competitor Analysis",
    "Technical Documents",
    "Standards",
    "Presentations",
    "Images",
  ],
};

/* ---------------------------- Review stage flow --------------------------- */
const REVIEW_FLOW: OpportunityReviewStage[] = [
  "Initial Review",
  "Market Validation",
  "Business Validation",
  "Innovation Committee Review",
];

/* ----------------------------- Calculations (C) --------------------------- */
const IMPACT_SCORE: Record<ImpactLevel, number> = { Low: 30, Medium: 60, High: 90 };
const READINESS_SCORE: Record<string, number> = { Low: 30, Medium: 60, High: 90 };
const MATURITY_SCORE: Record<string, number> = {
  Emerging: 70,
  "Growth Stage": 90,
  Mature: 55,
  Declining: 20,
};

function parseTRL(label: string): number {
  const m = (label || "").match(/TRL\s*(\d)/i);
  return m ? Math.max(1, Math.min(9, parseInt(m[1], 10))) : 4;
}

/** Business calculations: gross margin, ROI, payback. */
function computeBusiness(input: OpportunityFormInput): OpportunityBusiness {
  const revenue = input.business.revenueOpportunity || 0;
  const investment = input.business.estimatedInvestment || 0;
  const profit = revenue - investment;
  const monthlyRevenue = revenue / 12;
  return {
    revenueOpportunity: revenue,
    estimatedInvestment: investment,
    businessRisk: input.business.businessRisk,
    grossMargin: revenue > 0 ? round((profit / revenue) * 100) : 0,
    roi: investment > 0 ? round((profit / investment) * 100) : 0,
    paybackPeriod: monthlyRevenue > 0 ? round(investment / monthlyRevenue) : 0,
  };
}

/** ESG score from the three impact dropdowns (governance/social weighted less). */
function computeEsgScore(input: OpportunityFormInput): number {
  const e = IMPACT_SCORE[input.regulatoryESG.environmentalImpact] ?? 50;
  const s = IMPACT_SCORE[input.regulatoryESG.socialImpact] ?? 50;
  const g = IMPACT_SCORE[input.regulatoryESG.governanceImpact] ?? 50;
  const standardsBonus = Math.min(10, (input.regulatoryESG.applicableStandards?.length ?? 0) * 2.5);
  return clamp(round(0.4 * e + 0.3 * s + 0.3 * g + standardsBonus));
}

/** Section 9 — deterministic "AI" analysis derived from the entered fields. */
function computeAIAnalysis(
  input: OpportunityFormInput,
  business: OpportunityBusiness,
): OpportunityAIAnalysis {
  // Market: size of TAM, growth rate, readiness and maturity.
  const tam = input.market.tam || 0;
  const tamScore = tam <= 0 ? 20 : clamp((Math.log10(tam) / 12) * 100); // ₹1Cr≈58, ₹1000Cr≈83
  const growthScore = clamp((Math.min(input.market.growthRate || 0, 40) / 40) * 100);
  const readiness = READINESS_SCORE[input.market.marketReadiness] ?? 50;
  const maturity = MATURITY_SCORE[input.market.marketMaturity] ?? 55;
  const aiMarketScore = clamp(
    round(0.35 * tamScore + 0.25 * growthScore + 0.2 * readiness + 0.2 * maturity),
  );

  // Technology: TRL, whether a partner exists, whether a clear gap is stated.
  const trl = parseTRL(input.technology.technologyReadiness);
  const trlScore = (trl / 9) * 100;
  const partnerBonus =
    input.technology.technologyPartner && input.technology.technologyPartner !== "None" ? 10 : 0;
  const gapClarity = input.technology.technologyGap?.trim() ? 10 : 0;
  const emergingBonus = input.technology.emergingTechnology?.trim() ? 5 : 0;
  const aiTechnologyScore = clamp(
    round(trlScore * 0.75 + partnerBonus + gapClarity + emergingBonus),
  );

  // Competition: higher = more favourable position (clear advantage + gap, few competitors).
  const competitorCount = (input.competitive.existingCompetitors || "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  const crowding = clamp(competitorCount * 15, 0, 75);
  const advantage = input.competitive.competitiveAdvantage?.trim() ? 30 : 0;
  const gap = input.competitive.marketGap?.trim() ? 25 : 0;
  const aiCompetitionScore = clamp(round(45 + advantage + gap - crowding));

  // Risk: higher = riskier. Business risk + regulatory burden + crowding + low TRL.
  const bizRisk = IMPACT_SCORE[business.businessRisk] ?? 50;
  const regulatoryBurden = input.regulatoryESG.regulatoryRequirement?.trim() ? 15 : 0;
  const trlRisk = ((9 - trl) / 9) * 40;
  const aiRiskScore = clamp(round(0.45 * bizRisk + regulatoryBurden + trlRisk + crowding * 0.15));

  // Overall: opportunity attractiveness net of risk.
  const aiOpportunityScore = clamp(
    round(
      0.3 * aiMarketScore +
        0.25 * aiTechnologyScore +
        0.2 * aiCompetitionScore +
        0.25 * (100 - aiRiskScore),
    ),
  );

  // Narrative outputs, assembled from the same signals (no LLM).
  const recParts: string[] = [];
  if (aiOpportunityScore >= 75)
    recParts.push("Strong opportunity — recommend proceeding to Feasibility Study.");
  else if (aiOpportunityScore >= 55)
    recParts.push("Viable opportunity — proceed with targeted validation.");
  else recParts.push("Weak opportunity — refine scope before investing further.");
  if (aiRiskScore >= 60) recParts.push("Risk profile is elevated; add a mitigation plan.");
  if (business.roi > 0)
    recParts.push(`Projected ROI ${business.roi}% with a ${business.paybackPeriod}-month payback.`);

  const improvements: string[] = [];
  if (!input.competitive.competitiveAdvantage?.trim())
    improvements.push("Articulate a clear competitive advantage.");
  if (!input.technology.technologyGap?.trim())
    improvements.push("Define the technology gap being closed.");
  if ((input.market.tam || 0) <= 0)
    improvements.push("Quantify TAM/SAM/SOM to size the opportunity.");
  if (trl <= 3) improvements.push("Technology is early (low TRL) — plan a proof of concept.");
  if (!input.customer.customerFeedback?.trim())
    improvements.push("Capture customer feedback to validate demand.");
  if (improvements.length === 0) improvements.push("Inputs are complete — no gaps detected.");

  const markets = [input.market.targetMarket, input.market.industry, input.customer.customerSegment]
    .filter(Boolean)
    .join(" · ");

  return {
    aiMarketScore,
    aiTechnologyScore,
    aiCompetitionScore,
    aiRiskScore,
    aiOpportunityScore,
    aiRecommendation: recParts.join(" "),
    aiSuggestedMarkets: markets || "Define target market and segment to get suggestions.",
    aiSuggestedImprovements: improvements.join(" "),
  };
}

/** Section 10 — evaluation scores derived from the fields + AI analysis. */
function computeEvaluation(
  input: OpportunityFormInput,
  ai: OpportunityAIAnalysis,
  business: OpportunityBusiness,
  esgScore: number,
): OpportunityEvaluation {
  const strategicAlignmentScore = clamp(
    round(
      (input.information.strategicInitiative ? 70 : 40) +
        (input.information.productLine ? 15 : 0) +
        esgScore * 0.15,
    ),
  );
  const customerValueScore = clamp(
    round(
      35 +
        (input.customer.customerNeed?.trim() ? 20 : 0) +
        (input.customer.painPoints?.trim() ? 20 : 0) +
        (input.customer.customerFeedback?.trim() ? 15 : 0) +
        (input.customer.customerExpectations?.trim() ? 10 : 0),
    ),
  );
  const businessScore = clamp(
    round(
      (clamp(business.roi, 0, 200) / 2) * 0.6 +
        (100 - (Math.min(business.paybackPeriod, 60) / 60) * 100) * 0.4,
    ),
  );
  const overallOpportunityScore = clamp(
    round(
      0.2 * strategicAlignmentScore +
        0.2 * customerValueScore +
        0.2 * ai.aiMarketScore +
        0.2 * ai.aiTechnologyScore +
        0.2 * businessScore,
    ),
  );
  return {
    strategicAlignmentScore,
    customerValueScore,
    technologyScore: ai.aiTechnologyScore,
    marketScore: ai.aiMarketScore,
    businessScore,
    overallOpportunityScore,
    opportunityRank: 0, // assigned across the portfolio below
  };
}

/** Required fields for the Initial Review completeness gate. */
function completenessGaps(input: OpportunityFormInput): string[] {
  const gaps: string[] = [];
  if (!input.name?.trim()) gaps.push("Opportunity Name");
  if (!input.information.title?.trim()) gaps.push("Opportunity Title");
  if (!input.information.category) gaps.push("Opportunity Category");
  if (!input.information.department) gaps.push("Department");
  if (!input.customer.targetCustomer) gaps.push("Target Customer");
  if (!input.customer.customerNeed?.trim()) gaps.push("Customer Need");
  if (!input.market.industry) gaps.push("Industry");
  if ((input.market.tam || 0) <= 0) gaps.push("TAM");
  if (!input.technology.technologyDomain) gaps.push("Technology Domain");
  if (!input.competitive.marketLeader?.trim()) gaps.push("Market Leader");
  if ((input.business.revenueOpportunity || 0) <= 0) gaps.push("Revenue Opportunity");
  return gaps;
}

/** The single computed "Next Action" surfaced in the sidebar. */
function computeNextAction(
  status: OpportunityStatus,
  stage: OpportunityReviewStage | null,
): string {
  switch (status) {
    case "draft":
      return "Complete the form and Submit for Review";
    case "revision_required":
      return "Update the flagged fields and re-submit";
    case "under_review":
      if (stage === "Market Validation") return "Awaiting Market Validation";
      if (stage === "Business Validation") return "Awaiting Business Validation";
      if (stage === "Innovation Committee Review") return "Awaiting Innovation Committee decision";
      return "Awaiting Initial Review";
    case "approved":
      return "Proceed to Feasibility Study";
    case "on_hold":
      return "On hold — revisit with the Innovation Committee";
    case "rejected":
      return "Rejected — archived for reference";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

/* ------------------------------- Shaping --------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): DiscoveryOpportunityRecord {
  if (!doc) throw new Error("Opportunity not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<DiscoveryOpportunityRecord, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}

function toListRow(r: DiscoveryOpportunityRecord): OpportunityListRow {
  return {
    id: r.id,
    opportunityCode: r.opportunityCode,
    name: r.name,
    status: r.status,
    reviewStage: r.reviewStage,
    category: r.information.category,
    department: r.information.department,
    owner: r.owner,
    overallScore: r.evaluation?.overallOpportunityScore ?? 0,
    opportunityRank: r.evaluation?.opportunityRank ?? 0,
    revenueOpportunity: r.business.revenueOpportunity,
    linkedIdeaCode: r.sourceIdentification.linkedIdeaCode,
    updatedAt: r.updatedAt,
  };
}

/** Re-rank every scored opportunity by overall score (1 = best). */
async function reassignRanks() {
  const coll = await getOpportunitiesCollection();
  const docs = await coll.find({}).toArray();
  const all: DiscoveryOpportunityRecord[] = docs.map((d: unknown) => shape(d));
  const scored = all
    .filter((o) => o.evaluation)
    .sort(
      (a, b) =>
        (b.evaluation!.overallOpportunityScore ?? 0) - (a.evaluation!.overallOpportunityScore ?? 0),
    );
  for (let i = 0; i < scored.length; i++) {
    const rank = i + 1;
    if (scored[i].evaluation!.opportunityRank === rank) continue;
    const updated = {
      ...scored[i],
      evaluation: { ...scored[i].evaluation!, opportunityRank: rank },
    };
    const { id, ...body } = updated;
    await coll.updateOne({ _id: await newObjectId(id) }, { $set: body });
  }
}

/* ============================= Read endpoints ============================= */
export const getOpportunityLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getOpportunitiesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getOpportunitiesCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    const rows = docs.map((d: unknown) => toListRow(shape(d)));
    return { success: true as const, data: rows as OpportunityListRow[] };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getOpportunityFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getOpportunitiesCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Opportunity not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Approved ideas available to link as the Source Idea. */
export const getLinkableIdeasFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getIdeasCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    const items = docs.map((d: Record<string, unknown>) => {
      const basic = (d.basic ?? {}) as {
        title?: string;
        category?: string;
        department?: string;
        businessUnit?: string;
        productLine?: string;
        shortDescription?: string;
      };
      return {
        id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
        ideaCode: d.ideaCode as string,
        title: basic.title ?? "",
        category: basic.category ?? "",
        department: basic.department ?? "",
        businessUnit: basic.businessUnit ?? "",
        productLine: basic.productLine ?? "",
        shortDescription: basic.shortDescription ?? "",
        status: d.status as string,
      };
    });
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ============================ Create / update ============================ */
export const saveOpportunityDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: OpportunityFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getOpportunitiesCollection();
      const now = nowISO();
      const business = computeBusiness(data.input);
      const esgScore = computeEsgScore(data.input);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Opportunity not found.");
        const current = shape(existing);
        if (!["draft", "revision_required"].includes(current.status)) {
          throw new Error(`Opportunity in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<DiscoveryOpportunityRecord, "id"> = {
          ...current,
          name: data.input.name,
          information: data.input.information,
          sourceIdentification: data.input.sourceIdentification,
          customer: data.input.customer,
          market: data.input.market,
          technology: data.input.technology,
          competitive: data.input.competitive,
          business,
          regulatoryESG: { ...data.input.regulatoryESG, esgScore },
          attachments: data.input.attachments,
          lastModifiedBy: CURRENT_USER,
          updatedAt: now,
          nextAction: computeNextAction(current.status, current.reviewStage),
          auditTrail: [
            ...current.auditTrail,
            { at: now, actor: CURRENT_USER, event: "Draft saved" },
          ],
        };
        await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
        return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
      }

      const count = await coll.countDocuments();
      const year = new Date().getFullYear();
      const opportunityCode = `OPP-${year}-${String(count + 1).padStart(5, "0")}`;
      const record: Omit<DiscoveryOpportunityRecord, "id"> = {
        opportunityCode,
        name: data.input.name,
        status: "draft",
        reviewStage: null,
        priority: "Medium",
        nextAction: computeNextAction("draft", null),
        version: 1,
        owner: CURRENT_USER,
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        discoveryDate: now,
        information: data.input.information,
        sourceIdentification: data.input.sourceIdentification,
        customer: data.input.customer,
        market: data.input.market,
        technology: data.input.technology,
        competitive: data.input.competitive,
        business,
        regulatoryESG: { ...data.input.regulatoryESG, esgScore },
        aiAnalysis: null,
        evaluation: null,
        attachments: data.input.attachments,
        reviews: [],
        auditTrail: [
          { at: now, actor: "System", event: `Opportunity ${opportunityCode} created` },
          { at: now, actor: CURRENT_USER, event: "Draft saved" },
        ],
        revisionNote: null,
        feasibilityProjectId: null,
        feasibilityProjectCode: null,
      };
      const res = await coll.insertOne(record);
      return { success: true as const, data: shape({ ...record, _id: res.insertedId }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ===================== Submit → AI analysis → Initial Review ===================== */
export const submitOpportunityFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getOpportunitiesCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Opportunity not found.");
      const current = shape(existing);
      if (!["draft", "revision_required"].includes(current.status)) {
        throw new Error(
          `Only draft or revision-required opportunities can be submitted (was "${current.status}").`,
        );
      }

      const now = nowISO();
      const resubmission = current.status === "revision_required";

      // Rebuild the editable payload from the stored record to recompute.
      const input: OpportunityFormInput = {
        name: current.name,
        information: current.information,
        sourceIdentification: current.sourceIdentification,
        customer: current.customer,
        market: current.market,
        technology: current.technology,
        competitive: current.competitive,
        business: {
          revenueOpportunity: current.business.revenueOpportunity,
          estimatedInvestment: current.business.estimatedInvestment,
          businessRisk: current.business.businessRisk,
        },
        regulatoryESG: current.regulatoryESG,
        attachments: current.attachments,
      };

      // Step: Perform AI Opportunity Analysis.
      const business = computeBusiness(input);
      const esgScore = computeEsgScore(input);
      const aiAnalysis = computeAIAnalysis(input, business);
      const evaluation = computeEvaluation(input, aiAnalysis, business, esgScore);

      // Step: Initial Opportunity Review — branch on completeness.
      const gaps = completenessGaps(input);
      const qualified = gaps.length === 0;
      const status: OpportunityStatus = qualified ? "under_review" : "revision_required";
      const reviewStage: OpportunityReviewStage | null = qualified ? "Market Validation" : null;

      const reviews = qualified
        ? REVIEW_FLOW.map((stage) => ({
            stage,
            reviewer: stage === "Initial Review" ? "Innovation Manager" : stageReviewer(stage),
            decision: (stage === "Initial Review" ? "Forwarded" : "Pending") as
              OpportunityDecision | "Pending",
            comments:
              stage === "Initial Review"
                ? "Opportunity qualified — forwarded for functional reviews."
                : "",
            date: stage === "Initial Review" ? now : null,
          }))
        : current.reviews;

      const updated: Omit<DiscoveryOpportunityRecord, "id"> = {
        ...current,
        status,
        reviewStage,
        version: resubmission ? current.version + 1 : current.version,
        business,
        regulatoryESG: { ...current.regulatoryESG, esgScore },
        aiAnalysis,
        evaluation,
        reviews,
        revisionNote: qualified ? null : `Update required — missing: ${gaps.join(", ")}`,
        nextAction: computeNextAction(status, reviewStage),
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: resubmission ? "Re-submitted for review" : "Submitted for review",
            fromStatus: current.status,
            toStatus: status,
          },
          {
            at: now,
            actor: "System",
            event: `AI opportunity analysis completed (score ${aiAnalysis.aiOpportunityScore}/100)`,
          },
          {
            at: now,
            actor: "Innovation Manager",
            event: qualified
              ? "Initial review: qualified opportunity"
              : `Initial review: information incomplete (${gaps.length} field(s))`,
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      await reassignRanks();
      const fresh = await coll.findOne({ _id: await newObjectId(id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

function stageReviewer(stage: OpportunityReviewStage): string {
  if (stage === "Market Validation") return "Marketing Reviewer";
  if (stage === "Business Validation") return "Business Reviewer";
  if (stage === "Innovation Committee Review") return "Innovation Committee";
  return "Innovation Manager";
}

/* ============================ Functional reviews ============================ */
export const reviewOpportunityFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      stage: OpportunityReviewStage;
      decision: OpportunityDecision;
      comments?: string;
      priority?: DiscoveryOpportunityRecord["priority"];
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getOpportunitiesCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Opportunity not found.");
      const current = shape(existing);
      if (current.status !== "under_review") {
        throw new Error(`Opportunity is "${current.status}", not under review.`);
      }
      if (current.reviewStage !== data.stage) {
        throw new Error(`Opportunity is at "${current.reviewStage}", not "${data.stage}".`);
      }

      const now = nowISO();
      const reviewer = stageReviewer(data.stage);
      let status: OpportunityStatus = current.status;
      let reviewStage: OpportunityReviewStage | null = current.reviewStage;
      let feasibilityProjectId = current.feasibilityProjectId;
      let feasibilityProjectCode = current.feasibilityProjectCode;
      let revisionNote = current.revisionNote;

      if (data.decision === "Rejected") {
        status = "rejected";
        reviewStage = null;
      } else if (data.decision === "Revision Required") {
        status = "revision_required";
        reviewStage = null;
        revisionNote = data.comments?.trim() || "Revision requested by reviewer.";
      } else if (data.decision === "On Hold") {
        status = "on_hold";
      } else if (data.decision === "Approved" || data.decision === "Forwarded") {
        const idx = REVIEW_FLOW.indexOf(data.stage);
        const next = REVIEW_FLOW[idx + 1];
        if (data.stage === "Innovation Committee Review") {
          status = "approved";
          reviewStage = null;
          // Approved → auto-create the linked Feasibility Study record.
          const fpColl = await getFeasibilityProjectsCollection();
          const fpCount = await fpColl.countDocuments();
          const projectCode = `FSP-${String(fpCount + 1).padStart(5, "0")}`;
          const fpRecord: Omit<FeasibilityProjectRecord, "id"> = {
            projectCode,
            ideaId: current.sourceIdentification.linkedIdeaId ?? current.id,
            ideaCode: current.sourceIdentification.linkedIdeaCode ?? current.opportunityCode,
            title: current.name,
            createdAt: now,
            status: "Initiated",
          };
          const fpRes = await fpColl.insertOne(fpRecord);
          feasibilityProjectId = fpRes.insertedId?.toString?.() ?? projectCode;
          feasibilityProjectCode = projectCode;
        } else {
          reviewStage = next ?? null;
        }
      }

      const reviews = current.reviews.map((r) =>
        r.stage === data.stage
          ? { ...r, decision: data.decision, reviewer, comments: data.comments ?? "", date: now }
          : r,
      );

      const auditTrail = [
        ...current.auditTrail,
        {
          at: now,
          actor: reviewer,
          event: `${data.stage}: ${data.decision}${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        },
      ];
      if (feasibilityProjectCode && !current.feasibilityProjectCode) {
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Feasibility Study ${feasibilityProjectCode} created`,
        });
      }
      if (status === "rejected") {
        auditTrail.push({ at: now, actor: "System", event: "Opportunity archived to repository" });
      }

      const updated: Omit<DiscoveryOpportunityRecord, "id"> = {
        ...current,
        status,
        reviewStage,
        priority: data.priority ?? current.priority,
        revisionNote,
        feasibilityProjectId,
        feasibilityProjectCode,
        reviews,
        nextAction: computeNextAction(status, reviewStage),
        lastModifiedBy: reviewer,
        updatedAt: now,
        auditTrail,
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      await reassignRanks();
      const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });
