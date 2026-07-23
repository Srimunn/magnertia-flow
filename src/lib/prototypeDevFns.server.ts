import { createServerFn } from "@tanstack/react-start";
import type {
  PrototypeAIAssessment,
  PrototypeApprovalDecision,
  PrototypeFormInput,
  PrototypeListRow,
  PrototypeLookups,
  PrototypeProjectRecord,
  PrototypeReviewer,
  PrototypeStage,
  PrototypeStageState,
  PrototypeStatus,
  PrototypeSummary,
} from "@/services/types";

/* ===========================================================================
   Prototype Development — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   The engineering-realization stage. Created ONLY from an approved PoC; on
   creation it rolls up context from the PoC, Product Architecture / CAD-PDM,
   BOM Management, Procurement & Supply Chain and Patent/IP.
     Stage 1 Engineering Design ─▶ Stage 2 Prototype Manufacturing
       ─▶ Stage 3 Testing & Validation ─▶ Stage 4 Engineering Review
       (each completion advances the workflow status and re-runs the
        deterministic AI Engineering Assessment + Prototype Summary scores)
     ──Submit Prototype Package──▶ engineering_review (Engineering Review Committee)
           ├─ Approved ▶ auto-create an Engineering Validation project — notify PM
           ├─ Approved with Conditions ▶ approved_with_conditions (editable)
           ├─ Revision Required ▶ revision_required (editable, rebuild prototype)
           └─ Rejected ▶ archived
   The AI assessment object is the single source of truth — section 9 and the
   sidebar Key Scores read the same computed values. No LLM, no hardcoding.
   =========================================================================== */

