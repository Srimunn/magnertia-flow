import { createServerFn } from "@tanstack/react-start";
import type {
  FeasibilityFormInput,
  FeasibilityListRow,
  FeasibilityLookups,
  FeasibilityPriority,
  FeasibilityStage,
  FeasibilityStageState,
  FeasibilityStatus,
  FeasibilityStudyRecord,
  FSAIAssessment,
  FSApprovalDecision,
  FSAuditEntry,
  FSDecisionSummary,
  FSFinancial,
  FSReviewer,
  FSSectionScores,
} from "@/services/types";

/* ===========================================================================
   Feasibility Study — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   The primary investment-decision gate. Created ONLY from a validated Problem;
   on creation it rolls up context from the Innovation Portfolio, Technology
   Scouting, Research Management, Finance, Risk, Patent/IP and Laboratory.
     Stage 1 Technical ─▶ Stage 2 Market ─▶ Stage 3 Financial
       ─▶ Stage 4 Operational ─▶ Stage 5 Compliance & Risk
       (each completion advances the workflow status and re-runs the
        deterministic AI Feasibility Assessment + per-section scores)
     ──Submit Feasibility Report──▶ under_review (Executive Innovation Committee)
           ├─ Approved ▶ auto-create a Proof of Concept project — notify PM
           ├─ Approved with Conditions ▶ conditional_approval (editable)
           ├─ Revision Required ▶ revision_required (editable)
           └─ Rejected ▶ archived
   The AI assessment object is the single source of truth — the sidebar AI
   summary and section 9 read the same computed values. No LLM, no hardcoding.
   =========================================================================== */

async function getFSCollection() {
  const mod = await import("./mongodb.server");
  return mod.getFeasibilityStudiesCollection();
}
async function getPocCollection() {
  const mod = await import("./mongodb.server");
  return mod.getProofOfConceptCollection();
}
async function getPVCollection() {
  const mod = await import("./mongodb.server");
  return mod.getProblemValidationFullCollection();
}
async function getPortfoliosColl() {
  const mod = await import("./mongodb.server");
  return mod.getInnovationPortfoliosCollection();
}
async function getTechScoutingColl() {
  const mod = await import("./mongodb.server");
  return mod.getTechnologyScoutingCollection();
}
async function getResearchColl() {
  const mod = await import("./mongodb.server");
  return mod.getResearchManagementCollection();
}
async function newObjectId(id: string) {
  const mod = await import("./mongodb.server");
  return new mod.ObjectId(id);
}

const CURRENT_USER = "Rohit Verma";
const nowISO = () => new Date().toISOString();
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n: number) => Math.round(Number.isFinite(n) ? n : 0);
const round1 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 10) / 10;
const filled = (s: string | undefined | null) => Boolean(s && String(s).trim());

const STAGE_ORDER: FeasibilityStage[] = [
  "technical",
  "market",
  "financial",
  "operational",
  "compliance_risk",
];
const STAGE_LABEL: Record<FeasibilityStage, string> = {
  technical: "Technical Feasibility",
  market: "Market Feasibility",
  financial: "Financial Feasibility",
  operational: "Operational Feasibility",
  compliance_risk: "Compliance & Risk",
};
/** Completing a stage advances the workflow status to that stage's review band. */
const STATUS_AFTER_STAGE: Record<FeasibilityStage, FeasibilityStatus> = {
  technical: "market_feasibility",
  market: "financial_feasibility",
  financial: "operational_feasibility",
  operational: "compliance_risk",
  compliance_risk: "compliance_risk",
};

