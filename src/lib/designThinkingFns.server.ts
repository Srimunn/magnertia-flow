import { createServerFn } from "@tanstack/react-start";
import type {
  DesignStageState,
  DesignThinkingFormInput,
  DesignThinkingListRow,
  DesignThinkingLookups,
  DesignThinkingRecord,
  DesignThinkingStage,
  DesignThinkingStatus,
  DTAIAssistant,
  DTAssessment,
  DTOpportunityGlance,
  ProblemValidationRecord,
} from "@/services/types";

/* ===========================================================================
   Design Thinking — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   Workflow from the sequence diagram, as real state:

     Approved Opportunity ──▶ create project (prefills from Idea + Opportunity)
       Empathize ─▶ Define ─▶ Ideate ─▶ Prototype ─▶ Test      (each stage:
         complete-stage triggers the stage's AI analysis)
       ──Submit for Review──▶ under_review
             ├─ Approved  ▶ +Problem Validation project
             ├─ Revision Required ▶ returns to the named stage
             └─ Rejected ▶ archived

   Stage gating is enforced server-side: a stage can only be completed once its
   predecessor is completed. Every "AI" output is deterministic — no LLM.
   =========================================================================== */

async function getDTCollection() {
  const mod = await import("./mongodb.server");
  return mod.getDesignThinkingCollection();
}
async function getOpportunitiesCollection() {
  const mod = await import("./mongodb.server");
  return mod.getOpportunitiesCollection();
}
async function getProblemValidationCollection() {
  const mod = await import("./mongodb.server");
  return mod.getProblemValidationCollection();
}
async function newObjectId(id: string) {
  const mod = await import("./mongodb.server");
  return new mod.ObjectId(id);
}

export const CURRENT_USER = "Priya Sharma";

const nowISO = () => new Date().toISOString();
const clamp = (n: number, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, n));
const r1 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 10) / 10;
const filled = (s: string | undefined | null) => Boolean(s && String(s).trim());

export const STAGE_ORDER: DesignThinkingStage[] = [
  "empathize",
  "define",
  "ideate",
  "prototype",
  "test",
];
const STAGE_LABEL: Record<DesignThinkingStage, string> = {
  empathize: "Empathize",
  define: "Define",
  ideate: "Ideate",
  prototype: "Prototype",
  test: "Test",
};

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: DesignThinkingLookups = {
  customerTypes: [
    "Individual Customer",
    "Enterprise",
    "MSME",
    "Government",
    "OEM",
    "Fleet Operator",
    "Dealer",
    "Distributor",
    "Startup",
    "Research Institution",
    "Manufacturing Companies",
  ],
  testingMethods: [
    "Customer Interview",
    "Observation",
    "Prototype Demonstration",
    "Field Trial",
    "Pilot Deployment",
    "Focus Group",
    "Survey",
    "A/B Testing",
    "Usability Testing",
  ],
  prototypeTypes: [
    "Paper Prototype",
    "Sketch",
    "Wireframe",
    "CAD Model",
    "3D Printed Model",
    "Functional Prototype",
    "Engineering Prototype",
    "Alpha Prototype",
    "Beta Prototype",
    "MVP",
  ],
  innovationLevels: ["Incremental", "Moderate", "Radical", "Disruptive"],
  testResults: ["Passed", "Passed with Improvements", "Needs Iteration", "Failed", "Rejected"],
  recommendations: [
    "Proceed to Problem Validation",
    "Proceed to Feasibility Study",
    "Revise Prototype",
    "Conduct Additional User Research",
    "Return to Ideation",
    "Archive",
  ],
  technologies: [
    "Artificial Intelligence",
    "IoT",
    "Cloud Computing",
    "Edge Computing",
    "Machine Learning",
    "Digital Twin",
    "Robotics",
    "Materials Science",
  ],
  facilitators: ["Priya Sharma", "Rohit Verma", "Arjun Mehta", "Neha Kapoor", "Divya Nair"],
  projects: [
    "R&D-2026-045: Smart Mobility Platform",
    "R&D-2026-051: Battery Analytics",
    "R&D-2026-062: Charging Network AI",
    "Unassigned",
  ],
  businessUnits: [
    "Smart Manufacturing",
    "EV Powertrain",
    "Battery Systems",
    "Charging Infrastructure",
    "Corporate",
  ],
  departments: ["R&D", "Research & Innovation Development", "Engineering", "Product Management"],
  attachmentCategories: [
    "Empathy Maps",
    "Customer Journey Maps",
    "Brainstorm Photos",
    "Whiteboard Images",
    "Prototype Drawings",
    "CAD Models",
    "Test Videos",
    "Customer Interviews",
    "Design Documents",
  ],
};

