import { createServerFn } from "@tanstack/react-start";
import type {
  PocAIAssessment,
  PocApprovalDecision,
  PocFormInput,
  PocListRow,
  PocLookups,
  PocProjectRecord,
  PocReviewer,
  PocStage,
  PocStageState,
  PocStatus,
  PocSummary,
  PocTRL,
} from "@/services/types";

/* ===========================================================================
   Proof of Concept (PoC) — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   The technical-validation gateway. Created ONLY from an approved Feasibility
   Study; on creation it rolls up context from the Feasibility Study, Research
   Management, Technology Scouting, Finance, Laboratory and Patent/IP.
     Stage 1 Technical Implementation ─▶ Stage 2 Build & Integration
       ─▶ Stage 3 Experimental Testing ─▶ Stage 4 Commercial Assessment
       ─▶ Stage 5 Final Review
       (each completion advances the workflow status and re-runs the
        deterministic AI PoC Assessment + PoC summary scores)
     ──Submit PoC Report──▶ final_review (Technical Review Committee)
           ├─ Approved ▶ auto-create a Prototype Development project — notify PM
           ├─ Approved with Conditions ▶ conditional_approval (editable)
           ├─ Revision Required ▶ revision_required (editable, repeat PoC cycle)
           └─ Rejected ▶ archived
   The AI assessment object is the single source of truth — the sidebar Key
   Scores and AI Success Probability read the same computed values. No LLM.
   =========================================================================== */

async function getPocCollection() {
  const mod = await import("./mongodb.server");
  return mod.getPocProjectsCollection();
}
async function getPrototypeCollection() {
  const mod = await import("./mongodb.server");
  return mod.getPrototypeDevelopmentCollection();
}
async function getFSCollection() {
  const mod = await import("./mongodb.server");
  return mod.getFeasibilityStudiesCollection();
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

const STAGE_ORDER: PocStage[] = [
  "technical_implementation",
  "build_integration",
  "experimental_testing",
  "commercial_assessment",
  "final_review",
];
const STAGE_LABEL: Record<PocStage, string> = {
  technical_implementation: "Technical Implementation",
  build_integration: "Build & Integration",
  experimental_testing: "Experimental Testing",
  commercial_assessment: "Commercial Assessment",
  final_review: "Final Review",
};
/** Completing a stage advances the workflow status. */
const STATUS_AFTER_STAGE: Record<PocStage, PocStatus> = {
  technical_implementation: "build_integration",
  build_integration: "experimental_testing",
  experimental_testing: "commercial_assessment",
  commercial_assessment: "final_review",
  final_review: "final_review",
};
/** The sidebar progress checklist — 5 phases mapped from the workflow. */
const PROGRESS_PHASES = ["Planning", "Implementation", "Testing", "Validation", "Review"];
/** Progress % per status (drives the sidebar gauge + checklist). */
const PROGRESS_BY_STATUS: Record<PocStatus, number> = {
  draft: 10,
  technical_implementation: 25,
  build_integration: 45,
  experimental_testing: 68,
  commercial_assessment: 85,
  final_review: 92,
  approved: 100,
  conditional_approval: 92,
  revision_required: 60,
  rejected: 100,
  archived: 100,
};

const EDITABLE_STATUSES: PocStatus[] = [
  "draft",
  "technical_implementation",
  "build_integration",
  "experimental_testing",
  "commercial_assessment",
  "final_review",
  "conditional_approval",
  "revision_required",
];

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: PocLookups = {
  prototypeLevels: [
    "Simulation",
    "Breadboard",
    "Bench Prototype",
    "Alpha PoC",
    "Beta PoC",
    "Engineering Model",
  ],
  engineeringApproaches: [
    "Experimental",
    "Analytical",
    "Simulation",
    "Hybrid",
    "Reverse Engineering",
  ],
  testMethods: [
    "Functional Testing",
    "Performance Testing",
    "Reliability Testing",
    "Environmental Testing",
    "Integration Testing",
    "Stress Testing",
  ],
  testEnvironments: [
    "Laboratory",
    "Controlled Environment",
    "Pilot Site",
    "Customer Site",
    "Manufacturing Line",
    "Field Trial",
  ],
  technologyStack: [
    "Wireless Power Transfer",
    "Robotics",
    "AI/ML",
    "Embedded System",
    "IoT",
    "Power Electronics",
    "Computer Vision",
    "Edge Computing",
    "Digital Twin",
  ],
  softwareTools: [
    "MATLAB/Simulink",
    "Altium",
    "ROS",
    "ANSYS Maxwell",
    "SolidWorks",
    "Python",
    "TensorFlow",
    "LabVIEW",
  ],
  laboratories: [
    "Wireless Power Lab",
    "Robotics Lab",
    "Power Electronics Lab",
    "EMC Test Lab",
    "Prototype Workshop",
  ],
  recommendations: [
    "Proceed to Prototype Development",
    "Repeat PoC",
    "Conduct Additional Research",
    "Optimize Design",
    "Return to Feasibility Study",
    "Archive Project",
  ],
  approvalDecisions: [
    "Approved",
    "Approved with Conditions",
    "Revision Required",
    "On Hold",
    "Rejected",
  ],
  nextActions: [
    "Proceed to Prototype Development",
    "Implement Recommended Improvements",
    "Update Design & Re-Test",
    "Conduct Additional Testing",
    "Project Closed",
  ],
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
  technicalExperts: ["Dr. Anita Patel", "Sundar Rao", "Kavya Nair", "Deepak Menon", "Ritu Agarwal"],
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
    "Design Files",
    "Test Reports",
    "Simulation Results",
    "Source Code",
    "CAD Models",
    "Images",
    "Videos",
    "Technical Documentation",
  ],
};

