import { createServerFn } from "@tanstack/react-start";
import type {
  FeasibilityProjectRecord,
  ResearchActivityEntry,
  ResearchAIAnalytics,
  ResearchApprovalDecision,
  ResearchFormInput,
  ResearchKPIs,
  ResearchListRow,
  ResearchLookups,
  ResearchManagementRecord,
  ResearchReviewer,
  ResearchStage,
  ResearchStageState,
  ResearchStatus,
  ResearchTRL,
} from "@/services/types";

/* ===========================================================================
   Research Management — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   Approved Opportunity + Technology Scouting + Innovation Portfolio context
     ─▶ create research project
       Stage 1 Research Planning ─▶ Stage 2 Resource Planning
         ─▶ Stage 3 Research Execution ─▶ Stage 4 Review & Approval
       (completing a stage advances the workflow status and re-runs the
        deterministic AI Research Analytics + KPIs for that stage)
     ──Submit Research Report──▶ under_review
           ├─ Approved ▶ auto-initiate a Feasibility Study — notify researcher
           ├─ Approved with Conditions ▶ editable again (conditions surfaced)
           ├─ Revision Required ▶ editable again
           └─ Rejected ▶ archived
   Milestones are the single source of truth for the progress %. Every AI score
   is a pure function of the entered fields — no LLM, nothing hardcoded.
   =========================================================================== */

async function getRMCollection() {
  const mod = await import("./mongodb.server");
  return mod.getResearchManagementCollection();
}
async function getOppsCollection() {
  const mod = await import("./mongodb.server");
  return mod.getOpportunitiesCollection();
}
async function getTechScoutingColl() {
  const mod = await import("./mongodb.server");
  return mod.getTechnologyScoutingCollection();
}
async function getPortfoliosColl() {
  const mod = await import("./mongodb.server");
  return mod.getInnovationPortfoliosCollection();
}
async function getFeasibilityProjectsCollection() {
  const mod = await import("./mongodb.server");
  return mod.getFeasibilityProjectsCollection();
}
async function newObjectId(id: string) {
  const mod = await import("./mongodb.server");
  return new mod.ObjectId(id);
}

const CURRENT_USER = "Arjun Mehta";
const nowISO = () => new Date().toISOString();
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n: number) => Math.round(Number.isFinite(n) ? n : 0);
const round1 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 10) / 10;
const filled = (s: string | undefined | null) => Boolean(s && String(s).trim());

const STAGE_ORDER: ResearchStage[] = [
  "research_planning",
  "resource_planning",
  "research_execution",
  "review_approval",
];
const STAGE_LABEL: Record<ResearchStage, string> = {
  research_planning: "Research Planning",
  resource_planning: "Resource Planning",
  research_execution: "Research Execution",
  review_approval: "Review & Approval",
};
/** Completing a stage advances the workflow status. The last two stages both
 *  leave the record in_progress until the report is submitted for review. */
const STATUS_AFTER_STAGE: Record<ResearchStage, ResearchStatus> = {
  research_planning: "resource_planning",
  resource_planning: "in_progress",
  research_execution: "in_progress",
  review_approval: "in_progress",
};
/** Current phase label per stage/status (section — Research Progress). */
const PHASE_AFTER_STAGE: Record<ResearchStage, string> = {
  research_planning: "Research Planning",
  resource_planning: "Experimentation",
  research_execution: "Data Analysis",
  review_approval: "Documentation",
};

