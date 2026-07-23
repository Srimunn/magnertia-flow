import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Palette, CheckCircle2, Gauge, Layers } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  DesignThinkingTabBar,
  DT_STATUS_LABEL,
  DT_STAGE_LABEL,
} from "@/components/erp/DesignThinkingTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { designThinkingService } from "@/services";
import type { DesignThinkingListRow, DesignThinkingStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/design-thinking/")({
  head: () => ({ meta: [{ title: "Design Thinking · Magnertia ERP" }] }),
  component: DesignThinkingRegisterPage,
});

const FILTERS: { key: DesignThinkingStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "under_review", label: "Under Review" },
  { key: "revision_required", label: "Revision Required" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DesignThinkingRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<DesignThinkingStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["design-thinking", "list"],
    queryFn: () => designThinkingService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const approved = rows.filter((r) => r.status === "approved").length;
    const decided = rows.filter((r) => ["approved", "rejected"].includes(r.status)).length;
    const scored = rows.filter((r) => r.overallDesignScore > 0);
    return {
      total: rows.length,
      inProgress: rows.filter((r) => r.status === "in_progress").length,
      approvalRate: decided ? Math.round((approved / decided) * 100) : 0,
      avgScore: scored.length
        ? Math.round((scored.reduce((s, r) => s + r.overallDesignScore, 0) / scored.length) * 10) /
          10
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/design-thinking/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Design Thinking
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Design Thinking"
      breadcrumb="Research & Innovation Development"
      description="Empathize, define, ideate, prototype and test approved opportunities."
      tabs={<DesignThinkingTabBar />}
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
              label="Total Projects"
              value={kpis.total.toString()}
              neutralText="All stages"
              icon={<Palette className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="In Progress"
              value={kpis.inProgress.toString()}
              neutralText="Actively running"
              icon={<Layers className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Approval Rate"
              value={`${kpis.approvalRate}%`}
              neutralText="Of decided projects"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Average Design Score"
              value={`${kpis.avgScore}/10`}
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
                  ? "No design thinking projects yet"
                  : "No projects match this filter"
              }
              description={
                rows.length === 0
                  ? "Start a project from an approved opportunity to begin the design thinking process."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<DesignThinkingListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/design-thinking/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "project",
                  header: "Project",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.projectName || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.formCode}
                        {r.linkedOpportunityCode ? ` · from ${r.linkedOpportunityCode}` : ""}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={DT_STATUS_LABEL[r.status] ?? r.status} />,
                },
                {
                  key: "stage",
                  header: "Stage",
                  cell: (r) => (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {DT_STAGE_LABEL[r.currentStage] ?? r.currentStage}
                    </span>
                  ),
                },
                {
                  key: "score",
                  header: "Design Score",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.overallDesignScore ? `${r.overallDesignScore}/10` : "—"}
                    </span>
                  ),
                },
                {
                  key: "facilitator",
                  header: "Facilitator",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.facilitator || "—"}</span>
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
                    <div className="truncate font-semibold">{r.projectName || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.formCode} · {DT_STAGE_LABEL[r.currentStage]}
                    </div>
                  </div>
                  <StatusBadge status={DT_STATUS_LABEL[r.status] ?? r.status} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
