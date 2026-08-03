import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Package,
  Layers,
  Rocket,
  Repeat,
  Activity,
  TrendingUp,
  Filter,
  RefreshCw,
  Target,
  Cpu,
  Palette,
  Code,
  Smartphone,
  Cloud,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { chartColor } from "@/lib/chartColors";
import { prdService } from "@/services";

export const Route = createFileRoute("/development/product-development/overview")({
  head: () => ({ meta: [{ title: "Product Development Overview · Magnertia ERP" }] }),
  component: ProductDevelopmentOverview,
});

async function loadPdOverview() {
  try {
    const prdRecord = await prdService.fetchRecord();
    return {
      projectsCount: 18,
      inDevCount: 12,
      readyReleaseCount: 4,
      lifecycleCount: 34,
      healthScore: 94,
      prd: prdRecord,
    };
  } catch {
    return {
      projectsCount: 18,
      inDevCount: 12,
      readyReleaseCount: 4,
      lifecycleCount: 34,
      healthScore: 94,
      prd: null,
    };
  }
}

function ProductDevelopmentOverview() {
  const q = useQuery({ queryKey: ["product-development", "overview"], queryFn: loadPdOverview });
  const d = q.data;

  const funnel = useMemo(() => [
    { label: "Product Strategy", count: 24, icon: Target },
    { label: "Requirements (PRD)", count: 18, icon: Package },
    { label: "Architecture", count: 15, icon: Cpu },
    { label: "Industrial & Mech", count: 14, icon: Palette },
    { label: "Electronics & Embedded", count: 12, icon: Cpu },
    { label: "Software & Mobile", count: 10, icon: Code },
    { label: "Cloud & APIs", count: 8, icon: Cloud },
    { label: "Testing & Validation", count: 6, icon: Activity },
    { label: "Release & Lifecycle", count: 4, icon: Rocket },
  ], []);

  const trend = useMemo(() => [
    { label: "Mar", count: 12, key: "mar" },
    { label: "Apr", count: 15, key: "apr" },
    { label: "May", count: 18, key: "may" },
    { label: "Jun", count: 22, key: "jun" },
    { label: "Jul", count: 26, key: "jul" },
    { label: "Aug", count: 31, key: "aug" },
  ], []);

  const topProjects = useMemo(() => [
    { id: "PRJ-2026-081", name: "MagFlow NextGen Inverter Platform", stage: "Detailed Design", owner: "Dr. Aris Vance", progress: 78, status: "On Track" },
    { id: "PRJ-2026-074", name: "Smart Grid Gateway MCU-v4", stage: "Firmware Integration", owner: "Elena Rostova", progress: 92, status: "Release Gate" },
    { id: "PRJ-2026-069", name: "High-Voltage Power Module E3", stage: "Thermal Simulation", owner: "Marcus Sterling", progress: 64, status: "In Review" },
    { id: "PRJ-2026-058", name: "Enterprise IoT Telemetry Hub", stage: "Cloud API Validation", owner: "Sarah Jenkins", progress: 85, status: "On Track" },
    { id: "PRJ-2026-042", name: "Mobile Diagnostics Suite v2.1", stage: "Beta Testing", owner: "Devon Chen", progress: 90, status: "On Track" },
  ], []);

  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));

  return (
    <AppShell
      title="Product Development"
      breadcrumb="Development > Product Development"
      description="Consolidated product engineering intelligence — multi-stage pipeline, design baselines, release gates, and digital thread tracking."
      tabs={<ProductDevelopmentTabBar />}
    >
      <div className="space-y-6">
        {/* Header Filter & Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-foreground">Product Development Overview</h2>
            <p className="text-xs text-muted-foreground">Aggregated real-time metrics across design, software, hardware, and lifecycle stages.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>FY 2026 · All Divisions</span>
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
            pageId="pd-overview"
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
          {/* Design -> Build -> Release Funnel */}
          <section className="card-soft p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Design → Build → Release Funnel</h3>
              <span className="text-xs text-muted-foreground">111 Active Baselines</span>
            </div>
            <div className="space-y-2.5">
              {funnel.map((f, i) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="flex w-44 shrink-0 items-center gap-2 text-xs font-semibold text-foreground">
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

          {/* Business Impact / Roadmap Trend */}
          <section className="card-soft p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Milestones Delivered (6 Mo)</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex h-[230px] items-end justify-between gap-2">
              {trend.map((t, i) => (
                <div key={t.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold tabular text-foreground">{t.count}</span>
                  <div
                    className={cn("w-full rounded-t-md transition-all")}
                    style={{
                      height: `${Math.max(6, (t.count / maxTrend) * 180)}px`,
                      backgroundColor: chartColor(i),
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">{t.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Completed engineering milestones & gate approvals per month.
            </p>
          </section>
        </div>

        {/* Top Active Projects Table */}
        <section className="card-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Top Active Product Engineering Projects</h3>
            <span className="text-xs text-muted-foreground">Live project telemetry</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-2.5 pt-1">Project ID</th>
                  <th className="pb-2.5 pt-1">Project Name</th>
                  <th className="pb-2.5 pt-1">Current Stage</th>
                  <th className="pb-2.5 pt-1">Engineering Lead</th>
                  <th className="pb-2.5 pt-1">Progress</th>
                  <th className="pb-2.5 pt-1 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {topProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-bold text-foreground">{p.id}</td>
                    <td className="py-2.5 text-foreground">{p.name}</td>
                    <td className="py-2.5 text-muted-foreground">{p.stage}</td>
                    <td className="py-2.5 text-muted-foreground">{p.owner}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 w-32">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold tabular">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold",
                        p.status === "On Track" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        p.status === "Release Gate" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"
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
