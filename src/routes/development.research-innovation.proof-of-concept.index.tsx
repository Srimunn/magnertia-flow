import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Beaker, CheckCircle2, Gauge, Rocket } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PocPageTabBar, POC_STATUS_LABEL } from "@/components/erp/PocTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { pocService } from "@/services";
import type { PocListRow, PocStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/proof-of-concept/")({
  head: () => ({ meta: [{ title: "Proof of Concept · Magnertia ERP" }] }),
  component: PocRegisterPage,
});

const FILTERS: { key: PocStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "technical_implementation", label: "Technical Impl." },
  { key: "build_integration", label: "Build & Integration" },
  { key: "experimental_testing", label: "Testing" },
  { key: "commercial_assessment", label: "Commercial" },
  { key: "final_review", label: "Final Review" },
  { key: "approved", label: "Approved" },
  { key: "conditional_approval", label: "Conditional" },
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

function PocRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PocStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["proof-of-concept", "list"],
    queryFn: () => pocService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const scored = rows.filter((r) => r.overallPocScore > 0);
    return {
      total: rows.length,
      inProgress: rows.filter((r) =>
        [
          "technical_implementation",
          "build_integration",
          "experimental_testing",
          "commercial_assessment",
          "final_review",
        ].includes(r.status),
      ).length,
      approved: rows.filter((r) => ["approved", "conditional_approval"].includes(r.status)).length,
      avgScore: scored.length
        ? Math.round(scored.reduce((s, r) => s + r.overallPocScore, 0) / scored.length)
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/proof-of-concept/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New PoC Project
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Proof of Concept (PoC)"
      breadcrumb="Research & Innovation Development"
      description="The technical-validation gateway — experimentally verify a concept before prototype development."
      tabs={<PocPageTabBar />}
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
              label="PoC Projects"
              value={kpis.total.toString()}
              neutralText="All statuses"
              icon={<Beaker className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="In Progress"
              value={kpis.inProgress.toString()}
              neutralText="Build & test stages"
              icon={<Gauge className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Approved"
              value={kpis.approved.toString()}
              neutralText="Advancing to prototype"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Avg PoC Score"
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
              title={rows.length === 0 ? "No PoC projects yet" : "No projects match this filter"}
              description={
                rows.length === 0
                  ? "Create a PoC project from an approved Feasibility Study to technically validate the concept."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<PocListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/proof-of-concept/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "poc",
                  header: "PoC Project",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.pocTitle || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.pocId} · {r.formCode}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={POC_STATUS_LABEL[r.status]} />,
                },
                {
                  key: "pm",
                  header: "Project Manager",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.projectManager || "—"}</span>
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
                  key: "success",
                  header: "AI Success",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-semibold text-foreground">
                      {r.aiSuccessProbability ? `${r.aiSuccessProbability}%` : "—"}
                    </span>
                  ),
                },
                {
                  key: "score",
                  header: "PoC Score",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.overallPocScore || "—"}
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
                    <div className="truncate font-semibold">{r.pocTitle || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.pocId} · {r.progressPercentage}% · Score {r.overallPocScore || "—"}
                    </div>
                  </div>
                  <StatusBadge status={POC_STATUS_LABEL[r.status]} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
