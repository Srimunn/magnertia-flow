import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Lightbulb,
  Compass,
  Palette,
  ShieldCheck,
  ClipboardCheck,
  Beaker,
  Cpu,
  Stamp,
  Repeat,
  Activity,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import { StatCard } from "@/components/erp/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { chartColor } from "@/lib/chartColors";
import {
  ideaManagementService,
  opportunityDiscoveryService,
  designThinkingService,
  problemValidationService,
  innovationPortfolioService,
  technologyScoutingService,
  researchManagementService,
  feasibilityStudyService,
  pocService,
  prototypeDevService,
  experimentMgmtService,
  trlAssessmentService,
  commercializationService,
  continuousInnovationService,
  patentMgmtService,
} from "@/services";

export const Route = createFileRoute("/development/research-innovation/overview")({
  head: () => ({ meta: [{ title: "Research & Innovation Overview · Magnertia ERP" }] }),
  component: ResearchInnovationOverview,
});

/* Rows across 15 modules have different shapes; read defensively. */
type Row = Record<string, unknown>;
const statusOf = (r: Row) => String((r.status as string) ?? "").toLowerCase();
const dateOf = (r: Row) => String((r.updatedAt as string) ?? (r.createdAt as string) ?? "");

const TERMINAL_NEG = ["rejected", "archived", "closed", "abandoned", "cancelled", "canceled", "lost", "obsolete", "withdrawn"];
const isDead = (r: Row) => TERMINAL_NEG.some((t) => statusOf(r).includes(t));
const active = (rows: Row[]) => rows.filter((r) => !isDead(r)).length;
const validated = (rows: Row[]) =>
  rows.filter((r) => ["validated", "approved", "granted", "active"].some((t) => statusOf(r).includes(t))).length;

async function loadOverview() {
  const [
    ideas,
    opportunities,
    design,
    validation,
    portfolio,
    scouting,
    research,
    feasibility,
    poc,
    prototype,
    experiments,
    trl,
    commercialization,
    innovation,
    patents,
  ] = await Promise.all([
    ideaManagementService.fetchIdeas(),
    opportunityDiscoveryService.fetchOpportunities(),
    designThinkingService.fetchList(),
    problemValidationService.fetchList(),
    innovationPortfolioService.fetchList(),
    technologyScoutingService.fetchList(),
    researchManagementService.fetchList(),
    feasibilityStudyService.fetchList(),
    pocService.fetchList(),
    prototypeDevService.fetchList(),
    experimentMgmtService.fetchList(),
    trlAssessmentService.fetchList(),
    commercializationService.fetchList(),
    continuousInnovationService.fetchList(),
    patentMgmtService.fetchList(),
  ]);
  return {
    ideas,
    opportunities,
    design,
    validation,
    portfolio,
    scouting,
    research,
    feasibility,
    poc,
    prototype,
    experiments,
    trl,
    commercialization,
    innovation,
    patents,
  } as Record<string, Row[]>;
}

function ResearchInnovationOverview() {
  const q = useQuery({ queryKey: ["research-innovation", "overview"], queryFn: loadOverview });
  const d = q.data;

  const funnel = useMemo(() => {
    if (!d) return [];
    return [
      { label: "Ideas", count: d.ideas.length, icon: Lightbulb },
      { label: "Opportunities", count: d.opportunities.length, icon: Compass },
      { label: "Design", count: d.design.length, icon: Palette },
      { label: "Validation", count: d.validation.length, icon: ShieldCheck },
      { label: "Feasibility", count: d.feasibility.length, icon: ClipboardCheck },
      { label: "PoC", count: d.poc.length, icon: Beaker },
      { label: "Prototype", count: d.prototype.length, icon: Cpu },
      { label: "Experiments", count: d.experiments.length, icon: Activity },
      { label: "Commercialization", count: d.commercialization.length, icon: TrendingUp },
    ];
  }, [d]);

  const trend = useMemo(() => {
    if (!d) return [];
    const all = Object.values(d).flat();
    const now = new Date();
    const months: { label: string; key: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: dt.toLocaleDateString("en-IN", { month: "short" }),
        key: `${dt.getFullYear()}-${dt.getMonth()}`,
        count: 0,
      });
    }
    for (const r of all) {
      const iso = dateOf(r);
      if (!iso) continue;
      const dt = new Date(iso);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      const m = months.find((x) => x.key === key);
      if (m) m.count++;
    }
    return months;
  }, [d]);

  const totalRecords = d ? Object.values(d).reduce((s, r) => s + r.length, 0) : 0;
  const deadRecords = d ? Object.values(d).reduce((s, r) => s + r.filter(isDead).length, 0) : 0;
  const pipelineHealth = totalRecords ? Math.round((100 * (totalRecords - deadRecords)) / totalRecords) : 0;
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));

  return (
    <AppShell
      title="Research & Innovation"
      breadcrumb="Development"
      description="Pipeline-wide innovation intelligence — aggregate metrics, funnel and throughput across every stage."
      tabs={<ResearchInnovationTabBar />}
    >
      {q.isLoading || !d ? (
        <OverviewSkeleton />
      ) : (
        <div className="space-y-6">
          {/* KPI strip — customizable via the widget system (hover-pin, Edit, Templates, Restore).
              Each widget reads from its module's own fetchList so counts stay live. */}
          <WidgetPage
            pageId="ri-overview"
            skeleton={
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            }
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Pipeline funnel */}
            <section className="card-soft p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Innovation Pipeline Funnel</h3>
                <span className="text-xs text-muted-foreground">{totalRecords} records across the pipeline</span>
              </div>
              <div className="space-y-2.5">
                {funnel.map((f, i) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="flex w-36 shrink-0 items-center gap-2 text-xs font-semibold text-foreground">
                      <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {f.label}
                    </div>
                    <div className="h-5 flex-1 overflow-hidden rounded-md bg-muted">
                      <div
                        className="flex h-full items-center justify-end rounded-md px-2 text-[10px] font-bold text-white transition-all"
                        style={{
                          width: `${Math.max(8, (f.count / maxFunnel) * 100)}%`,
                          backgroundColor: chartColor(i),
                        }}
                      >
                        {f.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Throughput trend */}
            <section className="card-soft p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Throughput (6 mo)</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex h-[220px] items-end justify-between gap-2">
                {trend.map((t, i) => (
                  <div key={t.key} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold tabular text-foreground">{t.count}</span>
                    <div
                      className={cn("w-full rounded-t-md transition-all")}
                      style={{
                        height: `${Math.max(4, (t.count / maxTrend) * 170)}px`,
                        backgroundColor: chartColor(i),
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{t.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Records touched per month across all innovation modules.
              </p>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[320px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[320px] rounded-xl" />
      </div>
    </div>
  );
}
