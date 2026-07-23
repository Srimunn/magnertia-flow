import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Briefcase, Gauge, Wallet, Layers } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PortfolioPageTabBar, PORTFOLIO_STATUS_LABEL } from "@/components/erp/PortfolioTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { innovationPortfolioService } from "@/services";
import type { PortfolioListRow, PortfolioStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/innovation-portfolio/")({
  head: () => ({ meta: [{ title: "Innovation Portfolio · Magnertia ERP" }] }),
  component: PortfolioRegisterPage,
});

const FILTERS: { key: PortfolioStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "under_review", label: "Under Review" },
  { key: "active", label: "Active" },
  { key: "revision_required", label: "Revision Required" },
  { key: "budget_review", label: "Budget Review" },
  { key: "rejected", label: "Rejected" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PortfolioRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PortfolioStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["innovation-portfolio", "list"],
    queryFn: () => innovationPortfolioService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const active = rows.filter((r) => r.status === "active").length;
    const scored = rows.filter((r) => r.overallScore > 0);
    return {
      total: rows.length,
      active,
      totalProjects: rows.reduce((s, r) => s + r.totalProjects, 0),
      avgScore: scored.length
        ? Math.round(scored.reduce((s, r) => s + r.overallScore, 0) / scored.length)
        : 0,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/research-innovation/innovation-portfolio/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Portfolio
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Innovation Portfolio"
      breadcrumb="Research & Innovation Development"
      description="Executive oversight across the entire innovation pipeline."
      tabs={<PortfolioPageTabBar />}
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
              label="Total Portfolios"
              value={kpis.total.toString()}
              neutralText="All statuses"
              icon={<Briefcase className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Active Portfolios"
              value={kpis.active.toString()}
              neutralText="Approved & running"
              icon={<Gauge className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Rolled-up Projects"
              value={kpis.totalProjects.toString()}
              neutralText="Across all portfolios"
              icon={<Layers className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Average Health Score"
              value={`${kpis.avgScore}/100`}
              neutralText="AI-calculated"
              icon={<Wallet className="h-5 w-5" />}
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
              title={rows.length === 0 ? "No portfolios yet" : "No portfolios match this filter"}
              description={
                rows.length === 0
                  ? "Create a portfolio to roll up ideas, opportunities and validated projects into an executive view."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<PortfolioListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/research-innovation/innovation-portfolio/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "portfolio",
                  header: "Portfolio",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.portfolioName || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.portfolioId} · {r.portfolioCode}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => (
                    <StatusBadge status={PORTFOLIO_STATUS_LABEL[r.status] ?? r.status} />
                  ),
                },
                {
                  key: "manager",
                  header: "Manager",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.portfolioManager || "—"}</span>
                  ),
                },
                {
                  key: "fy",
                  header: "FY",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.financialYear || "—"}</span>
                  ),
                },
                {
                  key: "projects",
                  header: "Projects",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-semibold text-foreground">{r.totalProjects}</span>
                  ),
                },
                {
                  key: "score",
                  header: "Health Score",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.overallScore || "—"}
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
                    <div className="truncate font-semibold">{r.portfolioName || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.portfolioId} · {r.totalProjects} projects
                    </div>
                  </div>
                  <StatusBadge status={PORTFOLIO_STATUS_LABEL[r.status] ?? r.status} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