async function getPrototypeCollection() {
  const mod = await import("./mongodb.server");
  return mod.getPrototypeProjectsCollection();
}
async function getEngValidationCollection() {
  const mod = await import("./mongodb.server");
  return mod.getEngineeringValidationCollection();
}
async function getPocCollection() {
  const mod = await import("./mongodb.server");
  return mod.getPocProjectsCollection();
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

const STAGE_ORDER: PrototypeStage[] = [
  "engineering_design",
  "prototype_manufacturing",
  "testing_validation",
  "engineering_review",
];
const STAGE_LABEL: Record<PrototypeStage, string> = {
  engineering_design: "Engineering Design",
  prototype_manufacturing: "Prototype Manufacturing",
  testing_validation: "Testing & Validation",
  engineering_review: "Engineering Review",
};
/** Completing a stage advances the workflow status. */
const STATUS_AFTER_STAGE: Record<PrototypeStage, PrototypeStatus> = {
  engineering_design: "prototype_manufacturing",
  prototype_manufacturing: "testing_validation",
  testing_validation: "engineering_review",
  engineering_review: "engineering_review",
};
/** The sidebar progress checklist — 5 phases mapped from the workflow. */
const PROGRESS_PHASES = ["Design", "Manufacturing", "Testing", "Validation", "Review"];
/** Progress % per status (drives the sidebar gauge + checklist). */
const PROGRESS_BY_STATUS: Record<PrototypeStatus, number> = {
  draft: 12,
  engineering_design: 30,
  prototype_manufacturing: 52,
  testing_validation: 74,
  engineering_review: 90,
  approved: 100,
  approved_with_conditions: 90,
  revision_required: 55,
  rejected: 100,
  archived: 100,
};

const EDITABLE_STATUSES: PrototypeStatus[] = [
  "draft",
  "engineering_design",
  "prototype_manufacturing",
  "testing_validation",
  "engineering_review",
  "approved_with_conditions",
  "revision_required",
];

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: PrototypeLookups = {
  prototypeCategories: [
    "Mechanical Prototype",
    "Electrical Prototype",
    "Electronic Prototype",
    "Embedded Prototype",
    "Integrated System Prototype",
    "Digital Prototype",
    "Functional Prototype",
  ],
  prototypeTypes: [
    "Alpha Prototype",
    "Beta Prototype",
    "Engineering Prototype",
    "Production Prototype",
    "Demonstration Prototype",
    "Pilot Prototype",
  ],
  engineeringDisciplines: [
    "Mechanical",
    "Electrical",
    "Electronics",
    "Software",
    "Embedded Systems",
    "Thermal",
    "Materials",
  ],
  communicationProtocols: ["CAN", "Ethernet", "Wi-Fi", "OCPP 2.0.1", "Bluetooth", "Modbus", "LIN"],
  designStandards: ["ISO 15118", "IEC 61851", "ISO 9001", "ISO 26262", "IEC 61980", "IATF 16949"],
  manufacturingMethods: [
    "3D Printing",
    "CNC Machining",
    "Sheet Metal Fabrication",
    "Injection Molding",
    "PCB Assembly",
    "Manual Assembly",
    "Contract Manufacturing",
    "CNC Machining + PCB Assembly",
  ],
  fabricationStatuses: ["Planned", "In Progress", "Completed", "Delayed", "Cancelled"],
  assemblyStatuses: ["Planned", "In Progress", "Completed", "Delayed"],
  qualityInspectionStatuses: ["Pending", "In Progress", "Passed", "Failed"],
  manufacturingReadinessLevels: [
    "MRL 1 – Basic Manufacturing Implications Identified",
    "MRL 2 – Manufacturing Concepts Defined",
    "MRL 3 – Manufacturing Proof of Concept",
    "MRL 4 – Capability Demonstrated in Laboratory",
    "MRL 5 – Capability Demonstrated in Relevant Environment",
    "MRL 6 – Prototype Manufacturing Demonstrated",
    "MRL 7 – Pilot Production Demonstrated",
    "MRL 8 – Ready for Low-Rate Production",
    "MRL 9 – Full-Rate Production Ready",
    "MRL 10 – Lean Full-Scale Manufacturing",
  ],
  technologyReadinessLevels: [
    "TRL 4 – Validated in Lab",
    "TRL 5 – Validated in Relevant Environment",
    "TRL 6 – Prototype Demonstration",
    "TRL 7 – System Prototype Demonstration",
    "TRL 8 – System Complete & Qualified",
    "TRL 9 – Proven in Operations",
  ],
  recommendations: [
    "Proceed to Engineering Validation",
    "Proceed to Design Verification",
    "Pilot Production",
    "Product Development",
    "Revise Prototype",
    "Repeat Prototype Build",
    "Archive Prototype",
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
    "Implement Design Changes",
    "Update Design & Manufacture Again",
    "Conduct Additional Testing",
    "Close Prototype Project",
  ],
  manufacturingPartners: [
    "TechFab Solutions Pvt. Ltd.",
    "Precision Proto Labs",
    "Magnertia In-house Workshop",
    "ElectroBuild Systems",
    "RapidCraft Manufacturing",
  ],
  prototypeOwners: ["Rohit Verma", "Priya Sharma", "Neha Sharma", "Vikram Singh", "Arjun Mehta"],
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
    "CAD Files",
    "PCB Files",
    "Firmware",
    "Source Code",
    "Test Reports",
    "Images",
    "Videos",
    "BOM",
    "Assembly Manual",
    "Engineering Drawings",
  ],
};

/** Default engineering-design files shown when a prototype is created. */
const DEFAULT_DESIGN_FILES = [
  { name: "CAD_Models.zip", fileType: "zip", sizeLabel: "12.4 MB" },
  { name: "PCB_Design.brd", fileType: "brd", sizeLabel: "4.8 MB" },
  { name: "Circuit_Schematics.pdf", fileType: "pdf", sizeLabel: "2.1 MB" },
  { name: "Wiring_Diagram.pdf", fileType: "pdf", sizeLabel: "1.6 MB" },
  { name: "BOM_Rev1.2.xlsx", fileType: "xlsx", sizeLabel: "88 KB" },
];

function mrlNumber(mrl: string): number {
  const m = /MRL\s*(\d+)/i.exec(mrl || "");
  return m ? Number(m[1]) : 0;
}
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

