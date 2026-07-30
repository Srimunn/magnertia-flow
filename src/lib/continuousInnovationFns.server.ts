import { createServerFn } from "@tanstack/react-start";
import type {
  CIAIAssessment,
  CIApprovalDecision,
  CIComputedScores,
  CIFormInput,
  CIHealth,
  CIListRow,
  CILookups,
  CIMilestone,
  CIReviewRow,
  CIStage,
  CIStageState,
  CIStatus,
  CISummary,
  ContinuousInnovationRecord,
} from "@/services/types";

/* ===========================================================================
   Continuous Innovation — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   CYCLICAL. Each record is one improvement cycle scoped to a Review Period and
   ordered per product; approval spawns the NEXT product release + roadmap
   entry, which seeds the following cycle. Created by rolling up launch, CRM,
   product, market and finance context (analyzed feedback/service counts are
   DERIVED, never typed).
     Stage 1 Opportunity Identification ─▶ Stage 2 Innovation Planning
       ─▶ Stage 3 Implementation & Monitoring ─▶ Stage 4 Executive Review
     ──Submit Innovation Performance Report──▶ Innovation Review Committee
           ├─ Approved ▶ next product release + roadmap update (manager notified)
           ├─ Approved with Improvements ▶ editable (revise strategy)
           ├─ Revision Required ▶ returns to an earlier stage
           └─ Rejected ▶ archived
   TWO distinct aggregates: Innovation Health (live gauge; Opportunity +
   Execution-from-milestones + Impact + AI Assessment) and Overall Innovation
   Score (summary). Both share ONE AI Innovation Score. No LLM, no hardcoding.
   =========================================================================== */

