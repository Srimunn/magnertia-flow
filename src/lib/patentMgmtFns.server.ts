import { createServerFn } from "@tanstack/react-start";
import type {
  PatentAIAnalytics,
  PatentApprovalDecision,
  PatentDeadlines,
  PatentDeadlineTone,
  PatentFormInput,
  PatentListRow,
  PatentLookups,
  PatentRecord,
  PatentRenewalState,
  PatentReviewRow,
  PatentStage,
  PatentStageState,
  PatentStatus,
  PatentSummary,
} from "@/services/types";

/* ===========================================================================
   Patent Management — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   Created ONLY from an approved IP record. Genuinely date-driven: the header
   Next Action, the Response-Due alert and the Renewal Status are all COMPUTED
   from dates, never free-form.
     Stage 1 Preparation ─▶ Stage 2 Filing ─▶ Stage 3 Examination
       ─▶ Stage 4 Grant (auto Patent Portfolio entry) ─▶ Stage 5 Commercialization
         (auto Licensing opportunity)
     ──Submit Patent Summary──▶ Executive Review (Patent Review Committee)
           ├─ Approved ▶ active
           ├─ Approved with Recommendations ▶ commercialization (editable)
           ├─ Revision Required ▶ revision_required (editable)
           └─ Abandon Patent ▶ closed
   Section 8 (AI analytics) is the single source of truth for section 9. No LLM.
   =========================================================================== */

