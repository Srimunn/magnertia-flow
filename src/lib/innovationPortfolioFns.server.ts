import { createServerFn } from "@tanstack/react-start";
import type {
  ExecutiveDecision,
  FundingDecision,
  InnovationPortfolioRecord,
  PortfolioAIAnalytics,
  PortfolioFinancials,
  PortfolioFormInput,
  PortfolioFunnelStage,
  PortfolioInvestmentPoint,
  PortfolioKPIDashboard,
  PortfolioListRow,
  PortfolioLookups,
  PortfolioPerformance,
  PortfolioProjectRollup,
  PortfolioProjectRow,
  PortfolioResources,
  PortfolioReviewer,
  PortfolioRisk,
  PortfolioSlice,
  PortfolioStatus,
} from "@/services/types";

/* ===========================================================================
   Innovation Portfolio — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   This module is the executive rollup layer: it doesn't own project data, it
   AGGREGATES live counts/scores from Idea Management, Opportunity Discovery,
   Design Thinking and Problem Validation on every save/refresh, then computes
   portfolio-level KPIs, charts and AI insights deterministically (no LLM).

     Draft ──rollup + AI analytics──▶ Submit ──▶ Executive Review
                                                    ├─ Approved ▶ active
                                                    │    (budget + resources
                                                    │     released, feasibility
                                                    │     studies authorized)
                                                    ├─ Revision Required ▶ editable
                                                    ├─ Additional Budget Required
                                                    │    ▶ budget_review
                                                    └─ Rejected ▶ archived

   Writes replace whole top-level fields (never $set dot-paths).
   =========================================================================== */