const PROTOTYPE_LEVEL_SCORE: Record<string, number> = {
  Simulation: 30,
  Breadboard: 45,
  "Bench Prototype": 60,
  "Alpha PoC": 72,
  "Beta PoC": 85,
  "Engineering Model": 92,
};

function stars10(n: number): number {
  return clamp((n || 0) * 10);
}
function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/* ---------------------- AI PoC Assessment (computed) ---------------------- */
function computeAI(input: PocFormInput): PocAIAssessment {
  const tr = input.testResults;
  const comm = input.commercial;
  const tech = input.technical;

  // Technical: prototype level + tech-stack breadth + architecture depth.
  const aiTechnicalScore = clamp(
    round(
      0.45 * (PROTOTYPE_LEVEL_SCORE[tech.prototypeLevel] ?? 55) +
        0.25 * clamp((tech.technologyStack.length / 5) * 100) +
        0.15 * (filled(tech.architecture) ? 100 : 40) +
        0.15 * (filled(tech.integrationRequirements) ? 100 : 40),
    ),
  );

  // Performance: functional + performance validation + efficiency.
  const aiPerformanceScore = clamp(
    round(
      0.35 * stars10(tr.functionalValidation) +
        0.35 * stars10(tr.performanceValidation) +
        0.3 * clamp(tr.efficiency),
    ),
  );

  // Reliability: reliability + safety + compliance validations.
  const aiReliabilityScore = clamp(
    round(
      0.4 * stars10(tr.reliability) +
        0.3 * stars10(tr.safetyValidation) +
        0.3 * stars10(tr.complianceValidation),
    ),
  );

  // Commercial: the six commercial-assessment ratings.
  const aiCommercialScore = clamp(
    round(
      stars10(
        avg([
          comm.customerAcceptance,
          comm.marketReadiness,
          comm.scalability,
          comm.manufacturingReadiness,
          comm.commercialViability,
          comm.goToMarketReadiness,
        ]),
      ),
    ),
  );

  const aiSuccessProbability = clamp(
    round(
      0.3 * aiTechnicalScore +
        0.3 * aiPerformanceScore +
        0.2 * aiReliabilityScore +
        0.2 * aiCommercialScore,
    ),
  );

  const readinessScore = clamp(round(0.5 * aiTechnicalScore + 0.5 * aiPerformanceScore));

  const recs: string[] = [];
  if (aiSuccessProbability >= 75)
    recs.push(
      "Improve docking prediction model. Optimize coil alignment using reinforcement learning.",
    );
  else if (aiSuccessProbability >= 60)
    recs.push("Strengthen the weakest validation dimension before advancing to prototype.");
  else recs.push("Re-test after addressing the primary technical issues.");

  const improvements: string[] = [];
  if (aiReliabilityScore < 70)
    improvements.push("Add adaptive coil alignment and predictive docking.");
  if (aiPerformanceScore < 70)
    improvements.push("Tune control loop latency and thermal management.");
  if (aiCommercialScore < 65)
    improvements.push("Firm up manufacturing readiness and go-to-market plan.");
  if (improvements.length === 0)
    improvements.push("Real-time feedback loop significantly improves docking accuracy.");

  const designRisks =
    aiTechnicalScore >= 70
      ? "Low design risk — architecture and integration are well defined."
      : "Moderate design risk — clarify integration requirements and interfaces.";
  const architectureAssessment = `${tech.prototypeLevel || "PoC"} architecture over ${tech.technologyStack.length} technology stack element(s); ${tech.engineeringApproach || "experimental"} approach.`;
  const integrationStatus =
    readinessScore >= 70 ? "Integration verified — build is testable" : "Integration in progress";

  return {
    aiTechnicalScore,
    aiPerformanceScore,
    aiReliabilityScore,
    aiCommercialScore,
    aiSuccessProbability,
    recommendations: recs.join(" "),
    improvementSuggestions: improvements.join(" "),
    architectureAssessment,
    designRisks,
    integrationStatus,
    readinessScore,
    generatedAt: nowISO(),
  };
}

