import { createServerFn } from "@tanstack/react-start";
import type {
  IdeaApproval,
  IdeaDashboard,
  IdeaDecision,
  IdeaFinancials,
  IdeaFormInput,
  IdeaListRow,
  IdeaLookups,
  IdeaNotification,
  IdeaRecord,
  IdeaReviewerRole,
  IdeaScores,
  IdeaStatus,
  FeasibilityProjectRecord,
} from "@/services/types";

/* ===========================================================================
   Idea Management — server functions (MongoDB-backed, live)
   ---------------------------------------------------------------------------
   Follows the General Ledger server-fn pattern: collections are pulled through
   dynamic imports of ./mongodb.server so the mongodb driver never reaches the
   client bundle, and every handler returns a { success, data } | { success,
   error } envelope.

   The workflow is a real state machine: every transition appends an
   IdeaWorkflowEntry, updates the matching IdeaApproval, and records history +
   audit. Writes replace whole top-level fields (never $set dot-paths) so the
   in-memory mock fallback in mongodb.server.ts stays correct.

   AI Evaluation (Section 13) is intentionally absent — no field here is
   AI-derived; every score is calculated from the manually-entered ratings.
   =========================================================================== */

async function getIdeasCollection() {
  const mod = await import("./mongodb.server");
  return mod.getIdeasCollection();
}
async function getNotificationsCollection() {
  const mod = await import("./mongodb.server");
  return mod.getIdeaNotificationsCollection();
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
const round = (n: number, dp = 0) => {
  const f = Math.pow(10, dp);
  return Math.round((Number.isFinite(n) ? n : 0) * f) / f;
};
const avg = (nums: number[]) =>
  nums.length ? nums.reduce((s, n) => s + (n || 0), 0) / nums.length : 0;

/* ------------------------------- Lookups (I) ------------------------------ */
// Mock "imported" data — stands in for HRM / Administration / Product /
// Project / Patent modules until those exist.
const LOOKUPS: IdeaLookups = {
  categories: [
    {
      name: "Product Innovation",
      subCategories: ["New Product", "Product Enhancement", "Feature Add"],
    },
    { name: "Process Improvement", subCategories: ["Manufacturing", "Supply Chain", "Quality"] },
    { name: "Sustainability", subCategories: ["Energy", "Materials", "Circular Economy"] },
    { name: "Digital / Software", subCategories: ["Platform", "Analytics", "Automation"] },
    { name: "Business Model", subCategories: ["Service", "Pricing", "Partnership"] },
  ],
  businessUnits: [
    "EV Powertrain",
    "Battery Systems",
    "Charging Infrastructure",
    "Vehicle Platforms",
    "Corporate",
  ],
  departments: [
    "Research & Innovation Development",
    "Manufacturing",
    "Engineering",
    "Quality Assurance",
    "Supply Chain",
    "Product Management",
    "Sales & Marketing",
  ],
  productLines: [
    "Magnertia One",
    "Magnertia Fleet",
    "PowerCell 400",
    "PowerCell 800",
    "FastCharge DC",
    "HomeCharge AC",
  ],
  projects: [
    "PRJ-EV-Next",
    "PRJ-Battery-Gen3",
    "PRJ-Charge-Network",
    "PRJ-Lightweight-Chassis",
    "None",
  ],
  strategicInitiatives: [
    "Cost Leadership",
    "Range Leadership",
    "Net-Zero 2030",
    "Software-Defined Vehicle",
    "Global Expansion",
  ],
  innovationThemes: [
    "Electrification",
    "Autonomy",
    "Connectivity",
    "Sustainability",
    "Manufacturing Excellence",
  ],
  employees: [
    "Priya Sharma",
    "Arjun Mehta",
    "Neha Kapoor",
    "Rohan Iyer",
    "Sanjay Verma",
    "Divya Nair",
    "Karan Malhotra",
    "Ananya Rao",
  ],
  innovationTypes: ["Incremental", "Radical", "Disruptive", "Architectural"],
  innovationLevels: ["Component", "Product", "System", "Platform"],
  technologyAreas: [
    "Battery & Cells",
    "Power Electronics",
    "Electric Motors",
    "Thermal Management",
    "Software / Firmware",
    "Materials Science",
    "Charging Technology",
    "AI / Data",
  ],
  industries: ["Automotive", "Energy", "Industrial", "Consumer"],
  applicationAreas: [
    "Passenger EV",
    "Commercial EV",
    "Two-Wheeler",
    "Grid Storage",
    "Charging Network",
  ],
  marketSegments: ["Premium", "Mainstream", "Fleet / B2B", "Government"],
  customerTypes: ["B2C", "B2B", "B2G", "Internal"],
  productCategories: ["Hardware", "Software", "Service", "Hybrid"],
  technologyReadinessLevels: [
    "TRL 1 – Basic principles",
    "TRL 2 – Technology concept",
    "TRL 3 – Proof of concept",
    "TRL 4 – Lab validation",
    "TRL 5 – Relevant environment",
    "TRL 6 – Prototype demo",
    "TRL 7 – Operational prototype",
    "TRL 8 – System complete",
    "TRL 9 – Proven in operations",
  ],
  existingPatents: [
    "US10850638 – Battery thermal system",
    "US11209021 – Motor winding",
    "EP3456789 – Fast-charge protocol",
    "IN201911023456 – BMS balancing",
    "None found",
  ],
};

/* ---------------------------- Review stage map ---------------------------- */
const REVIEW_STAGES: { stage: IdeaStatus; role: IdeaReviewerRole }[] = [
  { stage: "Initial Screening", role: "Department Manager" },
  { stage: "Technical Review", role: "Technical Reviewer" },
  { stage: "Business Review", role: "Business Reviewer" },
  { stage: "Patentability Review", role: "IP & Patent Team" },
  { stage: "Innovation Committee Review", role: "Innovation Committee" },
];
const STAGE_ROLE: Partial<Record<IdeaStatus, IdeaReviewerRole>> = Object.fromEntries(
  REVIEW_STAGES.map((s) => [s.stage, s.role]),
) as Partial<Record<IdeaStatus, IdeaReviewerRole>>;

/* ----------------------------- Calculations (C) --------------------------- */
function parseTRL(label: string): number {
  const m = (label || "").match(/TRL\s*(\d)/i) || (label || "").match(/(\d)/);
  const n = m ? parseInt(m[1], 10) : 5;
  return Math.max(1, Math.min(9, n));
}

function computeFinancials(input: IdeaFormInput): IdeaFinancials {
  const rev = input.businessImpact.expectedRevenue || 0;
  const saving = input.businessImpact.costSaving || 0;
  const invest = input.financials.estimatedInvestment || 0;
  const annualBenefit = rev + saving;
  const netProfit = annualBenefit - invest;
  const monthlyBenefit = annualBenefit / 12;
  const monthlyRevenue = rev / 12;
  return {
    estimatedInvestment: invest,
    fundingRequired: input.financials.fundingRequired || 0,
    expectedROI: invest > 0 ? round((netProfit / invest) * 100, 1) : 0,
    paybackPeriod: monthlyBenefit > 0 ? round(invest / monthlyBenefit, 1) : 0,
    estimatedProfitMargin: rev > 0 ? round((netProfit / rev) * 100, 1) : 0,
    estimatedBreakEven: monthlyRevenue > 0 ? round(invest / monthlyRevenue, 1) : 0,
  };
}

function rankLabel(score: number): string {
  if (score >= 80) return "A – High Priority";
  if (score >= 65) return "B – Strong";
  if (score >= 50) return "C – Moderate";
  if (score >= 35) return "D – Low";
  return "E – Watchlist";
}

function computeScores(input: IdeaFormInput): IdeaScores {
  const inv = input.innovation;
  const overallInnovationScore = clamp(
    round(
      avg([
        inv.technicalNovelty,
        inv.businessValue,
        inv.customerValue,
        inv.strategicAlignment,
        inv.scalability,
        inv.sustainability,
      ]) * 10,
    ),
  );

  const trl = parseTRL(input.technical.technologyReadinessLevel);
  let technicalFeasibilityScore = 0.6 * (trl / 9) * 100 + 0.4 * ((10 - inv.complexity) / 10) * 100;
  if (input.technical.requiredRnD) technicalFeasibilityScore -= 5;
  if (input.technical.prototypeRequired) technicalFeasibilityScore -= 5;
  technicalFeasibilityScore = clamp(round(technicalFeasibilityScore));

  const bi = input.businessImpact;
  const businessFeasibilityScore = clamp(
    round(
      avg([
        inv.businessValue,
        bi.marketExpansionPotential,
        bi.competitiveDifferentiation,
        bi.customerSatisfactionImpact,
      ]) * 10,
    ),
  );

  const mk = input.market;
  const growthNorm = clamp((Math.min(mk.marketGrowthRate || 0, 50) / 50) * 100);
  const marketOpportunityScore = clamp(
    round(0.7 * avg([mk.customerDemand, mk.marketReadiness]) * 10 + 0.3 * growthNorm),
  );

  const rk = input.risk;
  const riskScore = clamp(
    round(
      avg([
        rk.technicalRisk,
        rk.financialRisk,
        rk.marketRisk,
        rk.regulatoryRisk,
        rk.operationalRisk,
        rk.supplyChainRisk,
      ]) * 10,
    ),
  );

  const eg = input.esg;
  const esgScore = clamp(
    round(
      avg([
        eg.environmentalImpact,
        eg.energyEfficiency,
        eg.carbonReduction,
        eg.wasteReduction,
        eg.socialImpact,
        eg.governanceImpact,
      ]) * 10,
    ),
  );

  const overallEvaluationScore = clamp(
    round(
      0.25 * overallInnovationScore +
        0.2 * technicalFeasibilityScore +
        0.2 * businessFeasibilityScore +
        0.2 * marketOpportunityScore +
        0.1 * esgScore +
        0.05 * (100 - riskScore),
    ),
  );

  return {
    overallInnovationScore,
    technicalFeasibilityScore,
    businessFeasibilityScore,
    marketOpportunityScore,
    riskScore,
    esgScore,
    overallEvaluationScore,
    ideaRanking: rankLabel(overallEvaluationScore),
  };
}

/* ------------------------------- Shaping --------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shapeIdea(doc: any): IdeaRecord {
  if (!doc) throw new Error("Idea not found.");
  const { _id, ...rest } = doc;
  return { ...(rest as Omit<IdeaRecord, "id">), id: _id?.toString?.() ?? String(_id) };
}

function toListRow(r: IdeaRecord): IdeaListRow {
  return {
    id: r.id,
    ideaCode: r.ideaCode,
    title: r.basic.title,
    status: r.status,
    category: r.basic.category,
    department: r.basic.department,
    technologyArea: r.classification.technologyArea,
    overallEvaluationScore: r.scores.overallEvaluationScore,
    ideaRanking: r.scores.ideaRanking,
    priority: r.priority,
    submittedBy: r.submittedBy,
    dateSubmitted: r.dateSubmitted,
    updatedAt: r.updatedAt,
    expectedRevenue: r.businessImpact.expectedRevenue,
    costSaving: r.businessImpact.costSaving,
    patentable: r.ip.patentable,
  };
}

async function notify(args: {
  ideaId: string;
  ideaCode: string;
  title: string;
  body: string;
  role: IdeaNotification["role"];
}) {
  const coll = await getNotificationsCollection();
  await coll.insertOne({
    ideaId: args.ideaId,
    ideaCode: args.ideaCode,
    title: args.title,
    body: args.body,
    role: args.role,
    read: false,
    createdAt: nowISO(),
  });
}

/* ============================= Read endpoints ============================= */
export const getIdeaLookupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true as const, data: LOOKUPS };
});

