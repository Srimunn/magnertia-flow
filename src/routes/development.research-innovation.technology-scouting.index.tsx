import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Radar, CheckCircle2, Eye, Gauge } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import {
  TechScoutingPageTabBar,
  TECH_SCOUTING_STATUS_LABEL,
} from "@/components/erp/TechScoutingTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { technologyScoutingService } from "@/services";
import type { TechScoutingListRow, TechScoutingStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/technology-scouting/")({
  head: () => ({ meta: [{ title: "Technology Scouting · Magnertia ERP" }] }),
  component: TechScoutingRegisterPage,
});

const FILTERS: { key: TechScoutingStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "identified", label: "Identified" },
  { key: "under_evaluation", label: "Under Evaluation" },
  { key: "technical_review", label: "Technical Review" },
  { key: "business_review", label: "Business Review" },
  { key: "ip_review", label: "IP Review" },
  { key: "executive_review", label: "Executive Review" },
  { key: "approved", label: "Approved" },
  { key: "monitoring", label: "Monitoring" },
  { key: "rejected", label: "Rejected" },
  { key: "closed", label: "Closed" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TechScoutingRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TechScoutingStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["technology-scouting", "list"],
    queryFn: () => technologyScoutingService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const scored = rows.filter((r) => r.overallTechnologyScore > 0);
    return {
      total: rows.length,
      approved: rows.filter((r) => r.status === "approved").length,
      watchlist: rows.filter((r) => r.status === "monitoring").length,
      avgScore: scored.length
        ? Math.round(scored.reduce((s, r) => s + r.overallTechnologyScore, 0) / scored.length)
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/technology-scouting/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Technology Scouting
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Technology Scouting"
      breadcrumb="Research & Innovation Development"
      description="Scout, assess, and track emerging technologies."
      tabs={<InnovationAreaTabs sub={<TechScoutingPageTabBar />} />}
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
          <WidgetPage pageId="ri-scouting" skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />))}</div>} />

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
                rows.length === 0 ? "No technologies scouted yet" : "No records match this filter"
              }
              description={
                rows.length === 0
                  ? "Register an emerging technology to start the identification, assessment and review workflow."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<TechScoutingListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/technology-scouting/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "technology",
                  header: "Technology",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.technologyName || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.scoutingId} · {r.technologyCategory || "—"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={TECH_SCOUTING_STATUS_LABEL[r.status]} />,
                },
                {
                  key: "scout",
                  header: "Scout",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.technologyScout || "—"}</span>
                  ),
                },
                {
                  key: "trl",
                  header: "TRL",
                  cell: (r) => (
                    <span className="text-muted-foreground">
                      {r.trl ? r.trl.split(" - ")[0] : "—"}
                    </span>
                  ),
                },
                {
                  key: "score",
                  header: "Score",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.overallTechnologyScore || "—"}
                    </span>
                  ),
                },
                {
                  key: "rank",
                  header: "Priority",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-semibold text-foreground">
                      {r.priorityRanking ? `#${r.priorityRanking}` : "—"}
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
                    <div className="truncate font-semibold">{r.technologyName || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.scoutingId} · Score {r.overallTechnologyScore || "—"}
                    </div>
                  </div>
                  <StatusBadge status={TECH_SCOUTING_STATUS_LABEL[r.status]} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