function trlFromScore(score: number): PocTRL {
  if (score >= 82) return "TRL 7 - System Prototype Demonstration";
  if (score >= 68) return "TRL 6 - Demonstrated in Relevant Environment";
  if (score >= 52) return "TRL 5 - Validated in Relevant Environment";
  return "TRL 4 - Validated in Lab";
}

function computeSummary(input: PocFormInput, ai: PocAIAssessment): PocSummary {
  const technicalScore = ai.aiTechnicalScore;
  const performanceScore = ai.aiPerformanceScore;
  const commercialScore = ai.aiCommercialScore;
  // Risk score (higher = safer) from safety/compliance/reliability.
  const riskScore = clamp(
    round(
      0.4 * stars10(input.testResults.safetyValidation) +
        0.3 * stars10(input.testResults.complianceValidation) +
        0.3 * ai.aiReliabilityScore,
    ),
  );
  const overallPocScore = clamp(
    round(0.3 * technicalScore + 0.3 * performanceScore + 0.2 * commercialScore + 0.2 * riskScore),
  );
  return {
    technicalScore,
    performanceScore,
    commercialScore,
    riskScore,
    overallPocScore,
    technologyReadinessLevel: trlFromScore(overallPocScore),
    recommendation: input.recommendation || defaultRecommendation(overallPocScore),
  };
}

function defaultRecommendation(score: number): string {
  if (score >= 72) return "Proceed to Prototype Development";
  if (score >= 60) return "Optimize Design";
  if (score >= 50) return "Repeat PoC";
  if (score >= 40) return "Conduct Additional Research";
  return "Archive Project";
}