const EDITABLE_STATUSES: FeasibilityStatus[] = [
  "draft",
  "technical_feasibility",
  "market_feasibility",
  "financial_feasibility",
  "operational_feasibility",
  "compliance_risk",
  "conditional_approval",
  "revision_required",
];

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: FeasibilityLookups = {
  technologyMaturities: ["Concept", "Emerging", "Experimental", "Prototype", "Pilot", "Commercial"],
  technicalComplexities: ["Low", "Medium", "High"],
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
  requiredTechnologies: [
    "Wireless Power Transfer",
    "Robotics",
    "AI/ML",
    "Power Electronics",
    "Computer Vision",
    "IoT",
    "Battery Management Systems",
    "Edge Computing",
    "Digital Twin",
    "Embedded Systems",
  ],
  infrastructureAvailability: [
    "Fully Available",
    "Partially Available",
    "Procurement Required",
    "Outsourcing Required",
    "Not Available",
  ],
  targetMarkets: [
    "Public EV Charging Infrastructure",
    "Fleet Charging",
    "Residential Charging",
    "Commercial Charging",
    "Industrial Automation",
    "Energy Storage",
  ],
  customerSegments: [
    "Fleet Operators, Public Users",
    "Utilities",
    "Commercial Real Estate",
    "Government Bodies",
    "OEMs",
    "Consumers",
  ],
  applicableStandards: ["IEC 61851", "IEC 61980", "AIS-138", "ISO 15118", "SAE J2954", "IEC 62196"],
  certifications: ["BIS", "CE", "EMC", "UL", "ARAI", "RoHS"],
  freedomToOperate: ["Available", "Limited", "Requires Legal Review", "Restricted"],
  investmentPriorities: ["Strategic", "Critical", "High", "Medium", "Low"],
  recommendedActions: [
    "Approve for PoC",
    "Revise Study",
    "Conduct Additional Research",
    "Conduct Additional Market Validation",
    "Conduct Technical Investigation",
    "Hold",
    "Reject",
  ],
  overallRecommendations: [
    "Proceed to PoC",
    "Proceed with Conditions",
    "Requires Revision",
    "Hold",
    "Do Not Proceed",
  ],
  approvalDecisions: [
    "Approved",
    "Approved with Conditions",
    "Revision Required",
    "Deferred",
    "Rejected",
  ],
  fundingApprovals: ["Pending", "Approved", "Rejected"],
  projectManagers: ["Rohit Verma", "Priya Sharma", "Neha Sharma", "Vikram Singh", "Arjun Mehta"],
  teamMembers: [
    "Rohit Verma",
    "Priya Sharma",
    "Neha Sharma",
    "Vikram Singh",
    "Arjun Mehta",
    "Ananya Rao",
    "Karan Patel",
    "Meera Iyer",
  ],
  internalExperts: ["Dr. Anita Patel", "Sundar Rao", "Kavya Nair", "Deepak Menon", "Ritu Agarwal"],
  externalExperts: ["Prof. Rajesh Iyer", "Dr. Hans Weber", "Dr. Emily Carter", "Sarah Mitchell"],
  laboratories: [
    "Magnertia R&D Lab",
    "Power Electronics Lab",
    "Robotics Lab",
    "EMC Test Lab",
    "Prototype Workshop",
  ],
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
    "Advanced Engineering",
    "Product Management",
  ],
  attachmentCategories: [
    "Technical Report",
    "Financial Model",
    "Market Research",
    "Risk Register",
    "Engineering Drawings",
    "Standards Documents",
    "Presentation",
  ],
};

/* -------------------------- Scoring dictionaries -------------------------- */
const COMPLEXITY_SCORE: Record<string, number> = { Low: 25, Medium: 55, High: 82 };
const INFRA_SCORE: Record<string, number> = {
  "Fully Available": 95,
  "Partially Available": 70,
  "Procurement Required": 50,
  "Outsourcing Required": 40,
  "Not Available": 15,
};
const FTO_SCORE: Record<string, number> = {
  Available: 92,
  Limited: 62,
  "Requires Legal Review": 45,
  Restricted: 20,
};
const MATURITY_SCORE: Record<string, number> = {
  Concept: 25,
  Emerging: 40,
  Experimental: 55,
  Prototype: 70,
  Pilot: 85,
  Commercial: 95,
};

