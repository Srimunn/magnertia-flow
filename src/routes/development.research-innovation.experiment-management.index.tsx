import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, TestTubes, CheckCircle2, Gauge, Rocket } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import {
  ExperimentMgmtPageTabBar,
  EXPERIMENT_STATUS_LABEL,
} from "@/components/erp/ExperimentMgmtTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { experimentMgmtService } from "@/services";
import type { ExperimentListRow, ExperimentStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/experiment-management/")({
  head: () => ({ meta: [{ title: "Experiment Management · Magnertia ERP" }] }),
  component: ExperimentRegisterPage,
});

const FILTERS: { key: ExperimentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "experiment_planning", label: "Planning" },
  { key: "laboratory_preparation", label: "Lab Prep" },
  { key: "experiment_execution", label: "Execution" },
  { key: "validation", label: "Validation" },
  { key: "technical_review", label: "Technical Review" },
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

function ExperimentRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ExperimentStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["experiment-management", "list"],
    queryFn: () => experimentMgmtService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const scored = rows.filter((r) => r.overallExperimentScore > 0);
    return {
      total: rows.length,
      running: rows.filter((r) =>
        [
          "experiment_planning",
          "laboratory_preparation",
          "experiment_execution",
          "validation",
          "technical_review",
        ].includes(r.status),
      ).length,
      approved: rows.filter((r) => ["approved", "approved_with_conditions"].includes(r.status))
        .length,
      avgScore: scored.length
        ? Math.round(scored.reduce((s, r) => s + r.overallExperimentScore, 0) / scored.length)
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/experiment-management/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Experiment
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Experiment Management"
      breadcrumb="Research & Innovation Development"
      description="Design, run, and validate structured experiments."
      tabs={<InnovationAreaTabs sub={<ExperimentMgmtPageTabBar />} />}
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
          <WidgetPage pageId="ri-experiments" skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />))}</div>} />

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
              title={rows.length === 0 ? "No experiments yet" : "No experiments match this filter"}
              description={
                rows.length === 0
                  ? "Create an experiment from an approved Prototype to generate the technical evidence for validation."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<ExperimentListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/experiment-management/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "experiment",
                  header: "Experiment",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.experimentTitle || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.experimentId} · {r.experimentCategory || "—"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={EXPERIMENT_STATUS_LABEL[r.status]} />,
                },
                {
                  key: "pi",
                  header: "Principal Investigator",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.principalInvestigator || "—"}</span>
                  ),
                },
                {
                  key: "proto",
                  header: "Linked Prototype",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.linkedPrototypeCode ?? "—"}</span>
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
                      {r.overallExperimentScore || "—"}
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
                    <div className="truncate font-semibold">{r.experimentTitle || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.experimentId} · {r.progressPercentage}% · Score{" "}
                      {r.overallExperimentScore || "—"}
                    </div>
                  </div>
                  <StatusBadge status={EXPERIMENT_STATUS_LABEL[r.status]} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