function computeNextAction(status: PocStatus, stage: PocStage): string {
  switch (status) {
    case "draft":
    case "technical_implementation":
    case "build_integration":
    case "experimental_testing":
    case "commercial_assessment":
      return `Complete the ${STAGE_LABEL[stage]} stage`;
    case "final_review":
      return "All stages complete — Submit PoC Report";
    case "approved":
      return "Proceed to Prototype Development";
    case "conditional_approval":
      return "Implement recommended improvements";
    case "revision_required":
      return "Update design & re-test";
    case "rejected":
      return "Project closed — archived";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

function initialStages(): PocStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function initialReviewers(): PocReviewer[] {
  return [
    { role: "Technical Reviewer", name: "Neha Sharma", status: "pending", date: null },
    { role: "R&D Manager", name: "Vikram Singh", status: "pending", date: null },
    { role: "Innovation Director", name: "Dr. Anita Patel", status: "pending", date: null },
    { role: "CTO", name: "Arjun Mehta", status: "pending", date: null },
  ];
}

/* ------------------------------- Shaping ---------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): PocProjectRecord {
  if (!doc) throw new Error("PoC project not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<PocProjectRecord, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}
function toListRow(r: PocProjectRecord): PocListRow {
  return {
    id: r.id,
    pocId: r.pocId,
    formCode: r.formCode,
    pocTitle: r.pocTitle,
    status: r.status,
    projectManager: r.projectManager,
    progressPercentage: r.progressPercentage,
    overallPocScore: r.summary.overallPocScore,
    aiSuccessProbability: r.aiAssessment.aiSuccessProbability,
    linkedFeasibilityStudyCode: r.linkedFeasibilityStudyCode,
    updatedAt: r.updatedAt,
  };
}

function recordToInput(r: PocProjectRecord): PocFormInput {
  return {
    pocTitle: r.pocTitle,
    businessUnit: r.businessUnit,
    department: r.department,
    projectManager: r.projectManager,
    pocStartDate: r.pocStartDate,
    linkedFeasibilityStudyId: r.linkedFeasibilityStudyId,
    overview: r.overview,
    technical: r.technical,
    experimental: r.experimental,
    resources: r.resources,
    testResults: r.testResults,
    issues: r.issues,
    commercial: r.commercial,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
  };
}

/* ============================= Read endpoints ============================= */
export const getPocLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getPocListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getPocCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as PocListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getPocFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPocCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("PoC project not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Approved Feasibility Studies — the only valid creation source. */
export const getApprovedFeasibilityStudiesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const coll = await getFSCollection();
      const docs = await coll.find({ status: "approved" }).toArray();
      const items = docs.map((d: Record<string, unknown>) => {
        const exec = (d.executiveSummary ?? {}) as Record<string, string>;
        const decision = (d.decisionSummary ?? {}) as Record<string, number>;
        return {
          id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
          feasibilityStudyCode: (d.feasibilityId as string) ?? "",
          studyTitle: (d.studyTitle as string) ?? "",
          studyObjective: exec.studyObjective ?? "",
          businessNeed: exec.businessNeed ?? "",
          overallFeasibilityScore: decision.overallFeasibilityScore ?? 0,
          linkedResearchProjectId: (d.linkedResearchProjectId as string) ?? null,
          linkedResearchProjectCode: (d.linkedResearchProjectCode as string) ?? null,
          linkedTechnologyScoutingId: (d.linkedTechnologyScoutingId as string) ?? null,
          linkedTechnologyScoutingCode: (d.linkedTechnologyScoutingCode as string) ?? null,
          businessUnit: (d.businessUnit as string) ?? "",
          department: (d.department as string) ?? "",
          projectManager: (d.projectManager as string) ?? "",
          budgetRequired: (d.budgetRequired as number) ?? 0,
        };
      });
      return { success: true as const, data: items };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  },
);

/* ============================ Create / update ============================ */
export const savePocDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: PocFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPocCollection();
      const now = nowISO();
      const ai = computeAI(data.input);
      const summary = computeSummary(data.input, ai);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("PoC project not found.");
        const current = shape(existing);
        if (!EDITABLE_STATUSES.includes(current.status)) {
          throw new Error(`PoC in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<PocProjectRecord, "id"> = {
          ...current,
          pocTitle: data.input.pocTitle,
          businessUnit: data.input.businessUnit,
          department: data.input.department,
          projectManager: data.input.projectManager,
          pocStartDate: data.input.pocStartDate,
          overview: data.input.overview,
          technical: data.input.technical,
          experimental: data.input.experimental,
          resources: data.input.resources,
          testResults: data.input.testResults,
          issues: data.input.issues,
          commercial: data.input.commercial,
          aiAssessment: ai,
          summary,
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

      // Create — only from an approved Feasibility Study.
      if (!data.input.linkedFeasibilityStudyId) {
        throw new Error("A PoC can only be created from an approved Feasibility Study.");
      }
      const fsColl = await getFSCollection();
      const fsDoc = await fsColl.findOne({
        _id: await newObjectId(data.input.linkedFeasibilityStudyId),
      });
      if (!fsDoc) throw new Error("Linked Feasibility Study not found.");
      if (fsDoc.status !== "approved") {
        throw new Error("The linked Feasibility Study must be Approved.");
      }
      const linkedFeasibilityStudyId = fsDoc._id?.toString?.() ?? String(fsDoc._id);
      const linkedFeasibilityStudyCode = (fsDoc.feasibilityId as string) ?? null;
      const linkedResearchProjectId = (fsDoc.linkedResearchProjectId as string) ?? null;
      const linkedResearchProjectCode = (fsDoc.linkedResearchProjectCode as string) ?? null;
      const linkedTechnologyId = (fsDoc.linkedTechnologyScoutingId as string) ?? null;
      const linkedTechnologyCode = (fsDoc.linkedTechnologyScoutingCode as string) ?? null;

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const pocId = `POC-${year}-${String(seq).padStart(4, "0")}`;
      const formCode = `POC-${year}-${String(seq).padStart(2, "0")}`;

      const record: Omit<PocProjectRecord, "id"> = {
        pocId,
        formCode,
        status: "draft",
        currentStage: "technical_implementation",
        currentStageLabel: STAGE_LABEL.technical_implementation,
        stages: initialStages(),
        progressPercentage: PROGRESS_BY_STATUS.draft,
        version: 1,
        pocTitle: data.input.pocTitle,
        businessUnit: data.input.businessUnit,
        department: data.input.department,
        projectManager: data.input.projectManager,
        pocStartDate: data.input.pocStartDate,
        linkedFeasibilityStudyId,
        linkedFeasibilityStudyCode,
        linkedResearchProjectId,
        linkedResearchProjectCode,
        linkedTechnologyId,
        linkedTechnologyCode,
        overview: data.input.overview,
        technical: data.input.technical,
        experimental: data.input.experimental,
        resources: data.input.resources,
        testResults: data.input.testResults,
        issues: data.input.issues,
        commercial: data.input.commercial,
        aiAssessment: ai,
        summary,
        attachments: data.input.attachments,
        reviewers: initialReviewers(),
        approvalDecision: null,
        reviewNextAction: null,
        reviewComments: null,
        reviewConditions: null,
        approvalDate: null,
        nextAction: computeNextAction("draft", "technical_implementation"),
        prototypeProjectId: null,
        prototypeProjectCode: null,
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: `PoC ${pocId} created from approved Feasibility Study ${linkedFeasibilityStudyCode}`,
          },
          {
            at: now,
            actor: "System",
            event:
              "Context retrieved — technical & business feasibility (Feasibility Study), experimental data (Research Management), technology assessment & TRL (Technology Scouting), schedule (Project Management), budget (Finance), equipment (Laboratory) and IP/FTO status",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Technical Implementation stage started",
            stage: "technical_implementation",
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
export const completePocStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: PocStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPocCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("PoC project not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`PoC in "${current.status}" cannot change stage.`);
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
      const stages: PocStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });

      const input = recordToInput(current);
      const ai = computeAI(input);
      const summary = computeSummary(input, ai);
      const status = STATUS_AFTER_STAGE[data.stage];

      const stageOutput: Record<PocStage, string> = {
        technical_implementation: `AI review — ${ai.architectureAssessment} ${ai.designRisks}`,
        build_integration: `AI verification — ${ai.integrationStatus}; readiness score ${ai.readinessScore}/100`,
        experimental_testing: `AI analysis — performance ${ai.aiPerformanceScore}/100, reliability ${ai.aiReliabilityScore}/100, success probability ${ai.aiSuccessProbability}%`,
        commercial_assessment: `AI analysis — commercial score ${ai.aiCommercialScore}/100`,
        final_review: `PoC summary — overall ${summary.overallPocScore}/100, ${summary.technologyReadinessLevel}`,
      };

      const updated: Omit<PocProjectRecord, "id"> = {
        ...current,
        stages,
        currentStage: advanced ? nextStage : data.stage,
        currentStageLabel: STAGE_LABEL[advanced ? nextStage : data.stage],
        status,
        progressPercentage: PROGRESS_BY_STATUS[status],
        aiAssessment: ai,
        summary,
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
export const submitPocFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPocCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("PoC project not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`PoC is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(`Complete all stages first. Outstanding: ${incomplete.join(", ")}.`);
      }
      const now = nowISO();
      const reviewers: PocReviewer[] = current.reviewers.map((r) =>
        r.role === "Technical Reviewer" || r.role === "R&D Manager"
          ? { ...r, status: "reviewed", date: now }
          : r,
      );
      const updated: Omit<PocProjectRecord, "id"> = {
        ...current,
        status: "final_review",
        reviewers,
        version: ["conditional_approval", "revision_required"].includes(current.status)
          ? current.version + 1
          : current.version,
        nextAction: "Awaiting Technical Review Committee decision",
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "PoC report submitted to the Technical Review Committee",
            fromStatus: current.status,
            toStatus: "final_review",
          },
          {
            at: now,
            actor: "System",
            event: "Technical Reviewer and R&D Manager sign-off recorded",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewPocFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: PocApprovalDecision;
      nextAction?: string;
      comments?: string;
      conditions?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getPocCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("PoC project not found.");
      const current = shape(existing);
      if (current.status !== "final_review") {
        throw new Error(`PoC is "${current.status}", not under final review.`);
      }
      const now = nowISO();
      const auditTrail = [...current.auditTrail];
      let status: PocStatus;
      let approvalDate: string | null = current.approvalDate;
      let prototypeProjectId = current.prototypeProjectId;
      let prototypeProjectCode = current.prototypeProjectCode;
      let reviewConditions = current.reviewConditions;

      if (data.decision === "Approved") {
        status = "approved";
        approvalDate = now;
        // Auto-create a linked Prototype Development project.
        const protoColl = await getPrototypeCollection();
        const protoCount = await protoColl.countDocuments();
        const projectCode = `PROTO-${new Date().getFullYear()}-${String(protoCount + 1).padStart(4, "0")}`;
        const protoRes = await protoColl.insertOne({
          projectCode,
          pocProjectId: current.id,
          pocProjectCode: current.pocId,
          title: current.pocTitle || current.pocId,
          projectManager: current.projectManager,
          overallPocScore: current.summary.overallPocScore,
          technologyReadinessLevel: current.summary.technologyReadinessLevel,
          status: "Initiated",
          createdAt: now,
        });
        prototypeProjectId = protoRes.insertedId?.toString?.() ?? projectCode;
        prototypeProjectCode = projectCode;
        auditTrail.push({
          at: now,
          actor: "Technical Review Committee",
          event: `PoC approved${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Prototype Development project ${projectCode} auto-created`,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Proceed to Prototype Development",
        });
      } else if (data.decision === "Approved with Conditions") {
        status = "conditional_approval";
        approvalDate = now;
        reviewConditions = data.conditions ?? data.comments ?? null;
        auditTrail.push({
          at: now,
          actor: "Technical Review Committee",
          event: `Approved with improvements${reviewConditions ? ` — ${reviewConditions}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Implement Recommended Improvements",
        });
      } else if (data.decision === "Revision Required" || data.decision === "On Hold") {
        status = "revision_required";
        auditTrail.push({
          at: now,
          actor: "Technical Review Committee",
          event: `${data.decision}${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Update Design & Re-Test",
        });
      } else {
        status = "rejected";
        auditTrail.push({
          at: now,
          actor: "Technical Review Committee",
          event: `PoC rejected${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "PoC archived" });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Project Closed",
        });
      }
      // Continuous monitoring — on every decision.
      auditTrail.push({
        at: now,
        actor: "System",
        event: "Monitoring: Innovation Dashboard and KPI Dashboard updated; PoC report generated",
      });

      const reviewers: PocReviewer[] = current.reviewers.map((r) =>
        data.decision === "Revision Required" || data.decision === "On Hold"
          ? r
          : r.status === "pending"
            ? { ...r, status: "reviewed", date: now }
            : r,
      );

      const updated: Omit<PocProjectRecord, "id"> = {
        ...current,
        status,
        progressPercentage: PROGRESS_BY_STATUS[status],
        reviewers,
        approvalDecision: data.decision,
        reviewNextAction: data.nextAction ?? current.reviewNextAction,
        reviewComments: data.comments ?? current.reviewComments,
        reviewConditions,
        approvalDate,
        prototypeProjectId,
        prototypeProjectCode,
        nextAction: computeNextAction(status, current.currentStage),
        lastModifiedBy: "Technical Review Committee",
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
export const generatePocReportFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPocCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("PoC project not found.");
      const current = shape(existing);
      const now = nowISO();
      const ai = computeAI(recordToInput(current));
      const summary = computeSummary(recordToInput(current), ai);
      const updated: Omit<PocProjectRecord, "id"> = {
        ...current,
        aiAssessment: ai,
        summary,
        updatedAt: now,
        lastModifiedBy: "System",
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: "System",
            event: "PoC report generated — AI assessment and scores refreshed",
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

export { PROGRESS_PHASES };