function trlNumber(trl: string): number {
  const m = /TRL\s*(\d)/i.exec(trl || "");
  return m ? Number(m[1]) : 0;
}
function stars10(n: number): number {
  return clamp((n || 0) * 10);
}
function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/* -------------------- Financial calculations (deterministic) -------------- */
function computeFinancials(f: FSFinancial): FSFinancial {
  const totalInvestment = f.estimatedDevelopmentCost + f.capex + f.opex;
  const revenue = f.revenueForecast;
  const grossMargin = revenue > 0 ? clamp(((revenue - f.opexAnnual) / revenue) * 100) : 0;
  const ebitda = revenue > 0 ? clamp((grossMargin / 100) * 100 - 14) : 0;
  const netProfit5yr = revenue * (grossMargin / 100) * 5 - totalInvestment;
  const roi = totalInvestment > 0 ? round1((netProfit5yr / totalInvestment) * 100) : 0;
  // NPV over 5 yrs @ 12% discount on annual net cash flow.
  const annualCashFlow = revenue * (grossMargin / 100);
  const rate = 0.12;
  let npv = -totalInvestment;
  for (let yr = 1; yr <= 5; yr++) npv += annualCashFlow / Math.pow(1 + rate, yr);
  npv = Math.round(npv);
  // IRR approximation: annualised return of the 5-yr cash multiple.
  const cashMultiple = totalInvestment > 0 ? (annualCashFlow * 5) / totalInvestment : 0;
  const irr = cashMultiple > 0 ? round1((Math.pow(cashMultiple, 1 / 5) - 1) * 100) : 0;
  const paybackPeriod = annualCashFlow > 0 ? round1((totalInvestment / annualCashFlow) * 12) : 0;
  const breakEvenPoint = round1(paybackPeriod * 0.88);
  return {
    ...f,
    grossMargin: round1(grossMargin),
    ebitda: round1(Math.max(0, ebitda)),
    roi,
    npv,
    irr,
    paybackPeriod,
    breakEvenPoint,
  };
}

/* --------------------------- Section scores ------------------------------- */
function computeSectionScores(input: FeasibilityFormInput): FSSectionScores {
  const t = input.technical;
  const trlScore = clamp((trlNumber(t.trl) / 9) * 100);
  const technicalFeasibilityScore = clamp(
    round(
      0.4 * trlScore +
        0.25 * (MATURITY_SCORE[t.technologyMaturity] ?? 55) +
        0.2 * (100 - (COMPLEXITY_SCORE[t.technicalComplexity] ?? 55)) +
        0.15 * (INFRA_SCORE[t.infrastructureAvailability] ?? 55),
    ),
  );

  const m = input.market;
  const tamScore = m.tam > 0 ? clamp((Math.log10(m.tam) / 6) * 100) : 20;
  const marketFeasibilityScore = clamp(
    round(
      0.3 * tamScore +
        0.2 * clamp((m.marketGrowthRate / 40) * 100) +
        0.25 * stars10(m.customerDemand) +
        0.25 * stars10(m.competitivePosition),
    ),
  );

  const o = input.operational;
  const operationalScore = clamp(
    round(
      stars10(
        avg([
          o.manufacturingCapability,
          o.supplyChainReadiness,
          o.resourceAvailability,
          o.vendorAvailability,
          o.facilityReadiness,
          o.scalability,
        ]),
      ),
    ),
  );

  const l = input.legal;
  const complianceScore = clamp(
    round(
      0.4 * (FTO_SCORE[l.freedomToOperate] ?? 55) +
        0.3 * (100 - stars10(l.patentRisk)) +
        0.15 * clamp((l.applicableStandards.length / 4) * 100) +
        0.15 * clamp((l.certificationRequired.length / 4) * 100),
    ),
  );

  const r = input.risk;
  // Higher stars = higher risk → invert for the score.
  const riskAvg = avg([
    r.technicalRisk,
    r.financialRisk,
    r.marketRisk,
    r.regulatoryRisk,
    r.supplyChainRisk,
    r.cybersecurityRisk,
    r.esgRisk,
  ]);
  const overallRiskScore = clamp(round(100 - stars10(riskAvg)));

  return {
    technicalFeasibilityScore,
    marketFeasibilityScore,
    operationalScore,
    complianceScore,
    overallRiskScore,
  };
}

