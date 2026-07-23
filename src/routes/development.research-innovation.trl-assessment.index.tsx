import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Gauge, CheckCircle2, Award, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  TrlAssessmentPageTabBar,
  TRL_STATUS_LABEL,
} from "@/components/erp/TrlAssessmentTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { trlAssessmentService } from "@/services";
import type { TrlListRow, TrlStatus } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/trl-assessment/")({
  head: () => ({ meta: [{ title: "TRL Assessment · Magnertia ERP" }] }),
  component: TrlRegisterPage,
});

const FILTERS: { key: TrlStatus | "all"; label: string }[] = [
  { key: "all", label: "All Statuses" },
  { key: "draft", label: "Draft" },
  { key: "technology_assessment", label: "Assessment" },
  { key: "technical_validation", label: "Validation" },
  { key: "demonstration_review", label: "Demonstration" },
  { key: "executive_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "approved_with_improvements", label: "Conditional" },
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

function TrlRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TrlStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["trl-assessment", "list"],
    queryFn: () => trlAssessmentService.fetchList(),
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
      approved: rows.filter((r) => r.status === "approved" || r.status === "approved_with_improvements").length,
      avgScore: rows.length > 0 ? Math.round(rows.reduce((a, b) => a + b.finalTrlScore, 0) / rows.length) : 78,
    };
  }, [rows]);

  return (
    <AppShell
      breadcrumb="Development > Research & Innovation Development > Technology Readiness Level (TRL) Assessment"
      title="Technology Readiness Level (TRL) Assessment"
      topbarActions={
        <ErpButton
          variant="primary"
          onClick={() => navigate({ to: "/development/research-innovation/trl-assessment/new" })}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New TRL Assessment
        </ErpButton>
      }
    >
      <div className="-mx-4 -mt-4 mb-4 flex flex-col gap-0">
        <TrlAssessmentPageTabBar />
      </div>

      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Assessments"
            value={String(kpis.total)}
            neutralText="Active & completed records"
            icon={<Gauge className="h-5 w-5" />}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            label="Under Assessment"
            value={String(kpis.active)}
            neutralText="In progress & review stages"
            icon={<Gauge className="h-5 w-5" />}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-600"
          />
          <StatCard
            label="Approved TRLs"
            value={String(kpis.approved)}
            neutralText="Committed readiness levels"
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600"
          />
          <StatCard
            label="Avg Readiness Score"
            value={`${kpis.avgScore}/100`}
            neutralText="Composite TRL maturity score"
            icon={<Award className="h-5 w-5" />}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-600"
          />
        </div>

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
              key: "trlAssessmentId",
              header: "TRL ID",
              cell: (row: any) => (
                <Link
                  to="/development/research-innovation/trl-assessment/new"
                  search={{ id: row.id }}
                  className="font-mono text-xs font-bold text-primary hover:underline"
                >
                  {row.trlAssessmentId}
                </Link>
              ),
            },
            {
              key: "assessmentTitle",
              header: "Assessment Title",
              cell: (row: any) => (
                <div className="max-w-[320px]">
                  <Link
                    to="/development/research-innovation/trl-assessment/new"
                    search={{ id: row.id }}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {row.assessmentTitle}
                  </Link>
                  <div className="text-[11px] text-muted-foreground">{row.technologyName}</div>
                </div>
              ),
            },
            {
              key: "currentTrlLevel",
              header: "TRL Levels",
              cell: (row: any) => (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800">
                    TRL {row.currentTrlLevel}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-800">
                    TRL {row.targetTrlLevel}
                  </span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (row: any) => (
                <StatusBadge status={TRL_STATUS_LABEL[row.status as TrlStatus] || row.status} />
              ),
            },
            {
              key: "finalTrlScore",
              header: "Readiness Score",
              cell: (row: any) => (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${row.finalTrlScore}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {row.finalTrlScore}/100
                  </span>
                </div>
              ),
            },
            {
              key: "recommendedTrlLevel",
              header: "Recommended",
              cell: (row: any) => (
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  {row.recommendedTrlLevel}
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
                  to="/development/research-innovation/trl-assessment/new"
                  search={{ id: row.id }}
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
              <div className="font-bold text-primary">{row.trlAssessmentId}</div>
              <div className="font-medium text-foreground">{row.assessmentTitle}</div>
              <div className="text-xs text-muted-foreground">Readiness: {row.finalTrlScore}/100</div>
            </div>
          )}
          empty={
            <EmptyState
              title="No TRL Assessments Found"
              description="Start a new Technology Readiness Level assessment to evaluate research, PoC, and prototype evidence."
              action={
                <ErpButton
                  variant="primary"
                  onClick={() => navigate({ to: "/development/research-innovation/trl-assessment/new" })}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create TRL Assessment
                </ErpButton>
              }
            />
          }
        />
      </div>
    </AppShell>
  );
}
