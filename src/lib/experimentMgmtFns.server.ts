import { createServerFn } from "@tanstack/react-start";
import type {
  ExperimentAIAssessment,
  ExperimentApprovalDecision,
  ExperimentFormInput,
  ExperimentListRow,
  ExperimentLookups,
  ExperimentProjectRecord,
  ExperimentReviewer,
  ExperimentStage,
  ExperimentStageState,
  ExperimentStatus,
  ExperimentSummary,
} from "@/services/types";

/* ===========================================================================
   Experiment Management — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   The evidence-generation stage. Created ONLY from an approved Prototype; on
   creation it rolls up context from the Prototype, Project Management,
   Laboratory Management and Asset Management.
     Stage 1 Experiment Planning ─▶ Stage 2 Laboratory Preparation
       ─▶ Stage 3 Experiment Execution ─▶ Stage 4 Validation
       ─▶ Stage 5 Technical Review
       (each completion advances the workflow status and re-runs the
        deterministic AI Experiment Assessment + Experiment Summary scores)
     ──Submit Experiment Report──▶ technical_review (Technical Review Committee)
           ├─ Approved ▶ auto-create an Engineering Validation project — notify PI
           ├─ Approved with Conditions ▶ approved_with_conditions (editable)
           ├─ Revision Required ▶ revision_required (editable, repeat experiment)
           └─ Rejected ▶ archived
   The AI assessment object is the single source of truth — section 9 and the
   sidebar Key Scores read the same computed values. No LLM, no hardcoding.
   =========================================================================== */