const INNOVATION_LEVEL_SCORE: Record<string, number> = {
  Incremental: 4,
  Moderate: 6,
  Radical: 8.5,
  Disruptive: 10,
};
const TEST_RESULT_SCORE: Record<string, number> = {
  Passed: 10,
  "Passed with Improvements": 8,
  "Needs Iteration": 5,
  Failed: 2,
  Rejected: 1,
};

/* ------------------------- Assessment (calculated) ------------------------ */
function computeAssessment(
  input: DesignThinkingFormInput,
  glance: DTOpportunityGlance | null,
): DTAssessment {
  const e = input.empathize;
  const d = input.define;
  const i = input.ideate;
  const p = input.prototype;
  const t = input.test;

  // Customer value: how well the customer is understood + validated satisfaction.
  const empathyDepth =
    [
      e.targetPersona,
      e.userJourney,
      e.customerGoals,
      e.painPoints,
      e.frustrations,
      e.interviewSummary,
    ].filter(filled).length / 6;
  const customerValueScore = clamp(
    r1(
      0.4 * (i.estimatedCustomerValue || 0) +
        0.3 * empathyDepth * 10 +
        0.3 * (t.satisfactionScore || 0),
    ),
  );

  // Innovation: chosen innovation level + novelty of tech + idea volume.
  const ideaVolume = Math.min((i.totalIdeasGenerated || 0) / 30, 1) * 10;
  const innovationScore = clamp(
    r1(
      0.5 * (INNOVATION_LEVEL_SCORE[i.innovationLevel] ?? 5) +
        0.25 * Math.min(i.technologyUsed.length * 2.5, 10) +
        0.25 * ideaVolume,
    ),
  );

  // Technical feasibility: prototype maturity + test outcome − cost/duration drag.
  const prototypeMaturity = filled(p.prototypeType)
    ? p.prototypeType.includes("Functional") ||
      p.prototypeType.includes("Engineering") ||
      p.prototypeType.includes("MVP")
      ? 9
      : 6
    : 4;
  const durationDrag = Math.min((p.estimatedDuration || 0) / 180, 1) * 3;
  const technicalFeasibility = clamp(
    r1(0.5 * prototypeMaturity + 0.5 * (TEST_RESULT_SCORE[t.testResult] ?? 5) - durationDrag),
  );

  // Business feasibility: estimated business value + opportunity score + cost sanity.
  const oppScore10 = glance ? glance.overallOpportunityScore / 10 : 5;
  const businessFeasibility = clamp(r1(0.5 * (i.estimatedBusinessValue || 0) + 0.5 * oppScore10));

  // Market potential: driven by the linked opportunity's market read.
  const marketPotential = clamp(
    r1(
      glance
        ? oppScore10 * 0.7 +
            (glance.marketPotential === "High" ? 3 : glance.marketPotential === "Medium" ? 2 : 1)
        : 5,
    ),
  );

  // ESG: sustainability signals in the define/ideate text.
  const esgText = `${d.businessImpact} ${d.opportunityStatement} ${i.selectedIdea}`.toLowerCase();
  const esgHits = ["sustain", "energy", "carbon", "waste", "safety", "emission", "efficien"].filter(
    (k) => esgText.includes(k),
  ).length;
  const esgImpact = clamp(r1(4 + esgHits * 1.5));

  const overallDesignScore = clamp(
    r1(
      0.25 * customerValueScore +
        0.2 * innovationScore +
        0.2 * technicalFeasibility +
        0.2 * businessFeasibility +
        0.1 * marketPotential +
        0.05 * esgImpact,
    ),
  );

  return {
    customerValueScore,
    innovationScore,
    technicalFeasibility,
    businessFeasibility,
    marketPotential,
    esgImpact,
    overallDesignScore,
  };
}