const FAB_STATUS_SCORE: Record<string, number> = {
  Completed: 100,
  "In Progress": 60,
  Planned: 30,
  Delayed: 40,
  Cancelled: 0,
};
const QI_STATUS_SCORE: Record<string, number> = {
  Passed: 100,
  "In Progress": 60,
  Pending: 40,
  Failed: 15,
};

/* ---------------------- AI Engineering Assessment ------------------------- */
function computeAI(input: PrototypeFormInput): PrototypeAIAssessment {
  const t = input.testing;
  const m = input.manufacturing;
  const c = input.commercial;

  // Design quality: architecture completeness + design-standards breadth + discipline breadth.
  const archDepth =
    [
      input.architecture.systemArchitecture,
      input.architecture.mechanicalDesign,
      input.architecture.electricalDesign,
      input.architecture.embeddedSoftware,
    ].filter(filled).length / 4;
  const aiDesignQualityScore = clamp(
    round(
      0.4 * archDepth * 100 +
        0.3 * clamp((input.engineering.designStandards.length / 4) * 100) +
        0.3 * clamp((input.overview.engineeringDiscipline.length / 5) * 100),
    ),
  );

  // Manufacturing: fabrication/assembly/quality status + MRL + method defined.
  const aiManufacturingScore = clamp(
    round(
      0.3 * (FAB_STATUS_SCORE[m.fabricationStatus] ?? 40) +
        0.25 * (FAB_STATUS_SCORE[m.assemblyStatus] ?? 40) +
        0.2 * (QI_STATUS_SCORE[m.qualityInspection] ?? 40) +
        0.25 * clamp((mrlNumber(c.manufacturingReadinessLevel) / 10) * 100),
    ),
  );

  // Reliability: reliability + safety + environmental + EMC/EMI tests.
  const aiReliabilityScore = clamp(
    round(stars10(avg([t.reliabilityTest, t.safetyTest, t.environmentalTest, t.emcEmiTest]))),
  );

  // Compliance: compliance test + safety test + design-standards breadth.
  const aiComplianceScore = clamp(
    round(
      0.4 * stars10(t.complianceTest) +
        0.3 * stars10(t.safetyTest) +
        0.3 * clamp((input.engineering.designStandards.length / 4) * 100),
    ),
  );

  // Risk (higher = safer): inverse of open design issues + reliability strength.
  const hasIssues = filled(input.improvements.designIssues);
  const aiRiskScore = clamp(
    round(0.5 * aiReliabilityScore + 0.3 * stars10(t.functionalTest) + (hasIssues ? 0 : 20)),
  );

  // Readiness: MRL + TRL + customer-demo readiness + scalability.
  const aiReadinessScore = clamp(
    round(
      0.3 * clamp((mrlNumber(c.manufacturingReadinessLevel) / 10) * 100) +
        0.25 * clamp((trlNumber(c.technologyReadinessLevel) / 9) * 100) +
        0.2 * (c.customerDemonstrationReady ? 100 : 40) +
        0.25 * stars10(c.productionScalability),
    ),
  );

  const recs: string[] = [];
  if (aiReadinessScore >= 75)
    recs.push("Optimize coil design, improve EMI shielding, and reduce material cost by 8–10%.");
  else if (aiReadinessScore >= 60)
    recs.push("Address the weakest engineering dimension before validation.");
  else recs.push("Rebuild key subsystems and re-test before proceeding.");
  if (aiComplianceScore < 70) recs.push("Close remaining compliance test gaps.");

  const manufacturabilityAnalysis = `${m.manufacturingMethod || "Method TBD"} via ${m.manufacturingPartner || "partner TBD"}; fabrication ${m.fabricationStatus || "pending"}, assembly ${m.assemblyStatus || "pending"}.`;
  const riskAssessment =
    aiRiskScore >= 70
      ? "Low engineering risk — reliability and safety validated."
      : "Moderate engineering risk — address open design issues and reliability gaps.";
  const designOptimizationSuggestions = filled(input.improvements.designOptimization)
    ? input.improvements.designOptimization
    : "Improve coil alignment, cooling path and EMI filter.";
  const costAnalysis = `Manufacturing cost ₹${(m.manufacturingCost || 0).toLocaleString("en-IN")} for a build of ${m.prototypeQuantity || 0} unit(s).`;
  const improvementRecommendations = filled(input.improvements.futureImprovements)
    ? input.improvements.futureImprovements
    : "Optimize weight, reduce cost, enhance scalability.";

  return {
    aiDesignQualityScore,
    aiManufacturingScore,
    aiReliabilityScore,
    aiComplianceScore,
    aiRiskScore,
    aiReadinessScore,
    recommendations: recs.join(" "),
    manufacturabilityAnalysis,
    riskAssessment,
    designOptimizationSuggestions,
    costAnalysis,
    improvementRecommendations,
    generatedAt: nowISO(),
  };
}