export const getIdeasFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getIdeasCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    const rows = docs.map((d: unknown) => toListRow(shapeIdea(d)));
    return { success: true as const, data: rows as IdeaListRow[] };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const getIdeaFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getIdeasCollection();
      const doc = await coll.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Idea not found.");
      return { success: true as const, data: shapeIdea(doc) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Create / update ============================ */
export const saveIdeaDraftFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: IdeaFormInput }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getIdeasCollection();
      const scores = computeScores(data.input);
      const financials = computeFinancials(data.input);
      const now = nowISO();

      if (data.id) {
        const existing = await coll.findOne({ _id: await newObjectId(data.id) });
        if (!existing) throw new Error("Idea not found.");
        const current = shapeIdea(existing);
        if (current.status !== "Draft" && current.status !== "Revision Required") {
          throw new Error(`Idea in "${current.status}" cannot be edited.`);
        }
        const updated: Omit<IdeaRecord, "id"> = {
          ...current,
          basic: data.input.basic,
          classification: data.input.classification,
          problem: data.input.problem,
          solution: data.input.solution,
          innovation: data.input.innovation,
          businessImpact: data.input.businessImpact,
          technical: data.input.technical,
          ip: { ...current.ip, ...data.input.ip },
          market: data.input.market,
          risk: data.input.risk,
          esg: data.input.esg,
          financials,
          scores,
          attachments: data.input.attachments,
          updatedAt: now,
          history: [
            ...current.history,
            { at: now, actor: CURRENT_USER, actorRole: "Employee", action: "Draft updated" },
          ],
          auditLog: [
            ...current.auditLog,
            { at: now, actor: CURRENT_USER, event: "Idea draft saved" },
          ],
        };
        await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });
        return { success: true as const, data: shapeIdea({ ...updated, _id: existing._id }) };
      }

      // New draft
      const count = await coll.countDocuments();
      const ideaCode = `IDEA-${String(count + 1).padStart(5, "0")}`;
      const record: Omit<IdeaRecord, "id"> = {
        ideaCode,
        status: "Draft",
        priority: "Medium",
        version: 1,
        submittedBy: CURRENT_USER,
        dateSubmitted: null,
        createdAt: now,
        updatedAt: now,
        basic: data.input.basic,
        classification: data.input.classification,
        problem: data.input.problem,
        solution: data.input.solution,
        innovation: data.input.innovation,
        businessImpact: data.input.businessImpact,
        technical: data.input.technical,
        ip: {
          ...data.input.ip,
          patentSearchStatus: null,
          ipRisk: null,
          patentRecommendation: null,
        },
        market: data.input.market,
        risk: data.input.risk,
        esg: data.input.esg,
        financials,
        scores,
        attachments: data.input.attachments,
        workflow: [],
        approvals: [],
        history: [
          { at: now, actor: CURRENT_USER, actorRole: "Employee", action: "Idea created (Draft)" },
        ],
        auditLog: [
          { at: now, actor: "System", event: `Idea number ${ideaCode} generated` },
          { at: now, actor: CURRENT_USER, event: "Idea draft created" },
        ],
        feasibilityProjectId: null,
      };
      const res = await coll.insertOne(record);
      return { success: true as const, data: shapeIdea({ ...record, _id: res.insertedId }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

export const submitIdeaFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const coll = await getIdeasCollection();
      const existing = await coll.findOne({ _id: await newObjectId(id) });
      if (!existing) throw new Error("Idea not found.");
      const current = shapeIdea(existing);
      if (current.status !== "Draft" && current.status !== "Revision Required") {
        throw new Error(
          `Only Draft or Revision Required ideas can be submitted (was "${current.status}").`,
        );
      }
      if (!current.basic.title?.trim())
        throw new Error("Idea Title is required before submitting.");

      const now = nowISO();
      const resubmission = current.status === "Revision Required";
      const version = resubmission ? current.version + 1 : current.version;

      const approvals: IdeaApproval[] = REVIEW_STAGES.map((s) => ({
        stage: s.stage,
        role: s.role,
        decision: "Pending",
        reviewer: "",
        date: null,
      }));

      const workflow = [
        ...current.workflow,
        {
          fromStatus: current.status,
          toStatus: "Submitted" as IdeaStatus,
          action: resubmission ? "Re-submitted after revision" : "Idea submitted",
          actorRole: "Employee" as const,
          actorName: CURRENT_USER,
          at: now,
        },
        {
          fromStatus: "Submitted" as IdeaStatus,
          toStatus: "Initial Screening" as IdeaStatus,
          action: "Sent for Initial Screening",
          actorRole: "System" as const,
          actorName: "System",
          at: now,
        },
      ];

      const updated: Omit<IdeaRecord, "id"> = {
        ...current,
        status: "Initial Screening",
        version,
        dateSubmitted: current.dateSubmitted ?? now,
        updatedAt: now,
        approvals,
        workflow,
        history: [
          ...current.history,
          {
            at: now,
            actor: CURRENT_USER,
            actorRole: "Employee",
            action: resubmission ? "Idea re-submitted" : "Idea submitted",
            detail: `Version ${version}`,
          },
        ],
        auditLog: [
          ...current.auditLog,
          { at: now, actor: "System", event: "Submission time recorded" },
          { at: now, actor: "System", event: "Review schedule generated" },
        ],
      };
      await coll.updateOne({ _id: await newObjectId(id) }, { $set: updated });
      await notify({
        ideaId: id,
        ideaCode: current.ideaCode,
        title: "New idea for initial screening",
        body: `${current.ideaCode} – "${current.basic.title}" is awaiting initial screening.`,
        role: "Department Manager",
      });
      return { success: true as const, data: shapeIdea({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================ Workflow engine ============================ */
export const reviewIdeaFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      stage: IdeaStatus;
      decision: IdeaDecision;
      comment?: string;
      priority?: IdeaRecord["priority"];
      patentFields?: {
        patentSearchStatus?: string;
        ipRisk?: string;
        patentRecommendation?: string;
      };
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const coll = await getIdeasCollection();
      const existing = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!existing) throw new Error("Idea not found.");
      const current = shapeIdea(existing);
      const role = STAGE_ROLE[data.stage];
      if (!role) throw new Error(`"${data.stage}" is not a review stage.`);
      if (current.status !== data.stage) {
        throw new Error(`Idea is at "${current.status}", not "${data.stage}".`);
      }

      const now = nowISO();

      // Resolve next status from the decision + stage.
      let nextStatus: IdeaStatus = current.status;
      let action = "";
      if (data.decision === "Rejected") {
        nextStatus = "Rejected";
        action = "Rejected";
      } else if (
        data.decision === "Returned for Correction" ||
        data.decision === "Revision Required"
      ) {
        nextStatus = "Revision Required";
        action = data.decision;
      } else if (data.decision === "On Hold") {
        nextStatus = "On Hold";
        action = "Put on hold";
      } else if (data.decision === "Approved" || data.decision === "Forwarded") {
        if (data.stage === "Initial Screening") {
          nextStatus = "Technical Review";
          action = "Forwarded to Technical Review";
        } else if (data.stage === "Technical Review") {
          nextStatus = "Business Review";
          action = "Forwarded to Business Review";
        } else if (data.stage === "Business Review") {
          nextStatus = "Patentability Review";
          action = "Forwarded to Patentability Review";
        } else if (data.stage === "Patentability Review") {
          nextStatus = "Innovation Committee Review";
          action = "Forwarded to Innovation Committee";
        } else if (data.stage === "Innovation Committee Review") {
          nextStatus = "Approved";
          action = "Approved by Innovation Committee";
        }
      } else {
        throw new Error(`Invalid decision "${data.decision}".`);
      }

      // Update the approval record for this stage.
      const approvals = current.approvals.map((a) =>
        a.stage === data.stage
          ? { ...a, decision: data.decision, reviewer: role, date: now, comment: data.comment }
          : a,
      );

      // IP fields captured at Patentability Review.
      const ip =
        data.stage === "Patentability Review"
          ? {
              ...current.ip,
              patentSearchStatus: data.patentFields?.patentSearchStatus ?? "Completed",
              ipRisk: data.patentFields?.ipRisk ?? current.ip.ipRisk ?? "Low",
              patentRecommendation:
                data.patentFields?.patentRecommendation ??
                current.ip.patentRecommendation ??
                "File Patent",
            }
          : current.ip;

      const workflow = [
        ...current.workflow,
        {
          fromStatus: current.status,
          toStatus: nextStatus,
          action,
          actorRole: role,
          actorName: role,
          comment: data.comment,
          at: now,
        },
      ];

      const history = [
        ...current.history,
        {
          at: now,
          actor: role,
          actorRole: role,
          action: `${data.stage}: ${action}`,
          detail: data.comment,
        },
      ];

      const auditLog = [
        ...current.auditLog,
        { at: now, actor: role, event: `${data.stage} decision: ${data.decision}` },
      ];

      let feasibilityProjectId = current.feasibilityProjectId;

      // On committee approval, auto-create the Feasibility Study Project record.
      if (nextStatus === "Approved") {
        const fpColl = await getFeasibilityProjectsCollection();
        const fpCount = await fpColl.countDocuments();
        const projectCode = `FSP-${String(fpCount + 1).padStart(5, "0")}`;
        const fpRecord: Omit<FeasibilityProjectRecord, "id"> = {
          projectCode,
          ideaId: current.id,
          ideaCode: current.ideaCode,
          title: current.basic.title,
          createdAt: now,
          status: "Initiated",
        };
        const fpRes = await fpColl.insertOne(fpRecord);
        feasibilityProjectId = fpRes.insertedId?.toString?.() ?? projectCode;
        workflow.push({
          fromStatus: "Approved",
          toStatus: "Converted to Feasibility Study",
          action: `Feasibility Study Project ${projectCode} created`,
          actorRole: "System",
          actorName: "System",
          at: now,
        });
        auditLog.push({
          at: now,
          actor: "System",
          event: `Feasibility project ${projectCode} created`,
        });
      }

      if (nextStatus === "Rejected") {
        auditLog.push({ at: now, actor: "System", event: "Idea archived to ERP database" });
      }

      const updated: Omit<IdeaRecord, "id"> = {
        ...current,
        status: nextStatus,
        priority: data.priority ?? current.priority,
        updatedAt: now,
        ip,
        approvals,
        workflow,
        history,
        auditLog,
        feasibilityProjectId,
      };
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: updated });

      // Notifications.
      const nextRole = STAGE_ROLE[nextStatus];
      if (nextRole) {
        await notify({
          ideaId: current.id,
          ideaCode: current.ideaCode,
          title: `${nextStatus} required`,
          body: `${current.ideaCode} – "${current.basic.title}" advanced to ${nextStatus}.`,
          role: nextRole,
        });
      }
      const employeeMsg: Partial<Record<IdeaStatus, string>> = {
        Approved: "has been approved and converted to a Feasibility Study",
        "Revision Required": "requires revision",
        "On Hold": "has been put on hold",
        Rejected: "has been rejected",
      };
      if (employeeMsg[nextStatus]) {
        await notify({
          ideaId: current.id,
          ideaCode: current.ideaCode,
          title: `Your idea ${nextStatus}`,
          body: `${current.ideaCode} – "${current.basic.title}" ${employeeMsg[nextStatus]}.`,
          role: "Employee",
        });
      }

      return { success: true as const, data: shapeIdea({ ...updated, _id: existing._id }) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });

/* ============================== Dashboard =============================== */
// Vibrant categorical palette used for donut / pie slices on the Ideas dashboard.
// Mirrors src/lib/chartColors.ts (kept in sync manually because this is a server
// module and the shared file is imported by client code).
const CHART_COLORS = [
  "#F97316", // orange
  "#22C55E", // green
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#EF4444", // red
  "#14B8A6", // teal
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#84CC16", // lime
];

export const getIdeaDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getIdeasCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    const ideas: IdeaRecord[] = docs.map((d: unknown) => shapeIdea(d));
    const rows = ideas.map(toListRow);

    const total = ideas.length;
    const decided = ideas.filter((i) =>
      ["Approved", "Rejected", "Converted to Feasibility Study"].includes(i.status),
    );
    const approved = ideas.filter(
      (i) => i.status === "Approved" || i.status === "Converted to Feasibility Study",
    );
    const rejected = ideas.filter((i) => i.status === "Rejected");
    const submitted = ideas.filter((i) => i.dateSubmitted);

    const now = new Date();
    const thisMonth = submitted.filter((i) => {
      const d = new Date(i.dateSubmitted as string);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    const avgInnovation = total ? round(avg(ideas.map((i) => i.scores.overallInnovationScore))) : 0;
    const portfolioRisk = total ? round(avg(ideas.map((i) => i.scores.riskScore))) : 0;
    const esgImpact = total ? round(avg(ideas.map((i) => i.scores.esgScore))) : 0;
    const revenuePipeline = ideas.reduce((s, i) => s + (i.businessImpact.expectedRevenue || 0), 0);
    const costSavings = ideas.reduce((s, i) => s + (i.businessImpact.costSaving || 0), 0);
    const patentable = ideas.filter((i) => i.ip.patentable).length;

    // Average review time: submit -> terminal decision, in days.
    const reviewDurations: number[] = [];
    for (const i of decided) {
      if (!i.dateSubmitted) continue;
      const start = new Date(i.dateSubmitted).getTime();
      const end = new Date(i.updatedAt).getTime();
      if (end > start) reviewDurations.push((end - start) / (1000 * 60 * 60 * 24));
    }
    const avgReviewTime = reviewDurations.length ? round(avg(reviewDurations), 1) : 0;

    // Pipeline trend — last 6 months.
    const months: { key: string; label: string }[] = [];
    for (let k = 5; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("en-US", { month: "short" }),
      });
    }
    const pipelineTrend = months.map((m) => {
      const sub = submitted.filter((i) => {
        const d = new Date(i.dateSubmitted as string);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      }).length;
      const app = approved.filter((i) => {
        const d = new Date(i.updatedAt);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      }).length;
      return { month: m.label, submitted: sub, approved: app };
    });

    const groupCount = (getKey: (i: IdeaRecord) => string[]) => {
      const map = new Map<string, number>();
      for (const i of ideas) for (const k of getKey(i)) if (k) map.set(k, (map.get(k) || 0) + 1);
      return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], idx) => ({
          name,
          value,
          color: CHART_COLORS[idx % CHART_COLORS.length],
        }));
    };

    const byDepartment = groupCount((i) => [i.basic.department]);
    const byTechnologyArea = groupCount((i) => i.classification.technologyArea);
    const byStatus = groupCount((i) => [i.status]);

    const dashboard: IdeaDashboard = {
      kpis: {
        totalIdeas: total,
        ideasThisMonth: thisMonth,
        approvalRate: decided.length ? round((approved.length / decided.length) * 100) : 0,
        rejectionRate: decided.length ? round((rejected.length / decided.length) * 100) : 0,
        averageInnovationScore: avgInnovation,
        patentableIdeas: patentable,
        estimatedRevenuePipeline: revenuePipeline,
        estimatedCostSavings: costSavings,
        portfolioRiskIndex: portfolioRisk,
        esgImpactScore: esgImpact,
        averageReviewTimeDays: avgReviewTime,
        convertedToFeasibility: ideas.filter((i) => i.feasibilityProjectId).length,
      },
      rows,
      pipelineTrend,
      byDepartment,
      byTechnologyArea,
      byStatus,
    };
    return { success: true as const, data: dashboard };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/* ============================ Notifications ============================= */
export const getIdeaNotificationsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getNotificationsCollection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    const items: IdeaNotification[] = docs.map((d: Record<string, unknown>) => ({
      id: (d._id as { toString(): string })?.toString?.() ?? String(d._id),
      ideaId: (d.ideaId as string) ?? null,
      ideaCode: (d.ideaCode as string) ?? null,
      title: d.title as string,
      body: d.body as string,
      role: (d.role as IdeaNotification["role"]) ?? "All",
      read: Boolean(d.read),
      createdAt: d.createdAt as string,
    }));
    return { success: true as const, data: items };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

export const markIdeaNotificationReadFn = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getNotificationsCollection();
      const doc = await coll.findOne({ _id: await newObjectId(data.id) });
      if (!doc) throw new Error("Notification not found.");
      await coll.updateOne({ _id: await newObjectId(data.id) }, { $set: { ...doc, read: true } });
      return { success: true as const, data: { id: data.id } };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });
