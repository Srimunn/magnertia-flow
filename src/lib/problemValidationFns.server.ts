import { createServerFn } from "@tanstack/react-start";
import type {
  FeasibilityProjectRecord,
  ProblemValidationFormInput,
  ProblemValidationListRow,
  ProblemValidationLookups,
  ProblemValidationRecord2,
  ProblemValidationStatus,
  PVAIValidation,
  PVDesignThinkingGlance,
  PVReviewer,
  PVStage,
  PVStageState,
  PVSummary,
  PVValidationDecision,
} from "@/services/types";

/* ===========================================================================
   Problem Validation — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   Approved Design Thinking ─▶ create PV record (prefills from DT + Opportunity)
     Problem Definition ─▶ Customer ─▶ Market ─▶ Technical ─▶ Business
       (completing a stage triggers that stage's deterministic AI analysis)
     ──Submit for Review──▶ under_review
           ├─ Validated ▶ +Feasibility Study (archives elsewhere) ─ notifies
           ├─ More Research Required ▶ editable again
           ├─ Revision Required ▶ editable again
           └─ Validation Failed ▶ archived

   AI (section 8) and Summary (section 9) are one computed source, reused by the
   sidebar. No LLM; every score is a function of the entered fields.
   =========================================================================== */

async function getPVCollection() {
  const mod = await import("./mongodb.server");
  return mod.getProblemValidationFullCollection();
}
async function getDTCollection() {
  const mod = await import("./mongodb.server");
  return mod.getDesignThinkingCollection();
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
const round = (n: number) => Math.round(Number.isFinite(n) ? n : 0);
const filled = (s: string | undefined | null) => Boolean(s && String(s).trim());

const STAGE_ORDER: PVStage[] = [
  "problem_definition",
  "customer_validation",
  "market_validation",
  "technical_validation",
  "business_validation",
];
const STAGE_LABEL: Record<PVStage, string> = {
  problem_definition: "Problem Definition",
  customer_validation: "Customer Validation",
  market_validation: "Market Validation",
  technical_validation: "Technical Validation",
  business_validation: "Business Validation",
};

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: ProblemValidationLookups = {
  problemCategories: [
    "Customer Experience",
    "Product",
    "Manufacturing",
    "Process",
    "Technology",
    "Quality",
    "Cost",
    "Safety",
    "Environmental",
    "Regulatory",
    "Supply Chain",
    "Business Model",
    "Digital Transformation",
    "Sustainability",
  ],
  problemSubCategories: [
    "Equipment Maintenance",
    "Downtime",
    "Quality Control",
    "Energy Use",
    "Logistics",
    "Analytics",
  ],
  industries: ["Manufacturing", "Automotive", "Energy", "Logistics", "Industrial"],
  customerSegments: ["Mid to Large Enterprises", "SME", "Enterprise", "Public Sector", "Retail"],
  businessAreas: ["Operations", "Engineering", "Supply Chain", "Sales & Service", "Quality"],
  geographicRegions: ["India", "APAC", "EMEA", "North America", "Global"],
  problemSources: [
    "Customer Interview",
    "Customer Complaint",
    "Market Research",
    "Field Observation",
    "Sales Team",
    "Service Team",
    "Manufacturing Team",
    "Internal Audit",
    "Competitor Analysis",
    "Government Policy",
    "Research Publication",
    "AI Recommendation",
  ],
  targetCustomers: [
    "Manufacturing Companies",
    "Fleet Operators",
    "Utilities",
    "Government Bodies",
    "Consumers",
  ],
  frequencies: [
    "Every Transaction",
    "Daily",
    "Weekly",
    "Monthly",
    "Quarterly",
    "Occasionally",
    "Rarely",
  ],
  technologyReadinessLevels: [
    "Unknown",
    "Existing Technology Available",
    "Minor Development Required",
    "Moderate Development Required",
    "Major R&D Required",
    "Breakthrough Technology Required",
  ],
  technicalComplexities: ["Very Low", "Low", "Medium", "High", "Very High"],
  businessPriorities: ["Critical", "High", "Medium", "Low"],
  validationDecisions: [
    "Validated",
    "Partially Validated",
    "Validation Failed",
    "More Research Required",
    "Put on Hold",
  ],
  nextActions: [
    "Feasibility Study",
    "Additional Customer Research",
    "Return to Design Thinking",
    "Return to Opportunity Discovery",
    "Archive Opportunity",
    "Conduct Market Survey",
    "Technical Investigation",
  ],
  expertise: [
    "AI/ML",
    "IoT",
    "Data Engineering",
    "Domain Expert",
    "Cloud",
    "Mechanical",
    "Materials",
  ],
  validationLeads: ["Priya Sharma", "Rohit Verma", "Neha Sharma", "Vikram Singh", "Arjun Mehta"],
  businessUnits: [
    "Smart Manufacturing",
    "EV Powertrain",
    "Battery Systems",
    "Charging Infrastructure",
    "Corporate",
  ],
  departments: ["R&D", "Research & Innovation Development", "Engineering", "Product Management"],
  attachmentCategories: [
    "Interview Records",
    "Survey Results",
    "Market Reports",
    "Research Papers",
    "Observation Photos",
    "Videos",
    "Presentation",
    "Supporting Documents",
  ],
};

const READINESS_COMPLEXITY: Record<string, number> = {
  Unknown: 60,
  "Existing Technology Available": 20,
  "Minor Development Required": 35,
  "Moderate Development Required": 55,
  "Major R&D Required": 80,
  "Breakthrough Technology Required": 95,
};
const COMPLEXITY_SCORE: Record<string, number> = {
  "Very Low": 20,
  Low: 35,
  Medium: 55,
  High: 75,
  "Very High": 92,
};
const PRIORITY_SCORE: Record<string, number> = { Critical: 100, High: 85, Medium: 60, Low: 35 };

/* ---------------------- AI + summary (single computation) ----------------- */
function tamScore(value: number): number {
  return value <= 0 ? 20 : clamp((Math.log10(value) / 12) * 100);
}

function computeAI(input: ProblemValidationFormInput): PVAIValidation {
  const ia = input.impactAssessment;
  const cv = input.customerValidation;
  const mv = input.marketValidation;
  const bv = input.businessValidation;
  const tv = input.technicalValidation;
  const pe = input.problemEvidence;

  // Problem severity: impact ratings + evidence completeness + productivity/time loss.
  const impactAvg =
    (ia.customerImpact + ia.qualityImpact + ia.safetyImpact + ia.regulatoryImpact) / 4;
  const evidenceDepth =
    [pe.existingSolution, pe.currentProcess, pe.rootCause, pe.supportingData, pe.fieldNotes].filter(
      filled,
    ).length / 5;
  const problemSeverityScore = clamp(
    round(
      0.5 * impactAvg * 10 +
        0.25 * evidenceDepth * 100 +
        0.25 * clamp(ia.productivityLoss * 2, 0, 100),
    ),
  );

  // Customer validation: interviews/surveys/observations volume + pain level.
  const interviewScore = clamp((cv.numberOfInterviews / 20) * 100);
  const surveyScore = clamp((cv.surveyResponses / 200) * 100);
  const obsScore = clamp((cv.observationSessions / 10) * 100);
  const customerValidationScore = clamp(
    round(
      0.3 * interviewScore +
        0.25 * surveyScore +
        0.15 * obsScore +
        0.3 * (cv.customerPainLevel || 0) * 10,
    ),
  );

  // Market validation: market size + growth + customers affected.
  const marketValidationScore = clamp(
    round(
      0.5 * tamScore(mv.marketSize) +
        0.25 * clamp((mv.growthRate / 40) * 100) +
        0.25 * clamp((mv.customersAffected / 5000) * 100),
    ),
  );

  // Business value: revenue + cost saving + strategic alignment + priority.
  const revScore = tamScore(bv.revenueOpportunity + bv.costSavingOpportunity);
  const businessValueScore = clamp(
    round(
      0.4 * revScore +
        0.3 * (bv.strategicAlignment || 0) * 10 +
        0.3 * (PRIORITY_SCORE[bv.businessPriority] ?? 50),
    ),
  );

  // Technical complexity: complexity dropdown + readiness + stated gap (higher = harder).
  const technicalComplexityScore = clamp(
    round(
      0.5 * (COMPLEXITY_SCORE[tv.technicalComplexity] ?? 55) +
        0.35 * (READINESS_COMPLEXITY[tv.technologyReadiness] ?? 55) +
        (filled(tv.technologyGap) ? 10 : 0),
    ),
  );

  // Overall = validation strength net of technical complexity.
  const overallValidationScore = clamp(
    round(
      0.25 * problemSeverityScore +
        0.25 * customerValidationScore +
        0.2 * marketValidationScore +
        0.2 * businessValueScore +
        0.1 * (100 - technicalComplexityScore),
    ),
  );

  const recParts: string[] = [];
  if (overallValidationScore >= 75)
    recParts.push(
      "Strong problem validation with high business potential. Proceed to feasibility study.",
    );
  else if (overallValidationScore >= 55)
    recParts.push("Problem is validated but needs additional evidence before advancing.");
  else
    recParts.push("Weak validation — gather more customer and market evidence before proceeding.");
  if (technicalComplexityScore >= 75)
    recParts.push("Technical complexity is high; plan a focused technical investigation.");

  const improvements: string[] = [];
  if (cv.numberOfInterviews < 10) improvements.push("Increase customer interview sample size.");
  if (cv.surveyResponses < 100) improvements.push("Collect more quantitative survey data.");
  if (!filled(mv.existingCompetitors)) improvements.push("Benchmark competitor solutions.");
  if (!filled(pe.supportingData)) improvements.push("Add supporting downtime / usage data.");
  if (mv.customersAffected < 100)
    improvements.push("Validate the problem across more customers / industries.");
  if (improvements.length === 0) improvements.push("Evidence base is solid — no gaps detected.");

  return {
    problemSeverityScore,
    customerValidationScore,
    marketValidationScore,
    businessValueScore,
    technicalComplexityScore,
    overallValidationScore,
    recommendation: recParts.join(" "),
    suggestedImprovements: improvements,
    generatedAt: nowISO(),
  };
}

function decisionFromScore(score: number): PVValidationDecision {
  if (score >= 75) return "Validated";
  if (score >= 60) return "Partially Validated";
  if (score >= 45) return "More Research Required";
  return "Validation Failed";
}

/** Section 9 summary derived from the AI scores (single source of truth). */
function computeSummary(ai: PVAIValidation, decision?: PVValidationDecision): PVSummary {
  return {
    problemSeverity: ai.problemSeverityScore,
    customerDemandScore: ai.customerValidationScore,
    marketOpportunityScore: ai.marketValidationScore,
    technicalFeasibilityScore: clamp(100 - ai.technicalComplexityScore),
    businessPotentialScore: ai.businessValueScore,
    overallValidationScore: ai.overallValidationScore,
    validationDecision: decision ?? decisionFromScore(ai.overallValidationScore),
  };
}

function validationBand(score: number): string {
  if (score >= 80) return "Strongly Validated";
  if (score >= 65) return "Validated";
  if (score >= 50) return "Partially Validated";
  return "Needs More Evidence";
}

function computeNextAction(status: ProblemValidationStatus, stage: PVStage): string {
  switch (status) {
    case "draft":
    case "in_progress":
      return `Complete the ${STAGE_LABEL[stage]} stage`;
    case "under_review":
      return "Awaiting management review";
    case "more_research_required":
      return "Conduct additional research and re-submit";
    case "revision_required":
      return "Revise the flagged areas and re-submit";
    case "validated":
      return "Proceed to Feasibility Study";
    case "validation_failed":
      return "Validation failed — archived for reference";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

function initialStages(): PVStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function initialReviewers(): PVReviewer[] {
  return [
    { role: "Innovation Manager", name: "Rohit Verma", status: "pending" },
    { role: "Technical Reviewer", name: "Neha Sharma", status: "pending" },
    { role: "Business Reviewer", name: "Vikram Singh", status: "pending" },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): ProblemValidationRecord2 {
  if (!doc) throw new Error("Problem Validation record not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<ProblemValidationRecord2, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}
function toListRow(r: ProblemValidationRecord2): ProblemValidationListRow {
  return {
    id: r.id,
    formCode: r.formCode,
    problemValidationId: r.problemValidationId,
    problemTitle: r.problemInfo.problemTitle,
    status: r.status,
    currentStage: r.currentStage,
    validationLead: r.validationLead,
    linkedDesignThinkingCode: r.linkedDesignThinkingCode,
    overallValidationScore: r.summary?.overallValidationScore ?? 0,
    validationRank: r.validationRank ?? 0,
    updatedAt: r.updatedAt,
  };
}

async function reassignRanks() {
  const coll = await getPVCollection();
  const docs = await coll.find({}).toArray();
  const all: ProblemValidationRecord2[] = docs.map((d: unknown) => shape(d));
  const scored = all
    .filter((o) => o.summary)
    .sort(
      (a, b) => (b.summary!.overallValidationScore ?? 0) - (a.summary!.overallValidationScore ?? 0),
    );
  for (let i = 0; i < scored.length; i++) {
    const rank = i + 1;
    if (scored[i].validationRank === rank) continue;
    const { id, ...body } = { ...scored[i], validationRank: rank };
    await coll.updateOne({ _id: await newObjectId(id) }, { $set: body });
  }
}

/* ------------------------------ DT glance --------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dtGlance(doc: any): PVDesignThinkingGlance {
  return {
    designThinkingId: doc._id?.toString?.() ?? String(doc._id),
    designThinkingCode: doc.formCode,
    projectName: doc.projectName ?? "",
    opportunityId: doc.linkedOpportunityId ?? null,
    opportunityCode: doc.linkedOpportunityCode ?? null,
    ideaId: doc.linkedIdeaId ?? null,
    ideaCode: doc.linkedIdeaCode ?? null,
  };
}

/* ============================= Read endpoints ============================= */
export const getPVLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getPVListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getPVCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as ProblemValidationListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getPVFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPVCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Problem Validation record not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Approved Design Thinking projects available to seed a Problem Validation. */
export const getApprovedDesignThinkingFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getDTCollection();
    const docs = await coll.find({ status: "approved" }).toArray();
    const items = docs.map((d: Record<string, unknown>) => {
      const define = (d.define ?? {}) as Record<string, string>;
      const test = (d.test ?? {}) as Record<string, unknown>;
      return {
        id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
        designThinkingCode: d.formCode as string,
        projectName: d.projectName as string,
        opportunityId: (d.linkedOpportunityId as string) ?? null,
        opportunityCode: (d.linkedOpportunityCode as string) ?? null,
        ideaId: (d.linkedIdeaId as string) ?? null,
        ideaCode: (d.linkedIdeaCode as string) ?? null,
        problemStatement: define.problemStatement ?? "",
        rootCause: define.rootCause ?? "",
        customerNeed: define.customerNeed ?? "",
        businessImpact: define.businessImpact ?? "",
        satisfactionScore: (test.satisfactionScore as number) ?? 0,
      };
    });
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ============================ Create / update ============================ */
export const savePVDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: ProblemValidationFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPVCollection();
      const now = nowISO();
      const ai = computeAI(data.input);
      const summary = computeSummary(ai);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Problem Validation record not found.");
        const current = shape(existing);
        if (
          !["draft", "in_progress", "more_research_required", "revision_required"].includes(
            current.status,
          )
        ) {
          throw new Error(`Record in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<ProblemValidationRecord2, "id"> = {
          ...current,
          validationLead: data.input.validationLead,
          validationDate: data.input.validationDate,
          businessUnit: data.input.businessUnit,
          department: data.input.department,
          problemInfo: data.input.problemInfo,
          customerValidation: data.input.customerValidation,
          problemEvidence: data.input.problemEvidence,
          impactAssessment: data.input.impactAssessment,
          marketValidation: data.input.marketValidation,
          technicalValidation: data.input.technicalValidation,
          businessValidation: data.input.businessValidation,
          attachments: data.input.attachments,
          aiValidation: ai,
          summary: {
            ...summary,
            validationDecision: current.summary?.validationDecision ?? summary.validationDecision,
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
        return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
      }

      if (!data.input.linkedDesignThinkingId) {
        throw new Error(
          "A Problem Validation record must be created from a completed Design Thinking project.",
        );
      }
      const dtColl = await getDTCollection();
      const dtDoc = await dtColl.findOne({
        _id: await newObjectId(data.input.linkedDesignThinkingId),
      });
      if (!dtDoc) throw new Error("Linked Design Thinking project not found.");
      const glance = dtGlance(dtDoc);

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const formCode = `PV-${year}-${String(seq).padStart(5, "0")}`;
      const problemValidationId = `PV-${String(seq).padStart(5, "0")}`;

      const record: Omit<ProblemValidationRecord2, "id"> = {
        formCode,
        problemValidationId,
        status: "in_progress",
        currentStage: "problem_definition",
        stages: initialStages(),
        version: 1,
        project: dtDoc.projectName ?? "",
        validationLead: data.input.validationLead,
        validationDate: data.input.validationDate,
        businessUnit: data.input.businessUnit,
        department: data.input.department,
        linkedDesignThinkingId: glance.designThinkingId,
        linkedDesignThinkingCode: glance.designThinkingCode,
        linkedOpportunityId: glance.opportunityId,
        linkedOpportunityCode: glance.opportunityCode,
        linkedIdeaId: glance.ideaId,
        linkedIdeaCode: glance.ideaCode,
        problemInfo: data.input.problemInfo,
        customerValidation: data.input.customerValidation,
        problemEvidence: data.input.problemEvidence,
        impactAssessment: data.input.impactAssessment,
        marketValidation: data.input.marketValidation,
        technicalValidation: data.input.technicalValidation,
        businessValidation: data.input.businessValidation,
        aiValidation: ai,
        summary,
        attachments: data.input.attachments,
        reviewers: initialReviewers(),
        validationRank: 0,
        reviewComments: null,
        approvalDate: null,
        nextAction: computeNextAction("in_progress", "problem_definition"),
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: `Problem Validation ${formCode} created from ${glance.designThinkingCode}`,
          },
          {
            at: now,
            actor: "System",
            event: "Design Thinking insights, customer and market context retrieved",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Problem Definition stage started",
            stage: "problem_definition",
          },
        ],
        feasibilityProjectId: null,
        feasibilityProjectCode: null,
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
export const completePVStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: PVStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPVCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Problem Validation record not found.");
      const current = shape(existing);
      if (
        !["draft", "in_progress", "more_research_required", "revision_required"].includes(
          current.status,
        )
      ) {
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
      const stages: PVStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });

      const input = recordToInput(current);
      const ai = computeAI(input);
      const summary = computeSummary(ai, current.summary?.validationDecision);

      const updated: Omit<ProblemValidationRecord2, "id"> = {
        ...current,
        stages,
        currentStage: advanced ? nextStage : data.stage,
        status: "in_progress",
        aiValidation: ai,
        summary,
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
      await reassignRanks();
      const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

function recordToInput(r: ProblemValidationRecord2): ProblemValidationFormInput {
  return {
    validationLead: r.validationLead,
    validationDate: r.validationDate,
    businessUnit: r.businessUnit,
    department: r.department,
    linkedDesignThinkingId: r.linkedDesignThinkingId,
    problemInfo: r.problemInfo,
    customerValidation: r.customerValidation,
    problemEvidence: r.problemEvidence,
    impactAssessment: r.impactAssessment,
    marketValidation: r.marketValidation,
    technicalValidation: r.technicalValidation,
    businessValidation: r.businessValidation,
    attachments: r.attachments,
  };
}

export const generatePVReportFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPVCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Problem Validation record not found.");
      const current = shape(existing);
      const now = nowISO();
      const ai = computeAI(recordToInput(current));
      const summary = computeSummary(ai, current.summary?.validationDecision);
      const updated: Omit<ProblemValidationRecord2, "id"> = {
        ...current,
        aiValidation: ai,
        summary,
        updatedAt: now,
        lastModifiedBy: CURRENT_USER,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: "System",
            event: "AI validation report generated",
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

/* ============================ Review workflow ============================ */
export const submitPVFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPVCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Problem Validation record not found.");
      const current = shape(existing);
      if (
        !["draft", "in_progress", "more_research_required", "revision_required"].includes(
          current.status,
        )
      ) {
        throw new Error(`Record is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(
          `Complete all validation stages first. Outstanding: ${incomplete.join(", ")}.`,
        );
      }
      const now = nowISO();
      const updated: Omit<ProblemValidationRecord2, "id"> = {
        ...current,
        status: "under_review",
        version: ["more_research_required", "revision_required"].includes(current.status)
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
            event: "Submitted validation report for review",
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

export const reviewPVFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: "Validated" | "More Research Required" | "Revision Required" | "Validation Failed";
      comments?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getPVCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Problem Validation record not found.");
      const current = shape(existing);
      if (current.status !== "under_review") {
        throw new Error(`Record is "${current.status}", not under review.`);
      }
      const now = nowISO();
      let status: ProblemValidationStatus = current.status;
      let feasibilityProjectId = current.feasibilityProjectId;
      let feasibilityProjectCode = current.feasibilityProjectCode;
      let approvalDate = current.approvalDate;
      const auditTrail = [...current.auditTrail];
      const decisionMap: Record<string, PVValidationDecision> = {
        Validated: "Validated",
        "More Research Required": "More Research Required",
        "Revision Required": "Revision Required",
        "Validation Failed": "Validation Failed",
      };

      if (data.decision === "Validated") {
        status = "validated";
        approvalDate = now;
        const fpColl = await getFeasibilityProjectsCollection();
        const fpCount = await fpColl.countDocuments();
        const projectCode = `FSP-${String(fpCount + 1).padStart(5, "0")}`;
        const fp: Omit<FeasibilityProjectRecord, "id"> = {
          projectCode,
          ideaId: current.linkedIdeaId ?? current.id,
          ideaCode: current.linkedIdeaCode ?? current.formCode,
          title: current.problemInfo.problemTitle || current.formCode,
          createdAt: now,
          status: "Initiated",
        };
        const fpRes = await fpColl.insertOne(fp);
        feasibilityProjectId = fpRes.insertedId?.toString?.() ?? projectCode;
        feasibilityProjectCode = projectCode;
        auditTrail.push({
          at: now,
          actor: "Innovation Committee",
          event: "Validation approved — Validated",
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Feasibility Study ${projectCode} created`,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Innovation dashboard and KPI reports updated",
        });
      } else if (data.decision === "More Research Required") {
        status = "more_research_required";
        auditTrail.push({
          at: now,
          actor: "Management Review",
          event: `More research required${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
      } else if (data.decision === "Revision Required") {
        status = "revision_required";
        auditTrail.push({
          at: now,
          actor: "Management Review",
          event: `Revision required${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
      } else {
        status = "validation_failed";
        auditTrail.push({
          at: now,
          actor: "Management Review",
          event: `Validation failed${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Record archived to repository" });
      }

      const reviewers: PVReviewer[] = current.reviewers.map((r) => ({
        ...r,
        status: data.decision === "Validated" ? "approved" : r.status,
      }));

      const updated: Omit<ProblemValidationRecord2, "id"> = {
        ...current,
        status,
        reviewers,
        reviewComments: data.comments ?? current.reviewComments,
        approvalDate,
        summary: current.summary
          ? { ...current.summary, validationDecision: decisionMap[data.decision] }
          : current.summary,
        feasibilityProjectId,
        feasibilityProjectCode,
        nextAction: computeNextAction(status, current.currentStage),
        lastModifiedBy: "Management Review",
        updatedAt: now,
        auditTrail,
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export { validationBand };