function computeSummary(input: PrototypeFormInput, ai: PrototypeAIAssessment): PrototypeSummary {
  const engineeringScore = ai.aiDesignQualityScore;
  const validationScore = clamp(
    round(
      stars10(
        avg([
          input.testing.functionalTest,
          input.testing.performanceTest,
          input.testing.reliabilityTest,
          input.testing.safetyTest,
          input.testing.emcEmiTest,
          input.testing.environmentalTest,
          input.testing.complianceTest,
        ]),
      ),
    ),
  );
  const manufacturingScore = ai.aiManufacturingScore;
  const commercialReadinessScore = clamp(
    round(
      0.4 * ai.aiReadinessScore +
        0.3 * stars10(input.commercial.costOptimization) +
        0.3 * stars10(input.commercial.serviceability),
    ),
  );
  const overallPrototypeScore = clamp(
    round(
      0.3 * engineeringScore +
        0.3 * validationScore +
        0.2 * manufacturingScore +
        0.2 * commercialReadinessScore,
    ),
  );
  return {
    engineeringScore,
    validationScore,
    manufacturingScore,
    commercialReadinessScore,
    overallPrototypeScore,
    recommendation: input.recommendation || defaultRecommendation(overallPrototypeScore),
  };
}

function defaultRecommendation(score: number): string {
  if (score >= 72) return "Proceed to Engineering Validation";
  if (score >= 62) return "Proceed to Design Verification";
  if (score >= 52) return "Revise Prototype";
  if (score >= 42) return "Repeat Prototype Build";
  return "Archive Prototype";
}

function computeNextAction(status: PrototypeStatus, stage: PrototypeStage): string {
  switch (status) {
    case "draft":
    case "engineering_design":
    case "prototype_manufacturing":
    case "testing_validation":
      return `Complete the ${STAGE_LABEL[stage]} stage`;
    case "engineering_review":
      return "All stages complete — Submit Prototype Package";
    case "approved":
      return "Proceed to Engineering Validation";
    case "approved_with_conditions":
      return "Implement design changes";
    case "revision_required":
      return "Update design & manufacture again";
    case "rejected":
      return "Prototype project closed — archived";
    case "archived":
      return "Archived";
    default:
      return "—";
  }
}

function initialStages(): PrototypeStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function initialReviewers(): PrototypeReviewer[] {
  return [
    { role: "Engineering Manager", name: "Neha Sharma", status: "pending", date: null },
    { role: "Quality Manager", name: "Vikram Singh", status: "pending", date: null },
    { role: "Manufacturing Manager", name: "Arjun Mehta", status: "pending", date: null },
    { role: "R&D Director", name: "Dr. Anita Patel", status: "pending", date: null },
    { role: "CTO", name: "Sankaran R.", status: "pending", date: null },
  ];
}