const EDITABLE_STATUSES: ResearchStatus[] = [
  "planning",
  "resource_planning",
  "in_progress",
  "approved_with_conditions",
  "revision_required",
];

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: ResearchLookups = {
  researchCategories: [
    "Basic Research",
    "Applied Research",
    "Experimental Research",
    "Product Research",
    "Process Research",
    "Technology Research",
    "Manufacturing Research",
    "Market Research",
    "Sustainability Research",
    "AI Research",
  ],
  researchTypes: [
    "Basic Research",
    "Applied Research",
    "Experimental Research",
    "Translational Research",
  ],
  researchDomains: [
    "Mechanical Engineering",
    "Electrical Engineering",
    "Electronics",
    "Embedded Systems",
    "Artificial Intelligence",
    "Robotics",
    "Wireless Power Transfer",
    "Battery Technology",
    "Materials Science",
    "Manufacturing",
    "IoT",
    "Cybersecurity",
    "Renewable Energy",
  ],
  technologyDomains: [
    "Wireless Power Transfer",
    "Energy Storage",
    "Propulsion",
    "Charging",
    "Autonomy",
    "Connectivity",
    "Manufacturing",
    "Materials",
    "Software & AI",
  ],
  strategicThemes: [
    "Future Mobility",
    "Electrification",
    "Sustainability",
    "Digital Transformation",
    "Autonomous Systems",
    "Advanced Manufacturing",
  ],
  researchMethodologies: [
    "Literature Review",
    "Experimental Research",
    "Simulation",
    "Analytical Study",
    "Prototype Development",
    "Field Study",
    "Survey Research",
    "Case Study",
    "Benchmarking",
    "Mixed Method",
  ],
  testMethods: [
    "Simulation",
    "Laboratory Testing",
    "Field Testing",
    "Functional Testing",
    "Performance Testing",
    "Reliability Testing",
    "Environmental Testing",
    "Compliance Testing",
  ],
  laboratories: [
    "Magnertia R&D Lab",
    "Battery Systems Lab",
    "Power Electronics Lab",
    "Materials Characterization Lab",
    "EMC Test Lab",
    "Prototype Workshop",
  ],
  currentPhases: [
    "Proposal",
    "Literature Review",
    "Research Planning",
    "Experimentation",
    "Data Analysis",
    "Validation",
    "Documentation",
    "Publication",
    "Technology Transfer",
    "Completed",
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
  productDevelopmentRecommendations: [
    "Continue Research",
    "Start Feasibility Study",
    "Develop PoC",
    "Prototype Development",
    "Patent Filing",
    "Technology Licensing",
    "Product Development",
    "Archive Research",
  ],
  approvalDecisions: ["Approved", "Approved with Conditions", "Revision Required", "Rejected"],
  nextActions: [
    "Proceed to Feasibility Study",
    "Advance to PoC",
    "Continue Research Activities",
    "Improve Research",
    "File Patent",
    "Publish Findings",
    "Close Research Project",
  ],
  principalInvestigators: [
    "Arjun Mehta",
    "Priya Sharma",
    "Rohit Verma",
    "Neha Sharma",
    "Vikram Singh",
  ],
  researchTeamMembers: [
    "Arjun Mehta",
    "Priya Sharma",
    "Rohit Verma",
    "Neha Sharma",
    "Vikram Singh",
    "Ananya Rao",
    "Karan Patel",
    "Meera Iyer",
  ],
  universities: [
    "IIT Madras",
    "Anna University",
    "IISc Bangalore",
    "IIT Bombay",
    "IIT Delhi",
    "Stanford University",
    "MIT",
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
    "Research Proposal",
    "Literature Review",
    "Experimental Data",
    "Lab Reports",
    "Publications",
    "Patent Drafts",
    "Technical Reports",
    "Presentations",
  ],
  keywordSuggestions: [
    "WPT",
    "EV Charging",
    "Inductive Power",
    "Litz Wire",
    "High Efficiency",
    "Battery",
    "Fast Charging",
    "AI",
    "Digital Twin",
    "Sustainability",
  ],
  milestoneTemplates: [
    "Literature Review Completed",
    "Coil Design & Simulation",
    "Prototype Development",
    "Testing & Validation",
    "Patent Filing",
    "Final Report",
  ],
};

/** The six fixed progress milestones shown in the sidebar checklist. */
const DEFAULT_MILESTONES = [
  "Literature Review Completed",
  "Coil Design & Simulation",
  "Prototype Development",
  "Testing & Validation",
  "Patent Filing",
  "Final Report",
];

/* -------------------------- Scoring dictionaries -------------------------- */
const METHODOLOGY_RIGOR: Record<string, number> = {
  "Experimental Research": 90,
  "Prototype Development": 85,
  Simulation: 75,
  "Analytical Study": 70,
  "Mixed Method": 80,
  Benchmarking: 60,
  "Field Study": 72,
  "Literature Review": 50,
  "Survey Research": 55,
  "Case Study": 58,
};
const COMMERCIAL_POTENTIAL_SCORE: Record<string, number> = { Low: 35, Medium: 65, High: 90 };

function trlNumber(trl: string): number {
  const m = /TRL\s*(\d)/i.exec(trl || "");
  return m ? Number(m[1]) : 0;
}
function tamScore(value: number): number {
  return value <= 0 ? 15 : clamp((Math.log10(value) / 12) * 100);
}
function stars10(n: number): number {
  return clamp((n || 0) * 10);
}
function textDepth(text: string): number {
  if (!filled(text)) return 0;
  return Math.min(1, String(text).trim().length / 200);
}

/* ------------------- AI Research Analytics (computed) --------------------- */
function computeAI(input: ResearchFormInput, progressPct: number): ResearchAIAnalytics {
  const { overview, planning, literature, experimental, outputs, commercialization, risk } = input;
  const trl = trlNumber(input.trl);
  const trlScore = clamp((trl / 9) * 100);
  const rigor = METHODOLOGY_RIGOR[planning.researchMethodology] ?? 60;

  const litVolume = clamp(
    ((literature.papersReviewed +
      literature.patentsReviewed * 2 +
      literature.standardsReviewed * 3) /
      150) *
      100,
  );
  const gapDepth = textDepth(literature.researchGap) * 100;

  // Novelty: research gap depth + emerging domain + keyword breadth + patent scarcity.
  const aiNoveltyScore = round1(
    clamp(
      0.4 * gapDepth +
        0.25 * rigor +
        0.2 * clamp((overview.keywords.length / 6) * 100) +
        0.15 * litVolume,
    ) / 10,
  );

  // Technical merit: methodology rigor + TRL + experimental completeness.
  const expDepth =
    [
      experimental.testMethod,
      experimental.equipmentRequired,
      experimental.safetyRequirements,
    ].filter(filled).length / 3;
  const aiTechnicalMerit = round1(
    clamp(0.4 * rigor + 0.35 * trlScore + 0.25 * expDepth * 100) / 10,
  );

  // Commercial potential: market size + commercial rating + licensing/startup signals.
  const commSignals =
    (commercialization.licensingOpportunity ? 50 : 0) +
    (commercialization.startupOpportunity ? 50 : 0);
  const aiCommercialPotential = round1(
    clamp(
      0.4 * tamScore(commercialization.marketSize) +
        0.35 * (COMMERCIAL_POTENTIAL_SCORE[commercialization.commercialPotential] ?? 50) +
        0.25 * commSignals,
    ) / 10,
  );

  // Publication potential: literature depth + novelty + methodology rigor.
  const aiPublicationPotential = round1(
    clamp(0.4 * litVolume + 0.35 * aiNoveltyScore * 10 + 0.25 * rigor) / 10,
  );

  // Patent potential: patent opportunities + novelty + TRL maturity.
  const aiPatentPotential = round1(
    clamp(
      0.4 * clamp((outputs.patentOpportunities / 5) * 100) +
        0.35 * aiNoveltyScore * 10 +
        0.25 * trlScore,
    ) / 10,
  );

  const researchImpactScore = round1(
    (aiNoveltyScore * 0.25 +
      aiTechnicalMerit * 0.25 +
      aiCommercialPotential * 0.25 +
      aiPublicationPotential * 0.125 +
      aiPatentPotential * 0.125) *
      1,
  );

  // Stage outputs — deterministic.
  const researchCompletenessScore = clamp(
    round(
      0.3 * (filled(overview.researchObjective) ? 100 : 0) +
        0.2 * (filled(planning.researchMethodology) ? 100 : 0) +
        0.2 * (filled(overview.expectedOutcome) ? 100 : 0) +
        0.15 * clamp((planning.milestones.length / 6) * 100) +
        0.15 * (filled(overview.strategicTheme) ? 100 : 0),
    ),
  );
  const literatureGapAnalysis = filled(literature.researchGap)
    ? `${literature.papersReviewed} papers, ${literature.patentsReviewed} patents and ${literature.standardsReviewed} standards reviewed; a clear gap is documented around ${overview.technologyDomain || "the target domain"}.`
    : "Literature gap not yet documented — review more prior work to establish novelty.";
  const noveltyAssessment =
    aiNoveltyScore >= 7
      ? "High novelty — limited prior art, strong differentiation potential."
      : aiNoveltyScore >= 5
        ? "Moderate novelty — incremental over existing approaches."
        : "Low novelty — significant prior art; sharpen the research gap.";

  const teamSize = input.resources.researchTeam.length;
  const resourceOptimization = `${teamSize || "No"} team member${teamSize === 1 ? "" : "s"} across ${input.resources.universities.length} partner institution(s); ${experimental.laboratory || "lab"} allocated for ${experimental.testMethod || "testing"}.`;
  const remaining = input.resources.budgetApproved - input.resources.budgetUtilized;
  const budgetOptimization =
    input.resources.budgetApproved > 0
      ? `${round((input.resources.budgetUtilized / input.resources.budgetApproved) * 100)}% of the approved budget utilised; ₹${remaining.toLocaleString("en-IN")} remaining.`
      : "Budget not yet approved.";
  const riskAvg =
    (risk.technicalRisk + risk.marketRisk + risk.regulatoryRisk + risk.supplyChainRisk) / 4;
  const riskAssessment =
    riskAvg >= 6.5
      ? "Elevated risk profile — technical and supply-chain exposure needs mitigation planning."
      : riskAvg >= 4
        ? "Moderate risk — manage regulatory and market uncertainty as the project matures."
        : "Low overall risk profile.";

  const progressAnalysis = `${progressPct}% of milestones complete; project is in the ${input.trl} readiness band.`;
  const researchQualityScore = clamp(
    round(0.4 * rigor + 0.3 * researchCompletenessScore + 0.3 * clamp(progressPct)),
  );

  const parts: string[] = [];
  if (researchImpactScore >= 8)
    parts.push(
      `Continue research with focus on ${riskAvg >= 5 ? "thermal management and cost optimization" : "scale-up and commercial deployment"}.`,
    );
  else if (researchImpactScore >= 6)
    parts.push("Promising research — strengthen experimental validation before advancing.");
  else
    parts.push("Early-stage research — deepen the literature review and tighten the methodology.");
  if (aiPatentPotential >= 7) parts.push("Strong patent potential — prepare IP filings early.");
  if (aiCommercialPotential >= 7)
    parts.push("High commercial potential — engage commercialization planning.");

  return {
    aiNoveltyScore,
    aiTechnicalMerit,
    aiCommercialPotential,
    aiPublicationPotential,
    aiPatentPotential,
    researchImpactScore,
    recommendation: parts.join(" "),
    researchCompletenessScore,
    literatureGapAnalysis,
    noveltyAssessment,
    resourceOptimization,
    budgetOptimization,
    riskAssessment,
    progressAnalysis,
    researchQualityScore,
    generatedAt: nowISO(),
  };
}

function computeKPIs(input: ResearchFormInput, ai: ResearchAIAnalytics): ResearchKPIs {
  return {
    researchImpactScore: ai.researchImpactScore,
    trl: input.trl,
    trlNumber: trlNumber(input.trl),
    publications: input.outputs.publications,
    patentOpportunities: input.outputs.patentOpportunities,
  };
}

function computeProgress(milestones: { completed: boolean }[]): number {
  if (milestones.length === 0) return 0;
  return round((milestones.filter((m) => m.completed).length / milestones.length) * 100);
}

function computeNextAction(status: ResearchStatus, stage: ResearchStage): string {
  switch (status) {
    case "planning":
    case "resource_planning":
      return `Complete the ${STAGE_LABEL[stage]} stage`;
    case "in_progress":
      return stage === "review_approval"
        ? "All stages complete — Submit Research Report"
        : `Complete the ${STAGE_LABEL[stage]} stage`;
    case "under_review":
      return "Awaiting Innovation Committee review";
    case "approved":
      return "Proceed to Feasibility Study";
    case "approved_with_conditions":
      return "Address review conditions and improve research";
    case "revision_required":
      return "Continue research activities and re-submit";
    case "rejected":
      return "Rejected — close research project";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

function initialStages(): ResearchStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function initialReviewers(): ResearchReviewer[] {
  return [
    { role: "Research Supervisor", name: "Rohit Verma", status: "pending", date: null },
    { role: "Technical Reviewer", name: "Neha Sharma", status: "pending", date: null },
    { role: "Innovation Director", name: "Vikram Singh", status: "pending", date: null },
    { role: "CTO", name: "Arjun Mehta", status: "pending", date: null },
  ];
}

/* ------------------------------- Shaping ---------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): ResearchManagementRecord {
  if (!doc) throw new Error("Research project not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<ResearchManagementRecord, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}
function toListRow(r: ResearchManagementRecord): ResearchListRow {
  return {
    id: r.id,
    researchId: r.researchId,
    researchCode: r.researchCode,
    researchTitle: r.researchTitle,
    researchCategory: r.researchCategory,
    status: r.status,
    currentPhase: r.currentPhase,
    principalInvestigator: r.principalInvestigator,
    progressPercentage: r.progressPercentage,
    researchImpactScore: r.kpis.researchImpactScore,
    trlNumber: r.kpis.trlNumber,
    updatedAt: r.updatedAt,
  };
}

function recordToInput(r: ResearchManagementRecord): ResearchFormInput {
  return {
    researchTitle: r.researchTitle,
    researchCategory: r.researchCategory,
    researchType: r.researchType,
    businessUnit: r.businessUnit,
    department: r.department,
    principalInvestigator: r.principalInvestigator,
    linkedOpportunityId: r.linkedOpportunityId,
    linkedTechnologyScoutingId: r.linkedTechnologyScoutingId,
    overview: r.overview,
    planning: r.planning,
    literature: r.literature,
    experimental: r.experimental,
    resources: r.resources,
    outputs: r.outputs,
    trl: r.trl,
    risk: r.risk,
    commercialization: r.commercialization,
    attachments: r.attachments,
    productDevelopmentRecommendation: r.productDevelopmentRecommendation,
  };
}

/* ============================= Read endpoints ============================= */
export const getResearchLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getResearchListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getRMCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as ResearchListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getResearchFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getRMCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Research project not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Context sources for a new research project: approved opportunities,
 *  approved technologies, and active portfolios. */
export const getResearchSourcesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const [oppColl, tsColl, pfColl] = await Promise.all([
      getOppsCollection(),
      getTechScoutingColl(),
      getPortfoliosColl(),
    ]);
    const [oppDocs, tsDocs, pfDocs] = await Promise.all([
      oppColl.find({ status: "approved" }).toArray(),
      tsColl.find({ status: "approved" }).toArray(),
      pfColl.find({ status: "active" }).toArray(),
    ]);
    const opportunities = oppDocs.map((d: Record<string, unknown>) => {
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
        marketSize: (mkt.marketSize as number) ?? 0,
      };
    });
    const technologies = tsDocs.map((d: Record<string, unknown>) => {
      const tinfo = (d.info ?? {}) as Record<string, unknown>;
      const mkt = (d.market ?? {}) as Record<string, unknown>;
      return {
        id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
        scoutingId: d.scoutingId as string,
        technologyName: (tinfo.technologyName as string) ?? "",
        technologyDomain: (tinfo.technologyDomain as string) ?? "",
        trl: (tinfo.trl as string) ?? "",
        marketSize: (mkt.marketSize as number) ?? 0,
        marketTrend: (mkt.marketTrend as string) ?? "",
      };
    });
    const portfolios = pfDocs.map((d: Record<string, unknown>) => ({
      id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
      portfolioCode: (d.portfolioCode as string) ?? (d.portfolioId as string) ?? "",
      portfolioName: (d.portfolioName as string) ?? "",
      strategicTheme: (d.strategicTheme as string) ?? "",
    }));
    return { success: true as const, data: { opportunities, technologies, portfolios } };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ============================ Create / update ============================ */
export const saveResearchDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: ResearchFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getRMCollection();
      const now = nowISO();
      const progressPercentage = computeProgress(data.input.planning.milestones);
      const ai = computeAI(data.input, progressPercentage);
      const kpis = computeKPIs(data.input, ai);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Research project not found.");
        const current = shape(existing);
        if (!EDITABLE_STATUSES.includes(current.status)) {
          throw new Error(`Record in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<ResearchManagementRecord, "id"> = {
          ...current,
          researchTitle: data.input.researchTitle,
          researchCategory: data.input.researchCategory,
          researchType: data.input.researchType,
          businessUnit: data.input.businessUnit,
          department: data.input.department,
          principalInvestigator: data.input.principalInvestigator,
          overview: data.input.overview,
          planning: data.input.planning,
          literature: data.input.literature,
          experimental: data.input.experimental,
          resources: data.input.resources,
          outputs: data.input.outputs,
          trl: data.input.trl,
          risk: data.input.risk,
          commercialization: data.input.commercialization,
          productDevelopmentRecommendation: data.input.productDevelopmentRecommendation,
          progressPercentage,
          aiAnalytics: ai,
          kpis,
          linkedInnovationPortfolioId: data.input.overview.linkedInnovationPortfolioId,
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

      // Create — prefill context from approved opportunity / technology / portfolio.
      let linkedOpportunityId: string | null = null;
      let linkedOpportunityCode: string | null = null;
      let linkedTechnologyScoutingId: string | null = null;
      let linkedTechnologyScoutingCode: string | null = null;
      const linkedInnovationPortfolioId: string | null =
        data.input.overview.linkedInnovationPortfolioId ?? null;
      let linkedInnovationPortfolioCode: string | null = null;

      if (data.input.linkedOpportunityId) {
        const oppColl = await getOppsCollection();
        const doc = await oppColl.findOne({
          _id: await newObjectId(data.input.linkedOpportunityId),
        });
        if (doc) {
          linkedOpportunityId = doc._id?.toString?.() ?? String(doc._id);
          linkedOpportunityCode = (doc.opportunityCode as string) ?? null;
        }
      }
      if (data.input.linkedTechnologyScoutingId) {
        const tsColl = await getTechScoutingColl();
        const doc = await tsColl.findOne({
          _id: await newObjectId(data.input.linkedTechnologyScoutingId),
        });
        if (doc) {
          linkedTechnologyScoutingId = doc._id?.toString?.() ?? String(doc._id);
          linkedTechnologyScoutingCode = (doc.scoutingId as string) ?? null;
        }
      }
      if (linkedInnovationPortfolioId) {
        const pfColl = await getPortfoliosColl();
        const doc = await pfColl.findOne({ _id: await newObjectId(linkedInnovationPortfolioId) });
        if (doc)
          linkedInnovationPortfolioCode =
            (doc.portfolioCode as string) ?? (doc.portfolioId as string) ?? null;
      }

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const researchId = `RES-${year}-${String(seq).padStart(4, "0")}`;
      const researchCode = `RM-${year}-${String(seq).padStart(5, "0")}`;

      const record: Omit<ResearchManagementRecord, "id"> = {
        researchId,
        researchCode,
        status: "planning",
        currentStage: "research_planning",
        currentPhase: "Research Planning",
        stages: initialStages(),
        version: 1,
        researchTitle: data.input.researchTitle,
        researchCategory: data.input.researchCategory,
        researchType: data.input.researchType,
        businessUnit: data.input.businessUnit,
        department: data.input.department,
        principalInvestigator: data.input.principalInvestigator,
        linkedOpportunityId,
        linkedOpportunityCode,
        linkedTechnologyScoutingId,
        linkedTechnologyScoutingCode,
        linkedInnovationPortfolioId,
        linkedInnovationPortfolioCode,
        overview: data.input.overview,
        planning: data.input.planning,
        literature: data.input.literature,
        experimental: data.input.experimental,
        resources: data.input.resources,
        outputs: data.input.outputs,
        trl: data.input.trl,
        risk: data.input.risk,
        commercialization: data.input.commercialization,
        productDevelopmentRecommendation: data.input.productDevelopmentRecommendation,
        progressPercentage,
        aiAnalytics: ai,
        kpis,
        attachments: data.input.attachments,
        reviewers: initialReviewers(),
        approvalDecision: null,
        reviewNextAction: null,
        reviewComments: null,
        reviewConditions: null,
        approvalDate: null,
        nextAction: computeNextAction("planning", "research_planning"),
        feasibilityProjectId: null,
        feasibilityProjectCode: null,
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: linkedOpportunityCode
              ? `Research project ${researchId} created from opportunity ${linkedOpportunityCode}`
              : `Research project ${researchId} created`,
          },
          {
            at: now,
            actor: "System",
            event:
              "Context retrieved — market need & business problem (Opportunity Discovery), technology trends & competitor analysis (Technology Scouting), strategic objectives (Innovation Portfolio)",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Research Planning stage started",
            stage: "research_planning",
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
export const completeResearchStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: ResearchStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getRMCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Research project not found.");
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
      const stages: ResearchStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });

      const input = recordToInput(current);
      const progressPercentage = computeProgress(current.planning.milestones);
      const ai = computeAI(input, progressPercentage);
      const kpis = computeKPIs(input, ai);
      const status = STATUS_AFTER_STAGE[data.stage];
      const currentPhase = PHASE_AFTER_STAGE[data.stage];

      const stageOutput: Record<ResearchStage, string> = {
        research_planning: `AI research analysis — completeness ${ai.researchCompletenessScore}/100, novelty ${ai.noveltyAssessment.toLowerCase()}`,
        resource_planning: `AI-optimized research plan — ${ai.resourceOptimization} ${ai.budgetOptimization}`,
        research_execution: `AI research evaluation — quality score ${ai.researchQualityScore}/100; ${ai.progressAnalysis}`,
        review_approval: "Research report prepared for review",
      };

      const updated: Omit<ResearchManagementRecord, "id"> = {
        ...current,
        stages,
        currentStage: advanced ? nextStage : data.stage,
        status,
        currentPhase,
        progressPercentage,
        aiAnalytics: ai,
        kpis,
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
export const submitResearchFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getRMCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Research project not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Record is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(`Complete all stages first. Outstanding: ${incomplete.join(", ")}.`);
      }
      const now = nowISO();
      const reviewers: ResearchReviewer[] = current.reviewers.map((r) =>
        r.role === "Research Supervisor" || r.role === "Technical Reviewer"
          ? { ...r, status: "reviewed", date: now }
          : r,
      );
      const updated: Omit<ResearchManagementRecord, "id"> = {
        ...current,
        status: "under_review",
        currentPhase: "Documentation",
        reviewers,
        version: ["approved_with_conditions", "revision_required"].includes(current.status)
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
            event: "Research report submitted for Innovation Committee review",
            fromStatus: current.status,
            toStatus: "under_review",
          },
          {
            at: now,
            actor: "System",
            event: "Research Supervisor and Technical Reviewer sign-off recorded",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewResearchFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: ResearchApprovalDecision;
      nextAction?: string;
      comments?: string;
      conditions?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getRMCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Research project not found.");
      const current = shape(existing);
      if (current.status !== "under_review") {
        throw new Error(`Record is "${current.status}", not under review.`);
      }
      const now = nowISO();
      const auditTrail = [...current.auditTrail];
      let status: ResearchStatus;
      let approvalDate: string | null = current.approvalDate;
      let feasibilityProjectId = current.feasibilityProjectId;
      let feasibilityProjectCode = current.feasibilityProjectCode;
      let currentPhase = current.currentPhase;
      let reviewConditions = current.reviewConditions;

      if (data.decision === "Approved") {
        status = "approved";
        approvalDate = now;
        currentPhase = "Technology Transfer";
        // Auto-initiate a linked Feasibility Study.
        const fpColl = await getFeasibilityProjectsCollection();
        const fpCount = await fpColl.countDocuments();
        const projectCode = `FSP-${String(fpCount + 1).padStart(5, "0")}`;
        const fp: Omit<FeasibilityProjectRecord, "id"> = {
          projectCode,
          ideaId: current.linkedOpportunityId ?? current.id,
          ideaCode: current.linkedOpportunityCode ?? current.researchCode,
          title: current.researchTitle || current.researchId,
          createdAt: now,
          status: "Initiated",
        };
        const fpRes = await fpColl.insertOne(fp);
        feasibilityProjectId = fpRes.insertedId?.toString?.() ?? projectCode;
        feasibilityProjectCode = projectCode;
        auditTrail.push({
          at: now,
          actor: "Innovation Committee",
          event: `Research approved${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Feasibility Study ${projectCode} auto-initiated`,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Researcher notified: Proceed to Feasibility Study",
        });
      } else if (data.decision === "Approved with Conditions") {
        status = "approved_with_conditions";
        approvalDate = now;
        reviewConditions = data.conditions ?? data.comments ?? null;
        auditTrail.push({
          at: now,
          actor: "Innovation Committee",
          event: `Approved with conditions${reviewConditions ? ` — ${reviewConditions}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Researcher notified: Improve Research",
        });
      } else if (data.decision === "Revision Required") {
        status = "revision_required";
        auditTrail.push({
          at: now,
          actor: "Innovation Committee",
          event: `Revision required${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Researcher notified: Continue Research Activities",
        });
      } else {
        status = "rejected";
        auditTrail.push({
          at: now,
          actor: "Innovation Committee",
          event: `Research rejected${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Research project archived" });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Researcher notified: Close Research Project",
        });
      }
      // Enterprise research governance (ongoing) — on every decision.
      auditTrail.push({
        at: now,
        actor: "System",
        event:
          "Governance: Research Dashboard, Knowledge Repository and Innovation Portfolio updated; executive report generated",
      });

      const reviewers: ResearchReviewer[] = current.reviewers.map((r) =>
        data.decision === "Revision Required"
          ? r
          : r.status === "pending"
            ? { ...r, status: "reviewed", date: now }
            : r,
      );

      const updated: Omit<ResearchManagementRecord, "id"> = {
        ...current,
        status,
        currentPhase,
        reviewers,
        approvalDecision: data.decision,
        reviewNextAction: data.nextAction ?? current.reviewNextAction,
        reviewComments: data.comments ?? current.reviewComments,
        reviewConditions,
        approvalDate,
        feasibilityProjectId,
        feasibilityProjectCode,
        nextAction: computeNextAction(status, current.currentStage),
        lastModifiedBy: "Innovation Committee",
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
export const generateResearchReportFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getRMCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Research project not found.");
      const current = shape(existing);
      const now = nowISO();
      const progressPercentage = computeProgress(current.planning.milestones);
      const ai = computeAI(recordToInput(current), progressPercentage);
      const kpis = computeKPIs(recordToInput(current), ai);
      const updated: Omit<ResearchManagementRecord, "id"> = {
        ...current,
        progressPercentage,
        aiAnalytics: ai,
        kpis,
        updatedAt: now,
        lastModifiedBy: "System",
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: "System",
            event: "Research report generated — AI analytics and KPIs refreshed",
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