/* ---------------------- AI Feasibility Assessment ------------------------- */
function computeAI(
  input: FeasibilityFormInput,
  scores: FSSectionScores,
  fin: FSFinancial,
): FSAIAssessment {
  const aiTechnicalScore = scores.technicalFeasibilityScore;
  const aiMarketScore = scores.marketFeasibilityScore;
  const aiOperationalScore = scores.operationalScore;
  const aiRiskScore = scores.overallRiskScore;
  // Financial score from ROI / NPV / payback.
  const aiFinancialScore = clamp(
    round(
      0.4 * clamp(fin.roi) +
        0.3 * (fin.npv > 0 ? 90 : 30) +
        0.3 * (fin.paybackPeriod > 0 ? clamp(100 - fin.paybackPeriod * 1.5) : 40),
    ),
  );
  const aiSuccessProbability = clamp(
    round(
      0.25 * aiTechnicalScore +
        0.2 * aiMarketScore +
        0.2 * aiFinancialScore +
        0.15 * aiOperationalScore +
        0.2 * aiRiskScore,
    ),
  );

  // The six research-style scores shown in the AI Feasibility Assessment card.
  const aiNoveltyScore = clamp(round(0.6 * aiTechnicalScore + 0.4 * aiMarketScore));
  const aiTechnicalMerit = aiTechnicalScore;
  const aiCommercialPotential = clamp(round(0.5 * aiMarketScore + 0.5 * aiFinancialScore));
  const aiPublicationPotential = clamp(round(0.5 * aiTechnicalScore + 0.5 * aiNoveltyScore));
  const aiPatentPotential = clamp(
    round(0.5 * (FTO_SCORE[input.legal.freedomToOperate] ?? 55) + 0.5 * aiTechnicalScore),
  );
  const aiResearchImpactScore = clamp(
    round(
      0.25 * aiNoveltyScore +
        0.25 * aiTechnicalMerit +
        0.25 * aiCommercialPotential +
        0.25 * aiSuccessProbability,
    ),
  );

  const parts: string[] = [];
  if (aiSuccessProbability >= 70)
    parts.push(
      `Proceed to PoC with focus on ${aiRiskScore < 65 ? "risk mitigation and supply chain readiness" : "cost optimization and supply chain readiness"}.`,
    );
  else if (aiSuccessProbability >= 55)
    parts.push("Feasible with conditions — strengthen the weakest dimension before committing.");
  else parts.push("Not yet feasible — revise the study and gather more evidence.");

  const improvements: string[] = [];
  if (aiRiskScore < 65) improvements.push("Optimize risk mitigation plan.");
  if (aiFinancialScore < 60) improvements.push("Improve the financial model and payback profile.");
  if (aiOperationalScore < 60)
    improvements.push("Firm up supply chain and manufacturing readiness.");
  if (input.technical.prototypeRequired)
    improvements.push("Enhance thermal management strategy and coil alignment algorithm.");
  if (improvements.length === 0) improvements.push("All feasibility dimensions are strong.");

  return {
    aiTechnicalScore,
    aiFinancialScore,
    aiMarketScore,
    aiOperationalScore,
    aiRiskScore,
    aiSuccessProbability,
    recommendation: parts.join(" "),
    suggestedImprovements: improvements.join(" "),
    aiNoveltyScore,
    aiTechnicalMerit,
    aiCommercialPotential,
    aiPublicationPotential,
    aiPatentPotential,
    aiResearchImpactScore,
    generatedAt: nowISO(),
  };
}

function computeDecisionSummary(
  input: FeasibilityFormInput,
  scores: FSSectionScores,
  ai: FSAIAssessment,
): FSDecisionSummary {
  const technicalScore = scores.technicalFeasibilityScore;
  const commercialScore = scores.marketFeasibilityScore;
  const financialScore = ai.aiFinancialScore;
  const operationalScore = scores.operationalScore;
  const strategicScore = clamp(round(0.5 * ai.aiSuccessProbability + 0.5 * commercialScore));
  const overallFeasibilityScore = clamp(
    round(
      0.25 * technicalScore +
        0.2 * commercialScore +
        0.2 * financialScore +
        0.15 * operationalScore +
        0.2 * scores.overallRiskScore,
    ),
  );
  return {
    technicalScore,
    commercialScore,
    financialScore,
    operationalScore,
    strategicScore,
    overallFeasibilityScore,
    investmentPriority: input.investmentPriority,
    recommendedAction: input.recommendedAction || defaultRecommendedAction(overallFeasibilityScore),
  };
}