async function getPatentsColl() {
  const mod = await import("./mongodb.server");
  return mod.getPatentsCollection();
}
async function getIpColl() {
  const mod = await import("./mongodb.server");
  return mod.getIpDevelopmentCollection();
}
async function getPortfolioColl() {
  const mod = await import("./mongodb.server");
  return mod.getPatentPortfolioCollection();
}
async function getLicensingColl() {
  const mod = await import("./mongodb.server");
  return mod.getLicensingOpportunitiesCollection();
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

const STAGE_ORDER: PatentStage[] = [
  "preparation",
  "filing",
  "examination",
  "grant",
  "commercialization",
];
const STAGE_LABEL: Record<PatentStage, string> = {
  preparation: "Patent Preparation",
  filing: "Patent Filing",
  examination: "Patent Examination",
  grant: "Patent Grant",
  commercialization: "Commercialization",
};
/** Completing a stage advances the workflow status. */
const STATUS_AFTER_STAGE: Record<PatentStage, PatentStatus> = {
  preparation: "filing",
  filing: "examination",
  examination: "granted",
  grant: "commercialization",
  commercialization: "commercialization",
};

const EDITABLE_STATUSES: PatentStatus[] = [
  "draft",
  "preparation",
  "filing",
  "examination",
  "granted",
  "commercialization",
  "revision_required",
];

/* ------------------------------- Lookups (I) ------------------------------ */
const LOOKUPS: PatentLookups = {
  patentTypes: [
    "Utility Patent",
    "Design Patent",
    "Provisional Patent",
    "Plant Patent",
    "Continuation Patent",
    "Divisional Patent",
  ],
  technologyAreas: [
    "Robotics & Automation",
    "Wireless Power Transfer",
    "Battery Technology",
    "Power Electronics",
    "Artificial Intelligence",
    "Embedded Systems",
    "Materials Science",
    "Charging Infrastructure",
  ],
  technologyDomains: [
    "Robotics & Automation",
    "Wireless Power Transfer",
    "Energy Storage",
    "Autonomy",
    "Connectivity",
    "Manufacturing",
    "Software & AI",
  ],
  industrySectors: [
    "Automotive",
    "Energy",
    "Manufacturing",
    "Electronics",
    "Aerospace",
    "Industrial",
  ],
  patentStatuses: [
    "Draft",
    "Filed",
    "Published",
    "Examination",
    "Granted",
    "Licensed",
    "Abandoned",
    "Expired",
  ],
  ownerships: [
    "Company Owned",
    "Jointly Owned",
    "Licensed-In",
    "Inventor Owned",
    "Government Funded",
  ],
  organizations: [
    "Magnertia R&D Center",
    "Magnertia Advanced Engineering",
    "Magnertia Innovation Labs",
  ],
  filingRoutes: [
    "PCT Filing",
    "Direct National Filing",
    "Paris Convention",
    "Provisional Filing",
    "Continuation Filing",
  ],
  filingCountries: [
    "India (IN)",
    "USA (US)",
    "Europe (EP)",
    "Japan (JP)",
    "China (CN)",
    "South Korea (KR)",
    "Germany (DE)",
    "United Kingdom (GB)",
  ],
  patentOffices: [
    "World Intellectual Property Organization (WIPO)",
    "Indian Patent Office (IPO)",
    "United States Patent and Trademark Office (USPTO)",
    "European Patent Office (EPO)",
    "Japan Patent Office (JPO)",
  ],
  filingAttorneys: [
    "LexOrbis IP Services",
    "K&S Partners",
    "Anand and Anand",
    "Remfry & Sagar",
    "Obhan & Associates",
  ],
  officeActions: [
    "None",
    "First Examination Report",
    "Second Examination Report",
    "Written Opinion",
    "Notice of Allowance",
    "Final Rejection",
  ],
  prosecutionStages: [
    "Pre-Filing",
    "Filed",
    "Office Action",
    "Response Filed",
    "Amendment",
    "Allowance",
    "Grant",
  ],
  renewalFrequencies: [
    "Every Year",
    "Every 2 Years",
    "Every 3 Years",
    "Every 4 Years",
    "Every 5 Years",
  ],
  licensingStatuses: [
    "Not Licensed",
    "Under Negotiation",
    "Licensed",
    "Exclusive License",
    "Non-Exclusive License",
    "Cross License",
  ],
  royaltyModels: [
    "Running Royalty",
    "Lump Sum",
    "Milestone-Based",
    "Hybrid",
    "Fixed Fee",
    "Equity Share",
  ],
  recommendations: [
    "Continue Prosecution",
    "Maintain & License",
    "Expand International Coverage",
    "Optimize Portfolio",
    "Strengthen Claims",
    "Abandon Patent",
  ],
  approvalDecisions: [
    "Approved",
    "Approved with Recommendations",
    "Revision Required",
    "Abandon Patent",
  ],
  patentManagers: ["Rohit Verma", "Priya Sharma", "Neha Sharma", "Vikram Singh", "Arjun Mehta"],
  inventors: [
    "Arjun Mehta",
    "Vikram Singh",
    "Neha Sharma",
    "Aarav Patel",
    "Rohit Verma",
    "Priya Sharma",
    "Ananya Rao",
    "Karan Patel",
  ],
  jurisdictions: [
    "USA",
    "Europe",
    "Japan",
    "Australia",
    "Canada",
    "China",
    "South Korea",
    "Brazil",
    "India",
  ],
  keywordSuggestions: [
    "Autonomous Docking",
    "AI Control",
    "Wireless Power Transfer",
    "Sensor Fusion",
    "Electric Vehicle",
    "Coil Alignment",
    "Battery Management",
  ],
  attachmentCategories: [
    "Patent Specification",
    "Patent Claims",
    "Patent Drawings",
    "Filing Receipt",
    "Office Action",
    "Attorney Opinion",
    "Grant Certificate",
    "Licensing Agreement",
  ],
};

const RENEWAL_YEARS: Record<string, number> = {
  "Every Year": 1,
  "Every 2 Years": 2,
  "Every 3 Years": 3,
  "Every 4 Years": 4,
  "Every 5 Years": 5,
};

/* ------------------------------ Deadline math ----------------------------- */
function daysUntil(dateStr: string | null | undefined): number | null {
  if (!filled(dateStr)) return null;
  const d = new Date(dateStr as string);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
function toneFromDays(days: number | null): PatentDeadlineTone {
  if (days === null) return "none";
  if (days < 0) return "overdue";
  if (days <= 7) return "due";
  if (days <= 30) return "soon";
  return "ok";
}
function addYears(dateStr: string, years: number): Date {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d;
}
/** Next renewal due date = smallest (grantDate + k*years) that is today-or-future. */
function computeRenewal(grant: PatentRecord["grant"]): {
  state: PatentRenewalState;
  dueDate: string | null;
  daysLeft: number | null;
} {
  if (!filled(grant.grantDate)) return { state: "N/A", dueDate: null, daysLeft: null };
  const years = RENEWAL_YEARS[grant.renewalFrequency] ?? 2;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let due: Date | null = null;
  for (let k = 1; k <= 20; k++) {
    const candidate = addYears(grant.grantDate, years * k);
    candidate.setHours(0, 0, 0, 0);
    if (candidate.getTime() >= today.getTime()) {
      due = candidate;
      break;
    }
  }
  if (!due) return { state: "Overdue", dueDate: null, daysLeft: null };
  const daysLeft = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  // "Paid" is represented when the next cost is zeroed out by the manager.
  if (grant.renewalCostNext === 0) return { state: "Paid", dueDate: due.toISOString(), daysLeft };
  let state: PatentRenewalState;
  if (daysLeft < 0) state = "Overdue";
  else if (daysLeft <= 60) state = "Due";
  else state = "Upcoming";
  return { state, dueDate: due.toISOString(), daysLeft };
}

function computeDeadlines(input: PatentFormInput): PatentDeadlines {
  const responseDays = input.prosecution.responseSubmitted
    ? null
    : daysUntil(input.prosecution.responseDueDate);
  const responseDueTone: PatentDeadlineTone = input.prosecution.responseSubmitted
    ? "none"
    : toneFromDays(responseDays);

  const renewal = computeRenewal(input.grant);
  const targetGrantDays = daysUntil(input.targetGrantDate);
  const expiryDays = daysUntil(input.grant.expiryDate);

  return {
    responseDueTone,
    responseDaysLeft: responseDays,
    renewalState: renewal.state,
    renewalDueDate: renewal.dueDate,
    renewalDaysLeft: renewal.daysLeft,
    targetGrantTone: toneFromDays(targetGrantDays),
    targetGrantDaysLeft: targetGrantDays,
    expiryTone: toneFromDays(expiryDays),
    expiryDaysLeft: expiryDays,
  };
}

/* --------------------------- Next Action (computed) ----------------------- */
function computeNextAction(
  status: PatentStatus,
  stage: PatentStage,
  deadlines: PatentDeadlines,
  input: PatentFormInput,
): string {
  const renewalDueOrOverdue =
    deadlines.renewalState === "Due" || deadlines.renewalState === "Overdue";
  const responseOpen =
    !input.prosecution.responseSubmitted &&
    (deadlines.responseDueTone === "due" ||
      deadlines.responseDueTone === "overdue" ||
      deadlines.responseDueTone === "soon");

  switch (status) {
    case "draft":
    case "preparation":
      return "Complete Patent Preparation";
    case "filing":
      return "Submit Filing Package";
    case "examination":
      return responseOpen ? "Respond to Office Action" : "Await Examination Result";
    case "granted":
      return renewalDueOrOverdue ? "Pay Renewal Fee" : "Advance to Commercialization";
    case "commercialization":
      return "Create Licensing Opportunity — Submit for Review";
    case "active":
      return renewalDueOrOverdue ? "Pay Renewal Fee" : "Patent Active — Monitor Deadlines";
    case "revision_required":
      return "Strengthen Patent Claims";
    case "abandoned":
    case "closed":
      return "Patent Closed";
    default:
      return "—";
  }
}

/* ---------------------- AI Patent Analytics (computed) -------------------- */
function computeAI(input: PatentFormInput): PatentAIAnalytics {
  const info = input.information;
  const inv = input.inventorInfo;
  const filing = input.filing;
  const comm = input.commercialization;

  // Claim quality: abstract depth + keyword breadth + patent-type strength.
  const abstractDepth = Math.min(1, (info.abstract || "").trim().length / 200);
  const claimQualityScore = clamp(
    round(
      0.4 * abstractDepth * 100 +
        0.3 * clamp((info.keywords.length / 5) * 100) +
        0.3 * (info.patentType === "Utility Patent" ? 90 : 70),
    ),
  );

  // Patent strength: claim quality + international coverage + assignment/NDA hygiene.
  const coverage = clamp((filing.filingCountries.length / 4) * 100);
  const hygiene = (inv.assignmentAgreement ? 50 : 0) + (inv.ndaSigned ? 50 : 0);
  const patentStrengthScore = clamp(
    round(0.45 * claimQualityScore + 0.3 * coverage + 0.25 * hygiene),
  );

  // Litigation risk (lower = better): fewer countries + weak claims + no FTO hygiene raise it.
  const litigationRisk = clamp(
    round(
      0.4 * (100 - claimQualityScore) +
        0.3 * (100 - coverage) +
        0.3 * (inv.assignmentAgreement && inv.ndaSigned ? 20 : 60),
    ),
  );

  // Licensing potential: strategic importance + commercial value + licensing status.
  const licensingStatusScore =
    comm.licensingStatus === "Licensed" || comm.licensingStatus === "Exclusive License"
      ? 90
      : comm.licensingStatus === "Under Negotiation"
        ? 70
        : 45;
  const commercialValueScore =
    comm.commercialValue > 0 ? clamp((Math.log10(comm.commercialValue) / 9) * 100) : 30;
  const licensingPotential = clamp(
    round(
      0.4 * (comm.strategicImportance || 0) * 10 +
        0.3 * commercialValueScore +
        0.3 * licensingStatusScore,
    ),
  );

  // Commercial score: licensing potential + commercial value + royalty presence.
  const commercialScore = clamp(
    round(
      0.4 * licensingPotential +
        0.35 * commercialValueScore +
        0.25 * (comm.annualRoyalty > 0 ? 90 : 40),
    ),
  );

  const grantProbability = clamp(round(0.6 * claimQualityScore + 0.4 * (100 - litigationRisk)));

  const renewal = computeRenewal(input.grant);
  const renewalRecommendation =
    patentStrengthScore >= 70
      ? "High value patent. Recommend renewal for maximum term and file in additional countries."
      : "Moderate value — renew selectively in core markets and monitor commercial traction.";
  const portfolioRecommendation =
    commercialScore >= 70
      ? "High strategic fit. Add to core portfolio and prioritize licensing."
      : "Retain as supporting IP; revisit licensing strategy as the market matures.";

  return {
    patentStrengthScore,
    claimQualityScore,
    litigationRisk,
    licensingPotential,
    commercialScore,
    renewalRecommendation,
    portfolioRecommendation,
    noveltyAssessment:
      claimQualityScore >= 70
        ? "Strong novelty — limited prior art overlap in the claimed domain."
        : "Moderate novelty — sharpen independent claims to improve differentiation.",
    inventiveStepAnalysis:
      patentStrengthScore >= 70
        ? "Non-obvious combination with clear technical advance."
        : "Inventive step defensible but would benefit from additional supporting embodiments.",
    suggestedClaimImprovements:
      "Broaden independent claim 1, add dependent claims covering coil-alignment and safety interlocks.",
    objectionAnalysis:
      input.prosecution.officeAction && input.prosecution.officeAction !== "None"
        ? `${input.prosecution.officeAction}: novelty and inventive-step objections likely; address with narrowed claims and prior-art distinctions.`
        : "No office action on record yet.",
    suggestedResponses:
      "Amend claims to recite the sensor-fusion alignment step; submit declarations evidencing unexpected efficiency gains.",
    grantProbability,
    portfolioImportance:
      commercialScore >= 75 ? "Core" : commercialScore >= 55 ? "Strategic" : "Supporting",
    generatedAt: nowISO(),
  };
}

function computeSummary(input: PatentFormInput, ai: PatentAIAnalytics): PatentSummary {
  const inv = input.inventorInfo;
  // Legal score: hygiene + prosecution posture + grant readiness.
  const legalScore = clamp(
    round(
      0.4 * ((inv.assignmentAgreement ? 50 : 0) + (inv.ndaSigned ? 50 : 0)) +
        0.3 * (100 - ai.litigationRisk) +
        0.3 * ai.grantProbability,
    ),
  );
  const patentStrengthScore = ai.patentStrengthScore;
  const commercialScore = ai.commercialScore;
  const portfolioScore = clamp(round(0.5 * ai.licensingPotential + 0.5 * commercialScore));
  const overallPatentScore = clamp(
    round(
      0.25 * legalScore + 0.3 * patentStrengthScore + 0.25 * commercialScore + 0.2 * portfolioScore,
    ),
  );
  return {
    legalScore,
    patentStrengthScore,
    commercialScore,
    portfolioScore,
    overallPatentScore,
    recommendation: input.recommendation || defaultRecommendation(overallPatentScore),
  };
}

function defaultRecommendation(score: number): string {
  if (score >= 72) return "Continue Prosecution";
  if (score >= 62) return "Maintain & License";
  if (score >= 52) return "Optimize Portfolio";
  if (score >= 42) return "Strengthen Claims";
  return "Abandon Patent";
}

function initialStages(): PatentStageState[] {
  return STAGE_ORDER.map((stage, idx) => ({
    stage,
    status: idx === 0 ? "in_progress" : "pending",
    startedAt: idx === 0 ? nowISO() : null,
    completedAt: null,
  }));
}
function initialReviewRows(): PatentReviewRow[] {
  return [
    {
      role: "Patent Manager",
      person: "Rohit Verma",
      decision: "Pending",
      comments: "",
      status: "Pending",
      date: null,
    },
    {
      role: "Patent Attorney",
      person: "Neha Sharma",
      decision: "Pending",
      comments: "",
      status: "Pending",
      date: null,
    },
    {
      role: "Legal Counsel",
      person: "Amitabh Singh",
      decision: "Pending",
      comments: "",
      status: "Pending",
      date: null,
    },
    {
      role: "R&D Director",
      person: "Vikram Singh",
      decision: "Pending",
      comments: "",
      status: "Pending",
      date: null,
    },
    {
      role: "CTO",
      person: "Arjun Mehta",
      decision: "Pending",
      comments: "",
      status: "Pending",
      date: null,
    },
    {
      role: "CEO",
      person: "Sanjay Kapoor",
      decision: "Pending",
      comments: "",
      status: "Pending",
      date: null,
    },
  ];
}

/* ------------------------------- Shaping ---------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(doc: any): PatentRecord {
  if (!doc) throw new Error("Patent not found.");
  const { _id, ...rest } = doc;
  return { ...(rest as Omit<PatentRecord, "id">), id: _id?.toString?.() ?? String(_id) };
}
function toListRow(r: PatentRecord): PatentListRow {
  return {
    id: r.id,
    patentId: r.patentId,
    patentNumber: r.patentNumber,
    patentTitle: r.patentTitle,
    status: r.status,
    patentManager: r.patentManager,
    overallPatentScore: r.summary.overallPatentScore,
    nextAction: r.nextAction,
    renewalState: r.deadlines.renewalState,
    responseDueTone: r.deadlines.responseDueTone,
    updatedAt: r.updatedAt,
  };
}
function recordToInput(r: PatentRecord): PatentFormInput {
  return {
    patentTitle: r.patentTitle,
    technologyDomain: r.technologyDomain,
    inventors: r.inventors,
    patentManager: r.patentManager,
    filingDate: r.filingDate,
    targetGrantDate: r.targetGrantDate,
    linkedIpRecordId: r.linkedIpRecordId,
    information: r.information,
    inventorInfo: r.inventorInfo,
    filing: r.filing,
    prosecution: r.prosecution,
    grant: r.grant,
    international: r.international,
    commercialization: r.commercialization,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
  };
}

/* ============================= Read endpoints ============================= */
export const getPatentLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getPatentListFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getPatentsColl();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return {
      success: true as const,
      data: docs.map((d: unknown) => toListRow(shape(d))) as PatentListRow[],
    };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getPatentFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPatentsColl();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Patent not found.");
      return { success: true as const, data: shape(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/** Approved IP records — the only valid creation source. */
export const getApprovedIpRecordsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getIpColl();
    const docs = await coll.find({ status: "approved" }).toArray();
    const items = docs.map((d: Record<string, unknown>) => ({
      id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
      ipRecordCode: (d.ipRecordCode as string) ?? "",
      inventionTitle: (d.inventionTitle as string) ?? "",
      abstract: (d.abstract as string) ?? "",
      technologyArea: (d.technologyArea as string) ?? "",
      technologyDomain: (d.technologyDomain as string) ?? "",
      industrySector: (d.industrySector as string) ?? "",
      leadInventor: (d.leadInventor as string) ?? "",
      coInventors: (d.coInventors as string[]) ?? [],
      keywords: (d.keywords as string[]) ?? [],
      linkedProductId: (d.linkedProductId as string) ?? null,
      linkedProductCode: (d.linkedProductCode as string) ?? null,
    }));
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ---------------------------- Build computed ------------------------------ */
function buildComputed(input: PatentFormInput, status: PatentStatus, stage: PatentStage) {
  const ai = computeAI(input);
  const summary = computeSummary(input, ai);
  const deadlines = computeDeadlines(input);
  const nextAction = computeNextAction(status, stage, deadlines, input);
  return { ai, summary, deadlines, nextAction };
}

/* ============================ Create / update ============================ */
export const savePatentDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: PatentFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPatentsColl();
      const now = nowISO();

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Patent not found.");
        const current = shape(existing);
        if (!EDITABLE_STATUSES.includes(current.status)) {
          throw new Error(`Patent in "${current.status}" cannot be edited.`);
        }
        const computed = buildComputed(data.input, current.status, current.currentStage);
        const updated: Omit<PatentRecord, "id"> = {
          ...current,
          patentTitle: data.input.patentTitle,
          technologyDomain: data.input.technologyDomain,
          inventors: data.input.inventors,
          patentManager: data.input.patentManager,
          filingDate: data.input.filingDate,
          targetGrantDate: data.input.targetGrantDate,
          information: data.input.information,
          inventorInfo: data.input.inventorInfo,
          filing: data.input.filing,
          prosecution: data.input.prosecution,
          grant: data.input.grant,
          international: data.input.international,
          commercialization: data.input.commercialization,
          aiAnalytics: computed.ai,
          summary: computed.summary,
          deadlines: computed.deadlines,
          nextAction: computed.nextAction,
          attachments: data.input.attachments,
          lastModifiedBy: CURRENT_USER,
          updatedAt: now,
          auditTrail: [
            ...current.auditTrail,
            {
              at: now,
              actor: CURRENT_USER,
              event: "Draft saved",
              kind: "change",
              stage: current.currentStage,
            },
          ],
        };
        await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
        const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
        return { success: true as const, data: shape(fresh) };
      }

      // Create — only from an approved IP record.
      if (!data.input.linkedIpRecordId) {
        throw new Error("A patent can only be created from an approved IP record.");
      }
      const ipColl = await getIpColl();
      const ipDoc = await ipColl.findOne({ _id: await newObjectId(data.input.linkedIpRecordId) });
      if (!ipDoc) throw new Error("Linked IP record not found.");
      if (ipDoc.status !== "approved") throw new Error("The linked IP record must be Approved.");
      const linkedIpRecordId = ipDoc._id?.toString?.() ?? String(ipDoc._id);
      const linkedIpRecordCode = (ipDoc.ipRecordCode as string) ?? null;
      const linkedProductId = (ipDoc.linkedProductId as string) ?? null;
      const linkedProductCode = (ipDoc.linkedProductCode as string) ?? null;

      const count = await coll.countDocuments();
      const seq = count + 1;
      const year = new Date().getFullYear();
      const patentId = `PAT-${year}-${String(seq).padStart(4, "0")}`;
      const formCode = `PAT-${year}-${String(seq).padStart(2, "0")}`;
      const patentFamily = `Family-${year}-${String(seq).padStart(4, "0")}`;

      const computed = buildComputed(data.input, "preparation", "preparation");

      const record: Omit<PatentRecord, "id"> = {
        patentId,
        patentNumber: "",
        applicationNumber: "",
        formCode,
        status: "preparation",
        currentStage: "preparation",
        currentStageLabel: STAGE_LABEL.preparation,
        stages: initialStages(),
        patentFamily,
        version: 1,
        patentTitle: data.input.patentTitle,
        technologyDomain: data.input.technologyDomain,
        inventors: data.input.inventors,
        patentManager: data.input.patentManager,
        filingDate: data.input.filingDate,
        targetGrantDate: data.input.targetGrantDate,
        linkedIpRecordId,
        linkedIpRecordCode,
        linkedProductId,
        linkedProductCode,
        information: data.input.information,
        inventorInfo: data.input.inventorInfo,
        filing: data.input.filing,
        prosecution: data.input.prosecution,
        grant: data.input.grant,
        international: data.input.international,
        commercialization: data.input.commercialization,
        aiAnalytics: computed.ai,
        summary: computed.summary,
        deadlines: computed.deadlines,
        nextAction: computed.nextAction,
        submittedForReview: false,
        attachments: data.input.attachments,
        reviewRows: initialReviewRows(),
        approvalDecision: null,
        reviewComments: null,
        approvalDate: null,
        portfolioEntryId: null,
        portfolioEntryCode: null,
        licensingRecordId: null,
        licensingRecordCode: null,
        createdBy: CURRENT_USER,
        createdAt: now,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          {
            at: now,
            actor: "System",
            event: `Patent ${patentId} created from approved IP record ${linkedIpRecordCode}`,
            kind: "workflow",
          },
          {
            at: now,
            actor: "System",
            event: "Invention disclosure and patent draft retrieved from IP Development",
            kind: "activity",
          },
          {
            at: now,
            actor: CURRENT_USER,
            event: "Patent Preparation stage started",
            kind: "workflow",
            stage: "preparation",
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
export const completePatentStageFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; stage: PatentStage }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPatentsColl();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Patent not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Patent in "${current.status}" cannot change stage.`);
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
      const stages: PatentStageState[] = current.stages.map((s) => {
        if (s.stage === data.stage) return { ...s, status: "completed", completedAt: now };
        if (s.stage === nextStage && s.status === "pending")
          return { ...s, status: "in_progress", startedAt: now };
        return s;
      });
      const status = STATUS_AFTER_STAGE[data.stage];
      const auditTrail = [...current.auditTrail];

      // Mutable copies for auto-assigned fields.
      const year = new Date().getFullYear();
      const input = recordToInput(current);
      let patentNumber = current.patentNumber;
      let applicationNumber = current.applicationNumber;
      let portfolioEntryId = current.portfolioEntryId;
      let portfolioEntryCode = current.portfolioEntryCode;
      let licensingRecordId = current.licensingRecordId;
      let licensingRecordCode = current.licensingRecordCode;

      if (data.stage === "filing") {
        // Filing → application number + filing confirmation (Legal / Patent DB).
        if (!filled(applicationNumber)) {
          const cnt = await coll.countDocuments();
          applicationNumber = `${year}${String(41012345 + cnt).slice(0, 8)}`;
        }
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Patent application filed — Application Number ${applicationNumber} issued; filing fee ₹${input.filing.filingCost.toLocaleString("en-IN")} recorded with Finance`,
          kind: "activity",
          stage: data.stage,
        });
      }

      if (data.stage === "examination") {
        // Examination complete → patent granted; assign grant number; auto Portfolio entry.
        if (!filled(patentNumber)) {
          const cnt = await coll.countDocuments();
          patentNumber = `IN${year}${String(41012345 + cnt)}`;
          input.grant.grantNumber = input.grant.grantNumber || `IN ${String(412345 + cnt)}`;
          if (!filled(input.grant.grantDate)) input.grant.grantDate = now.slice(0, 10);
          if (!filled(input.grant.expiryDate)) {
            const term = input.grant.patentTerm > 0 ? input.grant.patentTerm : 20;
            input.grant.expiryDate = addYears(input.grant.grantDate, term)
              .toISOString()
              .slice(0, 10);
          }
        }
        // Auto-create the Patent Portfolio entry (patent is now granted).
        const pfColl = await getPortfolioColl();
        const pfCount = await pfColl.countDocuments();
        const entryCode = `PPF-${year}-${String(pfCount + 1).padStart(4, "0")}`;
        const ai = computeAI(input);
        const pfRes = await pfColl.insertOne({
          entryCode,
          patentId: current.id,
          patentCode: current.patentId,
          patentTitle: current.patentTitle,
          grantNumber: input.grant.grantNumber,
          portfolioImportance: ai.portfolioImportance,
          patentStrengthScore: ai.patentStrengthScore,
          status: "Active",
          createdAt: now,
        });
        portfolioEntryId = pfRes.insertedId?.toString?.() ?? entryCode;
        portfolioEntryCode = entryCode;
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Patent granted — Patent Number ${patentNumber}; Patent Portfolio entry ${entryCode} auto-created; renewal calendar scheduled`,
          kind: "workflow",
          stage: data.stage,
        });
      }

      if (data.stage === "grant") {
        // Grant stage complete → commercialization; auto Licensing opportunity.
        const licColl = await getLicensingColl();
        const licCount = await licColl.countDocuments();
        const licCode = `LIC-${year}-${String(licCount + 1).padStart(4, "0")}`;
        const licRes = await licColl.insertOne({
          licenseCode: licCode,
          patentId: current.id,
          patentCode: current.patentId,
          patentTitle: current.patentTitle,
          licensingStatus: input.commercialization.licensingStatus || "Under Negotiation",
          royaltyModel: input.commercialization.royaltyModel,
          commercialValue: input.commercialization.commercialValue,
          status: "Open",
          createdAt: now,
        });
        licensingRecordId = licRes.insertedId?.toString?.() ?? licCode;
        licensingRecordCode = licCode;
        auditTrail.push({
          at: now,
          actor: "System",
          event: `Licensing opportunity ${licCode} auto-created in Licensing Management`,
          kind: "workflow",
          stage: data.stage,
        });
      }

      const computed = buildComputed(input, status, advanced ? nextStage : data.stage);

      const stageEvent: Record<PatentStage, string> = {
        preparation: `AI analysis — claim quality ${computed.ai.claimQualityScore}/100, grant probability ${computed.ai.grantProbability}%`,
        filing: `AI filing check complete — international coverage across ${input.filing.filingCountries.length} jurisdiction(s)`,
        examination: `AI examination analysis — objections assessed, grant probability ${computed.ai.grantProbability}%`,
        grant: `AI commercial evaluation — licensing potential ${computed.ai.licensingPotential}/100, importance ${computed.ai.portfolioImportance}`,
        commercialization: `Patent summary ready — overall ${computed.summary.overallPatentScore}/100`,
      };

      const updated: Omit<PatentRecord, "id"> = {
        ...current,
        stages,
        currentStage: advanced ? nextStage : data.stage,
        currentStageLabel: STAGE_LABEL[advanced ? nextStage : data.stage],
        status,
        patentNumber,
        applicationNumber,
        grant: input.grant,
        aiAnalytics: computed.ai,
        summary: computed.summary,
        deadlines: computed.deadlines,
        nextAction: computed.nextAction,
        portfolioEntryId,
        portfolioEntryCode,
        licensingRecordId,
        licensingRecordCode,
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: `${STAGE_LABEL[data.stage]} completed`,
            kind: "workflow",
            stage: data.stage,
            fromStatus: current.status,
            toStatus: status,
          },
          {
            at: now,
            actor: "System",
            event: stageEvent[data.stage],
            kind: "activity",
            stage: data.stage,
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
      const fresh = await coll.findOne({ _id: await newObjectId(data.id) });
      return { success: true as const, data: shape(fresh) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Deadline actions ============================ */
/** Mark the office-action response as submitted (clears the Respond alert). */
export const submitOfficeActionResponseFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPatentsColl();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Patent not found.");
      const current = shape(existing);
      const now = nowISO();
      const input = recordToInput(current);
      input.prosecution = { ...input.prosecution, responseSubmitted: true };
      const computed = buildComputed(input, current.status, current.currentStage);
      const updated: Omit<PatentRecord, "id"> = {
        ...current,
        prosecution: input.prosecution,
        deadlines: computed.deadlines,
        nextAction: computed.nextAction,
        updatedAt: now,
        lastModifiedBy: CURRENT_USER,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "Office Action response submitted",
            kind: "activity",
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

/** Pay the next renewal fee (zeroes the next cost → Renewal Status = Paid). */
export const payRenewalFeeFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPatentsColl();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Patent not found.");
      const current = shape(existing);
      const now = nowISO();
      const paidAmount = current.grant.renewalCostNext;
      const input = recordToInput(current);
      input.grant = { ...input.grant, renewalCostNext: 0 };
      const computed = buildComputed(input, current.status, current.currentStage);
      const updated: Omit<PatentRecord, "id"> = {
        ...current,
        grant: input.grant,
        deadlines: computed.deadlines,
        nextAction: computed.nextAction,
        updatedAt: now,
        lastModifiedBy: CURRENT_USER,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: `Renewal fee ₹${paidAmount.toLocaleString("en-IN")} paid — renewal calendar updated`,
            kind: "activity",
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
export const submitPatentFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPatentsColl();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Patent not found.");
      const current = shape(existing);
      if (!EDITABLE_STATUSES.includes(current.status)) {
        throw new Error(`Patent is already "${current.status}".`);
      }
      const incomplete = current.stages
        .filter((s) => s.status !== "completed")
        .map((s) => STAGE_LABEL[s.stage]);
      if (incomplete.length > 0) {
        throw new Error(`Complete all stages first. Outstanding: ${incomplete.join(", ")}.`);
      }
      const now = nowISO();
      // Patent Manager + Patent Attorney + Legal Counsel sign off on submit.
      const reviewRows: PatentReviewRow[] = current.reviewRows.map((r) =>
        ["Patent Manager", "Patent Attorney", "Legal Counsel"].includes(r.role)
          ? {
              ...r,
              decision: "Approved",
              status: "Reviewed",
              date: now,
              comments: r.comments || "Ready for review",
            }
          : r,
      );
      const updated: Omit<PatentRecord, "id"> = {
        ...current,
        submittedForReview: true,
        reviewRows,
        version: current.status === "revision_required" ? current.version + 1 : current.version,
        nextAction: "Awaiting Patent Review Committee decision",
        lastModifiedBy: CURRENT_USER,
        updatedAt: now,
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: CURRENT_USER,
            event: "Patent summary submitted for Executive Review",
            kind: "workflow",
          },
          {
            at: now,
            actor: "System",
            event: "Patent Manager, Attorney and Legal Counsel sign-off recorded",
            kind: "activity",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const reviewPatentFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; decision: PatentApprovalDecision; comments?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getPatentsColl();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Patent not found.");
      const current = shape(existing);
      if (!current.submittedForReview) {
        throw new Error("Patent has not been submitted for review.");
      }
      const now = nowISO();
      const auditTrail = [...current.auditTrail];
      let status: PatentStatus;
      let approvalDate: string | null = current.approvalDate;
      let submittedForReview: boolean = current.submittedForReview;
      let notify: string;

      if (data.decision === "Approved") {
        status = "active";
        approvalDate = now;
        submittedForReview = false;
        notify = "Patent Successfully Managed";
      } else if (data.decision === "Approved with Recommendations") {
        status = "commercialization";
        approvalDate = now;
        submittedForReview = false;
        notify = "Improve Licensing Strategy";
      } else if (data.decision === "Revision Required") {
        status = "revision_required";
        submittedForReview = false;
        notify = "Strengthen Patent Claims / Update Patent Documentation";
      } else {
        status = "closed";
        submittedForReview = false;
        notify = "Patent Closed";
      }

      // The full committee signs off (except revision, which returns to the manager).
      const reviewRows: PatentReviewRow[] = current.reviewRows.map((r) =>
        data.decision === "Revision Required" || data.decision === "Abandon Patent"
          ? r
          : r.status === "Pending"
            ? {
                ...r,
                decision: "Approved",
                status: "Reviewed",
                date: now,
                comments: r.comments || "Approved",
              }
            : r,
      );

      auditTrail.push({
        at: now,
        actor: "Patent Review Committee",
        event: `Executive review: ${data.decision}${data.comments ? ` — ${data.comments}` : ""}`,
        kind: "workflow",
        fromStatus: current.status,
        toStatus: status,
      });
      auditTrail.push({
        at: now,
        actor: "System",
        event: `Patent Manager notified: ${notify}`,
        kind: "activity",
      });
      auditTrail.push({
        at: now,
        actor: "System",
        event:
          "Governance: Patent Dashboard and portfolio reports updated; renewal deadlines monitored",
        kind: "activity",
      });

      const input = recordToInput(current);
      const computed = buildComputed(input, status, current.currentStage);
      const updated: Omit<PatentRecord, "id"> = {
        ...current,
        status,
        submittedForReview,
        reviewRows,
        approvalDecision: data.decision,
        reviewComments: data.comments ?? current.reviewComments,
        approvalDate,
        nextAction: computed.nextAction,
        deadlines: computed.deadlines,
        lastModifiedBy: "Patent Review Committee",
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

/* ============================ Refresh / report =========================== */
export const refreshPatentFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getPatentsColl();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Patent not found.");
      const current = shape(existing);
      const now = nowISO();
      const input = recordToInput(current);
      const computed = buildComputed(input, current.status, current.currentStage);
      const updated: Omit<PatentRecord, "id"> = {
        ...current,
        aiAnalytics: computed.ai,
        summary: computed.summary,
        deadlines: computed.deadlines,
        nextAction: computed.nextAction,
        updatedAt: now,
        lastModifiedBy: "System",
        auditTrail: [
          ...current.auditTrail,
          {
            at: now,
            actor: "System",
            event: "Portfolio report generated — AI analytics, scores and deadlines refreshed",
            kind: "activity",
          },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      return { success: true as const, data: shape({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });
