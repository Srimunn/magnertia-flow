import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Stamp, CheckCircle2, Gauge, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PatentMgmtPageTabBar, PATENT_STATUS_LABEL } from "@/components/erp/PatentMgmtTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { patentMgmtService } from "@/services";
import type { PatentListRow, PatentStatus } from "@/services/types";

export const Route = createFileRoute("/development/ip-development/patent-management/")({
  head: () => ({ meta: [{ title: "Patent Management · Magnertia ERP" }] }),
  component: PatentRegisterPage,
});

const FILTERS: { key: PatentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "preparation", label: "Preparation" },
  { key: "filing", label: "Filing" },
  { key: "examination", label: "Examination" },
  { key: "granted", label: "Granted" },
  { key: "commercialization", label: "Commercialization" },
  { key: "active", label: "Active" },
  { key: "revision_required", label: "Revision Required" },
  { key: "closed", label: "Closed" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PatentRegisterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PatentStatus | "all">("all");

  const listQuery = useQuery({
    queryKey: ["patent-management", "list"],
    queryFn: () => patentMgmtService.fetchList(),
  });
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const kpis = useMemo(() => {
    const scored = rows.filter((r) => r.overallPatentScore > 0);
    return {
      total: rows.length,
      inProsecution: rows.filter((r) => ["preparation", "filing", "examination"].includes(r.status))
        .length,
      grantedActive: rows.filter((r) =>
        ["granted", "commercialization", "active"].includes(r.status),
      ).length,
      deadlineAlerts: rows.filter(
        (r) =>
          r.responseDueTone === "due" ||
          r.responseDueTone === "overdue" ||
          r.renewalState === "Due" ||
          r.renewalState === "Overdue",
      ).length,
    };
  }, [rows]);

  const newButton = (
    <Link to="/development/ip-development/patent-management/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Patent
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Patent Management"
      breadcrumb="Development · IP Development"
      description="The IP lifecycle engine — preparation, filing, examination, grant and commercialization with live deadline tracking."
      tabs={<PatentMgmtPageTabBar />}
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
              label="Patents"
              value={kpis.total.toString()}
              neutralText="All statuses"
              icon={<Stamp className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="In Prosecution"
              value={kpis.inProsecution.toString()}
              neutralText="Prep → examination"
              icon={<Gauge className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Granted / Active"
              value={kpis.grantedActive.toString()}
              neutralText="In the portfolio"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Deadline Alerts"
              value={kpis.deadlineAlerts.toString()}
              neutralText="Office actions & renewals"
              icon={<AlertTriangle className="h-5 w-5" />}
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
              title={rows.length === 0 ? "No patents yet" : "No patents match this filter"}
              description={
                rows.length === 0
                  ? "Create a patent from an approved IP record to run it through the full filing-to-grant lifecycle."
                  : "Try a different status filter."
              }
              action={rows.length === 0 ? newButton : undefined}
            />
          ) : (
            <DataTable<PatentListRow>
              data={filtered}
              onRowClick={(r) =>
                navigate({
                  to: "/development/ip-development/patent-management/new",
                  search: { id: r.id },
                })
              }
              columns={[
                {
                  key: "patent",
                  header: "Patent",
                  cell: (r) => (
                    <div>
                      <span className="block font-semibold text-foreground">
                        {r.patentTitle || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.patentId}
                        {r.patentNumber ? ` · ${r.patentNumber}` : ""}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <StatusBadge status={PATENT_STATUS_LABEL[r.status]} />,
                },
                {
                  key: "manager",
                  header: "Patent Manager",
                  cell: (r) => (
                    <span className="text-muted-foreground">{r.patentManager || "—"}</span>
                  ),
                },
                {
                  key: "next",
                  header: "Next Action",
                  cell: (r) => (
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        r.responseDueTone === "overdue" || r.renewalState === "Overdue"
                          ? "text-destructive"
                          : r.responseDueTone === "due" || r.renewalState === "Due"
                            ? "text-[#F59E0B]"
                            : "text-muted-foreground",
                      )}
                    >
                      {r.nextAction}
                    </span>
                  ),
                },
                {
                  key: "renewal",
                  header: "Renewal",
                  align: "center",
                  cell: (r) =>
                    r.renewalState === "N/A" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <StatusBadge status={r.renewalState} />
                    ),
                },
                {
                  key: "score",
                  header: "Score",
                  align: "center",
                  cell: (r) => (
                    <span className="tabular font-bold text-foreground">
                      {r.overallPatentScore || "—"}
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
                    <div className="truncate font-semibold">{r.patentTitle || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.patentId} · {r.nextAction}
                    </div>
                  </div>
                  <StatusBadge status={PATENT_STATUS_LABEL[r.status]} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
