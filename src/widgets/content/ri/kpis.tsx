/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Activity,
  AlertTriangle,
  Award,
  Beaker,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Cpu,
  DollarSign,
  Eye,
  FlaskConical,
  Gauge,
  Lightbulb,
  Palette,
  Radar,
  Repeat,
  Rocket,
  ShieldCheck,
  Sparkles,
  Stamp,
  Star,
  TestTubes,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";
import type { WidgetDefinition, WidgetRole } from "../../types";
import {
  riCommercializationOptions,
  riDesignOptions,
  riExperimentsOptions,
  riFeasibilityOptions,
  riIdeasOptions,
  riInnovationOptions,
  riOpportunitiesOptions,
  riPatentsOptions,
  riPocOptions,
  riPortfolioOptions,
  riPrototypeOptions,
  riResearchOptions,
  riScoutingOptions,
  riTrlOptions,
  riValidationOptions,
} from "../../data/queries";
import { makeStatCardWidget, type StatCardShape } from "../shared/StatCardWidget";

/* ===========================================================================
   Research & Innovation module KPIs
   ---------------------------------------------------------------------------
   One widget per KPI card each R&I register renders today. Every widget reads
   from its module's canonical fetchList (see data/queries.ts), so the widget
   grid and the register share the query cache — zero extra requests.
   Deliberately reuses the same makeStatCardWidget factory Finance uses, so all
   pin / Edit Dashboard / Templates / Restore Default behavior is inherited
   from the widget system without any per-module code.
   =========================================================================== */

const ROLES: WidgetRole[] = ["CEO", "Operations", "Finance", "Accountant", "Auditor"];

/** Small helper: consistent widget shape from a compact config. */
function w<TData, TKey extends readonly unknown[]>(
  c: {
    id: string;
    title: string;
    description: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    sourceRoute: string;
    options: () => any;
    inLibrary?: boolean;
  },
  map: (d: TData) => StatCardShape,
): WidgetDefinition {
  return makeStatCardWidget<TData, TKey>({
    id: c.id,
    title: c.title,
    description: c.description,
    category: "kpi",
    tags: ["kpi", "innovation"],
    icon: c.icon,
    keywords: c.title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
    roles: ROLES,
    sourceRoute: c.sourceRoute,
    libraryHidden: !c.inLibrary,
    iconBg: c.iconBg,
    iconColor: c.iconColor,
    options: c.options,
    map,
  });
}

const num = (n: number | undefined) => (n == null ? "—" : Number(n).toLocaleString("en-IN"));
const pct = (n: number | undefined) => (n == null ? "—" : `${Number(n).toFixed(0)}%`);
const score100 = (n: number | undefined) => (n == null || !n ? "—" : `${Math.round(Number(n))}/100`);
const score10 = (n: number | undefined) => (n == null || !n ? "—" : `${Number(n).toFixed(1)}/10`);
const money = (n: number | undefined) => (n == null ? "—" : formatCurrency(n, true));

