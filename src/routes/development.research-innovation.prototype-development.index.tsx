import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Cpu, CheckCircle2, Gauge, Rocket } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  PrototypeDevPageTabBar,
  PROTOTYPE_STATUS_LABEL,
} from "@/components/erp/PrototypeDevTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { prototypeDevService } from "@/services";
import type { PrototypeListRow, PrototypeStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/prototype-development/")({
  head: () => ({ meta: [{ title: "Prototype Development · Magnertia ERP" }] }),
  component: PrototypeRegisterPage,
});

const FILTERS: { key: PrototypeStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "engineering_design", label: "Engineering Design" },
  { key: "prototype_manufacturing", label: "Manufacturing" },
  { key: "testing_validation", label: "Testing" },
  { key: "engineering_review", label: "Engineering Review" },
  { key: "approved", label: "Approved" },
  { key: "approved_with_conditions", label: "Conditional" },
  { key: "revision_required", label: "Revision Required" },
  { key: "rejected", label: "Rejected" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PrototypeRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PrototypeStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["prototype-development", "list"],
    queryFn: () => prototypeDevService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const scored = rows.filter((r) => r.overallPrototypeScore > 0);
    return {
      total: rows.length,
      inProgress: rows.filter((r) =>
        [
          "engineering_design",
          "prototype_manufacturing",
          "testing_validation",
          "engineering_review",
        ].includes(r.status),
      ).length,
      approved: rows.filter((r) => ["approved", "approved_with_conditions"].includes(r.status))
        .length,
      avgScore: scored.length
        ? Math.round(scored.reduce((s, r) => s + r.overallPrototypeScore, 0) / scored.length)
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/prototype-development/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Prototype
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Prototype Development"
      breadcrumb="Research & Innovation Development"
      description="The engineering-realization stage — turn a validated PoC into a manufacturable prototype."
      tabs={<PrototypeDevPageTabBar />}
      topbarActions={newButton}
    >
      {listQuery.isLoading ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Prototypes"
              value={kpis.total.toString()}
              neutralText="All statuses"
              icon={<Cpu className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="In Progress"
              value={kpis.inProgress.toString()}
              neutralText="Design → review stages"
              icon={<Gauge className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Approved"
              value={kpis.approved.toString()}
              neutralText="Advancing to validation"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Avg Prototype Score"
              value={`${kpis.avgScore}/100`}
              neutralText="AI-calculated"
              icon={<Rocket className="h-5 w-5" />}
              iconBg="bg-[#F59E0B]/10"
              iconColor="text-[#F59E0B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const count =
                f.key === "all" ? rows.length : rows.filter((r) => r.status === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    filter === f.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-white text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {f.label} <span className="tabular opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={rows.length === 0 ? "No prototypes yet" : "No prototypes match this filter"}
              description={
                rows.length === 0
                  ? "Create a prototype from an approved PoC to engineer, manufacture and validate it."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<PrototypeListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/prototype-development/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "prototype",
                  header: "Prototype",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.prototypeName || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.prototypeId} · v{r.prototypeVersion}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={PROTOTYPE_STATUS_LABEL[r.status]} />,
                },
                {
                  key: "owner",
                  header: "Owner",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.prototypeOwner || "—"}</span>
                  ),
                },
                {
                  key: "poc",
                  header: "Linked PoC",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.linkedPocCode ?? "—"}</span>
                  ),
                },
                {
                  key: "progress",
                  header: "Progress",
                  align: "center",
                  cell: (r) => (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${r.progressPercentage}%` }}
                        />
                      </div>
                      <span className="tabular text-xs font-semibold text-foreground">
                        {r.progressPercentage}%
                      </span>
                    </div>
                  ),
                },
                {
                  key: "score",
                  header: "Score",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.overallPrototypeScore || "—"}
                    </span>
                  ),
                },
                {
                  key: "updated",
                  header: "Updated",
                  align: "right",
                  cell: (r) => (
                    <span className="text-muted-foreground">{fmtDate(r.updatedAt)}</span>
                  ),
                },
              ]}
              mobileCard={(r) => (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{r.prototypeName || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.prototypeId} · {r.progressPercentage}% · Score{" "}
                      {r.overallPrototypeScore || "—"}
                    </div>
                  </div>
                  <StatusBadge status={PROTOTYPE_STATUS_LABEL[r.status]} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
