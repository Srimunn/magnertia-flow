import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Compass, CheckCircle2, Gauge, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { OpportunityTabBar, OPPORTUNITY_STATUS_LABEL } from "@/components/erp/OpportunityTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { opportunityDiscoveryService } from "@/services";
import type { OpportunityListRow, OpportunityStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/opportunity-discovery/")({
  head: () => ({ meta: [{ title: "Opportunity Discovery · Magnertia ERP" }] }),
  component: OpportunityRegisterPage,
});

const FILTERS: { key: OpportunityStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "under_review", label: "Under Review" },
  { key: "revision_required", label: "Revision Required" },
  { key: "approved", label: "Approved" },
  { key: "on_hold", label: "On Hold" },
  { key: "rejected", label: "Rejected" },
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
      {score || "—"}
    </span>
  );
}

function OpportunityRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OpportunityStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["opportunities", "list"],
    queryFn: () => opportunityDiscoveryService.fetchOpportunities(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const approved = rows.filter((r) => r.status === "approved").length;
    const decided = rows.filter((r) => ["approved", "rejected"].includes(r.status)).length;
    const scored = rows.filter((r) => r.overallScore > 0);
    return {
      total: rows.length,
      approvalRate: decided ? Math.round((approved / decided) * 100) : 0,
      avgScore: scored.length
        ? Math.round(scored.reduce((s, r) => s + r.overallScore, 0) / scored.length)
        : 0,
      revenue: rows.reduce((s, r) => s + (r.revenueOpportunity || 0), 0),
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/opportunity-discovery/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Opportunity
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Opportunity Discovery"
      breadcrumb="Research & Innovation Development"
      description="Qualify validated ideas into business and technology opportunities."
      tabs={<OpportunityTabBar />}
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
              label="Total Opportunities"
              value={kpis.total.toString()}
              neutralText="All stages"
              icon={<Compass className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Approval Rate"
              value={`${kpis.approvalRate}%`}
              neutralText="Of decided opportunities"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Average Opportunity Score"
              value={`${kpis.avgScore}/100`}
              neutralText="Calculated from fields"
              icon={<Gauge className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Revenue Opportunity"
              value={formatCurrency(kpis.revenue, true)}
              neutralText="Sum across register"
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-[#F59E0B]/10"
              iconColor="text-[#F59E0B]"
            />
          </div>

          {/* Status filters */}
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
                rows.length === 0 ? "No opportunities yet" : "No opportunities match this filter"
              }
              description={
                rows.length === 0
                  ? "Create the first opportunity from a validated idea to start the discovery pipeline."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<OpportunityListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/opportunity-discovery/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "opportunity",
                  header: "Opportunity",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.name || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.opportunityCode}
                        {r.linkedIdeaCode ? ` · from ${r.linkedIdeaCode}` : ""}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => (
                    <div className="space-y-1">
                      <StatusBadge status={OPPORTUNITY_STATUS_LABEL[r.status] ?? r.status} />
                      {r.reviewStage && (
                        <span className="block text-[10px] text-muted-foreground">
                          {r.reviewStage}
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: "category",
                  header: "Category",
                  cell: (r) => <span className="text-muted-foreground">{r.category || "—"}</span>,
                },
                {
                  key: "score",
                  header: "Score",
                  align: "center",
                  cell: (r) => <ScorePill score={r.overallScore} />,
                },
                {
                  key: "rank",
                  header: "Rank",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular text-muted-foreground">
                      {r.opportunityRank ? `#${r.opportunityRank}` : "—"}
                    </span>
                  ),
                },
                {
                  key: "revenue",
                  header: "Revenue",
                  align: "right",
                  cell: (r) => (
                    <span className="tabular text-foreground">
                      {formatCurrency(r.revenueOpportunity, true)}
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
                    <div className="truncate font-semibold">{r.name || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.opportunityCode} · {fmtDate(r.updatedAt)}
                    </div>
                  </div>
                  <StatusBadge status={OPPORTUNITY_STATUS_LABEL[r.status] ?? r.status} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
