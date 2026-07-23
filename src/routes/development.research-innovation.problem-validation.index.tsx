import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, ShieldCheck, CheckCircle2, Gauge, Layers } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  ProblemValidationTabBar,
  PV_STATUS_LABEL,
  PV_STAGE_LABEL,
} from "@/components/erp/ProblemValidationTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { problemValidationService } from "@/services";
import type { ProblemValidationListRow, ProblemValidationStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/problem-validation/")({
  head: () => ({ meta: [{ title: "Problem Validation · Magnertia ERP" }] }),
  component: ProblemValidationRegisterPage,
});

const FILTERS: { key: ProblemValidationStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "under_review", label: "Under Review" },
  { key: "more_research_required", label: "More Research" },
  { key: "revision_required", label: "Revision Required" },
  { key: "validated", label: "Validated" },
  { key: "validation_failed", label: "Failed" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 70
      ? "bg-success/10 text-success"
      : score >= 45
        ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular ${tone}`}
    >
      {score ? `${score}` : "—"}
    </span>
  );
}

function ProblemValidationRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProblemValidationStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["problem-validation", "list"],
    queryFn: () => problemValidationService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const validated = rows.filter((r) => r.status === "validated").length;
    const decided = rows.filter((r) =>
      ["validated", "validation_failed"].includes(r.status),
    ).length;
    const scored = rows.filter((r) => r.overallValidationScore > 0);
    return {
      total: rows.length,
      inProgress: rows.filter((r) => r.status === "in_progress").length,
      validationRate: decided ? Math.round((validated / decided) * 100) : 0,
      avgScore: scored.length
        ? Math.round(scored.reduce((s, r) => s + r.overallValidationScore, 0) / scored.length)
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/problem-validation/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Problem Validation
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Problem Validation"
      breadcrumb="Research & Innovation Development"
      description="Verify problems are real, significant and worth solving before feasibility."
      tabs={<ProblemValidationTabBar />}
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
              label="Total Records"
              value={kpis.total.toString()}
              neutralText="All stages"
              icon={<ShieldCheck className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="In Progress"
              value={kpis.inProgress.toString()}
              neutralText="Actively validating"
              icon={<Layers className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Validation Rate"
              value={`${kpis.validationRate}%`}
              neutralText="Of decided records"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Average Score"
              value={`${kpis.avgScore}/100`}
              neutralText="Calculated from stages"
              icon={<Gauge className="h-5 w-5" />}
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
              title={
                rows.length === 0
                  ? "No problem validation records yet"
                  : "No records match this filter"
              }
              description={
                rows.length === 0
                  ? "Start a validation from a completed Design Thinking project."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<ProblemValidationListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/problem-validation/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "problem",
                  header: "Problem",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.problemTitle || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.formCode}
                        {r.linkedDesignThinkingCode ? ` · from ${r.linkedDesignThinkingCode}` : ""}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={PV_STATUS_LABEL[r.status] ?? r.status} />,
                },
                {
                  key: "stage",
                  header: "Stage",
                  cell: (r) => (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {PV_STAGE_LABEL[r.currentStage] ?? r.currentStage}
                    </span>
                  ),
                },
                {
                  key: "score",
                  header: "Score",
                  align: "center",
                  cell: (r) => <ScorePill score={r.overallValidationScore} />,
                },
                {
                  key: "rank",
                  header: "Rank",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular text-muted-foreground">
                      {r.validationRank ? `#${r.validationRank}` : "—"}
                    </span>
                  ),
                },
                {
                  key: "lead",
                  header: "Lead",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.validationLead || "—"}</span>
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
                    <div className="truncate font-semibold">{r.problemTitle || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.formCode} · {PV_STAGE_LABEL[r.currentStage]}
                    </div>
                  </div>
                  <StatusBadge status={PV_STATUS_LABEL[r.status] ?? r.status} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