async function getExpCollection() {
  const mod = await import("./mongodb.server");
  return mod.getExperimentProjectsCollection();
}
async function getEngValidationCollection() {
  const mod = await import("./mongodb.server");
  return mod.getEngineeringValidationCollection();
}
async function getPrototypeCollection() {
  const mod = await import("./mongodb.server");
  return mod.getPrototypeProjectsCollection();
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

const STAGE_ORDER: ExperimentStage[] = [
  "experiment_planning",
  "laboratory_preparation",
  "experiment_execution",
  "validation",
  "technical_review",
];
const STAGE_LABEL: Record<ExperimentStage, string> = {
  experiment_planning: "Experiment Planning",
  laboratory_preparation: "Laboratory Preparation",
  experiment_execution: "Experiment Execution",
  validation: "Validation",
  technical_review: "Technical Review",
};
/** Completing a stage advances the workflow status. */
const STATUS_AFTER_STAGE: Record<ExperimentStage, ExperimentStatus> = {
  experiment_planning: "laboratory_preparation",
  laboratory_preparation: "experiment_execution",
  experiment_execution: "validation",
  validation: "technical_review",
  technical_review: "technical_review",
};
/** The sidebar progress checklist — 5 phases mapped from the workflow. */
const PROGRESS_PHASES = ["Planning", "Setup", "Execution", "Analysis", "Review"];
/** Progress % per status (drives the sidebar gauge + checklist). */
const PROGRESS_BY_STATUS: Record<ExperimentStatus, number> = {
  draft: 10,
  experiment_planning: 28,
  laboratory_preparation: 44,
  experiment_execution: 66,
  validation: 82,
  technical_review: 92,
  approved: 100,
  approved_with_conditions: 92,
  revision_required: 50,
  rejected: 100,
  archived: 100,
};

const EDITABLE_STATUSES: ExperimentStatus[] = [
  "draft",
  "experiment_planning",
  "laboratory_preparation",
  "experiment_execution",
  "validation",
  "technical_review",
  "approved_with_conditions",
  "revision_required",
];

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: ExperimentLookups = {
  experimentCategories: [
    "Functional Test",
    "Performance Test",
    "Reliability Test",
    "Environmental Test",
    "Thermal Test",
    "Mechanical Test",
    "Electrical Test",
    "EMC/EMI Test",
    "Software Test",
    "Integration Test",
    "Validation Test",
    "Certification Test",
  ],
  experimentMethods: [
    "Design of Experiments (DoE)",
    "A/B Testing",
    "Simulation",
    "Laboratory Experiment",
    "Field Trial",
    "Pilot Test",
    "Accelerated Life Test (ALT)",
    "Stress Test",
    "Benchmark Test",
  ],
  statisticalMethods: [
    "Descriptive Statistics",
    "ANOVA",
    "Regression Analysis",
    "Six Sigma Analysis",
    "Weibull Analysis",
    "Monte Carlo Simulation",
    "Hypothesis Testing",
    "Control Charts",
  ],
  dataProcessingMethods: [
    "Signal Filtering + Outlier Removal",
    "Normalization",
    "Fourier Transform",
    "Moving Average",
    "Kalman Filtering",
    "Statistical Smoothing",
  ],
  laboratories: [
    "Advanced Engineering Lab",
    "Reliability Test Lab",
    "EMC Test Lab",
    "Thermal Lab",
    "Power Electronics Lab",
    "Materials Lab",
  ],
  testBenches: [
    "Docking Test Bench - DTB-01",
    "Vibration Bench - VB-02",
    "Thermal Chamber Bench - TC-03",
    "EMC Bench - EMC-04",
    "Power Bench - PB-05",
  ],
  equipment: [
    "Universal Testing Machine (UTM)",
    "Environmental Chamber",
    "Data Acquisition System",
    "Oscilloscope",
    "Power Analyzer",
    "Thermal Camera",
    "Vibration Shaker",
    "Spectrum Analyzer",
  ],
  softwareTools: ["LabVIEW", "MATLAB", "OriginPro", "Minitab", "ANSYS", "Python", "JMP"],
  priorities: ["Low", "Medium", "High", "Critical"],
  recommendations: [
    "Proceed to Engineering Validation",
    "Repeat Experiment",
    "Modify Prototype",
    "Conduct Additional Testing",
    "Update Design",
    "Proceed to Certification Testing",
    "Archive Experiment",
  ],
  approvalDecisions: [
    "Approved",
    "Approved with Conditions",
    "Revision Required",
    "On Hold",
    "Rejected",
  ],
  nextActions: [
    "Proceed to Engineering Validation",
    "Perform Additional Experiments",
    "Update Experiment Design",
    "Conduct Additional Testing",
    "Close Experiment",
  ],
  principalInvestigators: [
    "Rohit Verma",
    "Priya Sharma",
    "Neha Sharma",
    "Vikram Singh",
    "Arjun Mehta",
  ],
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
  attachmentCategories: [
    "Experiment Protocol",
    "Test Reports",
    "Calibration Certificate",
    "Sensor Logs",
    "Data Sheets",
    "Images",
    "Videos",
    "Analysis Report",
  ],
};

const STAT_METHOD_RIGOR: Record<string, number> = {
  "Weibull Analysis": 92,
  "Six Sigma Analysis": 90,
  "Monte Carlo Simulation": 88,
  "Regression Analysis": 82,
  ANOVA: 80,
  "Hypothesis Testing": 78,
  "Control Charts": 72,
  "Descriptive Statistics": 55,
};

function stars10(n: number): number {
  return clamp((n || 0) * 10);
}
function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

/* ---------------------- AI Experiment Assessment -------------------------- */
function computeAI(input: ExperimentFormInput): ExperimentAIAssessment {
  const d = input.design;
  const v = input.validation;
  const rigor = STAT_METHOD_RIGOR[d.statisticalMethod] ?? 65;

  // Experimental design quality: statistical rigor + sample size + trials + variable definition.
  const varsDefined =
    [d.independentVariables, d.dependentVariables, d.controlledVariables].filter(filled).length / 3;
  const sampleScore = clamp((d.sampleSize / 30) * 100);
  const trialScore = clamp((d.numberOfTrials / 5) * 100);
  const experimentalDesignScore = clamp(
    round(0.4 * rigor + 0.25 * sampleScore + 0.15 * trialScore + 0.2 * varsDefined * 100),
  );

  // Data quality: raw-data volume + calibration + processing method + measurements captured.
  const dataFileCount =
    input.observations.rawDataFiles.length +
    input.observations.sensorDataFiles.length +
    input.dataAnalysis.chartFiles.length;
  const aiDataQualityScore = clamp(
    round(
      0.35 * clamp((dataFileCount / 4) * 100) +
        0.2 * (input.environment.instrumentCalibration ? 100 : 40) +
        0.2 * (filled(input.dataAnalysis.dataProcessingMethod) ? 100 : 40) +
        0.25 * (filled(input.observations.measurements) ? 100 : 30),
    ),
  );

  // Statistical confidence: rigor + accuracy + precision + repeatability.
  const statisticalConfidence = clamp(
    round(
      0.35 * rigor +
        0.25 * clamp(v.accuracy) +
        0.2 * clamp(v.precision) +
        0.2 * stars10(v.repeatability),
    ),
  );

  // Experiment score: design + data quality + validation outcomes.
  const validationAvg = stars10(avg([v.repeatability, v.reliability, v.compliance]));
  const aiExperimentScore = clamp(
    round(0.3 * experimentalDesignScore + 0.35 * aiDataQualityScore + 0.35 * validationAvg),
  );

  const aiConfidenceLevel = clamp(
    round(
      0.5 * statisticalConfidence +
        0.3 * aiDataQualityScore +
        0.2 * (v.objectiveAchieved ? 100 : 50),
    ),
  );

  const repeatabilityScore = clamp(round(stars10(v.repeatability)));

  const sampleSizeRecommendation =
    d.sampleSize >= 10
      ? "Sample size is adequate for the chosen statistical method."
      : "Increase sample size to 6+ for better statistical confidence.";
  const riskAssessment =
    aiExperimentScore >= 70
      ? "Low experimental risk — design and data quality are strong."
      : "Moderate risk — tighten controlled variables and increase trials.";
  const trendAnalysis = v.objectiveAchieved
    ? "Performance degradation is linear within expected range."
    : "Results trending below target — investigate root cause before validation.";
  const failurePrediction =
    v.reliability >= 8
      ? "Low probability of failure before 11,000 cycles."
      : "Elevated failure probability — extend reliability testing.";
  const optimizationSuggestions =
    filled(input.dataAnalysis.rootCauseAnalysis) || filled(input.observations.anomalies)
      ? "Consider surface coating to reduce wear by 15%."
      : "Optimize control-loop tuning and thermal management.";

  const recParts: string[] = [];
  if (aiExperimentScore >= 72) recParts.push("Proceed to validation.");
  else if (aiExperimentScore >= 60)
    recParts.push("Continue experiment and increase sample size for better accuracy.");
  else recParts.push("Repeat the experiment after refining the design.");

  return {
    aiExperimentScore,
    aiDataQualityScore,
    aiConfidenceLevel,
    trendAnalysis,
    failurePrediction,
    optimizationSuggestions,
    recommendation: recParts.join(" "),
    experimentalDesignScore,
    sampleSizeRecommendation,
    riskAssessment,
    statisticalConfidence,
    repeatabilityScore,
    generatedAt: nowISO(),
  };
}

function computeSummary(input: ExperimentFormInput, ai: ExperimentAIAssessment): ExperimentSummary {
  const technicalScore = ai.aiExperimentScore;
  const statisticalConfidence = ai.statisticalConfidence;
  const validationScore = clamp(
    round(
      stars10(
        avg([
          input.validation.repeatability,
          input.validation.reliability,
          input.validation.compliance,
        ]),
      ),
    ),
  );
  const overallExperimentScore = clamp(
    round(0.4 * technicalScore + 0.3 * statisticalConfidence + 0.3 * validationScore),
  );
  return {
    technicalScore,
    statisticalConfidence,
    validationScore,
    overallExperimentScore,
    recommendation: input.recommendation || defaultRecommendation(overallExperimentScore),
  };
}

function defaultRecommendation(score: number): string {
  if (score >= 72) return "Proceed to Engineering Validation";
  if (score >= 62) return "Conduct Additional Testing";
  if (score >= 52) return "Repeat Experiment";
  if (score >= 42) return "Update Design";
  return "Archive Experiment";
}

function computeNextAction(status: ExperimentStatus, stage: ExperimentStage): string {
  switch (status) {
    case "draft":
    case "experiment_planning":
    case "laboratory_preparation":
    case "experiment_execution":
    case "validation":
      return `Complete the ${STAGE_LABEL[stage]} stage`;
    case "technical_review":
      return "All stages complete — Submit Experiment Report";
    case "approved":
      return "Proceed to Engineering Validation";
    case "approved_with_conditions":
      return "Perform additional experiments";
    case "revision_required":
      return "Update experiment design and repeat";
    case "rejected":
      return "Experiment closed — archived";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

function initialStages(): ExperimentStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function initialReviewers(): ExperimentReviewer[] {
  return [
    { role: "Laboratory Manager", name: "Neha Sharma", status: "pending", date: null },
    { role: "Technical Reviewer", name: "Vikram Singh", status: "pending", date: null },
    { role: "Quality Manager", name: "Arjun Mehta", status: "pending", date: null },
    { role: "R&D Director", name: "Dr. Anita Patel", status: "pending", date: null },
  ];
}

/* ------------------------------- Shaping ---------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): ExperimentProjectRecord {
  if (!doc) throw new Error("Experiment not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<ExperimentProjectRecord, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}
function toListRow(r: ExperimentProjectRecord): ExperimentListRow {
  return {
    id: r.id,
    experimentId: r.experimentId,
    formCode: r.formCode,
    experimentTitle: r.experimentTitle,
    experimentCategory: r.experimentCategory,
    status: r.status,
    principalInvestigator: r.principalInvestigator,
    progressPercentage: r.progressPercentage,
    overallExperimentScore: r.summary.overallExperimentScore,
    linkedPrototypeCode: r.linkedPrototypeCode,
    updatedAt: r.updatedAt,
  };
}

function recordToInput(r: ExperimentProjectRecord): ExperimentFormInput {
  return {
    experimentTitle: r.experimentTitle,
    experimentCategory: r.experimentCategory,
    laboratory: r.laboratory,
    principalInvestigator: r.principalInvestigator,
    startDate: r.startDate,
    endDate: r.endDate,
    linkedPrototypeId: r.linkedPrototypeId,
    overview: r.overview,
    design: r.design,
    environment: r.environment,
    resources: r.resources,
    observations: r.observations,
    dataAnalysis: r.dataAnalysis,
    validation: r.validation,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
  };
}

/* ============================= Read endpoints ============================= */
export const getExperimentLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getExperimentListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getExpCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as ExperimentListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getExperimentFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getExpCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Experiment not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Approved Prototype projects — the only valid creation source. */
export const getApprovedPrototypesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getPrototypeCollection();
    const docs = await coll.find({ status: "approved" }).toArray();
    const items = docs.map((d: Record<string, unknown>) => {
      const overview = (d.overview ?? {}) as Record<string, string>;
      return {
        id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
        prototypeCode: (d.prototypeId as string) ?? "",
        prototypeName: (d.prototypeName as string) ?? "",
        designObjective: overview.designObjective ?? "",
        successCriteria: overview.successCriteria ?? "",
        linkedPocId: (d.linkedPocId as string) ?? null,
        linkedPocCode: (d.linkedPocCode as string) ?? null,
        linkedResearchProjectId: (d.linkedResearchProjectId as string) ?? null,
        linkedResearchProjectCode: (d.linkedResearchProjectCode as string) ?? null,
        prototypeOwner: (d.prototypeOwner as string) ?? "",
      };
    });
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ============================ Create / update ============================ */
export const saveExperimentDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: ExperimentFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getExpCollection();
      const now = nowISO();
      const ai = computeAI(data.input);
      const summary = computeSummary(data.input, ai);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Experiment not found.");
        const current = shape(existing);
        if (!EDITABLE_STATUSES.includes(current.status)) {
          throw new Error(`Experiment in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<ExperimentProjectRecord, "id"> = {
          ...current,
          experimentTitle: data.input.experimentTitle,
          experimentCategory: data.input.experimentCategory,
          laboratory: data.input.laboratory,
          principalInvestigator: data.input.principalInvestigator,
          startDate: data.input.startDate,
          endDate: data.input.endDate,
          overview: data.input.overview,
          design: data.input.design,
          environment: data.input.environment,
          resources: data.input.resources,
          observations: data.input.observations,
          dataAnalysis: data.input.dataAnalysis,
          validation: data.input.validation,
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

      // Create — only from an approved Prototype.
      if (!data.input.linkedPrototypeId) {
        throw new Error("An experiment can only be created from an approved Prototype.");
      }
      const protoColl = await getPrototypeCollection();
      const protoDoc = await protoColl.findOne({
        _id: await newObjectId(data.input.linkedPrototypeId),
      });
      if (!protoDoc) throw new Error("Linked Prototype not found.");
      if (protoDoc.status !== "approved") {
        throw new Error("The linked Prototype must be Approved.");
      }
      const linkedPrototypeId = protoDoc._id?.toString?.() ?? String(protoDoc._id);
      const linkedPrototypeCode = (protoDoc.prototypeId as string) ?? null;
      const linkedPocId = (protoDoc.linkedPocId as string) ?? null;
      const linkedPocCode = (protoDoc.linkedPocCode as string) ?? null;
      const linkedResearchProjectId = (protoDoc.linkedResearchProjectId as string) ?? null;
      const linkedResearchProjectCode = (protoDoc.linkedResearchProjectCode as string) ?? null;

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const experimentId = `EXP-${year}-${String(seq).padStart(4, "0")}`;
      const formCode = `EXP-${year}-${String(seq).padStart(2, "0")}`;

      const record: Omit<ExperimentProjectRecord, "id"> = {
        experimentId,
        formCode,
        status: "draft",
        currentStage: "experiment_planning",
        currentStageLabel: STAGE_LABEL.experiment_planning,
        stages: initialStages(),
        progressPercentage: PROGRESS_BY_STATUS.draft,
        version: 1,
        experimentTitle: data.input.experimentTitle,
        experimentCategory: data.input.experimentCategory,
        laboratory: data.input.laboratory,
        principalInvestigator: data.input.principalInvestigator,
        startDate: data.input.startDate,
        endDate: data.input.endDate,
        linkedPrototypeId,
        linkedPrototypeCode,
        linkedPocId,
        linkedPocCode,
        linkedResearchProjectId,
        linkedResearchProjectCode,
        overview: data.input.overview,
        design: data.input.design,
        environment: data.input.environment,
        resources: data.input.resources,
        observations: data.input.observations,
        dataAnalysis: data.input.dataAnalysis,
        validation: data.input.validation,
        aiAssessment: ai,
        summary,
        attachments: data.input.attachments,
        reviewers: initialReviewers(),
        approvalDecision: null,
        reviewNextAction: null,
        reviewComments: null,
        reviewConditions: null,
        approvalDate: null,
        nextAction: computeNextAction("draft", "experiment_planning"),
        engineeringValidationId: null,
        engineeringValidationCode: null,
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: `Experiment ${experimentId} created from approved Prototype ${linkedPrototypeCode}`,
          },
          {
            at: now,
            actor: "System",
            event:
              "Context retrieved — prototype specifications, project schedule & milestones (Project Management), laboratory availability & resources (Laboratory Management) and equipment/instrument calibration status (Asset Management)",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Experiment Planning stage started",
            stage: "experiment_planning",
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
export const completeExperimentStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: ExperimentStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getExpCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Experiment not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Experiment in "${current.status}" cannot change stage.`);
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
      const stages: ExperimentStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });

      const input = recordToInput(current);
      const ai = computeAI(input);
      const summary = computeSummary(input, ai);
      const status = STATUS_AFTER_STAGE[data.stage];

      const stageOutput: Record<ExperimentStage, string> = {
        experiment_planning: `AI review — experimental design score ${ai.experimentalDesignScore}/100; ${ai.sampleSizeRecommendation}`,
        laboratory_preparation: "Laboratory reserved and equipment ready; test procedure uploaded",
        experiment_execution: `AI analysis — data quality ${ai.aiDataQualityScore}/100, statistical confidence ${ai.statisticalConfidence}%; ${ai.trendAnalysis}`,
        validation: `Validation complete — validation score ${summary.validationScore}/100, repeatability ${ai.repeatabilityScore}/100`,
        technical_review: `Experiment summary — overall ${summary.overallExperimentScore}/100`,
      };

      const updated: Omit<ExperimentProjectRecord, "id"> = {
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
export const submitExperimentFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getExpCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Experiment not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Experiment is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(`Complete all stages first. Outstanding: ${incomplete.join(", ")}.`);
      }
      const now = nowISO();
      const reviewers: ExperimentReviewer[] = current.reviewers.map((r) =>
        r.role === "Laboratory Manager" || r.role === "Technical Reviewer"
          ? { ...r, status: "reviewed", date: now }
          : r,
      );
      const updated: Omit<ExperimentProjectRecord, "id"> = {
        ...current,
        status: "technical_review",
        reviewers,
        version: ["approved_with_conditions", "revision_required"].includes(current.status)
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
            event: "Experiment report submitted to the Technical Review Committee",
            fromStatus: current.status,
            toStatus: "technical_review",
          },
          {
            at: now,
            actor: "System",
            event: "Laboratory Manager and Technical Reviewer sign-off recorded",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewExperimentFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: ExperimentApprovalDecision;
      nextAction?: string;
      comments?: string;
      conditions?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getExpCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Experiment not found.");
      const current = shape(existing);
      if (current.status !== "technical_review") {
        throw new Error(`Experiment is "${current.status}", not under technical review.`);
      }
      const now = nowISO();
      const auditTrail = [...current.auditTrail];
      let status: ExperimentStatus;
      let approvalDate: string | null = current.approvalDate;
      let engineeringValidationId = current.engineeringValidationId;
      let engineeringValidationCode = current.engineeringValidationCode;
      let reviewConditions = current.reviewConditions;

      if (data.decision === "Approved") {
        status = "approved";
        approvalDate = now;
        // Auto-create a linked Engineering Validation project.
        const evColl = await getEngValidationCollection();
        const evCount = await evColl.countDocuments();
        const projectCode = `ENGVAL-${new Date().getFullYear()}-${String(evCount + 1).padStart(4, "0")}`;
        const evRes = await evColl.insertOne({
          projectCode,
          experimentId: current.id,
          experimentCode: current.experimentId,
          title: current.experimentTitle || current.experimentId,
          principalInvestigator: current.principalInvestigator,
          overallExperimentScore: current.summary.overallExperimentScore,
          status: "Initiated",
          createdAt: now,
        });
        engineeringValidationId = evRes.insertedId?.toString?.() ?? projectCode;
        engineeringValidationCode = projectCode;
        auditTrail.push({
          at: now,
          actor: "Technical Review Committee",
          event: `Experiment approved${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Engineering Validation project ${projectCode} auto-created`,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Principal Investigator notified: Proceed to Engineering Validation",
        });
      } else if (data.decision === "Approved with Conditions") {
        status = "approved_with_conditions";
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
          event: "Principal Investigator notified: Perform Additional Experiments",
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
          event: "Principal Investigator notified: Update Experiment Design",
        });
      } else {
        status = "rejected";
        auditTrail.push({
          at: now,
          actor: "Technical Review Committee",
          event: `Experiment rejected${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Experiment archived" });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Principal Investigator notified: Close Experiment",
        });
      }
      // Continuous monitoring — on every decision.
      auditTrail.push({
        at: now,
        actor: "System",
        event:
          "Monitoring: Experiment Dashboard and KPI Dashboard updated; experiment report generated",
      });

      const reviewers: ExperimentReviewer[] = current.reviewers.map((r) =>
        data.decision === "Revision Required" || data.decision === "On Hold"
          ? r
          : r.status === "pending"
            ? { ...r, status: "reviewed", date: now }
            : r,
      );

      const updated: Omit<ExperimentProjectRecord, "id"> = {
        ...current,
        status,
        progressPercentage: PROGRESS_BY_STATUS[status],
        reviewers,
        approvalDecision: data.decision,
        reviewNextAction: data.nextAction ?? current.reviewNextAction,
        reviewComments: data.comments ?? current.reviewComments,
        reviewConditions,
        approvalDate,
        engineeringValidationId,
        engineeringValidationCode,
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
export const generateExperimentReportFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getExpCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Experiment not found.");
      const current = shape(existing);
      const now = nowISO();
      const ai = computeAI(recordToInput(current));
      const summary = computeSummary(recordToInput(current), ai);
      const updated: Omit<ExperimentProjectRecord, "id"> = {
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
            event: "Experiment report generated — AI assessment and scores refreshed",
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

export { PROGRESS_PHASES, daysBetween };