/* ------------------------- AI assistant (deterministic) ------------------- */
function computeAI(
  input: DesignThinkingFormInput,
  assessment: DTAssessment,
  glance: DTOpportunityGlance | null,
): DTAIAssistant {
  const e = input.empathize;
  const d = input.define;
  const i = input.ideate;
  const p = input.prototype;
  const t = input.test;

  const personaBits = [
    e.targetPersona && `persona "${e.targetPersona}"`,
    e.customerType && `segment ${e.customerType}`,
  ]
    .filter(Boolean)
    .join(", ");
  const personaAnalysis = personaBits
    ? `Identified key ${personaBits}. Primary goals centre on ${e.customerGoals ? e.customerGoals.slice(0, 90) : "efficiency and cost reduction"}.`
    : "Add a target persona and customer type to generate persona analysis.";

  const painCount = (e.painPoints || "").split(/[,\n.]/).filter((s) => s.trim()).length;
  const painPointAnalysis = filled(e.painPoints)
    ? `${painCount} distinct pain point(s) detected${filled(e.frustrations) ? ", plus recorded frustrations" : ""}. Highest impact: ${e.painPoints.slice(0, 80)}.`
    : "Capture pain points in Empathize to generate this analysis.";

  const suggestedIdeas = filled(i.selectedIdea)
    ? `${i.alternativeSolutions.length || 0} alternative solution(s) recorded alongside "${i.selectedIdea}". Innovation level assessed as ${i.innovationLevel || "unset"}.`
    : "Record a selected idea in Ideate to generate suggestions.";

  const alternativeSolutions = i.alternativeSolutions.length
    ? i.alternativeSolutions.join(" · ")
    : "No alternatives captured — consider recording at least two for comparison.";

  const prototypeSuggestions = filled(p.prototypeType)
    ? `${p.prototypeType} targeting "${p.prototypeObjective ? p.prototypeObjective.slice(0, 60) : "validation"}". ${
        (p.estimatedDuration || 0) > 90
          ? "Duration is long — consider a lighter-weight first iteration."
          : "Scope and duration look proportionate."
      }`
    : "Define a prototype type in Prototype to generate suggestions.";

  const risks: string[] = [];
  if (assessment.technicalFeasibility < 6) risks.push("technical feasibility is low");
  if ((p.estimatedCost || 0) > 1_000_000) risks.push("prototype cost is significant");
  if ((t.testParticipants || 0) > 0 && t.testParticipants < 10)
    risks.push("small test sample may limit confidence");
  if (assessment.businessFeasibility < 6) risks.push("business case needs strengthening");
  const riskAnalysis = risks.length
    ? `${risks.length > 2 ? "High" : "Medium"} risk: ${risks.join(", ")}.`
    : "Low risk — data quality and feasibility indicators are healthy.";

  const aiOpportunityScore = Math.round(
    clamp(assessment.overallDesignScore, 0, 10) * 8 +
      (glance ? glance.overallOpportunityScore * 0.2 : 10),
  );

  let recommendation: string;
  if (assessment.overallDesignScore >= 7.5) {
    recommendation = `Proceed to Problem Validation${filled(t.improvementSuggestions) ? " with prototype iteration on the recorded improvement suggestions" : ""}.`;
  } else if (assessment.overallDesignScore >= 5.5) {
    recommendation = "Viable concept — refine the prototype and re-test before advancing.";
  } else {
    recommendation = "Return to Ideation — the current concept does not yet meet the design bar.";
  }

  return {
    personaAnalysis,
    painPointAnalysis,
    suggestedIdeas,
    alternativeSolutions,
    prototypeSuggestions,
    riskAnalysis,
    aiOpportunityScore: Math.max(0, Math.min(100, aiOpportunityScore)),
    recommendation,
    generatedAt: nowISO(),
  };
}

