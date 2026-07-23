import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, ClipboardCheck, CheckCircle2, Gauge, Rocket } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  FeasibilityStudyPageTabBar,
  FEASIBILITY_STATUS_LABEL,
} from "@/components/erp/FeasibilityStudyTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { feasibilityStudyService } from "@/services";
import type { FeasibilityListRow, FeasibilityStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/feasibility-study/")({
  head: () => ({ meta: [{ title: "Feasibility Study · Magnertia ERP" }] }),
  component: FeasibilityRegisterPage,
});

const FILTERS: { key: FeasibilityStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "technical_feasibility", label: "Technical" },
  { key: "market_feasibility", label: "Market" },
  { key: "financial_feasibility", label: "Financial" },
  { key: "operational_feasibility", label: "Operational" },
  { key: "compliance_risk", label: "Compliance & Risk" },
  { key: "under_review", label: "Under Review" },
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

function FeasibilityRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FeasibilityStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["feasibility-study", "list"],
    queryFn: () => feasibilityStudyService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const scored = rows.filter((r) => r.overallFeasibilityScore > 0);
    return {
      total: rows.length,
      inReview: rows.filter((r) =>
        [
          "technical_feasibility",
          "market_feasibility",
          "financial_feasibility",
          "operational_feasibility",
          "compliance_risk",
          "under_review",
        ].includes(r.status),
      ).length,
      approved: rows.filter((r) => ["approved", "conditional_approval"].includes(r.status)).length,
      avgScore: scored.length
        ? Math.round(scored.reduce((s, r) => s + r.overallFeasibilityScore, 0) / scored.length)
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/feasibility-study/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Feasibility Study
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Feasibility Study"
      breadcrumb="Research & Innovation Development"
      description="The investment-decision gate — technical, market, financial, operational, legal and AI assessment."
      tabs={<FeasibilityStudyPageTabBar />}
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
              label="Feasibility Studies"
              value={kpis.total.toString()}
              neutralText="All statuses"
              icon={<ClipboardCheck className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="In Assessment"
              value={kpis.inReview.toString()}
              neutralText="Stages & review"
              icon={<Gauge className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Approved"
              value={kpis.approved.toString()}
              neutralText="Advancing to PoC"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Avg Feasibility Score"
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
              title={
                rows.length === 0 ? "No feasibility studies yet" : "No studies match this filter"
              }
              description={
                rows.length === 0
                  ? "Create a feasibility study from a validated Problem to evaluate investment readiness."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<FeasibilityListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/feasibility-study/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "study",
                  header: "Study",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.studyTitle || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.feasibilityId} · {r.formCode}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={FEASIBILITY_STATUS_LABEL[r.status]} />,
                },
                {
                  key: "pm",
                  header: "Project Manager",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.projectManager || "—"}</span>
                  ),
                },
                {
                  key: "source",
                  header: "Validated Problem",
                  cell: (r) => (
                    <span className="text-muted-foreground">
                      {r.linkedProblemValidationCode ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "priority",
                  header: "Priority",
                  align: "center",
                  cell: (r) => (
                    <span className="text-xs font-semibold text-foreground">
                      {r.investmentPriority}
                    </span>
                  ),
                },
                {
                  key: "score",
                  header: "Feasibility",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.overallFeasibilityScore || "—"}
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
                    <div className="truncate font-semibold">{r.studyTitle || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.feasibilityId} · Score {r.overallFeasibilityScore || "—"}
                    </div>
                  </div>
                  <StatusBadge status={FEASIBILITY_STATUS_LABEL[r.status]} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