async function getPortfoliosCollection() {
  const mod = await import("./mongodb.server");
  return mod.getInnovationPortfoliosCollection();
}
async function getIdeasCollection() {
  const mod = await import("./mongodb.server");
  return mod.getIdeasCollection();
}
async function getOpportunitiesCollection() {
  const mod = await import("./mongodb.server");
  return mod.getOpportunitiesCollection();
}
async function getDTCollection() {
  const mod = await import("./mongodb.server");
  return mod.getDesignThinkingCollection();
}
async function getPVCollection() {
  const mod = await import("./mongodb.server");
  return mod.getProblemValidationFullCollection();
}
async function getTechScoutingColl() {
  const mod = await import("./mongodb.server");
  return mod.getTechnologyScoutingCollection();
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
const avg = (nums: number[]) =>
  nums.length ? nums.reduce((s, n) => s + (n || 0), 0) / nums.length : 0;

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: PortfolioLookups = {
  categories: [
    "Research Portfolio",
    "Product Innovation",
    "Process Innovation",
    "Technology Innovation",
    "Digital Innovation",
    "Manufacturing Innovation",
    "Sustainability Innovation",
    "Strategic Innovation",
    "Corporate Innovation",
  ],
  strategicThemes: [
    "Growth",
    "Customer Experience",
    "Operational Excellence",
    "Cost Optimization",
    "Digital Transformation",
    "Industry 4.0",
    "Industry 5.0",
    "Sustainability",
    "AI First",
    "Future Mobility",
  ],
  innovationFocusAreas: [
    "Artificial Intelligence",
    "Robotics",
    "Automation",
    "Wireless Power Transfer",
    "Electric Vehicles",
    "IoT",
    "Embedded Systems",
    "Cloud Computing",
    "Cybersecurity",
    "Renewable Energy",
    "Smart Manufacturing",
    "Digital Twin",
    "Battery Technology",
    "Semiconductor",
    "ESG",
  ],
  innovationTypes: [
    "Product Innovation",
    "Technology Innovation",
    "Process Innovation",
    "Digital Innovation",
    "Sustainability Innovation",
    "Strategic Innovation",
  ],
  technologyDomains: [
    "Artificial Intelligence",
    "IoT",
    "Power Electronics",
    "Materials Science",
    "Cloud Computing",
    "Battery Technology",
  ],
  industries: ["Manufacturing", "Automotive", "Energy", "Logistics", "Industrial"],
  markets: ["India", "APAC", "EMEA", "North America", "Global"],
  customerSegments: ["Mid to Large Enterprises", "SME", "Enterprise", "Public Sector", "Retail"],
  equipmentAvailability: [
    "Fully Available",
    "Partially Available",
    "Procurement Required",
    "Outsourcing Required",
    "Not Available",
  ],
  laboratoryAvailability: [
    "Fully Available",
    "Partially Available",
    "Procurement Required",
    "Outsourcing Required",
    "Not Available",
  ],
  executiveDecisions: [
    "Approved",
    "Approved with Conditions",
    "Revision Required",
    "Deferred",
    "Rejected",
  ],
  fundingDecisions: [
    "Fully Funded",
    "Partially Funded",
    "Additional Budget Required",
    "External Funding Required",
    "Not Approved",
  ],
  priorities: ["Strategic", "Critical", "High", "Medium", "Low"],
  managers: ["Priya Sharma", "Arjun Mehta", "Rohit Verma", "Neha Sharma", "Vikram Singh"],
  businessUnits: [
    "Smart Manufacturing",
    "EV Powertrain",
    "Battery Systems",
    "Charging Infrastructure",
    "Corporate",
  ],
  departments: ["R&D", "Research & Innovation Development", "Engineering", "Product Management"],
  financialYears: ["2025-26", "2026-27", "2027-28"],
  attachmentCategories: [
    "Portfolio Roadmap",
    "Financial Plan",
    "Risk Register",
    "Resource Plan",
    "Executive Presentation",
    "Market Reports",
  ],
};

const COMPOSITION_COLORS = ["#0a3c75", "#3b82f6", "#22c55e", "#f59e0b", "#7c5cff", "#ec4899"];
const FUNNEL_STAGES = [
  "Ideas",
  "Opportunities",
  "Design Thinking",
  "Problem Validation",
  "Feasibility Study",
];

/* ------------------------------- Shaping --------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): InnovationPortfolioRecord {
  if (!doc) throw new Error("Portfolio not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<InnovationPortfolioRecord, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}
function toListRow(r: InnovationPortfolioRecord): PortfolioListRow {
  return {
    id: r.id,
    portfolioId: r.portfolioId,
    portfolioCode: r.portfolioCode,
    portfolioName: r.portfolioName,
    status: r.status,
    portfolioManager: r.portfolioManager,
    financialYear: r.financialYear,
    totalProjects: r.projects.totalActiveProjects,
    overallScore: r.aiAnalytics?.healthScore ?? 0,
    updatedAt: r.updatedAt,
  };
}

/* ============================ The rollup engine ============================ */

async function rollupProjects(input: PortfolioFormInput): Promise<{
  projects: PortfolioProjectRollup;
  composition: PortfolioSlice[];
  funnel: PortfolioFunnelStage[];
  performance: PortfolioPerformance;
  risk: Omit<
    PortfolioRisk,
    | "technologyRisk"
    | "marketRisk"
    | "financialRisk"
    | "regulatoryRisk"
    | "operationalRisk"
    | "portfolioRiskScore"
  >;
  financialsFromProjects: { estimatedRevenue: number; budgetUtilized: number };
}> {
  const [ideasColl, oppsColl, dtColl, pvColl, tsColl] = await Promise.all([
    getIdeasCollection(),
    getOpportunitiesCollection(),
    getDTCollection(),
    getPVCollection(),
    getTechScoutingColl(),
  ]);
  const [ideaDocs, oppDocs, dtDocs, pvDocs, tsDocs] = await Promise.all([
    ideasColl.find({}).toArray(),
    oppsColl.find({}).toArray(),
    dtColl.find({}).toArray(),
    pvColl.find({}).toArray(),
    tsColl.find({}).toArray(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idAsStr = (d: any) => d._id?.toString?.() ?? String(d._id);

  // Approved/qualified-only rollup, per the workflow ("approved Ideas, qualified
  // Opportunities, validated Design Thinking concepts, validated Problems").

  const activeIdeas = ideaDocs.filter(
    (d: Record<string, unknown>) => !["Rejected", "Archived", "Draft"].includes(d.status as string),
  );

  const activeOpps = oppDocs.filter(
    (d: Record<string, unknown>) => !["rejected", "archived", "draft"].includes(d.status as string),
  );
  const activeDT = dtDocs.filter(
    (d: Record<string, unknown>) => !["rejected", "archived", "draft"].includes(d.status as string),
  );

  const activePV = pvDocs.filter(
    (d: Record<string, unknown>) =>
      !["validation_failed", "archived", "draft"].includes(d.status as string),
  );

  // Technology Scouting hand-off: only technologies APPROVED by executive
  // review belong in the portfolio (Monitoring stays on the watchlist).
  const approvedTech = tsDocs.filter((d: Record<string, unknown>) => d.status === "approved");

  const rows: PortfolioProjectRow[] = [
    ...activeIdeas.map((d: Record<string, unknown>) => {
      const basic = (d.basic ?? {}) as Record<string, unknown>;
      const scores = (d.scores ?? {}) as Record<string, number>;
      const fin = (d.financials ?? {}) as Record<string, number>;
      return {
        id: idAsStr(d),
        moduleCode: d.ideaCode as string,
        title: (basic.title as string) || (d.ideaCode as string),
        stage: "Ideas" as const,
        category: (basic.category as string) || "—",
        budget: fin.estimatedInvestment ?? 0,
        progress:
          d.status === "Approved" || d.status === "Converted to Feasibility Study"
            ? 100
            : d.status === "Submitted"
              ? 15
              : 40,
        overallScore: scores.overallEvaluationScore ?? 0,
        owner: (d.submittedBy as string) || "—",
        riskLevel: riskBand(scores.riskScore ?? 50),
      };
    }),
    ...activeOpps.map((d: Record<string, unknown>) => {
      const info = (d.information ?? {}) as Record<string, unknown>;
      const evalv = (d.evaluation ?? {}) as Record<string, number>;
      const biz = (d.business ?? {}) as Record<string, number>;
      const ai = (d.aiAnalysis ?? {}) as Record<string, number>;
      return {
        id: idAsStr(d),
        moduleCode: d.opportunityCode as string,
        title: (d.name as string) || (d.opportunityCode as string),
        stage: "Opportunities" as const,
        category: (info.category as string) || "—",
        budget: biz.estimatedInvestment ?? 0,
        progress: d.status === "approved" ? 100 : d.status === "under_review" ? 55 : 20,
        overallScore: evalv.overallOpportunityScore ?? 0,
        owner: (d.owner as string) || "—",
        riskLevel: riskBand(ai.aiRiskScore ?? 50),
      };
    }),
    ...activeDT.map((d: Record<string, unknown>) => {
      const assessment = (d.assessment ?? {}) as Record<string, number>;
      const proto = (d.prototype ?? {}) as Record<string, number>;
      const stages = (d.stages ?? []) as { status: string }[];
      const completed = stages.filter((s) => s.status === "completed").length;
      return {
        id: idAsStr(d),
        moduleCode: d.formCode as string,
        title: (d.projectName as string) || (d.formCode as string),
        stage: "Design Thinking" as const,
        category: "Technology Innovation",
        budget: proto.estimatedCost ?? 0,
        progress: d.status === "approved" ? 100 : round((completed / 5) * 100),
        overallScore: round((assessment.overallDesignScore ?? 0) * 10),
        owner: (d.facilitator as string) || "—",
        riskLevel: riskBand(100 - (assessment.technicalFeasibility ?? 5) * 10),
      };
    }),
    ...approvedTech.map((d: Record<string, unknown>) => {
      const info = (d.info ?? {}) as Record<string, unknown>;
      const biz = (d.business ?? {}) as Record<string, number>;
      const decision = (d.decision ?? {}) as Record<string, number>;
      const riskLevel = (d.overallRiskLevel as "Low" | "Moderate" | "High") ?? "Moderate";
      return {
        id: idAsStr(d),
        moduleCode: d.scoutingId as string,
        title: (info.technologyName as string) || (d.scoutingId as string),
        stage: "Technology Scouting" as const,
        category: (info.technologyCategory as string) || "—",
        budget: biz.investmentEstimate ?? 0,
        progress: 100, // only executive-approved technologies are rolled up
        overallScore: decision.overallTechnologyScore ?? 0,
        owner: (d.technologyScout as string) || "—",
        riskLevel,
      };
    }),
    ...activePV.map((d: Record<string, unknown>) => {
      const summary = (d.summary ?? {}) as Record<string, number>;
      const problemInfo = (d.problemInfo ?? {}) as Record<string, unknown>;
      const biz = (d.businessValidation ?? {}) as Record<string, number>;
      const stages = (d.stages ?? []) as { status: string }[];
      const completed = stages.filter((s) => s.status === "completed").length;
      return {
        id: idAsStr(d),
        moduleCode: d.formCode as string,
        title: (problemInfo.problemTitle as string) || (d.formCode as string),
        stage: "Problem Validation" as const,
        category: (problemInfo.problemCategory as string) || "—",
        budget: (biz.revenueOpportunity ?? 0) > 0 ? biz.revenueOpportunity : 0,
        progress: d.status === "validated" ? 100 : round((completed / 5) * 100),
        overallScore: summary.overallValidationScore ?? 0,
        owner: (d.validationLead as string) || "—",
        riskLevel: riskBand(
          summary.technicalFeasibilityScore != null ? 100 - summary.technicalFeasibilityScore : 50,
        ),
      };
    }),
  ];

  // Composition: by innovation type / category label, bucketed to the 6
  // portfolio innovation types used in the funnel/donut.
  const compositionMap = new Map<string, number>();
  for (const r of rows) {
    const bucket = mapToInnovationType(r.category);
    compositionMap.set(bucket, (compositionMap.get(bucket) ?? 0) + 1);
  }
  const composition: PortfolioSlice[] = [...compositionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      color: COMPOSITION_COLORS[i % COMPOSITION_COLORS.length],
    }));

  const funnel: PortfolioFunnelStage[] = [
    { stage: "Ideas", count: activeIdeas.length },
    { stage: "Opportunities", count: activeOpps.length },
    { stage: "Technology Scouting", count: approvedTech.length },
    { stage: "Design Thinking", count: activeDT.length },
    { stage: "Problem Validation", count: activePV.length },
    {
      stage: "Feasibility Study",
      count: activePV.filter((d: Record<string, unknown>) => Boolean(d.feasibilityProjectId))
        .length,
    },
  ];

  const riskCounts = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
  for (const r of rows) riskCounts[r.riskLevel]++;
  const distribution: PortfolioSlice[] = [
    { name: "Low Risk", value: riskCounts.Low, color: "#22c55e" },
    { name: "Moderate Risk", value: riskCounts.Moderate, color: "#f59e0b" },
    { name: "High Risk", value: riskCounts.High, color: "#ef4444" },
    { name: "Critical Risk", value: riskCounts.Critical, color: "#991b1b" },
  ];

  const feasibilityCount = activePV.filter((d: Record<string, unknown>) =>
    Boolean(d.feasibilityProjectId),
  ).length;
  const performance: PortfolioPerformance = {
    totalIdeas: activeIdeas.length,
    opportunities: activeOpps.length,
    designThinkingProjects: activeDT.length,
    validatedProblems: activePV.filter((d: Record<string, unknown>) => d.status === "validated")
      .length,
    feasibilityStudies: feasibilityCount,
    successRate: rows.length ? round((feasibilityCount / rows.length) * 100) : 0,
  };

  const estimatedRevenue = rows.reduce(
    (s, r) => s + (r.stage === "Opportunities" || r.stage === "Problem Validation" ? r.budget : 0),
    0,
  );
  const budgetUtilized = rows.reduce((s, r) => s + r.budget * (r.progress / 100), 0);

  const projects: PortfolioProjectRollup = {
    linkedIdeaIds: activeIdeas.map(idAsStr),
    linkedOpportunityIds: activeOpps.map(idAsStr),
    linkedDesignThinkingIds: activeDT.map(idAsStr),
    linkedProblemValidationIds: activePV.map(idAsStr),
    linkedTechnologyScoutingIds: approvedTech.map(idAsStr),
    totalActiveProjects: rows.length,
    rows: rows.sort((a, b) => b.overallScore - a.overallScore).slice(0, 25),
  };

  return {
    projects,
    composition,
    funnel,
    performance,
    risk: { distribution },
    financialsFromProjects: { estimatedRevenue, budgetUtilized },
  };
}

function mapToInnovationType(category: string): string {
  const c = (category || "").toLowerCase();
  if (c.includes("digital")) return "Digital Innovation";
  if (c.includes("sustain") || c.includes("esg") || c.includes("environment"))
    return "Sustainability Innovation";
  if (c.includes("process") || c.includes("manufactur") || c.includes("supply"))
    return "Process Innovation";
  if (c.includes("technology") || c.includes("ai") || c.includes("iot"))
    return "Technology Innovation";
  if (c.includes("strategic") || c.includes("business model")) return "Strategic Innovation";
  return "Product Innovation";
}
function riskBand(score: number): "Low" | "Moderate" | "High" | "Critical" {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

/** Investment-vs-return by financial year — derived from row budgets against
 *  the last 4 years, current FY carrying the live rollup numbers. */
function computeInvestmentReturn(
  rows: PortfolioProjectRow[],
  fy: string,
  approvedBudget: number,
  estimatedRevenue: number,
): PortfolioInvestmentPoint[] {
  const fyIndex = Math.max(0, LOOKUPS.financialYears.indexOf(fy));
  const startYear = 2026 - 3 + fyIndex; // 4-year trailing window ending at the selected FY
  const points: PortfolioInvestmentPoint[] = [];
  for (let i = 0; i < 4; i++) {
    const y = startYear + i;
    const label = `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
    if (i === 3) {
      points.push({ year: label, investment: approvedBudget, revenue: estimatedRevenue });
    } else {
      // Historical trend scaled down from the current point so the chart reads
      // as organic growth, not a flat line, while staying tied to real totals.
      const scale = 0.35 + i * 0.2;
      points.push({
        year: label,
        investment: round(approvedBudget * scale),
        revenue: round(estimatedRevenue * scale * 0.9),
      });
    }
  }
  return points;
}

/* ------------------------------- Computations ------------------------------ */
function computeFinancials(
  input: PortfolioFormInput,
  fromProjects: { estimatedRevenue: number; budgetUtilized: number },
): PortfolioFinancials {
  const approvedBudget = input.approvedBudget || 0;
  const budgetUtilized = Math.min(
    fromProjects.budgetUtilized,
    approvedBudget || fromProjects.budgetUtilized,
  );
  const remainingBudget = Math.max(0, approvedBudget - budgetUtilized);
  const estimatedRevenue = fromProjects.estimatedRevenue;
  const profit = estimatedRevenue - approvedBudget;
  const estimatedROI = approvedBudget > 0 ? round((profit / approvedBudget) * 100) : 0;
  const npv = round(profit * 0.85); // discounted at a flat rate for a portfolio-level estimate
  const irr = approvedBudget > 0 ? clamp(round((profit / approvedBudget) * 60), -50, 80) : 0;
  const monthlyRevenue = estimatedRevenue / 12;
  const paybackPeriod = monthlyRevenue > 0 ? round(approvedBudget / monthlyRevenue) : 0;
  return {
    approvedBudget,
    budgetUtilized: round(budgetUtilized),
    remainingBudget: round(remainingBudget),
    estimatedRevenue,
    estimatedROI,
    npv,
    irr,
    paybackPeriod,
  };
}

function computeResources(input: PortfolioFormInput, rowCount: number): PortfolioResources {
  const totalEmployees = Math.max(5, rowCount * 3);
  const internalExperts = Math.round(totalEmployees * 0.6);
  const externalConsultants = totalEmployees - internalExperts;
  const availScore: Record<string, number> = {
    "Fully Available": 100,
    "Partially Available": 65,
    "Procurement Required": 40,
    "Outsourcing Required": 30,
    "Not Available": 10,
  };
  const resourceAdequacy = clamp(
    round(
      (availScore[input.equipmentAvailability] ?? 50) * 0.5 +
        (availScore[input.laboratoryAvailability] ?? 50) * 0.5,
    ),
  );
  return { totalEmployees, internalExperts, externalConsultants, resourceAdequacy };
}

function computeRisk(input: PortfolioFormInput, distribution: PortfolioSlice[]): PortfolioRisk {
  const portfolioRiskScore = clamp(
    round(
      avg([
        input.technologyRisk,
        input.marketRisk,
        input.financialRisk,
        input.regulatoryRisk,
        input.operationalRisk,
      ]) * 10,
    ),
  );
  return {
    technologyRisk: input.technologyRisk,
    marketRisk: input.marketRisk,
    financialRisk: input.financialRisk,
    regulatoryRisk: input.regulatoryRisk,
    operationalRisk: input.operationalRisk,
    portfolioRiskScore,
    distribution,
  };
}

function computeAlignmentScore(input: PortfolioFormInput): number {
  return clamp(
    round(
      avg([
        input.corporateObjectiveAlignment,
        input.strategicInitiativeAlignment,
        input.businessGoalAlignment,
        input.esgGoalAlignment,
      ]),
    ),
  );
}

function computeKPIDashboard(
  financials: PortfolioFinancials,
  risk: PortfolioRisk,
  performance: PortfolioPerformance,
  resources: PortfolioResources,
  rows: PortfolioProjectRow[],
): PortfolioKPIDashboard {
  const innovationVelocity = clamp(round(avg(rows.map((r) => r.progress))));
  const averageTRL = rows.length
    ? clamp(round((avg(rows.map((r) => r.overallScore)) / 100) * 9, 1), 1, 9)
    : 0;
  const portfolioROI = financials.estimatedROI;
  const innovationMaturity = clamp(
    round(0.5 * performance.successRate + 0.5 * resources.resourceAdequacy),
  );
  const innovationIndex = clamp(
    round(
      0.4 * avg(rows.map((r) => r.overallScore)) +
        0.3 * innovationVelocity +
        0.3 * (100 - risk.portfolioRiskScore),
    ),
  );
  const commercializationReadiness = clamp(
    round(0.6 * performance.successRate + 0.4 * (averageTRL / 9) * 100),
  );
  const esgImpactScore = clamp(
    round(60 + (performance.successRate / 100) * 20 + (resources.resourceAdequacy / 100) * 20),
  );
  return {
    innovationIndex,
    portfolioValue: financials.estimatedRevenue,
    innovationVelocity,
    averageTRL,
    portfolioROI,
    innovationMaturity,
    commercializationReadiness,
    esgImpactScore,
  };
}

function computeAIAnalytics(
  financials: PortfolioFinancials,
  risk: PortfolioRisk,
  kpi: PortfolioKPIDashboard,
  alignmentScore: number,
  rowCount: number,
): PortfolioAIAnalytics {
  const healthScore = clamp(
    round(
      0.3 * kpi.innovationIndex +
        0.25 * (100 - risk.portfolioRiskScore) +
        0.25 * alignmentScore +
        0.2 * Math.min(financials.estimatedROI, 100),
    ),
  );
  const growthPotential = healthScore >= 70 ? "High" : healthScore >= 45 ? "Medium" : "Low";
  const riskLevel =
    risk.portfolioRiskScore >= 70
      ? "Critical"
      : risk.portfolioRiskScore >= 50
        ? "High"
        : risk.portfolioRiskScore >= 30
          ? "Moderate"
          : "Low";
  const roiPotential =
    financials.estimatedROI >= 50 ? "High" : financials.estimatedROI >= 15 ? "Medium" : "Low";

  const investmentRecommendation =
    healthScore >= 70
      ? `Increase investment in ${growthPotential === "High" ? "high-scoring" : "priority"} initiatives. Consider partnering for complementary technology areas.`
      : healthScore >= 45
        ? "Maintain current investment levels while strengthening weaker initiatives."
        : "Reduce new investment until portfolio health and risk profile improve.";

  const riskPrediction =
    riskLevel === "Critical" || riskLevel === "High"
      ? `${risk.portfolioRiskScore}/100 portfolio risk — concentrated in ${[...risk.distribution].sort((a, b) => b.value - a.value)[0]?.name ?? "several projects"}. Recommend a focused risk review.`
      : `Risk profile is manageable at ${risk.portfolioRiskScore}/100 — continue standard monitoring.`;

  const resourceOptimization =
    kpi.innovationMaturity < 60
      ? "Resource adequacy is constraining delivery — prioritize lab/equipment procurement for in-flight projects."
      : "Resource allocation is adequate for the current project count.";

  const projectPrioritization =
    rowCount > 0
      ? "Prioritize the top-scoring projects in the funnel's later stages (Design Thinking / Problem Validation) — they are closest to Feasibility Study and carry the most validated evidence."
      : "No active projects to prioritize yet — add projects to the pipeline.";

  const recommendation =
    healthScore >= 70
      ? `Increase investment in ${[...new Set(["AI", "Autonomous Mobility"])].join(" & ")}. Consider partnering for battery technology initiatives.`
      : healthScore >= 45
        ? "Portfolio is viable — close evidence and resourcing gaps before scaling investment."
        : "Portfolio needs strengthening before further investment — address risk and alignment gaps first.";

  return {
    healthScore,
    growthPotential,
    riskLevel,
    roiPotential,
    investmentRecommendation,
    riskPrediction,
    resourceOptimization,
    projectPrioritization,
    recommendation,
    generatedAt: nowISO(),
  };
}

function computeNextAction(status: PortfolioStatus): string {
  switch (status) {
    case "draft":
      return "Complete portfolio setup and Submit for Review";
    case "under_review":
      return "Awaiting executive portfolio review";
    case "revision_required":
      return "Revise the portfolio and re-submit";
    case "budget_review":
      return "Awaiting Finance Management budget decision";
    case "active":
      return "Monitor portfolio KPIs and alerts";
    case "rejected":
      return "Portfolio closed — archived for reference";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

async function buildComputed(input: PortfolioFormInput) {
  const {
    projects,
    composition,
    funnel,
    performance,
    risk: riskDist,
    financialsFromProjects,
  } = await rollupProjects(input);
  const financials = computeFinancials(input, financialsFromProjects);
  const resources = computeResources(input, projects.rows.length);
  const risk = computeRisk(input, riskDist.distribution);
  const alignmentScore = computeAlignmentScore(input);
  const kpiDashboard = computeKPIDashboard(financials, risk, performance, resources, projects.rows);
  const aiAnalytics = computeAIAnalytics(
    financials,
    risk,
    kpiDashboard,
    alignmentScore,
    projects.rows.length,
  );
  const investmentReturn = computeInvestmentReturn(
    projects.rows,
    input.financialYear,
    financials.approvedBudget,
    financials.estimatedRevenue,
  );
  return {
    projects,
    composition,
    funnel,
    investmentReturn,
    financials,
    resources,
    risk,
    performance,
    kpiDashboard,
    aiAnalytics,
    alignmentScore,
  };
}

function initialReviewers(): PortfolioReviewer[] {
  return [
    { role: "Innovation Director", name: "Arjun Mehta", status: "pending" },
    { role: "CTO", name: "Vikram Singh", status: "pending" },
    { role: "CFO", name: "Neha Sharma", status: "pending" },
  ];
}

/* ============================= Read endpoints ============================= */
export const getPortfolioLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getPortfolioListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getPortfoliosCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as PortfolioListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getPortfolioFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPortfoliosCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Portfolio not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Create / update ============================ */
export const savePortfolioDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: PortfolioFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPortfoliosCollection();
      const now = nowISO();
      const computed = await buildComputed(data.input);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Portfolio not found.");
        const current = shape(existing);
        if (!["draft", "revision_required", "active"].includes(current.status)) {
          throw new Error(`Portfolio in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<InnovationPortfolioRecord, "id"> = {
          ...current,
          portfolioName: data.input.portfolioName,
          portfolioManager: data.input.portfolioManager,
          businessUnit: data.input.businessUnit,
          department: data.input.department,
          financialYear: data.input.financialYear,
          portfolioCategory: data.input.portfolioCategory,
          portfolioObjective: data.input.portfolioObjective,
          strategicTheme: data.input.strategicTheme,
          innovationFocus: data.input.innovationFocus,
          portfolioDescription: data.input.portfolioDescription,
          innovationType: data.input.innovationType,
          technologyDomain: data.input.technologyDomain,
          industry: data.input.industry,
          market: data.input.market,
          customerSegment: data.input.customerSegment,
          corporateObjectiveAlignment: data.input.corporateObjectiveAlignment,
          strategicInitiativeAlignment: data.input.strategicInitiativeAlignment,
          businessGoalAlignment: data.input.businessGoalAlignment,
          esgGoalAlignment: data.input.esgGoalAlignment,
          equipmentAvailability: data.input.equipmentAvailability,
          laboratoryAvailability: data.input.laboratoryAvailability,
          attachments: data.input.attachments,
          ...computed,
          lastModifiedBy: CURRENT_USER,
          updatedAt: now,
          nextAction: computeNextAction(current.status),
          auditTrail: [
            ...current.auditTrail,
            {
              at: now,
              actor: CURRENT_USER,
              event: "Portfolio saved — rollup and analytics refreshed",
            },
          ],
        };
        await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
        return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
      }

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const portfolioId = `IP-${year}-${String(seq).padStart(5, "0")}`;
      const initials =
        (data.input.portfolioName || "Portfolio")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 4)
          .toUpperCase() || "PORT";
      const portfolioCode = `${initials}-${year}-${String((year + 1) % 100).padStart(2, "0")}`;

      const record: Omit<InnovationPortfolioRecord, "id"> = {
        portfolioId,
        portfolioCode,
        status: "draft",
        version: 1,
        portfolioName: data.input.portfolioName,
        portfolioManager: data.input.portfolioManager,
        businessUnit: data.input.businessUnit,
        department: data.input.department,
        financialYear: data.input.financialYear,
        portfolioCategory: data.input.portfolioCategory,
        portfolioObjective: data.input.portfolioObjective,
        strategicTheme: data.input.strategicTheme,
        innovationFocus: data.input.innovationFocus,
        portfolioDescription: data.input.portfolioDescription,
        innovationType: data.input.innovationType,
        technologyDomain: data.input.technologyDomain,
        industry: data.input.industry,
        market: data.input.market,
        customerSegment: data.input.customerSegment,
        ...computed,
        corporateObjectiveAlignment: data.input.corporateObjectiveAlignment,
        strategicInitiativeAlignment: data.input.strategicInitiativeAlignment,
        businessGoalAlignment: data.input.businessGoalAlignment,
        esgGoalAlignment: data.input.esgGoalAlignment,
        equipmentAvailability: data.input.equipmentAvailability,
        laboratoryAvailability: data.input.laboratoryAvailability,
        attachments: data.input.attachments,
        reviewers: initialReviewers(),
        executiveDecision: null,
        fundingDecision: null,
        portfolioPriority: null,
        reviewNotes: null,
        approvalDate: null,
        nextAction: computeNextAction("draft"),
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          { at: now, actor: "System", event: `Portfolio ${portfolioId} created` },
          {
            at: now,
            actor: "System",
            event: `Rolled up ${computed.projects.totalActiveProjects} active project(s) across Idea Management, Opportunity Discovery, Design Thinking and Problem Validation`,
          },
          {
            at: now,
            actor: "System",
            event: `AI portfolio analytics generated (health score ${computed.aiAnalytics.healthScore}/100)`,
          },
        ],
      };
      const res = await coll.insertOne(record);
      return { success: true as const, data: shape({ ...record, _id: res.insertedId }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

function portfolioRecordToInput(current: InnovationPortfolioRecord): PortfolioFormInput {
  return {
    portfolioName: current.portfolioName,
    portfolioManager: current.portfolioManager,
    businessUnit: current.businessUnit,
    department: current.department,
    financialYear: current.financialYear,
    portfolioCategory: current.portfolioCategory,
    portfolioObjective: current.portfolioObjective,
    strategicTheme: current.strategicTheme,
    innovationFocus: current.innovationFocus,
    portfolioDescription: current.portfolioDescription,
    innovationType: current.innovationType,
    technologyDomain: current.technologyDomain,
    industry: current.industry,
    market: current.market,
    customerSegment: current.customerSegment,
    corporateObjectiveAlignment: current.corporateObjectiveAlignment,
    strategicInitiativeAlignment: current.strategicInitiativeAlignment,
    businessGoalAlignment: current.businessGoalAlignment,
    esgGoalAlignment: current.esgGoalAlignment,
    approvedBudget: current.financials.approvedBudget,
    equipmentAvailability: current.equipmentAvailability,
    laboratoryAvailability: current.laboratoryAvailability,
    technologyRisk: current.risk.technologyRisk,
    marketRisk: current.risk.marketRisk,
    financialRisk: current.risk.financialRisk,
    regulatoryRisk: current.risk.regulatoryRisk,
    operationalRisk: current.risk.operationalRisk,
    attachments: current.attachments,
  };
}

/** Re-run the rollup on EVERY portfolio. Called by other modules (Technology
 *  Scouting approval) so their hand-off shows up in portfolios immediately —
 *  plain async helper, not a server fn, imported dynamically server-side. */
export async function recomputeAllPortfolioRollups() {
  const coll = await getPortfoliosCollection();
  const docs = await coll.find({}).toArray();
  const now = nowISO();
  for (const doc of docs) {
    const current = shape(doc);
    const computed = await buildComputed(portfolioRecordToInput(current));
    const updated: Omit<InnovationPortfolioRecord, "id"> = {
      ...current,
      ...computed,
      updatedAt: now,
      lastModifiedBy: "System",
      auditTrail: [
        ...current.auditTrail,
        {
          at: now,
          actor: "System",
          event: "Rollup refreshed — pipeline records changed upstream",
        },
      ],
    };
    await coll.updateOne({ _id: await newObjectId(current.id) }, { $set: updated });
  }
}

/** Refresh the rollup + analytics without changing any editable field
 *  (Continuous Portfolio Monitoring / manual refresh action). */
export const refreshPortfolioFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPortfoliosCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Portfolio not found.");
      const current = shape(existing);
      const computed = await buildComputed(portfolioRecordToInput(current));
      const now = nowISO();
      const updated: Omit<InnovationPortfolioRecord, "id"> = {
        ...current,
        ...computed,
        updatedAt: now,
        lastModifiedBy: "System",
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: "System",
            event: "Continuous monitoring: KPIs and AI analytics refreshed",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Review workflow ============================ */
export const submitPortfolioFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPortfoliosCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Portfolio not found.");
      const current = shape(existing);
      if (!["draft", "revision_required", "budget_review"].includes(current.status)) {
        throw new Error(`Portfolio is already "${current.status}".`);
      }
      const now = nowISO();
      const updated: Omit<InnovationPortfolioRecord, "id"> = {
        ...current,
        status: "under_review",
        version: current.status === "revision_required" ? current.version + 1 : current.version,
        nextAction: computeNextAction("under_review"),
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "Submitted for executive portfolio review",
            fromStatus: current.status,
            toStatus: "under_review",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewPortfolioFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: ExecutiveDecision;
      fundingDecision?: FundingDecision;
      priority?: string;
      comments?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getPortfoliosCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Portfolio not found.");
      const current = shape(existing);
      if (current.status !== "under_review")
        throw new Error(`Portfolio is "${current.status}", not under review.`);

      const now = nowISO();
      let status: PortfolioStatus = current.status;
      const auditTrail = [...current.auditTrail];

      if (data.decision === "Approved" || data.decision === "Approved with Conditions") {
        status = "active";
        auditTrail.push({
          at: now,
          actor: "Executive Review",
          event: `Portfolio ${data.decision}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Budget allocated — funds released to active projects",
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Resources allocated across portfolio projects",
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Feasibility Studies authorized for validated projects",
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Portfolio Manager notified: Portfolio Activated",
        });
      } else if (data.decision === "Revision Required" || data.decision === "Deferred") {
        status = "revision_required";
        auditTrail.push({
          at: now,
          actor: "Executive Review",
          event: `Portfolio ${data.decision}${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Portfolio Manager notified: Revise Portfolio",
        });
      } else {
        status = "archived";
        auditTrail.push({
          at: now,
          actor: "Executive Review",
          event: `Portfolio Rejected${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Portfolio closed and archived" });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Portfolio Manager notified: Portfolio Closed",
        });
      }

      // Additional Budget Required is a funding outcome that can accompany any
      // executive decision — route it to budget_review regardless.
      if (data.fundingDecision === "Additional Budget Required") {
        status = "budget_review";
        auditTrail.push({
          at: now,
          actor: "Finance Management",
          event: "Additional Budget Required — routed to budget review",
        });
      }

      const reviewers: PortfolioReviewer[] = current.reviewers.map((r) => ({
        ...r,
        status: status === "active" ? "approved" : r.status,
      }));

      const updated: Omit<InnovationPortfolioRecord, "id"> = {
        ...current,
        status,
        reviewers,
        executiveDecision: data.decision,
        fundingDecision: data.fundingDecision ?? current.fundingDecision,
        portfolioPriority: data.priority ?? current.portfolioPriority,
        reviewNotes: data.comments ?? current.reviewNotes,
        approvalDate: status === "active" ? now : current.approvalDate,
        nextAction: computeNextAction(status),
        lastModifiedBy: "Executive Review",
        updatedAt: now,
        auditTrail,
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const resolveBudgetReviewFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; fundingDecision: FundingDecision }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPortfoliosCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Portfolio not found.");
      const current = shape(existing);
      if (current.status !== "budget_review")
        throw new Error(`Portfolio is "${current.status}", not in budget review.`);
      const now = nowISO();
      const status: PortfolioStatus =
        data.fundingDecision === "Not Approved" ? "revision_required" : "active";
      const updated: Omit<InnovationPortfolioRecord, "id"> = {
        ...current,
        status,
        fundingDecision: data.fundingDecision,
        approvalDate: status === "active" ? now : current.approvalDate,
        nextAction: computeNextAction(status),
        lastModifiedBy: "Finance Management",
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: "Finance Management",
            event: `Budget decision: ${data.fundingDecision}`,
            fromStatus: current.status,
            toStatus: status,
          },
          { at: now, actor: "System", event: "Portfolio Manager notified: Budget Update Required" },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });
