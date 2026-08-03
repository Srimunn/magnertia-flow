import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Eye, RefreshCw, ChevronRight, ArrowUpRight } from "lucide-react";
import { leanManufacturingService } from "@/services/leanManufacturingService";
import type { LeanManufacturing } from "@/lib/lean-manufacturing/types";
import { AppShell } from "@/components/erp/AppShell";
import {
  calculateOverallLeanReadiness,
  calculateWasteSeverityScore,
  calculateProcessEfficiencyScore,
  calculateOperationalScore,
  calculateContinuousImprovementScore,
  getRecommendationSuggestion,
  formatIndianCurrency,
} from "@/lib/lean-manufacturing/scoring";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/manufacturing-development/lean-manufacturing/")({
  head: () => ({
    meta: [{ title: "Lean Manufacturing · Magnertia ERP" }],
  }),
  component: LeanManufacturingListPage,
});

export function LeanManufacturingListPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs = <ManufacturingDevelopmentTabBar />,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: records = [], isLoading, refetch } = useQuery<LeanManufacturing[]>({
    queryKey: ["leanManufacturingRecords"],
    queryFn: () => leanManufacturingService.listRecords(),
  });

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.leanProjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.plant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.leanProjectNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || rec.workflowStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved — Continuous Improvement Active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
      case "Minor Improvements Required":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
      case "Revision Required":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
      case "Archived":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 border-slate-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300";
    }
  };

  return (
    <AppShell
      title="Lean Manufacturing"
      breadcrumb={breadcrumb}
      description="Drive kaizen initiatives, value stream mapping, 5S audits, waste reduction, and continuous flow."
      tabs={tabs}
    >
      <div className="p-6 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
              <span>Development</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Manufacturing Development</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-semibold">Lean Manufacturing</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Lean Manufacturing Directory</h1>
            <p className="text-xs text-muted-foreground">
              Continuous improvement Kaizen project directory tracking 8 Wastes, cycle time reduction, and cost savings.
            </p>
          </div>

          <Link
            to="/manufacturing-development/lean-manufacturing/new"
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs rounded-lg shadow flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Lean Project
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ID, project title, plant, line..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Executive Review">Executive Review</option>
              <option value="Approved — Continuous Improvement Active">Approved — CI Active</option>
              <option value="Minor Improvements Required">Minor Improvements Required</option>
              <option value="Revision Required">Revision Required</option>
              <option value="Archived">Archived</option>
            </select>

            <button
              onClick={() => refetch()}
              className="p-1.5 border border-input rounded-md bg-background hover:bg-accent text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Directory Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/80 text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Project ID</th>
                    <th className="px-4 py-3">Project Title</th>
                    <th className="px-4 py-3">Plant / Line</th>
                    <th className="px-4 py-3">Workflow Status</th>
                    <th className="px-4 py-3">Lean Readiness</th>
                    <th className="px-4 py-3">Expected Cost Saving</th>
                    <th className="px-4 py-3">Timeline</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        No Lean Manufacturing projects found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      const wasteScore = calculateWasteSeverityScore(rec.wastes);
                      const procScore = calculateProcessEfficiencyScore({
                        cycleTimeSec: rec.currentCycleTimeSec,
                        taktTimeSec: rec.taktTimeSec,
                        valueAddedRatio: rec.valueAddedRatio,
                        leadTimeHr: rec.leadTimeHr,
                      });
                      const opsScore = calculateOperationalScore(rec.performanceMetrics);
                      const ciScore = calculateContinuousImprovementScore(rec.kaizenActivities);

                      const overall = calculateOverallLeanReadiness({
                        processEfficiencyScore: procScore,
                        operationalScore: opsScore,
                        continuousImprovementScore: ciScore,
                        aiLeanHealthScore: rec.aiLeanHealthScore,
                        wasteSeverityScore: wasteScore,
                      });

                      return (
                        <tr key={rec.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3 font-extrabold text-foreground">
                            <Link
                              to="/manufacturing-development/lean-manufacturing/$id"
                              params={{ id: rec.id }}
                              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                              {rec.id} <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground max-w-xs truncate">
                            {rec.leanProjectTitle}
                            <span className="block text-[10px] text-muted-foreground font-normal">
                              {rec.leanProjectNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {rec.plant} — {rec.productionLine}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                                rec.workflowStatus
                              )}`}
                            >
                              {rec.workflowStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">
                              {overall}/100
                            </span>
                          </td>
                          <td className="px-4 py-3 font-extrabold text-emerald-600">
                            {formatIndianCurrency(rec.expectedCostSaving)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {rec.timelineStart} – {rec.timelineEnd}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to="/manufacturing-development/lean-manufacturing/$id"
                              params={{ id: rec.id }}
                              className="px-2.5 py-1 border border-input rounded bg-background hover:bg-accent text-xs font-semibold text-foreground inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