/* ------------------------------- Shaping ---------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): PrototypeProjectRecord {
  if (!doc) throw new Error("Prototype project not found.");
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<PrototypeProjectRecord, "id">),
    id: _id?.toString?.() ?? String(_id),
  };
}
function toListRow(r: PrototypeProjectRecord): PrototypeListRow {
  return {
    id: r.id,
    prototypeId: r.prototypeId,
    formCode: r.formCode,
    prototypeName: r.prototypeName,
    status: r.status,
    prototypeOwner: r.prototypeOwner,
    progressPercentage: r.progressPercentage,
    overallPrototypeScore: r.summary.overallPrototypeScore,
    prototypeVersion: r.prototypeVersion,
    linkedPocCode: r.linkedPocCode,
    updatedAt: r.updatedAt,
  };
}

function recordToInput(r: PrototypeProjectRecord): PrototypeFormInput {
  return {
    prototypeName: r.prototypeName,
    businessUnit: r.businessUnit,
    department: r.department,
    prototypeOwner: r.prototypeOwner,
    developmentStartDate: r.developmentStartDate,
    targetCompletion: r.targetCompletion,
    linkedPocId: r.linkedPocId,
    overview: r.overview,
    architecture: r.architecture,
    engineering: r.engineering,
    manufacturing: r.manufacturing,
    testing: r.testing,
    improvements: r.improvements,
    commercial: r.commercial,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
  };
}

/* ============================= Read endpoints ============================= */
export const getPrototypeLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getPrototypeListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getPrototypeCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as PrototypeListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getPrototypeFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPrototypeCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Prototype project not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Approved PoC projects — the only valid creation source. */
export const getApprovedPocsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getPocCollection();
    const docs = await coll.find({ status: "approved" }).toArray();
    const items = docs.map((d: Record<string, unknown>) => {
      const overview = (d.overview ?? {}) as Record<string, string>;
      const summary = (d.summary ?? {}) as Record<string, unknown>;
      return {
        id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
        pocCode: (d.pocId as string) ?? "",
        pocTitle: (d.pocTitle as string) ?? "",
        objective: overview.objective ?? "",
        proposedSolution: overview.proposedSolution ?? "",
        overallPocScore: (summary.overallPocScore as number) ?? 0,
        technologyReadinessLevel: (summary.technologyReadinessLevel as string) ?? "",
        linkedFeasibilityStudyId: (d.linkedFeasibilityStudyId as string) ?? null,
        linkedFeasibilityStudyCode: (d.linkedFeasibilityStudyCode as string) ?? null,
        linkedResearchProjectId: (d.linkedResearchProjectId as string) ?? null,
        linkedResearchProjectCode: (d.linkedResearchProjectCode as string) ?? null,
        businessUnit: (d.businessUnit as string) ?? "",
        department: (d.department as string) ?? "",
        projectManager: (d.projectManager as string) ?? "",
      };
    });
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ============================ Create / update ============================ */
export const savePrototypeDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: PrototypeFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPrototypeCollection();
      const now = nowISO();
      const ai = computeAI(data.input);
      const summary = computeSummary(data.input, ai);

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Prototype project not found.");
        const current = shape(existing);
        if (!EDITABLE_STATUSES.includes(current.status)) {
          throw new Error(`Prototype in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<PrototypeProjectRecord, "id"> = {
          ...current,
          prototypeName: data.input.prototypeName,
          businessUnit: data.input.businessUnit,
          department: data.input.department,
          prototypeOwner: data.input.prototypeOwner,
          developmentStartDate: data.input.developmentStartDate,
          targetCompletion: data.input.targetCompletion,
          overview: data.input.overview,
          architecture: data.input.architecture,
          engineering: data.input.engineering,
          manufacturing: data.input.manufacturing,
          testing: data.input.testing,
          improvements: data.input.improvements,
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

      // Create — only from an approved PoC.
      if (!data.input.linkedPocId) {
        throw new Error("A prototype can only be created from an approved PoC.");
      }
      const pocColl = await getPocCollection();
      const pocDoc = await pocColl.findOne({ _id: await newObjectId(data.input.linkedPocId) });
      if (!pocDoc) throw new Error("Linked PoC not found.");
      if (pocDoc.status !== "approved") {
        throw new Error("The linked PoC must be Approved.");
      }
      const linkedPocId = pocDoc._id?.toString?.() ?? String(pocDoc._id);
      const linkedPocCode = (pocDoc.pocId as string) ?? null;
      const linkedFeasibilityStudyId = (pocDoc.linkedFeasibilityStudyId as string) ?? null;
      const linkedFeasibilityStudyCode = (pocDoc.linkedFeasibilityStudyCode as string) ?? null;
      const linkedResearchProjectId = (pocDoc.linkedResearchProjectId as string) ?? null;
      const linkedResearchProjectCode = (pocDoc.linkedResearchProjectCode as string) ?? null;

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const prototypeId = `PRD-${year}-${String(seq).padStart(5, "0")}`;
      const formCode = `PRD-${year}-${String(seq).padStart(2, "0")}`;

      // Seed the engineering-design file cards (from CAD/PDM) if none provided.
      const engineering = {
        ...data.input.engineering,
        designFiles:
          data.input.engineering.designFiles.length > 0
            ? data.input.engineering.designFiles
            : DEFAULT_DESIGN_FILES.map((f, i) => ({ id: `df-${i}`, ...f })),
      };
      const inputWithFiles: PrototypeFormInput = { ...data.input, engineering };
      const ai2 = computeAI(inputWithFiles);
      const summary2 = computeSummary(inputWithFiles, ai2);

      const record: Omit<PrototypeProjectRecord, "id"> = {
        prototypeId,
        formCode,
        status: "draft",
        currentStage: "engineering_design",
        currentStageLabel: STAGE_LABEL.engineering_design,
        stages: initialStages(),
        progressPercentage: PROGRESS_BY_STATUS.draft,
        prototypeVersion: "1.0",
        version: 1,
        prototypeName: data.input.prototypeName,
        businessUnit: data.input.businessUnit,
        department: data.input.department,
        prototypeOwner: data.input.prototypeOwner,
        developmentStartDate: data.input.developmentStartDate,
        targetCompletion: data.input.targetCompletion,
        linkedPocId,
        linkedPocCode,
        linkedFeasibilityStudyId,
        linkedFeasibilityStudyCode,
        linkedResearchProjectId,
        linkedResearchProjectCode,
        overview: data.input.overview,
        architecture: data.input.architecture,
        engineering,
        manufacturing: data.input.manufacturing,
        testing: data.input.testing,
        improvements: data.input.improvements,
        commercial: data.input.commercial,
        aiAssessment: ai2,
        summary: summary2,
        attachments: data.input.attachments,
        reviewers: initialReviewers(),
        approvalDecision: null,
        reviewNextAction: null,
        reviewComments: null,
        reviewConditions: null,
        approvalDate: null,
        nextAction: computeNextAction("draft", "engineering_design"),
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
            event: `Prototype ${prototypeId} created from approved PoC ${linkedPocCode}`,
          },
          {
            at: now,
            actor: "System",
            event:
              "Context retrieved — technical validation report (PoC), CAD models & engineering drawings (CAD/PDM), engineering BOM & material list (BOM Management), material availability & supplier status (Procurement) and patent/FTO status",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Engineering Design stage started",
            stage: "engineering_design",
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
export const completePrototypeStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: PrototypeStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPrototypeCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Prototype project not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Prototype in "${current.status}" cannot change stage.`);
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
      const stages: PrototypeStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });

      const input = recordToInput(current);
      const ai = computeAI(input);
      const summary = computeSummary(input, ai);
      const status = STATUS_AFTER_STAGE[data.stage];

      const stageOutput: Record<PrototypeStage, string> = {
        engineering_design: `AI review — design quality ${ai.aiDesignQualityScore}/100; ${ai.manufacturabilityAnalysis}`,
        prototype_manufacturing: `AI evaluation — manufacturing readiness ${ai.aiManufacturingScore}/100; ${ai.costAnalysis}`,
        testing_validation: `AI analysis — validation ${summary.validationScore}/100, reliability ${ai.aiReliabilityScore}/100, compliance ${ai.aiComplianceScore}/100`,
        engineering_review: `Prototype summary — overall ${summary.overallPrototypeScore}/100`,
      };

      const updated: Omit<PrototypeProjectRecord, "id"> = {
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
export const submitPrototypeFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPrototypeCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Prototype project not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Prototype is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(`Complete all stages first. Outstanding: ${incomplete.join(", ")}.`);
      }
      const now = nowISO();
      const reviewers: PrototypeReviewer[] = current.reviewers.map((r) =>
        r.role === "Engineering Manager" || r.role === "Quality Manager"
          ? { ...r, status: "reviewed", date: now }
          : r,
      );
      const updated: Omit<PrototypeProjectRecord, "id"> = {
        ...current,
        status: "engineering_review",
        reviewers,
        version: ["approved_with_conditions", "revision_required"].includes(current.status)
          ? current.version + 1
          : current.version,
        nextAction: "Awaiting Engineering Review Committee decision",
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "Prototype package submitted to the Engineering Review Committee",
            fromStatus: current.status,
            toStatus: "engineering_review",
          },
          {
            at: now,
            actor: "System",
            event: "Engineering Manager and Quality Manager sign-off recorded",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewPrototypeFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      decision: PrototypeApprovalDecision;
      nextAction?: string;
      comments?: string;
      conditions?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getPrototypeCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Prototype project not found.");
      const current = shape(existing);
      if (current.status !== "engineering_review") {
        throw new Error(`Prototype is "${current.status}", not under engineering review.`);
      }
      const now = nowISO();
      const auditTrail = [...current.auditTrail];
      let status: PrototypeStatus;
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
          prototypeProjectId: current.id,
          prototypeProjectCode: current.prototypeId,
          title: current.prototypeName || current.prototypeId,
          prototypeOwner: current.prototypeOwner,
          overallPrototypeScore: current.summary.overallPrototypeScore,
          status: "Initiated",
          createdAt: now,
        });
        engineeringValidationId = evRes.insertedId?.toString?.() ?? projectCode;
        engineeringValidationCode = projectCode;
        auditTrail.push({
          at: now,
          actor: "Engineering Review Committee",
          event: `Prototype approved${data.comments ? ` — ${data.comments}` : ""}`,
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
          event: "Project Manager notified: Proceed to Engineering Validation",
        });
      } else if (data.decision === "Approved with Conditions") {
        status = "approved_with_conditions";
        approvalDate = now;
        reviewConditions = data.conditions ?? data.comments ?? null;
        auditTrail.push({
          at: now,
          actor: "Engineering Review Committee",
          event: `Approved with modifications${reviewConditions ? ` — ${reviewConditions}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Implement Design Changes",
        });
      } else if (data.decision === "Revision Required" || data.decision === "On Hold") {
        status = "revision_required";
        auditTrail.push({
          at: now,
          actor: "Engineering Review Committee",
          event: `${data.decision}${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Update Design & Manufacture Again",
        });
      } else {
        status = "rejected";
        auditTrail.push({
          at: now,
          actor: "Engineering Review Committee",
          event: `Prototype rejected${data.comments ? ` — ${data.comments}` : ""}`,
          fromStatus: current.status,
          toStatus: status,
        });
        auditTrail.push({ at: now, actor: "System", event: "Prototype archived" });
        auditTrail.push({
          at: now,
          actor: "System",
          event: "Project Manager notified: Close Prototype Project",
        });
      }
      // Continuous engineering governance — on every decision.
      auditTrail.push({
        at: now,
        actor: "System",
        event:
          "Governance: Prototype Dashboard and KPI Dashboard updated; engineering report generated",
      });

      const reviewers: PrototypeReviewer[] = current.reviewers.map((r) =>
        data.decision === "Revision Required" || data.decision === "On Hold"
          ? r
          : r.status === "pending"
            ? { ...r, status: "reviewed", date: now }
            : r,
      );

      const updated: Omit<PrototypeProjectRecord, "id"> = {
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
        lastModifiedBy: "Engineering Review Committee",
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
export const generatePrototypeReportFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPrototypeCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Prototype project not found.");
      const current = shape(existing);
      const now = nowISO();
      const ai = computeAI(recordToInput(current));
      const summary = computeSummary(recordToInput(current), ai);
      const updated: Omit<PrototypeProjectRecord, "id"> = {
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
            event: "Prototype report generated — AI assessment and scores refreshed",
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
