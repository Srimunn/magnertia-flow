import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Microscope, CheckCircle2, Activity, Gauge } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import { ResearchMgmtPageTabBar, RESEARCH_STATUS_LABEL } from "@/components/erp/ResearchMgmtTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { researchManagementService } from "@/services";
import type { ResearchListRow, ResearchStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/research-management/")({
  head: () => ({ meta: [{ title: "Research Management · Magnertia ERP" }] }),
  component: ResearchRegisterPage,
});

const FILTERS: { key: ResearchStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "planning", label: "Planning" },
  { key: "resource_planning", label: "Resource Planning" },
  { key: "in_progress", label: "In Progress" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "approved_with_conditions", label: "Approved w/ Conditions" },
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

function ResearchRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ResearchStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["research-management", "list"],
    queryFn: () => researchManagementService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const scored = rows.filter((r) => r.researchImpactScore > 0);
    return {
      total: rows.length,
      active: rows.filter((r) =>
        ["planning", "resource_planning", "in_progress", "under_review"].includes(r.status),
      ).length,
      approved: rows.filter((r) => ["approved", "approved_with_conditions"].includes(r.status))
        .length,
      avgImpact: scored.length
        ? Math.round((scored.reduce((s, r) => s + r.researchImpactScore, 0) / scored.length) * 10) /
          10
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/research-management/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Research Project
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Research Management"
      breadcrumb="Research & Innovation Development"
      description="Plan, execute, and review applied research projects."
      tabs={<InnovationAreaTabs sub={<ResearchMgmtPageTabBar />} />}
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
          <WidgetPage pageId="ri-research" skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />))}</div>} />

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
                rows.length === 0 ? "No research projects yet" : "No projects match this filter"
              }
              description={
                rows.length === 0
                  ? "Create a research project to plan, execute and review R&D through to feasibility."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<ResearchListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/research-management/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "research",
                  header: "Research Project",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.researchTitle || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.researchId} · {r.researchCategory || "—"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={RESEARCH_STATUS_LABEL[r.status]} />,
                },
                {
                  key: "pi",
                  header: "Principal Investigator",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.principalInvestigator || "—"}</span>
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
                  key: "trl",
                  header: "TRL",
                  align: "center",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.trlNumber ? r.trlNumber : "—"}</span>
                  ),
                },
                {
                  key: "impact",
                  header: "Impact",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.researchImpactScore ? `${r.researchImpactScore}` : "—"}
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
                    <div className="truncate font-semibold">{r.researchTitle || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.researchId} · {r.progressPercentage}% · Impact{" "}
                      {r.researchImpactScore || "—"}
                    </div>
                  </div>
                  <StatusBadge status={RESEARCH_STATUS_LABEL[r.status]} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
