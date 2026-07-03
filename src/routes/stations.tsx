import { createFileRoute } from "@tanstack/react-router";
import { Zap, Activity, Wifi, WifiOff, Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { KpiCard } from "@/components/erp/KpiCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { stations, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/stations")({
  head: () => ({ meta: [{ title: "Stations · Magnertia ERP" }] }),
  component: StationsPage,
});

function StationsPage() {
  const online = stations.filter((s) => s.status === "Online").length;
  const offline = stations.filter((s) => s.status === "Offline").length;
  const avgUptime = (stations.reduce((s, x) => s + x.uptime, 0) / stations.length).toFixed(1);
  const totalToday = stations.reduce((s, x) => s + x.todayRevenue, 0);

  return (
    <AppShell>
      <PageHeader
        title="Charging Stations"
        description="Live status and performance across the Magnertia network."
        actions={
          <ErpButton size="md">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Station</span>
          </ErpButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Stations"
          value={stations.length.toString()}
          icon={Zap}
          hint={`${stations.reduce((s, x) => s + x.chargers, 0)} chargers`}
        />
        <KpiCard label="Online" value={online.toString()} icon={Wifi} tone="success" />
        <KpiCard label="Offline" value={offline.toString()} icon={WifiOff} tone="danger" />
        <KpiCard
          label="Avg Uptime"
          value={`${avgUptime}%`}
          icon={Activity}
          hint={`${formatCurrency(totalToday, true)} today`}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stations.map((s) => (
          <div
            key={s.id}
            className="card-soft p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display text-base font-semibold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.city} · {s.id}
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-secondary/50 p-2.5">
                <div className="font-display text-lg font-bold text-foreground">{s.chargers}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Chargers
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2.5">
                <div className="font-display text-lg font-bold text-foreground">{s.uptime}%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Uptime
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2.5">
                <div className="font-display text-lg font-bold text-foreground">
                  {formatCurrency(s.todayRevenue, true)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Today
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted-foreground">Utilization</span>
                <span className="font-semibold text-foreground">
                  {Math.min(100, Math.round(s.uptime))}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${s.status === "Offline" ? "bg-destructive" : s.status === "Degraded" ? "bg-warning" : "bg-gradient-to-r from-primary to-accent"}`}
                  style={{ width: `${Math.max(2, s.uptime)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