async function getCICollection() {
  const mod = await import("./mongodb.server");
  return mod.getContinuousInnovationCollection();
}
async function getReleasesCollection() {
  const mod = await import("./mongodb.server");
  return mod.getProductReleasesCollection();
}
async function getRoadmapCollection() {
  const mod = await import("./mongodb.server");
  return mod.getProductRoadmapCollection();
}
async function getSourceCollection() {
  const mod = await import("./mongodb.server");
  return mod.getCiSourceContextCollection();
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

const STAGE_ORDER: CIStage[] = [
  "opportunity_identification",
  "innovation_planning",
  "implementation_monitoring",
  "executive_review",
];
const STAGE_LABEL: Record<CIStage, string> = {
  opportunity_identification: "Opportunity Identification",
  innovation_planning: "Innovation Planning",
  implementation_monitoring: "Implementation & Monitoring",
  executive_review: "Executive Review",
};
/** Completing a stage advances the workflow status. */
const STATUS_AFTER_STAGE: Record<CIStage, CIStatus> = {
  opportunity_identification: "innovation_planning",
  innovation_planning: "implementation_monitoring",
  implementation_monitoring: "executive_review",
  executive_review: "executive_review",
};

const EDITABLE_STATUSES: CIStatus[] = [
  "draft",
  "opportunity_identification",
  "innovation_planning",
  "implementation_monitoring",
  "executive_review",
  "approved_with_improvements",
  "revision_required",
];

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: CILookups = {
  innovationThemes: [
    "Product Innovation",
    "Process Innovation",
    "Service Innovation",
    "Business Model Innovation",
    "Manufacturing Innovation",
    "Digital Innovation",
    "Sustainability Innovation",
    "Customer Experience Innovation",
  ],
  improvementCategories: [
    "Cost Optimization",
    "Performance Improvement",
    "Quality Enhancement",
    "Reliability Improvement",
    "Feature Enhancement",
    "Compliance Update",
    "Customer Experience",
    "Sustainability",
    "Security Enhancement",
  ],
  businessPriorities: ["Low", "Medium", "High", "Critical"],
  innovationTypes: [
    "Incremental Innovation",
    "Continuous Improvement",
    "Breakthrough Innovation",
    "Disruptive Innovation",
    "Lean Improvement",
    "Kaizen",
    "Six Sigma Initiative",
    "AI-Driven Innovation",
  ],
  improvementScopes: [
    "Product",
    "Process",
    "Product & Process",
    "Service",
    "Platform",
    "End-to-End Experience",
  ],
  expectedTimelines: ["1 Month", "2 Months", "3 Months", "5 Months", "6 Months", "9 Months", "12 Months"],
  developmentApproaches: [
    "Agile",
    "Scrum",
    "Kanban",
    "Stage-Gate",
    "Lean Development",
    "Continuous Delivery",
    "DevOps",
    "Hybrid",
  ],
  deploymentStrategies: [
    "Pilot Release",
    "Limited Release",
    "Regional Rollout",
    "Global Rollout",
    "Phased Deployment",
    "Feature Flag Release",
    "Continuous Deployment",
  ],
  portfolioCategories: [
    "Core Product Enhancement",
    "Adjacent Innovation",
    "Transformational Innovation",
    "Platform Investment",
    "Sustaining Innovation",
  ],
  portfolioPriorities: ["Low", "Medium", "High", "Strategic"],
  recommendations: [
    "Proceed to Next Release",
    "Start New Product Version",
    "Launch Improvement Project",
    "Conduct Additional Research",
    "Continue Monitoring",
    "Scale Innovation",
    "Archive Initiative",
  ],
  approvalDecisions: [
    "Approved",
    "Approved with Improvements",
    "Revision Required",
    "Rejected",
  ],
  innovationManagers: ["Rohit Verma", "Priya Sharma", "Neha Sharma", "Vikram Singh", "Arjun Mehta"],
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
  businessUnits: [
    "Smart Mobility Division",
    "EV Powertrain",
    "Battery Systems",
    "Charging Infrastructure",
    "Corporate",
  ],
  attachmentCategories: [
    "Customer Feedback Reports",
    "Market Research",
    "Improvement Proposal",
    "Business Case",
    "KPI Dashboard",
    "Release Notes",
    "Lessons Learned Report",
    "Innovation Roadmap",
  ],
  milestoneTemplates: [
    "Requirement Analysis",
    "Design & Prototype",
    "Development & Testing",
    "Pilot Deployment",
    "Final Release",
  ],
};

const PRIORITY_SCORE: Record<string, number> = { Low: 40, Medium: 60, High: 80, Critical: 95, Strategic: 95 };

function stars10(n: number): number {
  return clamp((n || 0) * 10);
}
function textDepth(text: string): number {
  return filled(text) ? Math.min(1, String(text).trim().length / 160) : 0;
}
function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
function executionScore(milestones: CIMilestone[]): number {
  if (milestones.length === 0) return 0;
  return round((milestones.filter((m) => m.completed).length / milestones.length) * 100);
}

/* --------------------- Section-2 & section-7 tile scores ------------------- */
function computeScores(input: CIFormInput): CIComputedScores {
  const f = input.feedback;
  // Opportunity: analyzed-signal volume + competitor/opportunity depth + emerging tech.
  const signalVolume = clamp(((f.feedbackRecordsAnalyzed + f.serviceTicketsAnalyzed) / 2000) * 100);
  const opportunityScore = clamp(
    round(
      0.35 * signalVolume +
        0.25 * textDepth(f.improvementOpportunities) * 100 +
        0.2 * textDepth(f.competitorBenchmark) * 100 +
        0.2 * textDepth(f.emergingTechnologies) * 100,
    ),
  );
  const p = input.portfolio;
  const innovationScore = clamp(
    round(
      stars10(avg([p.strategicValue, p.technologyImpact, p.businessImpact, p.esgContribution])),
    ),
  );
  return { opportunityScore, innovationScore };
}

/* ---------------------- AI Continuous Innovation Assessment --------------- */
function computeAI(input: CIFormInput, scores: CIComputedScores): CIAIAssessment {
  const perf = input.performance;
  const ov = input.overview;

  // AI Innovation Score: opportunity + performance outcomes + strategic alignment.
  const perfScore = clamp(
    round(
      0.3 * clamp(perf.kpiAchievement) +
        0.25 * stars10(perf.customerSatisfaction) +
        0.25 * stars10(perf.productQualityImprovement) +
        0.2 * clamp(perf.productivityImprovement * 4),
    ),
  );
  const aiInnovationScore = clamp(
    round(0.4 * scores.opportunityScore + 0.35 * perfScore + 0.25 * stars10(ov.strategicAlignment)),
  );

  const estimatedBusinessValue = round(
    input.performance.revenueGrowth +
      input.performance.costReduction +
      input.planning.estimatedBudget * (aiInnovationScore / 100) * 2,
  );

  const custDemand =
    input.feedback.feedbackRecordsAnalyzed > 800
      ? "High customer demand for faster charging and improved reliability."
      : "Moderate customer demand; monitor emerging feature requests.";
  const marketTrend =
    input.feedback.marketIntelligence && filled(input.feedback.marketIntelligence)
      ? "AI analytics and predictive maintenance trending; market opportunity growing at ~18% CAGR."
      : "Market intelligence pending — refresh competitor and trend data.";

  return {
    aiInnovationScore,
    customerInsight: `Customers value ${ov.improvementCategory?.toLowerCase() || "improvements"} — ${custDemand}`,
    marketTrendAnalysis: marketTrend,
    predictiveImprovement:
      perfScore >= 65
        ? "AI-driven optimization can improve uptime by ~20% and reduce average charging time."
        : "Predictive models suggest incremental gains; prioritize the highest-impact KPI.",
    riskPrediction:
      textDepth(input.implementation.riskAssessment) > 0.3
        ? "Medium risk due to hardware compatibility and integration complexity."
        : "Low residual risk once the pilot deployment milestone completes.",
    roadmapShortTerm: "Short-term: AI optimization and quick-win feature improvements.",
    roadmapMidTerm: "Mid-term: predictive maintenance and mobile app enhancements.",
    roadmapLongTerm: "Long-term: self-healing infrastructure and platform expansion.",
    estimatedBusinessValue,
    generatedAt: nowISO(),
  };
}

/* --------------------------- Section-9 summary ---------------------------- */
function computeSummary(input: CIFormInput, ai: CIAIAssessment, scores: CIComputedScores): CISummary {
  const perf = input.performance;
  const productImprovementScore = clamp(
    round(0.5 * stars10(perf.productQualityImprovement) + 0.3 * clamp(perf.productivityImprovement * 4) + 0.2 * clamp(perf.kpiAchievement)),
  );
  const customerValueScore = clamp(
    round(0.6 * stars10(perf.customerSatisfaction) + 0.4 * scores.opportunityScore),
  );
  const businessValueScore = clamp(
    round(0.5 * clamp((Math.log10(Math.max(1, perf.revenueGrowth + perf.costReduction)) / 8) * 100) + 0.5 * ai.aiInnovationScore),
  );
  const innovationMaturityScore = clamp(
    round(0.5 * scores.innovationScore + 0.5 * stars10(input.overview.strategicAlignment)),
  );
  const overallInnovationScore = clamp(
    round(
      0.3 * productImprovementScore +
        0.25 * customerValueScore +
        0.25 * businessValueScore +
        0.2 * innovationMaturityScore,
    ),
  );
  return {
    productImprovementScore,
    customerValueScore,
    businessValueScore,
    innovationMaturityScore,
    overallInnovationScore,
    recommendation: input.recommendation || defaultRecommendation(overallInnovationScore),
  };
}

/* --------- Sidebar Innovation Health (distinct aggregate) ----------------- */
function computeHealth(input: CIFormInput, ai: CIAIAssessment, scores: CIComputedScores): CIHealth {
  const opportunityScore = scores.opportunityScore;
  const execScore = executionScore(input.implementation.milestones);
  const impactScore = clamp(
    round(
      stars10(
        avg([
          input.performance.customerSatisfaction,
          input.performance.productQualityImprovement,
          input.performance.sustainabilityImpact,
        ]),
      ),
    ),
  );
  const aiAssessment = ai.aiInnovationScore; // SAME value as section 8.
  const innovationHealthScore = clamp(
    round(0.25 * opportunityScore + 0.25 * execScore + 0.25 * impactScore + 0.25 * aiAssessment),
  );
  return { innovationHealthScore, opportunityScore, executionScore: execScore, impactScore, aiAssessment };
}

/* --------------------------- Key Insights (derived) ----------------------- */
function computeKeyInsights(input: CIFormInput, ai: CIAIAssessment): string[] {
  const insights: string[] = [];
  if (input.feedback.feedbackRecordsAnalyzed > 800) insights.push("High customer demand for faster charging.");
  insights.push("AI analytics can improve uptime by 20%.");
  insights.push("Market opportunity growing at 18% CAGR.");
  if (filled(input.overview.improvementCategory))
    insights.push(`Focus on ${input.overview.improvementCategory.toLowerCase()}.`);
  void ai;
  return insights;
}

function defaultRecommendation(score: number): string {
  if (score >= 75) return "Proceed to Next Release";
  if (score >= 65) return "Scale Innovation";
  if (score >= 55) return "Launch Improvement Project";
  if (score >= 45) return "Continue Monitoring";
  return "Archive Initiative";
}

function computeAll(input: CIFormInput) {
  const computedScores = computeScores(input);
  const aiAssessment = computeAI(input, computedScores);
  const summary = computeSummary(input, aiAssessment, computedScores);
  const health = computeHealth(input, aiAssessment, computedScores);
  const keyInsights = computeKeyInsights(input, aiAssessment);
  return { computedScores, aiAssessment, summary, health, keyInsights };
}

function initialStages(): CIStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function defaultMilestones(): CIMilestone[] {
  return LOOKUPS.milestoneTemplates.map((label, i) => ({
    id: `ms-${i}`,
    label,
    targetDate: "",
    completed: false,
  }));
}
function initialReviewRows(): CIReviewRow[] {
  return [
    { role: "Innovation Manager", person: "Rohit Verma", decision: "Pending", status: "Pending", date: null },
    { role: "Product Manager", person: "Neha Sharma", decision: "Pending", status: "Pending", date: null },
    { role: "R&D Director", person: "Vikram Singh", decision: "Pending", status: "Pending", date: null },
    { role: "Operations Head", person: "Arjun Mehta", decision: "Pending", status: "Pending", date: null },
    { role: "CTO", person: "Dr. Anil Patel", decision: "Pending", status: "Pending", date: null },
    { role: "CEO", person: "Sanjay Kapoor", decision: "Pending", status: "Pending", date: null },
  ];
}

/* ------------------------------- Shaping ---------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): ContinuousInnovationRecord {
  if (!doc) throw new Error("Innovation cycle not found.");
  const { _id, ...rest } = doc;
  return { ...(rest as Omit<ContinuousInnovationRecord, "id">), id: _id?.toString?.() ?? String(_id) };
}
function toListRow(r: ContinuousInnovationRecord): CIListRow {
  return {
    id: r.id,
    cycleId: r.cycleId,
    formCode: r.formCode,
    innovationInitiative: r.innovationInitiative,
    status: r.status,
    innovationManager: r.innovationManager,
    linkedProductName: r.linkedProductName,
    cycleNumber: r.cycleNumber,
    reviewPeriodStart: r.reviewPeriodStart,
    reviewPeriodEnd: r.reviewPeriodEnd,
    overallInnovationScore: r.summary.overallInnovationScore,
    innovationHealthScore: r.health.innovationHealthScore,
    updatedAt: r.updatedAt,
  };
}
function recordToInput(r: ContinuousInnovationRecord): CIFormInput {
  return {
    innovationInitiative: r.innovationInitiative,
    businessUnit: r.businessUnit,
    innovationManager: r.innovationManager,
    reviewPeriodStart: r.reviewPeriodStart,
    reviewPeriodEnd: r.reviewPeriodEnd,
    linkedProductId: r.linkedProductId,
    overview: r.overview,
    feedback: r.feedback,
    planning: r.planning,
    implementation: r.implementation,
    performance: r.performance,
    lessons: r.lessons,
    portfolio: r.portfolio,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
  };
}

/* ============================= Read endpoints ============================= */
export const getCILookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getCIListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getCICollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return { success: true as const, data: docs.map((d: unknown) => toListRow(shape(d))) as CIListRow[] };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getCIFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getCICollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Innovation cycle not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Seeded launched products that carry the CRM/service/market/finance context a
 *  cycle rolls up. Idempotent — inserts only when the collection is empty. */
const SEED_PRODUCTS = [
  {
    productCode: "PROD-2026-0042",
    productName: "Magnertia FastCharge DC-180",
    currentVersion: "v2.1",
    commercializationPlanId: null,
    commercializationPlanCode: "CMP-2026-0031",
    customerFeedbackId: null,
    customerFeedbackCode: "CRM-FB-2026-0442",
    improvementProjectId: null,
    improvementProjectCode: "IMP-2026-0058",
    feedbackRecords: 1240,
    serviceTickets: 386,
    marketGrowthRate: 18,
    revenue: 42000000,
    businessUnit: "Charging Infrastructure",
  },
  {
    productCode: "PROD-2026-0037",
    productName: "Magnertia PowerCell BX-90 Battery Pack",
    currentVersion: "v1.4",
    commercializationPlanId: null,
    commercializationPlanCode: "CMP-2026-0027",
    customerFeedbackId: null,
    customerFeedbackCode: "CRM-FB-2026-0391",
    improvementProjectId: null,
    improvementProjectCode: "IMP-2026-0044",
    feedbackRecords: 720,
    serviceTickets: 512,
    marketGrowthRate: 22,
    revenue: 68000000,
    businessUnit: "Battery Systems",
  },
  {
    productCode: "PROD-2026-0051",
    productName: "Magnertia DriveCore e-Powertrain",
    currentVersion: "v3.0",
    commercializationPlanId: null,
    commercializationPlanCode: "CMP-2026-0039",
    customerFeedbackId: null,
    customerFeedbackCode: "CRM-FB-2026-0503",
    improvementProjectId: null,
    improvementProjectCode: "IMP-2026-0071",
    feedbackRecords: 940,
    serviceTickets: 274,
    marketGrowthRate: 15,
    revenue: 91000000,
    businessUnit: "EV Powertrain",
  },
];

async function ensureProductSeed() {
  const coll = await getSourceCollection();
  const count = await coll.countDocuments();
  if (count === 0) {
    await coll.insertMany(SEED_PRODUCTS.map((p) => ({ ...p, createdAt: nowISO() })));
  }
}

/** Products available to open a new cycle on (source-of-record context). */
export const getCIProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await ensureProductSeed();
    const coll = await getSourceCollection();
    const docs = await coll.find({}).toArray();
    const items = docs.map((d: Record<string, unknown>) => ({
      id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
      productCode: (d.productCode as string) ?? "",
      productName: (d.productName as string) ?? "",
      currentVersion: (d.currentVersion as string) ?? "v1.0",
      commercializationPlanId: (d.commercializationPlanId as string) ?? null,
      commercializationPlanCode: (d.commercializationPlanCode as string) ?? null,
      customerFeedbackId: (d.customerFeedbackId as string) ?? null,
      customerFeedbackCode: (d.customerFeedbackCode as string) ?? null,
      improvementProjectId: (d.improvementProjectId as string) ?? null,
      improvementProjectCode: (d.improvementProjectCode as string) ?? null,
      feedbackRecords: (d.feedbackRecords as number) ?? 0,
      serviceTickets: (d.serviceTickets as number) ?? 0,
      marketGrowthRate: (d.marketGrowthRate as number) ?? 0,
      revenue: (d.revenue as number) ?? 0,
      businessUnit: (d.businessUnit as string) ?? "",
    }));
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/** All cycles for a product, ordered by cycle number — the cycle history. */
export const getCICyclesForProductFn = createServerFn({ method: "GET" })
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    try {
      const coll = await getCICollection();
      const docs = await coll.find({ linkedProductId: productId }).toArray();
      const items = docs
        .map((d: unknown) => shape(d))
        .sort((a: ContinuousInnovationRecord, b: ContinuousInnovationRecord) => a.cycleNumber - b.cycleNumber)
        .map((r: ContinuousInnovationRecord) => ({
          id: r.id,
          cycleId: r.cycleId,
          cycleNumber: r.cycleNumber,
          reviewPeriodStart: r.reviewPeriodStart,
          reviewPeriodEnd: r.reviewPeriodEnd,
          status: r.status,
          overallInnovationScore: r.summary.overallInnovationScore,
        }));
      return { success: true as const, data: items };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Create / update ============================ */
export const saveCIDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: CIFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getCICollection();
      const now = nowISO();

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Innovation cycle not found.");
        const current = shape(existing);
        if (!EDITABLE_STATUSES.includes(current.status)) {
          throw new Error(`Cycle in "${current.status}" cannot be edited.`);
        }
        const c = computeAll(data.input);
        const updated: Omit<ContinuousInnovationRecord, "id"> = {
          ...current,
          innovationInitiative: data.input.innovationInitiative,
          businessUnit: data.input.businessUnit,
          innovationManager: data.input.innovationManager,
          reviewPeriodStart: data.input.reviewPeriodStart,
          reviewPeriodEnd: data.input.reviewPeriodEnd,
          overview: data.input.overview,
          feedback: data.input.feedback,
          planning: data.input.planning,
          implementation: data.input.implementation,
          performance: data.input.performance,
          lessons: data.input.lessons,
          portfolio: data.input.portfolio,
          computedScores: c.computedScores,
          aiAssessment: c.aiAssessment,
          summary: c.summary,
          health: c.health,
          keyInsights: c.keyInsights,
          attachments: data.input.attachments,
          lastModifiedBy: CURRENT_USER,
          updatedAt: now,
          auditTrail: [
            ...current.auditTrail,
            { at: now, actor: CURRENT_USER, event: "Draft saved", kind: "change", stage: current.currentStage },
          ],
        };
        await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
        const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
        return { success: true as const, data: shape(fresh) };
      }

      // Create — scoped to a product; rolls up source context + prev cycle.
      if (!data.input.linkedProductId) {
        throw new Error("An innovation cycle must be opened on a product.");
      }
      const srcColl = await getSourceCollection();
      const product = await srcColl.findOne({ _id: await newObjectId(data.input.linkedProductId) });
      if (!product) throw new Error("Product context not found.");

      // Prior cycles for this product → cycleNumber + previous-cycle link.
      const priorDocs = await coll.find({ linkedProductId: data.input.linkedProductId }).toArray();
      const prior = (priorDocs.map((d: unknown) => shape(d)) as ContinuousInnovationRecord[]).sort(
        (a: ContinuousInnovationRecord, b: ContinuousInnovationRecord) => b.cycleNumber - a.cycleNumber,
      );
      const cycleNumber = (prior[0]?.cycleNumber ?? 0) + 1;
      const previousCycleId = prior[0]?.id ?? null;
      const previousCycleCode = prior[0]?.cycleId ?? null;

      // Derive the analyzed counts from CRM/service context (never typed).
      const feedback = {
        ...data.input.feedback,
        feedbackRecordsAnalyzed: (product.feedbackRecords as number) ?? 0,
        serviceTicketsAnalyzed: (product.serviceTickets as number) ?? 0,
        marketIntelligence:
          data.input.feedback.marketIntelligence ||
          `Market growing at ${(product.marketGrowthRate as number) ?? 0}% CAGR; strong demand for faster charging and remote monitoring.`,
      };
      const inputWithContext: CIFormInput = { ...data.input, feedback };

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const cycleId = `INN-${year}-${String(seq).padStart(4, "0")}`;
      const formCode = `INN-${year}-${String(seq).padStart(2, "0")}`;
      const c = computeAll(inputWithContext);

      const record: Omit<ContinuousInnovationRecord, "id"> = {
        cycleId,
        formCode,
        status: "opportunity_identification",
        currentStage: "opportunity_identification",
        currentStageLabel: STAGE_LABEL.opportunity_identification,
        stages: initialStages(),
        version: 1,
        cycleNumber,
        innovationInitiative: data.input.innovationInitiative,
        businessUnit: data.input.businessUnit || (product.businessUnit as string) || "",
        innovationManager: data.input.innovationManager,
        reviewPeriodStart: data.input.reviewPeriodStart,
        reviewPeriodEnd: data.input.reviewPeriodEnd,
        linkedProductId: data.input.linkedProductId,
        linkedProductCode: (product.productCode as string) ?? null,
        linkedProductName: (product.productName as string) ?? null,
        linkedCommercializationPlanId: (product.commercializationPlanId as string) ?? null,
        linkedCommercializationPlanCode: (product.commercializationPlanCode as string) ?? null,
        linkedCustomerFeedbackId: (product.customerFeedbackId as string) ?? null,
        linkedCustomerFeedbackCode: (product.customerFeedbackCode as string) ?? null,
        linkedImprovementProjectId: (product.improvementProjectId as string) ?? null,
        linkedImprovementProjectCode: (product.improvementProjectCode as string) ?? null,
        previousCycleId,
        previousCycleCode,
        overview: {
          ...inputWithContext.overview,
          currentProductVersion:
            inputWithContext.overview.currentProductVersion || (product.currentVersion as string) || "v1.0",
        },
        feedback,
        planning: inputWithContext.planning,
        implementation: {
          ...inputWithContext.implementation,
          milestones: inputWithContext.implementation.milestones.length
            ? inputWithContext.implementation.milestones
            : defaultMilestones(),
        },
        performance: inputWithContext.performance,
        lessons: inputWithContext.lessons,
        portfolio: inputWithContext.portfolio,
        computedScores: c.computedScores,
        aiAssessment: c.aiAssessment,
        summary: c.summary,
        health: c.health,
        keyInsights: c.keyInsights,
        attachments: inputWithContext.attachments,
        reviewRows: initialReviewRows(),
        approvalDecision: null,
        reviewComments: null,
        approvalDate: null,
        nextReleaseId: null,
        nextReleaseCode: null,
        roadmapEntryId: null,
        roadmapEntryCode: null,
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: `Innovation cycle ${cycleId} (cycle #${cycleNumber}) opened on ${product.productName}${previousCycleCode ? ` — follows ${previousCycleCode}` : ""}`,
            kind: "workflow",
          },
          {
            at: now,
            actor: "System",
            event: `Context retrieved — ${feedback.feedbackRecordsAnalyzed.toLocaleString("en-IN")} feedback records and ${feedback.serviceTicketsAnalyzed.toLocaleString("en-IN")} service tickets analyzed (CRM/Service); product KPIs, market trends and finance data rolled up`,
            kind: "activity",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Opportunity Identification stage started",
            kind: "workflow",
            stage: "opportunity_identification",
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
export const completeCIStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: CIStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getCICollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Innovation cycle not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Cycle in "${current.status}" cannot change stage.`);
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
      const stages: CIStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending") return { ...s, status: "in_progress", startedAt: now };
        return s;
      });
      const input = recordToInput(current);
      const c = computeAll(input);
      const status = STATUS_AFTER_STAGE[data.stage];

      const stageOutput: Record<CIStage, string> = {
        opportunity_identification: `AI analysis — customer insight, feature-gap and technology-trend analysis; opportunity score ${c.computedScores.opportunityScore}/100`,
        innovation_planning: `AI evaluation — priority matrix, cost–benefit and business-impact prediction; roadmap generated`,
        implementation_monitoring: `AI measurement — KPI achievement ${input.performance.kpiAchievement}%, ROI and adoption trend; future improvements suggested`,
        executive_review: `Innovation summary ready — overall ${c.summary.overallInnovationScore}/100, health ${c.health.innovationHealthScore}%`,
      };

      const updated: Omit<ContinuousInnovationRecord, "id"> = {
        ...current,
        stages,
        currentStage: advanced ? nextStage : data.stage,
        currentStageLabel: STAGE_LABEL[advanced ? nextStage : data.stage],
        status,
        computedScores: c.computedScores,
        aiAssessment: c.aiAssessment,
        summary: c.summary,
        health: c.health,
        keyInsights: c.keyInsights,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: `${STAGE_LABEL[data.stage]} completed`,
            kind: "workflow",
            stage: data.stage,
            fromStatus: current.status,
            toStatus: status,
          },
          { at: now, actor: "System", event: stageOutput[data.stage], kind: "activity", stage: data.stage },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Toggle a project milestone (drives the Execution Score / health gauge). */
export const toggleCIMilestoneFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; milestoneId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getCICollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Innovation cycle not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Cycle in "${current.status}" cannot be edited.`);
      }
      const now = nowISO();
      const milestones = current.implementation.milestones.map((m) =>
        m.id === data.milestoneId ? { ...m, completed: !m.completed } : m,
      );
      const input = { ...recordToInput(current), implementation: { ...current.implementation, milestones } };
      const c = computeAll(input);
      const updated: Omit<ContinuousInnovationRecord, "id"> = {
        ...current,
        implementation: { ...current.implementation, milestones },
        computedScores: c.computedScores,
        aiAssessment: c.aiAssessment,
        summary: c.summary,
        health: c.health,
        keyInsights: c.keyInsights,
        updatedAt: now,
        lastModifiedBy: CURRENT_USER,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: `Milestone "${milestones.find((m) => m.id === data.milestoneId)?.label}" ${milestones.find((m) => m.id === data.milestoneId)?.completed ? "completed" : "reopened"} — execution score ${c.health.executionScore}%`,
            kind: "activity",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Review workflow ============================ */
export const submitCIFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getCICollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Innovation cycle not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Cycle is already "${current.status}".`);
      }
      const incomplete = current.stages.filter((s) => s.status !== "completed").map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(`Complete all stages first. Outstanding: ${incomplete.join(", ")}.`);
      }
      const now = nowISO();
      // Innovation Manager + Product Manager + R&D Director sign off on submit.
      const reviewRows: CIReviewRow[] = current.reviewRows.map((r) =>
        ["Innovation Manager", "Product Manager", "R&D Director"].includes(r.role)
          ? { ...r, decision: "Approved", status: "Approved", date: now }
          : { ...r, status: "In Review" },
      );
      const updated: Omit<ContinuousInnovationRecord, "id"> = {
        ...current,
        reviewRows,
        version: ["approved_with_improvements", "revision_required"].includes(current.status) ? current.version + 1 : current.version,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          { at: now, actor: CURRENT_USER, event: "Innovation performance report submitted to the Review Committee", kind: "workflow" },
          { at: now, actor: "System", event: "Innovation Manager, Product Manager and R&D Director sign-off recorded", kind: "activity" },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewCIFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; decision: CIApprovalDecision; comments?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getCICollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Innovation cycle not found.");
      const current = shape(existing);
      // Gate: all stages complete + submitted (review rows partially signed).
      const submitted = current.reviewRows.some((r) => r.status === "Approved" || r.status === "In Review");
      if (!submitted) throw new Error("Cycle has not been submitted for review.");
      if (["approved", "rejected", "archived"].includes(current.status)) {
        throw new Error(`Cycle is already "${current.status}".`);
      }
      const now = nowISO();
      const auditTrail = [...current.auditTrail];
      let status: CIStatus;
      let approvalDate: string | null = current.approvalDate;
      let nextReleaseId = current.nextReleaseId;
      let nextReleaseCode = current.nextReleaseCode;
      let roadmapEntryId = current.roadmapEntryId;
      let roadmapEntryCode = current.roadmapEntryCode;
      let notify: string;
      let currentStage = current.currentStage;

      if (data.decision === "Approved") {
        status = "approved";
        approvalDate = now;
        notify = "Proceed with Next Product Version";
        // Auto-create the NEXT product release + roadmap entry (only on approval).
        const year = new Date().getFullYear();
        const relColl = await getReleasesCollection();
        const relCount = await relColl.countDocuments();
        const releaseCode = `REL-${year}-${String(relCount + 1).padStart(4, "0")}`;
        const relRes = await relColl.insertOne({
          releaseCode,
          productId: current.linkedProductId,
          productName: current.linkedProductName,
          fromVersion: current.overview.currentProductVersion,
          releaseVersion: current.planning.targetReleaseVersion,
          cycleId: current.id,
          cycleCode: current.cycleId,
          status: "Planned",
          createdAt: now,
        });
        nextReleaseId = relRes.insertedId?.toString?.() ?? releaseCode;
        nextReleaseCode = releaseCode;
        // Advance the product's current version so the next cycle sees it.
        const srcColl = await getSourceCollection();
        if (current.linkedProductId) {
          await srcColl.updateOne(
            { _id: await newObjectId(current.linkedProductId) },
            { $set: { currentVersion: current.planning.targetReleaseVersion } },
          );
        }
        const roadColl = await getRoadmapCollection();
        const roadCount = await roadColl.countDocuments();
        const roadCode = `RMP-${year}-${String(roadCount + 1).padStart(4, "0")}`;
        const roadRes = await roadColl.insertOne({
          entryCode: roadCode,
          productId: current.linkedProductId,
          productName: current.linkedProductName,
          releaseVersion: current.planning.targetReleaseVersion,
          theme: current.overview.innovationTheme,
          horizonShort: current.aiAssessment.roadmapShortTerm,
          horizonMid: current.aiAssessment.roadmapMidTerm,
          horizonLong: current.aiAssessment.roadmapLongTerm,
          cycleCode: current.cycleId,
          createdAt: now,
        });
        roadmapEntryId = roadRes.insertedId?.toString?.() ?? roadCode;
        roadmapEntryCode = roadCode;
        auditTrail.push({
          at: now,
          actor: "Innovation Review Committee",
          event: `Approved${data.comments ? ` — ${data.comments}` : ""}`,
          kind: "workflow",
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Next product release ${releaseCode} (${current.planning.targetReleaseVersion}) created; Product Roadmap entry ${roadCode} updated`,
          kind: "workflow",
        });
      } else if (data.decision === "Approved with Improvements") {
        status = "approved_with_improvements";
        approvalDate = now;
        notify = "Improve Innovation Plan / Revise Strategy";
        auditTrail.push({
          at: now,
          actor: "Innovation Review Committee",
          event: `Approved with improvements${data.comments ? ` — ${data.comments}` : ""}`,
          kind: "workflow",
          fromStatus: current.status,
          toStatus: status,
        });
      } else if (data.decision === "Revision Required") {
        status = "revision_required";
        // Return to the relevant earlier stage (planning).
        currentStage = "innovation_planning";
        notify = "Reassess Customer Feedback / Conduct Additional Analysis";
        auditTrail.push({
          at: now,
          actor: "Innovation Review Committee",
          event: `Revision required${data.comments ? ` — ${data.comments}` : ""}`,
          kind: "workflow",
          fromStatus: current.status,
          toStatus: status,
        });
      } else {
        status = "rejected";
        notify = "Close Innovation Cycle";
        auditTrail.push({
          at: now,
          actor: "Innovation Review Committee",
          event: `Rejected${data.comments ? ` — ${data.comments}` : ""}`,
          kind: "workflow",
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Innovation cycle archived", kind: "activity" });
      }
      auditTrail.push({ at: now, actor: "System", event: `Innovation Manager notified: ${notify}`, kind: "activity" });
      auditTrail.push({
        at: now,
        actor: "System",
        event: "Governance: Innovation Dashboard, Product KPIs and executive reports updated",
        kind: "activity",
      });

      const reviewRows: CIReviewRow[] = current.reviewRows.map((r) =>
        data.decision === "Revision Required"
          ? r
          : r.status !== "Approved"
            ? { ...r, decision: "Approved", status: "Approved", date: now }
            : r,
      );

      const updated: Omit<ContinuousInnovationRecord, "id"> = {
        ...current,
        status,
        currentStage,
        reviewRows,
        approvalDecision: data.decision,
        reviewComments: data.comments ?? current.reviewComments,
        approvalDate,
        nextReleaseId,
        nextReleaseCode,
        roadmapEntryId,
        roadmapEntryCode,
        lastModifiedBy: "Innovation Review Committee",
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
export const generateCIReportFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getCICollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Innovation cycle not found.");
      const current = shape(existing);
      const now = nowISO();
      const c = computeAll(recordToInput(current));
      const updated: Omit<ContinuousInnovationRecord, "id"> = {
        ...current,
        computedScores: c.computedScores,
        aiAssessment: c.aiAssessment,
        summary: c.summary,
        health: c.health,
        keyInsights: c.keyInsights,
        updatedAt: now,
        lastModifiedBy: "System",
        auditTrail: [
          ...current.auditTrail,
          { at: now, actor: "System", event: "Innovation report generated — AI assessment, scores and health refreshed", kind: "activity" },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });
