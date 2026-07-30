import {
  commercializationService,
  feasibilityStudyService,
  ideaManagementService,
  innovationPortfolioService,
  opportunityDiscoveryService,
  patentMgmtService,
  trlAssessmentService,
  continuousInnovationService,
} from "@/services";
import type { ReportConfig } from "./types";

/* ===========================================================================
   Research & Innovation report configuration — one report type per major
   module, each resolved directly via that module's own fetchList() so we
   never fabricate numbers. Secondary filter is Business Unit; picked because
   every innovation record either has a BU or a status stage.
   =========================================================================== */

const currentFy = () => ({
  from: `${new Date().getFullYear() - 1}-04-01`,
  to: `${new Date().getFullYear()}-03-31`,
});

// Common helpers
const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// Optional date-window filter for records that carry an updatedAt/dateSubmitted.
function inRange(iso: string | null | undefined, from: string, to: string, enabled: boolean) {
  if (!enabled) return true;
  if (!iso) return false;
  return iso >= from && iso <= `${to}T23:59:59`;
}

export const RI_REPORT_CONFIG: ReportConfig = {
  areaLabel: "Innovation",
  defaultRange: currentFy(),
  secondaryFilter: {
    key: "businessUnit",
    label: "Business Unit",
    options: [
      { value: "Smart Mobility Division", label: "Smart Mobility Division" },
      { value: "EV Powertrain", label: "EV Powertrain" },
      { value: "Battery Systems", label: "Battery Systems" },
      { value: "Charging Infrastructure", label: "Charging Infrastructure" },
      { value: "Corporate", label: "Corporate" },
    ],
  },
  reportTypes: [
    /* -------------------- Ideas Register -------------------- */
    {
      id: "ideas-register",
      label: "Ideas Register",
      description: "Every idea captured, with score, priority, and status.",
      resolve: async (f) => {
        const dashboard = await ideaManagementService.fetchDashboard();
        const rows = (dashboard.rows ?? [])
          .filter((r) => inRange(r.dateSubmitted, f.from, f.to, f.dateRangeEnabled))
          .filter((r) => !f.secondary || r.department === f.secondary);
        if (rows.length === 0) return { status: "empty" as const };
        return {
          status: "ok" as const,
          columns: [
            { key: "code", header: "Idea Code" },
            { key: "title", header: "Title" },
            { key: "category", header: "Category" },
            { key: "status", header: "Status" },
            { key: "score", header: "Score", align: "right" as const },
            { key: "submitted", header: "Submitted" },
          ],
          rows: rows.map((r) => ({
            code: r.ideaCode,
            title: r.title || "Untitled",
            category: r.category || "—",
            status: r.status,
            score: r.overallEvaluationScore,
            submitted: fmtDate(r.dateSubmitted),
          })),
        };
      },
    },
    /* -------------------- Opportunity Pipeline -------------------- */
    {
      id: "opportunity-pipeline",
      label: "Opportunity Pipeline",
      description: "Opportunities by status and estimated revenue.",
      resolve: async (f) => {
        const list = await opportunityDiscoveryService.fetchOpportunities();
        const rows = list.filter((r) =>
          inRange(r.updatedAt, f.from, f.to, f.dateRangeEnabled),
        );
        if (rows.length === 0) return { status: "empty" as const };
        return {
          status: "ok" as const,
          columns: [
            { key: "code", header: "Opportunity" },
            { key: "title", header: "Title" },
            { key: "status", header: "Status" },
            { key: "score", header: "Score", align: "right" as const },
            { key: "revenue", header: "Est. Revenue (₹)", align: "right" as const, total: "sum" as const },
          ],
          rows: rows.map((r) => ({
            code: (r as { opportunityId?: string }).opportunityId ?? r.id,
            title: (r as { opportunityTitle?: string }).opportunityTitle ?? "Untitled",
            status: r.status,
            score: (r as { opportunityScore?: number }).opportunityScore ?? 0,
            revenue: (r as { estimatedRevenue?: number }).estimatedRevenue ?? 0,
          })),
        };
      },
    },
    /* -------------------- Feasibility Summary -------------------- */
    {
      id: "feasibility-summary",
      label: "Feasibility Summary",
      description: "Feasibility studies with composite score and status.",
      resolve: async (f) => {
        const list = await feasibilityStudyService.fetchList();
        const rows = list.filter((r) => inRange(r.updatedAt, f.from, f.to, f.dateRangeEnabled));
        if (rows.length === 0) return { status: "empty" as const };
        return {
          status: "ok" as const,
          columns: [
            { key: "code", header: "Study" },
            { key: "title", header: "Title" },
            { key: "status", header: "Status" },
            { key: "score", header: "Score", align: "right" as const },
            { key: "updated", header: "Updated" },
          ],
          rows: rows.map((r) => ({
            code: (r as { studyCode?: string }).studyCode ?? r.id,
            title: (r as { studyTitle?: string }).studyTitle ?? "Untitled",
            status: r.status,
            score: (r as { feasibilityScore?: number }).feasibilityScore ?? 0,
            updated: fmtDate(r.updatedAt),
          })),
        };
      },
    },
    /* -------------------- Portfolio Status -------------------- */
    {
      id: "portfolio-status",
      label: "Portfolio Status",
      description: "Innovation portfolios with health, projects, and status.",
      resolve: async () => {
        const list = await innovationPortfolioService.fetchList();
        if (list.length === 0) return { status: "empty" as const };
        return {
          status: "ok" as const,
          columns: [
            { key: "code", header: "Portfolio" },
            { key: "name", header: "Name" },
            { key: "status", header: "Status" },
            { key: "projects", header: "Projects", align: "right" as const, total: "sum" as const },
            { key: "health", header: "Health", align: "right" as const },
          ],
          rows: list.map((r) => ({
            code: (r as { portfolioCode?: string }).portfolioCode ?? r.id,
            name: (r as { portfolioName?: string }).portfolioName ?? "Untitled",
            status: r.status,
            projects: (r as { totalProjects?: number }).totalProjects ?? 0,
            health: (r as { healthScore?: number }).healthScore ?? 0,
          })),
        };
      },
    },
    /* -------------------- Patent Register -------------------- */
    {
      id: "patent-register",
      label: "Patent Register",
      description: "Patents with status, number, and manager.",
      resolve: async () => {
        const list = await patentMgmtService.fetchList();
        if (list.length === 0) return { status: "empty" as const };
        return {
          status: "ok" as const,
          columns: [
            { key: "code", header: "Patent ID" },
            { key: "title", header: "Title" },
            { key: "number", header: "Patent No." },
            { key: "status", header: "Status" },
            { key: "manager", header: "Manager" },
            { key: "updated", header: "Updated" },
          ],
          rows: list.map((r) => ({
            code: r.patentId,
            title: r.patentTitle || "Untitled",
            number: r.patentNumber || "—",
            status: r.status,
            manager: r.patentManager || "—",
            updated: fmtDate(r.updatedAt),
          })),
        };
      },
    },
    /* -------------------- TRL Summary -------------------- */
    {
      id: "trl-summary",
      label: "TRL Summary",
      description: "Technology-readiness assessments and their scores.",
      resolve: async () => {
        const list = await trlAssessmentService.fetchList();
        if (list.length === 0) return { status: "empty" as const };
        return {
          status: "ok" as const,
          columns: [
            { key: "code", header: "TRL ID" },
            { key: "title", header: "Assessment" },
            { key: "current", header: "Current", align: "center" as const },
            { key: "target", header: "Target", align: "center" as const },
            { key: "status", header: "Status" },
            { key: "score", header: "Score", align: "right" as const },
          ],
          rows: list.map((r) => ({
            code: (r as { trlAssessmentId?: string }).trlAssessmentId ?? r.id,
            title: (r as { assessmentTitle?: string }).assessmentTitle ?? "Untitled",
            current: (r as { currentTrlLevel?: number }).currentTrlLevel ?? "—",
            target: (r as { targetTrlLevel?: number }).targetTrlLevel ?? "—",
            status: r.status,
            score: (r as { finalTrlScore?: number }).finalTrlScore ?? 0,
          })),
        };
      },
    },
    /* -------------------- Commercialization Plans -------------------- */
    {
      id: "commercialization-plans",
      label: "Commercialization Plans",
      description: "Go-to-market plans with launch readiness.",
      resolve: async () => {
        const list = await commercializationService.fetchList();
        if (list.length === 0) return { status: "empty" as const };
        return {
          status: "ok" as const,
          columns: [
            { key: "code", header: "Plan" },
            { key: "project", header: "Project" },
            { key: "status", header: "Status" },
            { key: "readiness", header: "Readiness", align: "right" as const },
          ],
          rows: list.map((r) => ({
            code: (r as { commercializationPlanId?: string }).commercializationPlanId ?? r.id,
            project: (r as { commercializationProject?: string }).commercializationProject ?? "—",
            status: r.status,
            readiness: (r as { overallLaunchReadiness?: number }).overallLaunchReadiness ?? 0,
          })),
        };
      },
    },
    /* -------------------- Innovation KPI (Continuous Innovation cycles) --- */
    {
      id: "innovation-kpi",
      label: "Innovation KPI",
      description: "Continuous-innovation cycles with health & overall score.",
      resolve: async () => {
        const list = await continuousInnovationService.fetchList();
        if (list.length === 0) return { status: "empty" as const };
        return {
          status: "ok" as const,
          columns: [
            { key: "code", header: "Cycle" },
            { key: "initiative", header: "Initiative" },
            { key: "product", header: "Product" },
            { key: "status", header: "Status" },
            { key: "health", header: "Health %", align: "right" as const },
            { key: "overall", header: "Overall", align: "right" as const },
          ],
          rows: list.map((r) => ({
            code: r.cycleId,
            initiative: r.innovationInitiative || "—",
            product: r.linkedProductName ?? "—",
            status: r.status,
            health: r.innovationHealthScore,
            overall: r.overallInnovationScore,
          })),
        };
      },
    },
  ],
};