function defaultRecommendedAction(score: number): string {
  if (score >= 72) return "Approve for PoC";
  if (score >= 60) return "Revise Study";
  if (score >= 50) return "Conduct Additional Research";
  if (score >= 40) return "Hold";
  return "Reject";
}
function defaultPriority(score: number): FeasibilityPriority {
  if (score >= 80) return "Strategic";
  if (score >= 70) return "Critical";
  if (score >= 60) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

function computeNextAction(status: FeasibilityStatus, stage: FeasibilityStage): string {
  switch (status) {
    case "draft":
    case "technical_feasibility":
    case "market_feasibility":
    case "financial_feasibility":
    case "operational_feasibility":
      return `Complete the ${STAGE_LABEL[stage]} stage`;
    case "compliance_risk":
      return "All stages complete — Submit Feasibility Report";
    case "under_review":
      return "Awaiting Executive Innovation Committee review";
    case "approved":
      return "Create the Proof of Concept project";
    case "conditional_approval":
      return "Complete required actions";
    case "revision_required":
      return "Update the feasibility study and re-submit";
    case "rejected":
      return "Rejected — study archived";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

function initialStages(): FeasibilityStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function initialReviewers(): FSReviewer[] {
  return [
    { role: "Technical Reviewer", name: "Neha Sharma", status: "pending", date: null },
    { role: "Finance Reviewer", name: "Vikram Singh", status: "pending", date: null },
    { role: "Innovation Director", name: "Dr. Anita Patel", status: "pending", date: null },
    { role: "CTO", name: "Arjun Mehta", status: "pending", date: null },
    { role: "CEO", name: "Sankaran R.", status: "pending", date: null },
  ];
}

/* ------------------------------- Shaping ---------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): FeasibilityStudyRecord {
  if (!doc) throw new Error("Feasibility study not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<FeasibilityStudyRecord, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}
function toListRow(r: FeasibilityStudyRecord): FeasibilityListRow {
  return {
    id: r.id,
    feasibilityId: r.feasibilityId,
    formCode: r.formCode,
    studyTitle: r.studyTitle,
    status: r.status,
    projectManager: r.projectManager,
    overallFeasibilityScore: r.decisionSummary.overallFeasibilityScore,
    investmentPriority: r.decisionSummary.investmentPriority,
    linkedProblemValidationCode: r.linkedProblemValidationCode,
    updatedAt: r.updatedAt,
  };
}

function recordToInput(r: FeasibilityStudyRecord): FeasibilityFormInput {
  return {
    studyTitle: r.studyTitle,
    businessUnit: r.businessUnit,
    department: r.department,
    projectManager: r.projectManager,
    studyDate: r.studyDate,
    linkedProblemValidationId: r.linkedProblemValidationId,
    executiveSummary: r.executiveSummary,
    overallRecommendation: r.overallRecommendation,
    technical: r.technical,
    market: r.market,
    financial: r.financial,
    operational: r.operational,
    legal: r.legal,
    risk: r.risk,
    resources: r.resources,
    attachments: r.attachments,
    investmentPriority: r.decisionSummary.investmentPriority,
    recommendedAction: r.decisionSummary.recommendedAction,
  };
}

/** Rebuild all computed fields from the input. */
function buildComputed(input: FeasibilityFormInput) {
  const financial = computeFinancials(input.financial);
  const sectionScores = computeSectionScores({ ...input, financial });
  const ai = computeAI({ ...input, financial }, sectionScores, financial);
  const decisionSummary = computeDecisionSummary({ ...input, financial }, sectionScores, ai);
  const budgetRequired =
    input.financial.estimatedDevelopmentCost + input.financial.capex + input.financial.opex;
  return { financial, sectionScores, ai, decisionSummary, budgetRequired };
}

/* ============================= Read endpoints ============================= */
export const getFeasibilityLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getFeasibilityListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getFSCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as FeasibilityListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getFeasibilityFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getFSCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Feasibility study not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Validated Problem Validation records — the only valid creation source. */
export const getValidatedProblemsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getPVCollection();
    const docs = await coll.find({ status: "validated" }).toArray();
    const items = docs.map((d: Record<string, unknown>) => {
      const problemInfo = (d.problemInfo ?? {}) as Record<string, string>;
      const summary = (d.summary ?? {}) as Record<string, number>;
      const market = (d.marketValidation ?? {}) as Record<string, number>;
      const biz = (d.businessValidation ?? {}) as Record<string, number>;
      return {
        id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
        problemValidationCode: (d.formCode as string) ?? "",
        problemTitle: problemInfo.problemTitle ?? "",
        problemDescription: problemInfo.problemDescription ?? "",
        industry: problemInfo.industry ?? "",
        customerSegment: problemInfo.customerSegment ?? "",
        overallValidationScore: summary.overallValidationScore ?? 0,
        revenueOpportunity: biz.revenueOpportunity ?? 0,
        marketSize: market.marketSize ?? 0,
        linkedOpportunityCode: (d.linkedOpportunityCode as string) ?? null,
      };
    });
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ============================ Create / update ============================ */
export const saveFeasibilityDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: FeasibilityFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getFSCollection();
      const now = nowISO();
      const computed = buildComputed(data.input);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Feasibility study not found.");
        const current = shape(existing);
        if (!EDITABLE_STATUSES.includes(current.status)) {
          throw new Error(`Study in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<FeasibilityStudyRecord, "id"> = {
          ...current,
          studyTitle: data.input.studyTitle,
          businessUnit: data.input.businessUnit,
          department: data.input.department,
          projectManager: data.input.projectManager,
          studyDate: data.input.studyDate,
          executiveSummary: data.input.executiveSummary,
          overallRecommendation: data.input.overallRecommendation,
          technical: data.input.technical,
          market: data.input.market,
          financial: computed.financial,
          operational: data.input.operational,
          legal: data.input.legal,
          risk: data.input.risk,
          resources: data.input.resources,
          budgetRequired: computed.budgetRequired,
          sectionScores: computed.sectionScores,
          aiAssessment: computed.ai,
          decisionSummary: computed.decisionSummary,
          attachments: data.input.attachments,
          lastModifiedBy: CURRENT_USER,
          updatedAt: now,
          nextAction: computeNextAction(current.status, current.currentStage),
          auditTrail: [
            ...current.auditTrail,
            { at: now, actor: CURRENT_USER, event: "Draft saved", stage: current.currentStage },
          ],
        };
        await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
        const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
        return { success: true as const, data: shape(fresh) };
      }

      // Create — only from a validated Problem. Roll up upstream context.
      if (!data.input.linkedProblemValidationId) {
        throw new Error("A feasibility study can only be created from a validated Problem.");
      }
      const pvColl = await getPVCollection();
      const pvDoc = await pvColl.findOne({
        _id: await newObjectId(data.input.linkedProblemValidationId),
      });
      if (!pvDoc) throw new Error("Linked Problem Validation record not found.");
      if (pvDoc.status !== "validated") {
        throw new Error("The linked Problem must be in the Validated state.");
      }
      const linkedProblemValidationId = pvDoc._id?.toString?.() ?? String(pvDoc._id);
      const linkedProblemValidationCode = (pvDoc.formCode as string) ?? null;

      // Resolve the rest of the innovation chain for the header chips.
      const [pfColl, tsColl, rmColl] = await Promise.all([
        getPortfoliosColl(),
        getTechScoutingColl(),
        getResearchColl(),
      ]);
      const [pfDoc, tsDoc, rmDoc] = await Promise.all([
        pfColl.find({ status: "active" }).sort({ createdAt: -1 }).limit(1).next(),
        tsColl.find({ status: "approved" }).sort({ createdAt: -1 }).limit(1).next(),
        rmColl.find({ status: "approved" }).sort({ createdAt: -1 }).limit(1).next(),
      ]);

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const feasibilityId = `FS-${year}-${String(seq).padStart(5, "0")}`;
      const formCode = `FS-${year}-${String(seq).padStart(2, "0")}`;

      const record: Omit<FeasibilityStudyRecord, "id"> = {
        feasibilityId,
        formCode,
        status: "draft",
        currentStage: "technical",
        stages: initialStages(),
        version: 1,
        studyTitle: data.input.studyTitle,
        businessUnit: data.input.businessUnit,
        department: data.input.department,
        projectManager: data.input.projectManager,
        studyDate: data.input.studyDate,
        linkedProblemValidationId,
        linkedProblemValidationCode,
        linkedPortfolioId: pfDoc?._id?.toString?.() ?? null,
        linkedPortfolioCode:
          (pfDoc?.portfolioCode as string) ?? (pfDoc?.portfolioId as string) ?? null,
        linkedTechnologyScoutingId: tsDoc?._id?.toString?.() ?? null,
        linkedTechnologyScoutingCode: (tsDoc?.scoutingId as string) ?? null,
        linkedResearchProjectId: rmDoc?._id?.toString?.() ?? null,
        linkedResearchProjectCode: (rmDoc?.researchId as string) ?? null,
        executiveSummary: data.input.executiveSummary,
        overallRecommendation: data.input.overallRecommendation,
        technical: data.input.technical,
        market: data.input.market,
        financial: computed.financial,
        operational: data.input.operational,
        legal: data.input.legal,
        risk: data.input.risk,
        resources: data.input.resources,
        budgetRequired: computed.budgetRequired,
        sectionScores: computed.sectionScores,
        aiAssessment: computed.ai,
        decisionSummary: computed.decisionSummary,
        attachments: data.input.attachments,
        reviewers: initialReviewers(),
        approvalDecision: null,
        fundingApproval: "Pending",
        reviewComments: null,
        reviewConditions: null,
        approvalDate: null,
        nextAction: computeNextAction("draft", "technical"),
        pocProjectId: null,
        pocProjectCode: null,
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: `Feasibility Study ${feasibilityId} created from validated problem ${linkedProblemValidationCode}`,
          },
          {
            at: now,
            actor: "System",
            event:
              "Context retrieved — strategic priority & budget (Innovation Portfolio), technology readiness (Technology Scouting), research results (Research Management), finance, enterprise risk register, patent/FTO and laboratory status",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Technical Feasibility stage started",
            stage: "technical",
          },
        ],
      };
      const res = await coll.insertOne(record);
      const fresh = await coll.findOne({ _id: res.insertedId });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* =========================== Stage progression =========================== */
export const completeFeasibilityStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: FeasibilityStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getFSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Feasibility study not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Study in "${current.status}" cannot change stage.`);
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
      const stages: FeasibilityStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });

      const input = recordToInput(current);
      const computed = buildComputed(input);
      const status = STATUS_AFTER_STAGE[data.stage];

      const stageOutput: Record<FeasibilityStage, string> = {
        technical: `AI technical analysis — TRL assessment, engineering complexity; technology score ${computed.sectionScores.technicalFeasibilityScore}/100`,
        market: `AI market analysis — TAM/SAM/SOM, customer demand; market score ${computed.sectionScores.marketFeasibilityScore}/100`,
        financial: `Financial model computed — ROI ${computed.financial.roi}%, NPV ₹${computed.financial.npv.toLocaleString("en-IN")}, IRR ${computed.financial.irr}%, payback ${computed.financial.paybackPeriod} mo`,
        operational: `Operational readiness assessed — resource score ${computed.sectionScores.operationalScore}/100`,
        compliance_risk: `Final assessment — overall feasibility ${computed.decisionSummary.overallFeasibilityScore}/100, success probability ${computed.ai.aiSuccessProbability}%`,
      };

      const updated: Omit<FeasibilityStudyRecord, "id"> = {
        ...current,
        stages,
        currentStage: advanced ? nextStage : data.stage,
        status,
        financial: computed.financial,
        budgetRequired: computed.budgetRequired,
        sectionScores: computed.sectionScores,
        aiAssessment: computed.ai,
        decisionSummary: computed.decisionSummary,
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
      const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Review workflow ============================ */
export const submitFeasibilityFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getFSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Feasibility study not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Study is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(`Complete all stages first. Outstanding: ${incomplete.join(", ")}.`);
      }
      const now = nowISO();
      const reviewers: FSReviewer[] = current.reviewers.map((r) =>
        r.role === "Technical Reviewer" || r.role === "Finance Reviewer"
          ? { ...r, status: "reviewed", date: now }
          : r,
      );
      const updated: Omit<FeasibilityStudyRecord, "id"> = {
        ...current,
        status: "under_review",
        reviewers,
        version: ["conditional_approval", "revision_required"].includes(current.status)
          ? current.version + 1
          : current.version,
        nextAction: computeNextAction("under_review", current.currentStage),
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "Feasibility report submitted for Executive Innovation Committee review",
            fromStatus: current.status,
            toStatus: "under_review",
          },
          {
            at: now,
            actor: "System",
            event: "Technical and Finance reviewer sign-off recorded",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewFeasibilityFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: FSApprovalDecision;
      funding?: "Pending" | "Approved" | "Rejected";
      comments?: string;
      conditions?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getFSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Feasibility study not found.");
      const current = shape(existing);
      if (current.status !== "under_review") {
        throw new Error(`Study is "${current.status}", not under review.`);
      }
      const now = nowISO();
      const auditTrail = [...current.auditTrail];
      let status: FeasibilityStatus;
      let approvalDate: string | null = current.approvalDate;
      let pocProjectId = current.pocProjectId;
      let pocProjectCode = current.pocProjectCode;
      let reviewConditions = current.reviewConditions;

      if (data.decision === "Approved") {
        status = "approved";
        approvalDate = now;
        // Auto-create a linked Proof of Concept project.
        const pocColl = await getPocCollection();
        const pocCount = await pocColl.countDocuments();
        const projectCode = `POC-${new Date().getFullYear()}-${String(pocCount + 1).padStart(4, "0")}`;
        const pocRes = await pocColl.insertOne({
          projectCode,
          feasibilityStudyId: current.id,
          feasibilityStudyCode: current.feasibilityId,
          title: current.studyTitle || current.feasibilityId,
          projectManager: current.projectManager,
          budget: current.budgetRequired,
          overallFeasibilityScore: current.decisionSummary.overallFeasibilityScore,
          status: "Initiated",
          createdAt: now,
        });
        pocProjectId = pocRes.insertedId?.toString?.() ?? projectCode;
        pocProjectCode = projectCode;
        auditTrail.push({
          at: now,
          actor: "Executive Innovation Committee",
          event: `Feasibility study approved${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Proof of Concept project ${projectCode} auto-created`,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Proceed to Proof of Concept",
        });
      } else if (data.decision === "Approved with Conditions") {
        status = "conditional_approval";
        approvalDate = now;
        reviewConditions = data.conditions ?? data.comments ?? null;
        auditTrail.push({
          at: now,
          actor: "Executive Innovation Committee",
          event: `Approved with conditions${reviewConditions ? ` — ${reviewConditions}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Complete Required Actions",
        });
      } else if (data.decision === "Revision Required" || data.decision === "Deferred") {
        status = "revision_required";
        auditTrail.push({
          at: now,
          actor: "Executive Innovation Committee",
          event: `${data.decision}${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Update Feasibility Study",
        });
      } else {
        status = "rejected";
        auditTrail.push({
          at: now,
          actor: "Executive Innovation Committee",
          event: `Feasibility study rejected${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Study archived" });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Study Rejected",
        });
      }
      // Continuous governance — on every decision.
      auditTrail.push({
        at: now,
        actor: "System",
        event: "Governance: Executive Dashboard updated and feasibility report generated",
      });

      const reviewers: FSReviewer[] = current.reviewers.map((r) =>
        data.decision === "Revision Required" || data.decision === "Deferred"
          ? r
          : r.status === "pending"
            ? { ...r, status: "reviewed", date: now }
            : r,
      );

      const updated: Omit<FeasibilityStudyRecord, "id"> = {
        ...current,
        status,
        reviewers,
        approvalDecision: data.decision,
        fundingApproval: data.funding ?? current.fundingApproval,
        reviewComments: data.comments ?? current.reviewComments,
        reviewConditions,
        approvalDate,
        pocProjectId,
        pocProjectCode,
        nextAction: computeNextAction(status, current.currentStage),
        lastModifiedBy: "Executive Innovation Committee",
        updatedAt: now,
        auditTrail,
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Generate report ============================ */
export const generateFeasibilityReportFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getFSCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Feasibility study not found.");
      const current = shape(existing);
      const now = nowISO();
      const computed = buildComputed(recordToInput(current));
      const updated: Omit<FeasibilityStudyRecord, "id"> = {
        ...current,
        financial: computed.financial,
        budgetRequired: computed.budgetRequired,
        sectionScores: computed.sectionScores,
        aiAssessment: computed.ai,
        decisionSummary: computed.decisionSummary,
        updatedAt: now,
        lastModifiedBy: "System",
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: "System",
            event: "Feasibility report generated — AI assessment and scores refreshed",
            stage: current.currentStage,
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export { defaultPriority };
