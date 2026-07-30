import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Repeat, Activity, CheckCircle2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import {
  ContinuousInnovationPageTabBar,
  CI_STATUS_LABEL,
} from "@/components/erp/ContinuousInnovationTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { continuousInnovationService } from "@/services";
import type { CIListRow, CIStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/continuous-innovation/")({
  head: () => ({ meta: [{ title: "Continuous Innovation · Magnertia ERP" }] }),
  component: CIRegisterPage,
});

const FILTERS: { key: CIStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "opportunity_identification", label: "Opportunity ID" },
  { key: "innovation_planning", label: "Planning" },
  { key: "implementation_monitoring", label: "Implementation" },
  { key: "executive_review", label: "Executive Review" },
  { key: "approved", label: "Approved" },
  { key: "approved_with_improvements", label: "Approved w/ Improvements" },
  { key: "revision_required", label: "Revision Required" },
  { key: "rejected", label: "Rejected" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtPeriod(s: string, e: string) {
  const f = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—";
  return `${f(s)} – ${f(e)}`;
}

function CIRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CIStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["continuous-innovation", "list"],
    queryFn: () => continuousInnovationService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const active = rows.filter((r) =>
      [
        "opportunity_identification",
        "innovation_planning",
        "implementation_monitoring",
        "executive_review",
      ].includes(r.status),
    );
    const approved = rows.filter((r) => ["approved", "approved_with_improvements"].includes(r.status));
    const scored = rows.filter((r) => r.overallInnovationScore > 0);
    const avgScore = scored.length
      ? Math.round(scored.reduce((s, r) => s + r.overallInnovationScore, 0) / scored.length)
      : 0;
    return { total: rows.length, active: active.length, approved: approved.length, avgScore };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/continuous-innovation/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Innovation Cycle
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Continuous Innovation"
      breadcrumb="Development · Research & Innovation"
      description="Drive continuous, period-over-period product improvement."
      tabs={<InnovationAreaTabs sub={<ContinuousInnovationPageTabBar />} />}
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
          <WidgetPage pageId="ri-innovation" skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />))}</div>} />

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
              title={rows.length === 0 ? "No innovation cycles yet" : "No cycles match this filter"}
              description={
                rows.length === 0
                  ? "Open a cycle on a launched product to roll up its feedback and performance, run the four stages, and produce the next release."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<CIListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/continuous-innovation/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "cycle",
                  header: "Innovation Cycle",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.innovationInitiative || "Untitled cycle"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.cycleId} · Cycle #{r.cycleNumber}
                        {r.linkedProductName ? ` · ${r.linkedProductName}` : ""}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={CI_STATUS_LABEL[r.status]} />,
                },
                {
                  key: "period",
                  header: "Review Period",
                  cell: (r) => (
                    <span className="text-muted-foreground">
                      {fmtPeriod(r.reviewPeriodStart, r.reviewPeriodEnd)}
                    </span>
                  ),
                },
                {
                  key: "manager",
                  header: "Innovation Manager",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.innovationManager || "—"}</span>
                  ),
                },
                {
                  key: "health",
                  header: "Health",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-semibold text-foreground">
                      {r.innovationHealthScore ? `${r.innovationHealthScore}%` : "—"}
                    </span>
                  ),
                },
                {
                  key: "score",
                  header: "Overall",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.overallInnovationScore || "—"}
                    </span>
                  ),
                },
                {
                  key: "updated",
                  header: "Updated",
                  align: "right",
                  cell: (r) => <span className="text-muted-foreground">{fmtDate(r.updatedAt)}</span>,
                },
              ]}
              mobileCard={(r) => (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">
                      {r.innovationInitiative || "Untitled cycle"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.cycleId} · Cycle #{r.cycleNumber}
                    </div>
                  </div>
                  <StatusBadge status={CI_STATUS_LABEL[r.status]} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