/* -------------------- Idea Management (8 KPIs, dashboard shape) ------------ */
const IDEAS_ROUTE = "/development/research-innovation/idea-management";
const ideas = [
  w({ id: "kpi.ri.ideas-total", title: "Total Ideas Submitted", description: "Cumulative ideas submitted.", icon: Lightbulb, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: IDEAS_ROUTE, options: riIdeasOptions, inLibrary: true },
    (d: any) => ({ value: num(d?.kpis?.totalIdeas) })),
  w({ id: "kpi.ri.ideas-approval-rate", title: "Approval Rate", description: "Share of submitted ideas approved.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: IDEAS_ROUTE, options: riIdeasOptions },
    (d: any) => ({ value: pct(d?.kpis?.approvalRate) })),
  w({ id: "kpi.ri.ideas-avg-innovation", title: "Average Innovation Score", description: "Mean of the per-idea innovation score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: IDEAS_ROUTE, options: riIdeasOptions },
    (d: any) => ({ value: score100(d?.kpis?.averageInnovationScore) })),
  w({ id: "kpi.ri.ideas-revenue-pipeline", title: "Estimated Revenue Pipeline", description: "Cumulative estimated revenue across ideas.", icon: DollarSign, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: IDEAS_ROUTE, options: riIdeasOptions },
    (d: any) => ({ value: money(d?.kpis?.estimatedRevenuePipeline) })),
  w({ id: "kpi.ri.ideas-this-month", title: "Ideas This Month", description: "Ideas submitted this month.", icon: Calendar, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: IDEAS_ROUTE, options: riIdeasOptions },
    (d: any) => ({ value: num(d?.kpis?.ideasThisMonth) })),
  w({ id: "kpi.ri.ideas-patentable", title: "Patentable Ideas", description: "Ideas flagged as patentable.", icon: Stamp, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: IDEAS_ROUTE, options: riIdeasOptions },
    (d: any) => ({ value: num(d?.kpis?.patentableIdeas) })),
  w({ id: "kpi.ri.ideas-cost-savings", title: "Estimated Cost Savings", description: "Cumulative estimated cost savings.", icon: TrendingUp, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: IDEAS_ROUTE, options: riIdeasOptions },
    (d: any) => ({ value: money(d?.kpis?.estimatedCostSavings) })),
  w({ id: "kpi.ri.ideas-avg-review-days", title: "Avg. Review Time", description: "Mean review time per idea (days).", icon: Activity, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]", sourceRoute: IDEAS_ROUTE, options: riIdeasOptions },
    (d: any) => ({ value: d?.kpis?.averageReviewTimeDays != null ? `${d.kpis.averageReviewTimeDays} days` : "—" })),
];

/* -------- List-shape helpers: derive KPIs from a fetchList[] result -------- */
const isTerminalNeg = (s: string) => ["rejected", "archived", "closed", "abandoned", "cancelled", "canceled", "lost", "obsolete", "withdrawn"].some((t) => s.includes(t));
const countActive = (rows: any[]) => rows.filter((r) => !isTerminalNeg(String(r.status ?? "").toLowerCase())).length;
const countApproved = (rows: any[]) => rows.filter((r) => {
  const s = String(r.status ?? "").toLowerCase();
  return s.includes("approved") || s === "active" || s === "granted";
}).length;
const avgOf = (rows: any[], key: string) => {
  const scored = rows.filter((r) => r[key] > 0);
  return scored.length ? Math.round(scored.reduce((s, r) => s + r[key], 0) / scored.length) : 0;
};

/* -------------------- Opportunity Discovery (4) --------------------------- */
const OPP_ROUTE = "/development/research-innovation/opportunity-discovery";
const opportunities = [
  w({ id: "kpi.ri.opps-total", title: "Total Opportunities", description: "All discovered opportunities.", icon: Compass, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: OPP_ROUTE, options: riOpportunitiesOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.opps-approval-rate", title: "Approval Rate", description: "Approved / total opportunities.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: OPP_ROUTE, options: riOpportunitiesOptions },
    (d: any[]) => ({ value: d?.length ? pct((countApproved(d) / d.length) * 100) : "—" })),
  w({ id: "kpi.ri.opps-avg-score", title: "Average Opportunity Score", description: "Mean opportunity score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: OPP_ROUTE, options: riOpportunitiesOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "opportunityScore")) })),
  w({ id: "kpi.ri.opps-revenue", title: "Revenue Opportunity", description: "Cumulative estimated revenue.", icon: DollarSign, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: OPP_ROUTE, options: riOpportunitiesOptions },
    (d: any[]) => ({ value: money((d ?? []).reduce((s, r) => s + (r.estimatedRevenue ?? 0), 0)) })),
];

/* -------------------- Design Thinking (4) --------------------------------- */
const DT_ROUTE = "/development/research-innovation/design-thinking";
const design = [
  w({ id: "kpi.ri.design-total", title: "Total Projects", description: "Design Thinking projects.", icon: Palette, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: DT_ROUTE, options: riDesignOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.design-in-progress", title: "In Progress", description: "Active DT projects.", icon: Activity, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: DT_ROUTE, options: riDesignOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.design-approval-rate", title: "Approval Rate", description: "Approved / total DT projects.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: DT_ROUTE, options: riDesignOptions },
    (d: any[]) => ({ value: d?.length ? pct((countApproved(d) / d.length) * 100) : "—" })),
  w({ id: "kpi.ri.design-avg-score", title: "Average Design Score", description: "Mean design score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: DT_ROUTE, options: riDesignOptions },
    (d: any[]) => ({ value: score10(avgOf(d ?? [], "designScore")) })),
];

/* -------------------- Problem Validation (4) ------------------------------ */
const PV_ROUTE = "/development/research-innovation/problem-validation";
const validation = [
  w({ id: "kpi.ri.pv-total", title: "Total Records", description: "Problem-validation records.", icon: ShieldCheck, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: PV_ROUTE, options: riValidationOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.pv-in-progress", title: "In Progress", description: "Active PV records.", icon: Activity, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: PV_ROUTE, options: riValidationOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.pv-validation-rate", title: "Validation Rate", description: "Validated / total.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: PV_ROUTE, options: riValidationOptions },
    (d: any[]) => ({
      value: d?.length
        ? pct((d.filter((r) => String(r.status ?? "").toLowerCase().includes("validated")).length / d.length) * 100)
        : "—",
    })),
  w({ id: "kpi.ri.pv-avg-score", title: "Average Score", description: "Mean validation score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: PV_ROUTE, options: riValidationOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "validationScore")) })),
];

/* -------------------- Innovation Portfolio (4) ---------------------------- */
const PORT_ROUTE = "/development/research-innovation/innovation-portfolio";
const portfolio = [
  w({ id: "kpi.ri.port-total", title: "Total Portfolios", description: "All portfolios.", icon: Briefcase, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: PORT_ROUTE, options: riPortfolioOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.port-active", title: "Active Portfolios", description: "Not terminal.", icon: Activity, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: PORT_ROUTE, options: riPortfolioOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.port-projects", title: "Rolled-up Projects", description: "Projects across portfolios.", icon: Rocket, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: PORT_ROUTE, options: riPortfolioOptions },
    (d: any[]) => ({ value: num((d ?? []).reduce((s, r) => s + (r.totalProjects ?? 0), 0)) })),
  w({ id: "kpi.ri.port-avg-health", title: "Average Health Score", description: "Mean portfolio health.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: PORT_ROUTE, options: riPortfolioOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "healthScore")) })),
];

/* -------------------- Technology Scouting (4) ----------------------------- */
const SC_ROUTE = "/development/research-innovation/technology-scouting";
const scouting = [
  w({ id: "kpi.ri.sc-total", title: "Technologies Scouted", description: "All scouted technologies.", icon: Radar, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: SC_ROUTE, options: riScoutingOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.sc-approved", title: "Approved", description: "Approved technologies.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: SC_ROUTE, options: riScoutingOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.sc-watchlist", title: "On Watchlist", description: "Monitoring status.", icon: Eye, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]", sourceRoute: SC_ROUTE, options: riScoutingOptions },
    (d: any[]) => ({
      value: num((d ?? []).filter((r) => String(r.status ?? "").toLowerCase() === "monitoring").length),
    })),
  w({ id: "kpi.ri.sc-avg-score", title: "Average Technology Score", description: "Mean tech score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: SC_ROUTE, options: riScoutingOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "technologyScore")) })),
];

/* -------------------- Research Management (4) ----------------------------- */
const RM_ROUTE = "/development/research-innovation/research-management";
const research = [
  w({ id: "kpi.ri.rm-total", title: "Research Projects", description: "All research projects.", icon: FlaskConical, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: RM_ROUTE, options: riResearchOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.rm-active", title: "Active", description: "Not terminal.", icon: Activity, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: RM_ROUTE, options: riResearchOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.rm-approved", title: "Approved", description: "Approved research.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: RM_ROUTE, options: riResearchOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.rm-avg-impact", title: "Avg Research Impact", description: "Mean impact score.", icon: Star, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: RM_ROUTE, options: riResearchOptions },
    (d: any[]) => ({ value: score10(avgOf(d ?? [], "researchImpact")) })),
];

/* -------------------- Feasibility Study (4) ------------------------------- */
const FS_ROUTE = "/development/research-innovation/feasibility-study";
const feasibility = [
  w({ id: "kpi.ri.fs-total", title: "Feasibility Studies", description: "All studies.", icon: ClipboardCheck, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: FS_ROUTE, options: riFeasibilityOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.fs-in-assessment", title: "In Assessment", description: "Active studies.", icon: Activity, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]", sourceRoute: FS_ROUTE, options: riFeasibilityOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.fs-approved", title: "Approved", description: "Approved studies.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: FS_ROUTE, options: riFeasibilityOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.fs-avg-score", title: "Avg Feasibility Score", description: "Mean feasibility score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: FS_ROUTE, options: riFeasibilityOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "feasibilityScore")) })),
];

/* -------------------- PoC (4) --------------------------------------------- */
const POC_ROUTE = "/development/research-innovation/proof-of-concept";
const poc = [
  w({ id: "kpi.ri.poc-total", title: "PoC Projects", description: "All PoC projects.", icon: Beaker, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: POC_ROUTE, options: riPocOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.poc-in-progress", title: "In Progress", description: "Active PoCs.", icon: Activity, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]", sourceRoute: POC_ROUTE, options: riPocOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.poc-approved", title: "Approved", description: "Approved PoCs.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: POC_ROUTE, options: riPocOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.poc-avg-score", title: "Avg PoC Score", description: "Mean PoC score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: POC_ROUTE, options: riPocOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "pocScore")) })),
];

/* -------------------- Prototype Development (4) --------------------------- */
const PD_ROUTE = "/development/research-innovation/prototype-development";
const prototype = [
  w({ id: "kpi.ri.pd-total", title: "Prototypes", description: "All prototypes.", icon: Cpu, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: PD_ROUTE, options: riPrototypeOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.pd-in-progress", title: "In Progress", description: "Active prototypes.", icon: Activity, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]", sourceRoute: PD_ROUTE, options: riPrototypeOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.pd-approved", title: "Approved", description: "Approved prototypes.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: PD_ROUTE, options: riPrototypeOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.pd-avg-score", title: "Avg Prototype Score", description: "Mean prototype score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: PD_ROUTE, options: riPrototypeOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "prototypeScore")) })),
];

/* -------------------- Experiments (4) ------------------------------------- */
const EX_ROUTE = "/development/research-innovation/experiment-management";
const experiments = [
  w({ id: "kpi.ri.ex-total", title: "Experiments", description: "All experiments.", icon: TestTubes, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: EX_ROUTE, options: riExperimentsOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.ex-running", title: "Running", description: "Active experiments.", icon: Activity, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: EX_ROUTE, options: riExperimentsOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.ex-approved", title: "Approved", description: "Approved experiments.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: EX_ROUTE, options: riExperimentsOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.ex-avg-score", title: "Avg Experiment Score", description: "Mean experiment score.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: EX_ROUTE, options: riExperimentsOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "experimentScore")) })),
];

/* -------------------- TRL (4) --------------------------------------------- */
const TRL_ROUTE = "/development/research-innovation/trl-assessment";
const trl = [
  w({ id: "kpi.ri.trl-total", title: "Total Assessments", description: "All TRL assessments.", icon: Gauge, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: TRL_ROUTE, options: riTrlOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.trl-under", title: "Under Assessment", description: "In progress.", icon: Gauge, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]", sourceRoute: TRL_ROUTE, options: riTrlOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.trl-approved", title: "Approved TRLs", description: "Committed readiness levels.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: TRL_ROUTE, options: riTrlOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.trl-avg-score", title: "Avg Readiness Score", description: "Composite TRL maturity.", icon: Award, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: TRL_ROUTE, options: riTrlOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "finalTrlScore")) })),
];

/* -------------------- Commercialization (4) ------------------------------- */
const CMP_ROUTE = "/development/research-innovation/commercialization-planning";
const commercialization = [
  w({ id: "kpi.ri.cmp-total", title: "Total Plans", description: "All plans.", icon: Briefcase, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: CMP_ROUTE, options: riCommercializationOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.cmp-planning", title: "Under Planning", description: "Active planning.", icon: TrendingUp, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]", sourceRoute: CMP_ROUTE, options: riCommercializationOptions },
    (d: any[]) => ({ value: num(countActive(d ?? [])) })),
  w({ id: "kpi.ri.cmp-approved", title: "Approved Plans", description: "Approved plans.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: CMP_ROUTE, options: riCommercializationOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.cmp-avg-readiness", title: "Avg Launch Readiness", description: "Composite readiness.", icon: DollarSign, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: CMP_ROUTE, options: riCommercializationOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "overallLaunchReadiness")) })),
];

/* -------------------- Continuous Innovation (4) --------------------------- */
const INN_ROUTE = "/development/research-innovation/continuous-innovation";
const innovation = [
  w({ id: "kpi.ri.inn-total", title: "Innovation Cycles", description: "All cycles.", icon: Repeat, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: INN_ROUTE, options: riInnovationOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.inn-active", title: "Active Cycles", description: "In progress.", icon: Activity, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: INN_ROUTE, options: riInnovationOptions },
    (d: any[]) => ({
      value: num((d ?? []).filter((r) => [
        "opportunity_identification","innovation_planning","implementation_monitoring","executive_review",
      ].includes(String(r.status ?? ""))).length),
    })),
  w({ id: "kpi.ri.inn-approved", title: "Approved", description: "Released / roadmapped.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: INN_ROUTE, options: riInnovationOptions },
    (d: any[]) => ({ value: num(countApproved(d ?? [])) })),
  w({ id: "kpi.ri.inn-avg-score", title: "Avg Innovation Score", description: "Across scored cycles.", icon: Sparkles, iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]", sourceRoute: INN_ROUTE, options: riInnovationOptions },
    (d: any[]) => ({ value: score100(avgOf(d ?? [], "overallInnovationScore")) })),
];

/* -------------------- Patents (4) ----------------------------------------- */
const PAT_ROUTE = "/development/ip-development/patent-management";
const patents = [
  w({ id: "kpi.ri.pat-total", title: "Patents", description: "All patents.", icon: Stamp, iconBg: "bg-primary/10", iconColor: "text-primary", sourceRoute: PAT_ROUTE, options: riPatentsOptions, inLibrary: true },
    (d: any[]) => ({ value: num(d?.length) })),
  w({ id: "kpi.ri.pat-in-prosecution", title: "In Prosecution", description: "Prep → examination.", icon: Gauge, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", sourceRoute: PAT_ROUTE, options: riPatentsOptions },
    (d: any[]) => ({ value: num((d ?? []).filter((r) => ["preparation","filing","examination"].includes(String(r.status ?? ""))).length) })),
  w({ id: "kpi.ri.pat-granted", title: "Granted / Active", description: "In the portfolio.", icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]", sourceRoute: PAT_ROUTE, options: riPatentsOptions },
    (d: any[]) => ({ value: num((d ?? []).filter((r) => ["granted","commercialization","active"].includes(String(r.status ?? ""))).length) })),
  w({ id: "kpi.ri.pat-deadline-alerts", title: "Deadline Alerts", description: "Office actions & renewals.", icon: AlertTriangle, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]", sourceRoute: PAT_ROUTE, options: riPatentsOptions },
    (d: any[]) => ({
      value: num((d ?? []).filter((r) => r.responseDueTone === "due" || r.responseDueTone === "overdue" || r.renewalState === "Due" || r.renewalState === "Overdue").length),
    })),
];

export const RI_KPI_WIDGETS: WidgetDefinition[] = [
  ...ideas, ...opportunities, ...design, ...validation, ...portfolio, ...scouting,
  ...research, ...feasibility, ...poc, ...prototype, ...experiments, ...trl,
  ...commercialization, ...innovation, ...patents,
];
