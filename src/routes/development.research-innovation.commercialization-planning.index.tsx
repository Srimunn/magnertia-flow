import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Briefcase, CheckCircle2, TrendingUp, ArrowRight, DollarSign } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import {
  CommercializationPageTabBar,
  COMMERCIALIZATION_STATUS_LABEL,
} from "@/components/erp/CommercializationTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { commercializationService } from "@/services";
import type { CommercializationStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/commercialization-planning/")({
  head: () => ({ meta: [{ title: "Commercialization Planning · Magnertia ERP" }] }),
  component: CommercializationRegisterPage,
});

const FILTERS: { key: CommercializationStatus | "all"; label: string }[] = [
  { key: "all", label: "All Statuses" },
  { key: "draft", label: "Draft" },
  { key: "product_readiness", label: "Product Readiness" },
  { key: "manufacturing_supply_chain", label: "Mfg & Supply" },
  { key: "sales_marketing_planning", label: "Sales & Marketing" },
  { key: "executive_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "approved_with_conditions", label: "Conditional" },
  { key: "revision_required", label: "Revision" },
  { key: "rejected", label: "Rejected" },
];

function fmtDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TruncatedText({ text, max = 28 }: { text: string; max?: number }) {
  if (!text) return null;
  return (
    <span title={text}>
      {text.length > max ? `${text.slice(0, max)}...` : text}
    </span>
  );
}

function CommercializationRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CommercializationStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["commercialization-planning", "list"],
    queryFn: () => commercializationService.fetchList(),
  });

  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    return {
      total: rows.length,
      active: rows.filter((r) => !["approved", "rejected", "archived"].includes(r.status)).length,
      approved: rows.filter((r) => r.status === "approved" || r.status === "approved_with_conditions").length,
      avgReadiness: rows.length > 0 ? Math.round(rows.reduce((a, b) => a + b.overallLaunchReadiness, 0) / rows.length) : 81,
    };
  }, [rows]);

  return (
    <AppShell
      breadcrumb="Development > Research & Innovation Development > Commercialization Planning"
      title="Commercialization Planning"
      description="Plan go-to-market, financials, and launch readiness."
      topbarActions={
        <ErpButton
          variant="primary"
          onClick={() => (navigate as any)({ to: "/development/research-innovation/commercialization-planning/new" })}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Commercialization Plan
        </ErpButton>
      }
      tabs={<InnovationAreaTabs sub={<CommercializationPageTabBar />} />}
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <WidgetPage pageId="ri-commercialization" skeleton={<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />))}</div>} />

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  filter === f.key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            Showing {filtered.length} of {rows.length} records
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={[
            {
              key: "commercializationPlanId",
              header: "Plan ID",
              cell: (row: any) => (
                <Link
                  to={"/development/research-innovation/commercialization-planning/new" as any}
                  search={{ id: row.id } as any}
                  className="font-mono text-xs font-bold text-primary hover:underline"
                >
                  {row.commercializationPlanId}
                </Link>
              ),
            },
            {
              key: "commercializationProject",
              header: "Project & Product",
              cell: (row: any) => (
                <div className="max-w-[320px]">
                  <Link
                    to={"/development/research-innovation/commercialization-planning/new" as any}
                    search={{ id: row.id } as any}
                    className="font-semibold text-foreground hover:text-primary block truncate"
                    title={row.commercializationProject}
                  >
                    <TruncatedText text={row.commercializationProject} max={36} />
                  </Link>
                  <div className="text-[11px] text-muted-foreground truncate" title={row.productName}>
                    <TruncatedText text={row.productName} max={40} />
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (row: any) => (
                <StatusBadge status={COMMERCIALIZATION_STATUS_LABEL[row.status as CommercializationStatus] || row.status} />
              ),
            },
            {
              key: "overallLaunchReadiness",
              header: "Launch Readiness",
              cell: (row: any) => (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${row.overallLaunchReadiness}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {row.overallLaunchReadiness}/100
                  </span>
                </div>
              ),
            },
            {
              key: "roiPct",
              header: "Expected ROI",
              cell: (row: any) => (
                <span className="font-mono text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ring-1 ring-emerald-200">
                  {row.roiPct}%
                </span>
              ),
            },
            {
              key: "launchTargetDate",
              header: "Target Launch",
              cell: (row: any) => (
                <span className="font-mono text-xs text-foreground font-semibold">
                  {fmtDate(row.launchTargetDate)}
                </span>
              ),
            },
            {
              key: "updatedAt",
              header: "Updated",
              cell: (row: any) => (
                <span className="text-xs text-muted-foreground">{fmtDate(row.updatedAt)}</span>
              ),
            },
            {
              key: "action",
              header: "Action",
              cell: (row: any) => (
                <Link
                  to={"/development/research-innovation/commercialization-planning/new" as any}
                  search={{ id: row.id } as any}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Open Form
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ),
            },
          ]}
          data={filtered as any}
          mobileCard={(row: any) => (
            <div className="p-3 border-b space-y-1">
              <div className="font-bold text-primary">{row.commercializationPlanId}</div>
              <div className="font-medium text-foreground">{row.commercializationProject}</div>
              <div className="text-xs text-muted-foreground">Readiness: {row.overallLaunchReadiness}/100 • ROI: {row.roiPct}%</div>
            </div>
          )}
          empty={
            <EmptyState
              title="No Commercialization Plans Found"
              description="Create a commercialization plan to take a validated innovation to market."
              action={
                <ErpButton
                  variant="primary"
                  onClick={() => (navigate as any)({ to: "/development/research-innovation/commercialization-planning/new" })}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Commercialization Plan
                </ErpButton>
              }
            />
          }
        />
      </div>
    </AppShell>
  );
}