function computeNextAction(status: DesignThinkingStatus, stage: DesignThinkingStage): string {
  switch (status) {
    case "draft":
      return `Start the ${STAGE_LABEL[stage]} stage`;
    case "in_progress":
      return `Complete the ${STAGE_LABEL[stage]} stage`;
    case "under_review":
      return "Awaiting design review decision";
    case "revision_required":
      return `Revise the ${STAGE_LABEL[stage]} stage and re-submit`;
    case "approved":
      return "Proceed to Problem Validation";
    case "rejected":
      return "Rejected — archived for reference";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

function initialStages(): DesignStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}

/* ------------------------------- Shaping --------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): DesignThinkingRecord {
  if (!doc) throw new Error("Design Thinking project not found.");
  const { _id, ...rest } = doc;
  return { ...(rest as Omit<DesignThinkingRecord, "id">), id: _id?.toString?.() ?? String(_id) };
}

function toListRow(r: DesignThinkingRecord): DesignThinkingListRow {
  return {
    id: r.id,
    formCode: r.formCode,
    designThinkingId: r.designThinkingId,
    projectName: r.projectName,
    status: r.status,
    currentStage: r.currentStage,
    facilitator: r.facilitator,
    linkedOpportunityCode: r.linkedOpportunityCode,
    linkedIdeaCode: r.linkedIdeaCode,
    overallDesignScore: r.assessment?.overallDesignScore ?? 0,
    updatedAt: r.updatedAt,
  };
}

/** Resolve the linked opportunity into the "At A Glance" summary. */
async function loadGlance(opportunityId: string | null): Promise<DTOpportunityGlance | null> {
  if (!opportunityId) return null;
  try {
    const coll = await getOpportunitiesCollection();
    const doc = await coll.findOne({ _id: await newObjectId(opportunityId) });
    if (!doc) return null;
    const marketReadiness = doc.market?.marketReadiness || "Medium";
    return {
      opportunityId,
      opportunityCode: doc.opportunityCode,
      name: doc.name,
      category: doc.information?.category ?? "",
      marketPotential: marketReadiness,
      strategicInitiative: doc.information?.strategicInitiative ?? "",
      overallOpportunityScore: doc.evaluation?.overallOpportunityScore ?? 0,
      ideaId: doc.sourceIdentification?.linkedIdeaId ?? null,
      ideaCode: doc.sourceIdentification?.linkedIdeaCode ?? null,
    };
  } catch {
    return null;
  }
}

/* ============================= Read endpoints ============================= */
export const getDesignThinkingLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getDesignThinkingListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getDTCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as DesignThinkingListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getDesignThinkingFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getDTCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Design Thinking project not found.");
      const record = shape(doc);
      const glance = await loadGlance(record.linkedOpportunityId);
      return { success: true as const, data: { record, glance } };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Only APPROVED opportunities can seed a Design Thinking project. */
export const getApprovedOpportunitiesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getOpportunitiesCollection();
    const docs = await coll.find({ status: "approved" }).toArray();
    const items = docs.map((d: Record<string, unknown>) => {
      const info = (d.information ?? {}) as Record<string, string>;
      const src = (d.sourceIdentification ?? {}) as Record<string, string | null>;
      const evalv = (d.evaluation ?? {}) as Record<string, number>;
      const market = (d.market ?? {}) as Record<string, string>;
      return {
        id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
        opportunityCode: d.opportunityCode as string,
        name: d.name as string,
        category: info.category ?? "",
        strategicInitiative: info.strategicInitiative ?? "",
        businessUnit: info.businessUnit ?? "",
        department: info.department ?? "",
        marketPotential: market.marketReadiness ?? "Medium",
        overallOpportunityScore: evalv.overallOpportunityScore ?? 0,
        ideaId: src.linkedIdeaId ?? null,
        ideaCode: src.linkedIdeaCode ?? null,
        customerNeed: (d.customer as Record<string, string>)?.customerNeed ?? "",
        painPoints: (d.customer as Record<string, string>)?.painPoints ?? "",
        targetCustomer: (d.customer as Record<string, string>)?.targetCustomer ?? "",
      };
    });
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ============================ Create / update ============================ */
export const saveDesignThinkingDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: DesignThinkingFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getDTCollection();
      const now = nowISO();
      const glance = await loadGlance(data.input.linkedOpportunityId);
      const assessment = computeAssessment(data.input, glance);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Design Thinking project not found.");
        const current = shape(existing);
        if (!["draft", "in_progress", "revision_required"].includes(current.status)) {
          throw new Error(`Project in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<DesignThinkingRecord, "id"> = {
          ...current,
          projectName: data.input.projectName,
          workshopDate: data.input.workshopDate,
          facilitator: data.input.facilitator,
          businessUnit: data.input.businessUnit,
          department: data.input.department,
          empathize: data.input.empathize,
          define: data.input.define,
          ideate: data.input.ideate,
          prototype: data.input.prototype,
          test: data.input.test,
          attachments: data.input.attachments,
          assessment,
          lastModifiedBy: CURRENT_USER,
          updatedAt: now,
          nextAction: computeNextAction(current.status, current.currentStage),
          auditTrail: [
            ...current.auditTrail,
            { at: now, actor: CURRENT_USER, event: "Draft saved", stage: current.currentStage },
          ],
        };
        await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
        return {
          success: true as const,
          data: { record: shape({ ...updated, _id: existing._id }), glance },
        };
      }

      if (!data.input.linkedOpportunityId) {
        throw new Error("A Design Thinking project must be created from an approved Opportunity.");
      }

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const formCode = `DT-${year}-${String(seq).padStart(5, "0")}`;
      const designThinkingId = `DT-${String(seq).padStart(6, "0")}`;

      const record: Omit<DesignThinkingRecord, "id"> = {
        formCode,
        designThinkingId,
        projectName: data.input.projectName,
        workshopDate: data.input.workshopDate,
        facilitator: data.input.facilitator,
        businessUnit: data.input.businessUnit,
        department: data.input.department,
        status: "in_progress",
        currentStage: "empathize",
        stages: initialStages(),
        version: 1,
        linkedOpportunityId: data.input.linkedOpportunityId,
        linkedOpportunityCode: glance?.opportunityCode ?? null,
        linkedIdeaId: glance?.ideaId ?? null,
        linkedIdeaCode: glance?.ideaCode ?? null,
        empathize: data.input.empathize,
        define: data.input.define,
        ideate: data.input.ideate,
        prototype: data.input.prototype,
        test: data.input.test,
        assessment,
        aiAssistant: null,
        attachments: data.input.attachments,
        reviewComments: null,
        nextAction: computeNextAction("in_progress", "empathize"),
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: `Design Thinking project ${formCode} created from ${glance?.opportunityCode ?? "opportunity"}`,
          },
          { at: now, actor: "System", event: "Idea, opportunity and customer context retrieved" },
          { at: now, actor: CURRENT_USER, event: "Empathize stage started", stage: "empathize" },
        ],
        problemValidationId: null,
        problemValidationCode: null,
      };
      const res = await coll.insertOne(record);
      return {
        success: true as const,
        data: { record: shape({ ...record, _id: res.insertedId }), glance },
      };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* =========================== Stage progression =========================== */
export const completeStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: DesignThinkingStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getDTCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Design Thinking project not found.");
      const current = shape(existing);
      if (!["draft", "in_progress", "revision_required"].includes(current.status)) {
        throw new Error(`Project in "${current.status}" cannot change stage.`);
      }

      const idx = STAGE_ORDER.indexOf(data.stage);
      if (idx === -1) throw new Error(`Unknown stage "${data.stage}".`);
      // Gate: the predecessor must be completed first.
      if (idx > 0) {
        const prev = current.stages.find((s) => s.stage === STAGE_ORDER[idx - 1]);
        if (prev?.status !== "completed") {
          throw new Error(`Complete the ${STAGE_LABEL[STAGE_ORDER[idx - 1]]} stage first.`);
        }
      }

      const now = nowISO();
      const nextStage = STAGE_ORDER[idx + 1] ?? data.stage;
      const stages: DesignStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });

      const input: DesignThinkingFormInput = {
        projectName: current.projectName,
        workshopDate: current.workshopDate,
        facilitator: current.facilitator,
        businessUnit: current.businessUnit,
        department: current.department,
        linkedOpportunityId: current.linkedOpportunityId,
        empathize: current.empathize,
        define: current.define,
        ideate: current.ideate,
        prototype: current.prototype,
        test: current.test,
        attachments: current.attachments,
      };
      const glance = await loadGlance(current.linkedOpportunityId);
      const assessment = computeAssessment(input, glance);
      // Completing a stage triggers that stage's AI analysis.
      const aiAssistant = computeAI(input, assessment, glance);

      const advanced = idx < STAGE_ORDER.length - 1;
      const updated: Omit<DesignThinkingRecord, "id"> = {
        ...current,
        stages,
        currentStage: advanced ? nextStage : data.stage,
        status: "in_progress",
        assessment,
        aiAssistant,
        nextAction: advanced
          ? computeNextAction("in_progress", nextStage)
          : "All stages complete — Submit for Review",
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: `${STAGE_LABEL[data.stage]} completed`,
            stage: data.stage,
          },
          {
            at: now,
            actor: "System",
            event: `AI ${STAGE_LABEL[data.stage]} analysis generated`,
            stage: data.stage,
          },
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
      return {
        success: true as const,
        data: { record: shape({ ...updated, _id: existing._id }), glance },
      };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** The "Generate AI Insights" quick action — recomputes the whole assistant panel. */
export const generateAIInsightsFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getDTCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Design Thinking project not found.");
      const current = shape(existing);
      const now = nowISO();
      const input: DesignThinkingFormInput = {
        projectName: current.projectName,
        workshopDate: current.workshopDate,
        facilitator: current.facilitator,
        businessUnit: current.businessUnit,
        department: current.department,
        linkedOpportunityId: current.linkedOpportunityId,
        empathize: current.empathize,
        define: current.define,
        ideate: current.ideate,
        prototype: current.prototype,
        test: current.test,
        attachments: current.attachments,
      };
      const glance = await loadGlance(current.linkedOpportunityId);
      const assessment = computeAssessment(input, glance);
      const aiAssistant = computeAI(input, assessment, glance);
      const updated: Omit<DesignThinkingRecord, "id"> = {
        ...current,
        assessment,
        aiAssistant,
        updatedAt: now,
        lastModifiedBy: CURRENT_USER,
        auditTrail: [
          ...current.auditTrail,
          { at: now, actor: "System", event: "AI insights generated", stage: current.currentStage },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return {
        success: true as const,
        data: { record: shape({ ...updated, _id: existing._id }), glance },
      };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Review workflow ============================ */
export const submitDesignThinkingFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getDTCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Design Thinking project not found.");
      const current = shape(existing);
      if (!["draft", "in_progress", "revision_required"].includes(current.status)) {
        throw new Error(`Project is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(
          `Complete all stages before submitting. Outstanding: ${incomplete.join(", ")}.`,
        );
      }

      const now = nowISO();
      const updated: Omit<DesignThinkingRecord, "id"> = {
        ...current,
        status: "under_review",
        nextAction: computeNextAction("under_review", current.currentStage),
        version: current.status === "revision_required" ? current.version + 1 : current.version,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "Submitted for Review",
            fromStatus: current.status,
            toStatus: "under_review",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      const glance = await loadGlance(current.linkedOpportunityId);
      return {
        success: true as const,
        data: { record: shape({ ...updated, _id: existing._id }), glance },
      };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewDesignThinkingFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: "Approved" | "Revision Required" | "Rejected";
      comments?: string;
      returnToStage?: DesignThinkingStage;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getDTCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Design Thinking project not found.");
      const current = shape(existing);
      if (current.status !== "under_review") {
        throw new Error(`Project is "${current.status}", not under review.`);
      }

      const now = nowISO();
      let status: DesignThinkingStatus = current.status;
      let currentStage = current.currentStage;
      let stages = current.stages;
      let problemValidationId = current.problemValidationId;
      let problemValidationCode = current.problemValidationCode;
      const auditTrail = [...current.auditTrail];

      if (data.decision === "Approved") {
        status = "approved";
        const pvColl = await getProblemValidationCollection();
        const pvCount = await pvColl.countDocuments();
        const projectCode = `PV-${String(pvCount + 1).padStart(5, "0")}`;
        const pv: Omit<ProblemValidationRecord, "id"> = {
          projectCode,
          designThinkingId: current.id,
          designThinkingCode: current.formCode,
          title: current.projectName || current.formCode,
          createdAt: now,
          status: "Initiated",
        };
        const pvRes = await pvColl.insertOne(pv);
        problemValidationId = pvRes.insertedId?.toString?.() ?? projectCode;
        problemValidationCode = projectCode;
        auditTrail.push({
          at: now,
          actor: "Innovation Committee",
          event: "Design review: Approved",
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Problem Validation project ${projectCode} created`,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Innovation dashboard and KPI reports updated",
        });
      } else if (data.decision === "Revision Required") {
        status = "revision_required";
        const back = data.returnToStage ?? "ideate";
        currentStage = back;
        // Reopen the returned-to stage and everything after it.
        const backIdx = STAGE_ORDER.indexOf(back);
        stages = current.stages.map((s) => {
          const i = STAGE_ORDER.indexOf(s.stage);
          if (i === backIdx) return { ...s, status: "in_progress", completedAt: null };
          if (i > backIdx) return { ...s, status: "pending", startedAt: null, completedAt: null };
          return s;
        });
        auditTrail.push({
          at: now,
          actor: "Design Review",
          event: `Design review: Revision Required — returned to ${STAGE_LABEL[back]}${data.comments ? ` (${data.comments})` : ""}`,
          stage: back,
          fromStatus: current.status,
          toStatus: status,
        });
      } else {
        status = "rejected";
        auditTrail.push({
          at: now,
          actor: "Design Review",
          event: `Design review: Rejected${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Project archived to repository" });
      }

      const updated: Omit<DesignThinkingRecord, "id"> = {
        ...current,
        status,
        currentStage,
        stages,
        reviewComments: data.comments ?? current.reviewComments,
        problemValidationId,
        problemValidationCode,
        nextAction: computeNextAction(status, currentStage),
        lastModifiedBy: "Design Review",
        updatedAt: now,
        auditTrail,
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      const glance = await loadGlance(current.linkedOpportunityId);
      return {
        success: true as const,
        data: { record: shape({ ...updated, _id: existing._id }), glance },
      };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });
