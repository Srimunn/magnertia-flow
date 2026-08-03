import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Settings,
  Repeat,
  ShieldCheck,
  Rocket,
  Gauge,
  TrendingUp,
  Filter,
  RefreshCw,
  Zap,
  Cpu,
  Target,
  FileCheck,
  CheckSquare,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { chartColor } from "@/lib/chartColors";

export const Route = createFileRoute("/development/manufacturing-development/overview")({
  head: () => ({ meta: [{ title: "Manufacturing Development Overview · Magnertia ERP" }] }),
  component: ManufacturingDevelopmentOverview,
});

async function loadMdOverview() {
  return {
    activeProjects: 15,
    inPilot: 5,
    readyPpap: 3,
    massProdLines: 28,
    overallReadiness: 92,
  };
}

function ManufacturingDevelopmentOverview() {
  const q = useQuery({ queryKey: ["manufacturing-development", "overview"], queryFn: loadMdOverview });
  const d = q.data;

  const funnel = useMemo(() => [
    { label: "APQP Quality Gate", count: 22, icon: ShieldCheck },
    { label: "Process Design", count: 18, icon: Settings },
    { label: "Control Plan", count: 16, icon: FileCheck },
    { label: "PFMEA & Risk Control", count: 14, icon: CheckSquare },
    { label: "Pilot Production Runs", count: 10, icon: Repeat },
    { label: "PPAP Approval", count: 8, icon: ShieldCheck },
    { label: "Mass Production", count: 6, icon: Rocket },
  ], []);

  const trend = useMemo(() => [
    { label: "Mar", count: 88, key: "mar" },
    { label: "Apr", count: 90, key: "apr" },
    { label: "May", count: 91, key: "may" },
    { label: "Jun", count: 93, key: "jun" },
    { label: "Jul", count: 94, key: "jul" },
    { label: "Aug", count: 96, key: "aug" },
  ], []);

  const topProjects = useMemo(() => [
    { id: "MFG-2026-104", name: "Inverter Automated Stator Assembly Line", stage: "Pilot Run", lead: "Karthik Subramanian", yield: "98.4%", status: "In Pilot" },
    { id: "MFG-2026-092", name: "High-Speed SMT Pick & Place Robotics", stage: "PPAP Level 3", lead: "Anita Sharma", yield: "99.1%", status: "Ready PPAP" },
    { id: "MFG-2026-088", name: "Lean Value Stream Line 4 Standardization", stage: "Kaizen Validation", lead: "David Miller", yield: "97.8%", status: "On Track" },
    { id: "MFG-2026-071", name: "Cobot Welding Cell - Chassis Subassembly", stage: "Safety Interlock Audit", lead: "Hiroshi Tanaka", yield: "98.9%", status: "In Review" },
    { id: "MFG-2026-063", name: "Smart Factory IIoT Sensor Network Phase 2", stage: "Full Integration", lead: "Vikram Mehta", yield: "99.5%", status: "Mass Production" },
  ], []);

  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));

  return (
    <AppShell
      title="Manufacturing Development"
      breadcrumb="Development > Manufacturing Development"
      description="Consolidated manufacturing intelligence — APQP timing, process engineering, pilot builds, PPAP readiness, and mass production ramp."
      tabs={<ManufacturingDevelopmentTabBar />}
    >
      <div className="space-y-6">
        {/* Header Filter & Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-foreground">Manufacturing Development Overview</h2>
            <p className="text-xs text-muted-foreground">Aggregated operational metrics across process, pilot, PPAP, robotics, and mass production readiness.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>FY 2026 · All Plants</span>
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Last updated just now
            </span>
          </div>
        </div>

        {/* KPI Strip — Customizable via Widget System */}
        {q.isLoading || !d ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <WidgetPage
            pageId="md-overview"
            skeleton={
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            }
          />
        )}

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* APQP -> Process -> Pilot -> PPAP -> Mass Funnel */}
          <section className="card-soft p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">APQP → Pilot → PPAP → Mass Production Pipeline</h3>
              <span className="text-xs text-muted-foreground">94 Active Industrialization Gates</span>
            </div>
            <div className="space-y-2.5">
              {funnel.map((f, i) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="flex w-48 shrink-0 items-center gap-2 text-xs font-semibold text-foreground">
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

          {/* Operational Metric Trend */}
          <section className="card-soft p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Overall Yield Trend (%)</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex h-[230px] items-end justify-between gap-2">
              {trend.map((t, i) => (
                <div key={t.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold tabular text-foreground">{t.count}%</span>
                  <div
                    className={cn("w-full rounded-t-md transition-all")}
                    style={{
                      height: `${Math.max(10, (t.count / maxTrend) * 180)}px`,
                      backgroundColor: chartColor(i),
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">{t.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Average first-pass yield across pilot & ramp-up lines.
            </p>
          </section>
        </div>

        {/* Top Active Projects Table */}
        <section className="card-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Top Active Industrialization & Ramp Projects</h3>
            <span className="text-xs text-muted-foreground">Live manufacturing telemetry</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-2.5 pt-1">Project ID</th>
                  <th className="pb-2.5 pt-1">Project Name</th>
                  <th className="pb-2.5 pt-1">Stage</th>
                  <th className="pb-2.5 pt-1">Manufacturing Lead</th>
                  <th className="pb-2.5 pt-1">First Pass Yield</th>
                  <th className="pb-2.5 pt-1 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {topProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-bold text-foreground">{p.id}</td>
                    <td className="py-2.5 text-foreground">{p.name}</td>
                    <td className="py-2.5 text-muted-foreground">{p.stage}</td>
                    <td className="py-2.5 text-muted-foreground">{p.lead}</td>
                    <td className="py-2.5 font-semibold text-emerald-600 dark:text-emerald-400 tabular">{p.yield}</td>
                    <td className="py-2.5 text-right">
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold",
                        p.status === "Mass Production" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        p.status === "Ready PPAP" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-600"
                      )}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
