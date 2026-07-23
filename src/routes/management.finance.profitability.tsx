import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  TrendingUp,
  Download,
  MoreHorizontal,
  ChevronDown,
  Search,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  Globe,
  Building,
  Upload,
  Calendar,
  Layers,
  FileText,
  User,
  DollarSign,
  ChevronRight,
  Sparkles,
  Percent,
  Sliders,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetBand } from "@/widgets/components/WidgetBand";
import { FinanceTabBar } from "@/components/erp/FinanceTabBar";
import { ErpButton } from "@/components/erp/Button";
import { CardHeader } from "@/components/erp/CardHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DataTable } from "@/components/erp/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { company, formatCurrency } from "@/lib/mock-data";
import { profitabilityService, loadProfitabilityDashboard } from "@/services";
import type { ProfitabilityRecord, CostAllocationRule, DashboardQuery } from "@/services/types";

export const Route = createFileRoute("/management/finance/profitability")({
  head: () => ({
    meta: [
      { title: "Profitability Analysis · Magnertia" },
      {
        name: "description",
        content:
          "Analyze profitability by product, customer, region, and other dimensions to drive better business decisions.",
      },
    ],
  }),
  component: ProfitabilityAnalysisPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const DIMENSIONS = [
  { label: "Product", value: "Product" },
  { label: "Customer", value: "Customer" },
  { label: "Region", value: "Region" },
  { label: "Sales Channel", value: "Sales Channel" },
  { label: "Cost Center", value: "Cost Center" },
  { label: "Project", value: "Project" },
];

function ProfitabilityAnalysisPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "Product" | "Customer" | "Region" | "Sales Channel" | "Cost Center" | "Project"
  >("Product");

  // Filters
  const [search, setSearch] = useState("");
  const [timePeriod, setTimePeriod] = useState("This Fiscal Year (Apr 2024 - Mar 2025)");
  const [compareWith, setCompareWith] = useState("Previous Fiscal Year");

  // Dialog States
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ code: string; name: string } | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [allocationOpen, setAllocationOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Allocation Form State
  const [allocationRules, setAllocationRules] = useState<CostAllocationRule[]>([
    { id: "AR-001", costCenter: "IT-005", allocationKey: "Headcount", weight: 45 },
    { id: "AR-002", costCenter: "HR-006", allocationKey: "Headcount", weight: 25 },
    { id: "AR-003", costCenter: "ADM-001", allocationKey: "Square Footage", weight: 30 },
  ]);

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ["profitability", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadProfitabilityDashboard(QUERY),
  });

  const dimensionQuery = useQuery({
    queryKey: ["profitability", "dimension", activeTab],
    queryFn: () => profitabilityService.fetchProfitabilityByDimension(QUERY, activeTab),
  });

  const comparisonQuery = useQuery({
    queryKey: ["profitability", "comparison"],
    queryFn: () => profitabilityService.fetchPeriodComparison(QUERY),
    enabled: compareOpen,
  });

  const drilldownQuery = useQuery({
    queryKey: ["profitability", "drilldown", activeTab, selectedItem?.code],
    queryFn: () =>
      profitabilityService.fetchDrilldownAnalysis(QUERY, activeTab, selectedItem?.code || ""),
    enabled: drilldownOpen && !!selectedItem,
  });

  // Mutations
  const allocationMutation = useMutation({
    mutationFn: profitabilityService.saveAllocationRules,
    onSuccess: (res) => {
      toast.success(
        `Cost allocation rules updated successfully (${res.updatedRulesCount} rules applied).`,
      );
      setAllocationOpen(false);
      queryClient.invalidateQueries({ queryKey: ["profitability"] });
    },
    onError: () => toast.error("Failed to update cost allocation rules."),
  });

  const handleRowClick = (row: ProfitabilityRecord) => {
    setSelectedItem({ code: row.code, name: row.name });
    setDrilldownOpen(true);
  };

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeight = allocationRules.reduce((sum, r) => sum + r.weight, 0);
    if (totalWeight !== 100) {
      toast.error(
        `Total allocation weight must equal exactly 100% (Current total: ${totalWeight}%).`,
      );
      return;
    }
    allocationMutation.mutate(allocationRules);
  };

  const handleWeightChange = (id: string, weight: number) => {
    setAllocationRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, weight: Math.max(0, Math.min(100, weight)) } : r)),
    );
  };

  const handleAllocationKeyChange = (id: string, key: CostAllocationRule["allocationKey"]) => {
    setAllocationRules((prev) => prev.map((r) => (r.id === id ? { ...r, allocationKey: key } : r)));
  };

  const isLoading = dashboardQuery.isLoading;
  const data = dashboardQuery.data;

  // Filter dimension list
  const dimensionList = dimensionQuery.data || [];
  const filteredList = dimensionList.filter((row) => {
    const matchesSearch =
      row.code.toLowerCase().includes(search.toLowerCase()) ||
      row.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppShell
      title="Finance"
      breadcrumb="Management"
      description="Analyze profitability by product, customer, region, and other dimensions to drive better business decisions."
      tabs={<FinanceTabBar />}
      topbarActions={
        <ErpButton variant="outline" onClick={() => setReportOpen(true)}>
          <FileText className="mr-1.5 h-4 w-4" />
          <span>Profitability Report</span>
        </ErpButton>
      }
    >
      {isLoading || !data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-xl bg-muted" />
              <div className="h-48 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* KPI Stat Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Total Revenue (YTD)"
              value={formatCurrency(data.kpis.revenueYTD)}
              neutralText={`${data.kpis.revenueYTDDelta}% vs PYTD`}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Gross Profit (YTD)"
              value={formatCurrency(data.kpis.grossProfitYTD)}
              neutralText={`${data.kpis.grossProfitYTDDelta}% vs PYTD`}
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
            />
            <StatCard
              label="Gross Profit Margin"
              value={`${data.kpis.grossMarginYTD.toFixed(2)}%`}
              neutralText={`+${data.kpis.grossMarginYTDDelta.toFixed(2)} pp vs PYTD`}
              icon={<Percent className="h-5 w-5" />}
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
            />
            <StatCard
              label="Net Profit (YTD)"
              value={formatCurrency(data.kpis.netProfitYTD)}
              neutralText={`${data.kpis.netProfitYTDDelta}% vs PYTD`}
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
            />
            <StatCard
              label="Net Profit Margin"
              value={`${data.kpis.netMarginYTD.toFixed(2)}%`}
              neutralText={`${data.kpis.netMarginYTDDelta.toFixed(2)} pp vs PYTD`}
              icon={<Layers className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Customizable widget band (empty by default) */}
          <WidgetBand pageId="finance-profitability" />

          {/* Main Layout Grid */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Column */}
            <div className="min-w-0 space-y-5">
              {/* Tab Navigation & Toolbar Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {DIMENSIONS.map((dim) => (
                    <button
                      key={dim.value}
                      onClick={() => {
                        setActiveTab(dim.value as typeof activeTab);
                        queryClient.invalidateQueries({
                          queryKey: ["profitability", "dimension"],
                        });
                      }}
                      className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors -mb-[2px] ${
                        activeTab === dim.value
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {activeTab === dim.value ? `By ${dim.label}` : dim.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <ErpButton
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Exporting profitability CSV...")}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </ErpButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground shadow-sm hover:bg-muted/50">
                        <span>More Actions</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setCompareOpen(true)}>
                        Compare Periods
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAllocationOpen(true)}>
                        Manage Cost Allocation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setReportOpen(true)}>
                        Generate PDF Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* View Controls toolbar */}
              <div className="flex flex-wrap items-center gap-3.5 card-soft p-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Search by ${activeTab.toLowerCase()} code or name...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="This Fiscal Year (Apr 2024 - Mar 2025)">{timePeriod}</option>
                  </select>

                  <select
                    value={compareWith}
                    onChange={(e) => setCompareWith(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Previous Fiscal Year">{compareWith}</option>
                  </select>
                </div>
              </div>

              {/* Profitability Dimension Grid Table */}
              <div className="card-soft overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-card">
                  <h3 className="font-bold text-sm text-foreground">
                    Profitability by {activeTab}
                  </h3>
                </div>
                {dimensionQuery.isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    Loading dimension analysis...
                  </div>
                ) : (
                  <DataTable<ProfitabilityRecord>
                    data={filteredList}
                    columns={[
                      {
                        key: "code",
                        header: "Code",
                        cell: (r) => <span className="font-bold text-foreground">{r.code}</span>,
                      },
                      {
                        key: "name",
                        header: "Name",
                        cell: (r) => (
                          <span className="font-semibold text-foreground">{r.name}</span>
                        ),
                      },
                      {
                        key: "revenue",
                        header: "Total Revenue (₹)",
                        align: "right",
                        cell: (r) => (
                          <span className="font-semibold text-foreground tabular">
                            {formatCurrency(r.revenue)}
                          </span>
                        ),
                      },
                      {
                        key: "cogs",
                        header: "COGS (₹)",
                        align: "right",
                        cell: (r) => (
                          <span className="text-muted-foreground tabular">
                            {formatCurrency(r.cogs)}
                          </span>
                        ),
                      },
                      {
                        key: "grossProfit",
                        header: "Gross Profit (₹)",
                        align: "right",
                        cell: (r) => (
                          <span className="font-semibold text-foreground tabular">
                            {formatCurrency(r.grossProfit)}
                          </span>
                        ),
                      },
                      {
                        key: "grossMargin",
                        header: "Gross Margin (%)",
                        align: "right",
                        cell: (r) => (
                          <span className="font-semibold text-foreground tabular">
                            {r.grossMargin.toFixed(2)}%
                          </span>
                        ),
                      },
                      {
                        key: "netProfit",
                        header: "Net Profit (₹)",
                        align: "right",
                        cell: (r) => (
                          <span className="font-semibold text-foreground tabular">
                            {formatCurrency(r.netProfit)}
                          </span>
                        ),
                      },
                      {
                        key: "netMargin",
                        header: "Net Margin (%)",
                        align: "right",
                        cell: (r) => (
                          <span className="font-bold text-primary tabular">
                            {r.netMargin.toFixed(2)}%
                          </span>
                        ),
                      },
                    ]}
                    mobileCard={(r) => (
                      <div className="space-y-1" onClick={() => handleRowClick(r)}>
                        <div className="flex justify-between font-semibold">
                          <span>{r.name}</span>
                          <span>{formatCurrency(r.netProfit)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Revenue: {formatCurrency(r.revenue)} • Margin: {r.netMargin}%
                        </div>
                      </div>
                    )}
                    onRowClick={handleRowClick}
                  />
                )}
              </div>

              {/* Bottom Profitability Summary & Top Performers */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* Profitability Summary totals grid */}
                <div className="card-soft p-5">
                  <CardHeader title="Profitability Summary" />
                  <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                      <span className="text-muted-foreground block mb-0.5">Total Revenue</span>
                      <span className="font-bold text-foreground text-sm block tabular">
                        {formatCurrency(data.summary.revenue)}
                      </span>
                      <span className="text-green-600 block text-[10px] mt-0.5">
                        ▲ 12.45% vs PYTD
                      </span>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                      <span className="text-muted-foreground block mb-0.5">Total COGS</span>
                      <span className="font-bold text-foreground text-sm block tabular">
                        {formatCurrency(data.summary.cogs)}
                      </span>
                      <span className="text-green-600 block text-[10px] mt-0.5">
                        ▲ 9.18% vs PYTD
                      </span>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                      <span className="text-muted-foreground block mb-0.5">Gross Profit</span>
                      <span className="font-bold text-foreground text-sm block tabular">
                        {formatCurrency(data.summary.grossProfit)}
                      </span>
                      <span className="text-green-600 block text-[10px] mt-0.5">
                        ▲ 15.62% vs PYTD
                      </span>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                      <span className="text-muted-foreground block mb-0.5">Net Profit</span>
                      <span className="font-bold text-primary text-sm block tabular">
                        {formatCurrency(data.summary.netProfit)}
                      </span>
                      <span className="text-green-600 block text-[10px] mt-0.5">
                        ▲ 8.67% vs PYTD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Performers (By Net Margin) */}
                <div className="card-soft p-5 space-y-3">
                  <CardHeader title="Top Performers (By Net Margin %)" />
                  <div className="space-y-3 mt-3">
                    {data.topPerformers.map((perf) => (
                      <div
                        key={perf.rank}
                        className="flex items-center justify-between text-xs py-1 border-b border-border/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid place-items-center h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                            {perf.rank}
                          </span>
                          <span className="font-semibold text-foreground">{perf.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary block tabular">
                            {perf.netMargin}%
                          </span>
                          <span className="text-muted-foreground text-[10px] block tabular">
                            {formatCurrency(perf.netProfit)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-5">
              {/* Profitability Trend line chart */}
              <div className="card-soft p-5">
                <CardHeader title="Profitability Trend" />

                <div className="h-[180px] w-full mt-3">
                  <ResponsiveContainer>
                    <LineChart
                      data={data.trend}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${(v / 1_00_000).toFixed(1)}L`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="netProfit"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                        name="Net Profit"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="netMargin"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={false}
                        name="Net Margin %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Profitability by Region Horizontal Bar chart */}
              <div className="card-soft p-5">
                <CardHeader title="Profitability by Region (Net Margin %)" />

                <div className="h-[180px] w-full mt-3">
                  <ResponsiveContainer>
                    <BarChart
                      data={data.regional}
                      layout="vertical"
                      margin={{ top: 5, right: 5, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                      <XAxis
                        type="number"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        dataKey="region"
                        type="category"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                        formatter={(v: number) => [`${v}%`, "Net Margin"]}
                      />
                      <Bar dataKey="netMargin" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Profitability by Sales Channel donut chart */}
              <div className="card-soft p-5">
                <CardHeader title="Profitability by Sales Channel" />

                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data.salesChannels}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {data.salesChannels.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[14px] font-bold text-foreground">
                          18.99%
                        </div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-wider">
                          Overall Margin
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-1.5 text-xs">
                    {data.salesChannels.map((entry, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}
                        </span>
                        <span className="font-semibold text-foreground">
                          {entry.percentage}% ({formatCurrency(entry.value, true)})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTION DIALOGS --- */}

      {/* 1. Drill-down Analysis Modal */}
      <Dialog open={drilldownOpen} onOpenChange={setDrilldownOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Drill-down Transaction Ledger</DialogTitle>
            <DialogDescription>
              Detail lines for {activeTab} [{selectedItem?.code}] {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>

          {drilldownQuery.isLoading || !drilldownQuery.data ? (
            <div className="h-48 flex items-center justify-center">Loading transactions...</div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto mt-2 border border-border rounded-xl">
              <DataTable<{
                date: string;
                ref: string;
                description: string;
                amount: number;
                type: string;
              }>
                data={drilldownQuery.data}
                columns={[
                  {
                    key: "date",
                    header: "Date",
                    cell: (r) => <span className="text-muted-foreground text-xs">{r.date}</span>,
                  },
                  {
                    key: "ref",
                    header: "Ref No.",
                    cell: (r) => <span className="font-mono text-xs">{r.ref}</span>,
                  },
                  {
                    key: "description",
                    header: "Description",
                    cell: (r) => (
                      <span className="text-foreground font-semibold">{r.description}</span>
                    ),
                  },
                  {
                    key: "type",
                    header: "Type",
                    cell: (r) => <span className="text-xs">{r.type}</span>,
                  },
                  {
                    key: "amount",
                    header: "Amount",
                    align: "right",
                    cell: (r) => (
                      <span
                        className={`font-semibold tabular ${r.amount < 0 ? "text-destructive" : "text-green-600"}`}
                      >
                        {formatCurrency(r.amount)}
                      </span>
                    ),
                  },
                ]}
                mobileCard={(r) => (
                  <div>
                    {r.ref} - {formatCurrency(r.amount)}
                  </div>
                )}
              />
            </div>
          )}

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton variant="outline" onClick={() => setDrilldownOpen(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Compare Periods Modal */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compare Profitability Periods</DialogTitle>
            <DialogDescription>
              Compare Current YTD vs Prior YTD performance margins.
            </DialogDescription>
          </DialogHeader>

          {comparisonQuery.isLoading || !comparisonQuery.data ? (
            <div className="h-48 flex items-center justify-center">Loading comparison...</div>
          ) : (
            <div className="mt-2 border border-border rounded-xl overflow-hidden">
              <DataTable<{
                dimension: string;
                currentYTD: number;
                priorYTD: number;
                changePercentage: number;
              }>
                data={comparisonQuery.data}
                columns={[
                  {
                    key: "dimension",
                    header: "Dimension",
                    cell: (r) => <span className="font-bold text-foreground">{r.dimension}</span>,
                  },
                  {
                    key: "currentYTD",
                    header: "Current YTD",
                    align: "right",
                    cell: (r) => (
                      <span className="font-semibold tabular">{formatCurrency(r.currentYTD)}</span>
                    ),
                  },
                  {
                    key: "priorYTD",
                    header: "Prior YTD",
                    align: "right",
                    cell: (r) => (
                      <span className="text-muted-foreground tabular">
                        {formatCurrency(r.priorYTD)}
                      </span>
                    ),
                  },
                  {
                    key: "changePercentage",
                    header: "Change %",
                    align: "right",
                    cell: (r) => (
                      <span
                        className={`font-bold tabular ${r.changePercentage > 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        {r.changePercentage > 0
                          ? `+${r.changePercentage}%`
                          : `${r.changePercentage}%`}
                      </span>
                    ),
                  },
                ]}
                mobileCard={(r) => <div>{r.dimension}</div>}
              />
            </div>
          )}

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton variant="outline" onClick={() => setCompareOpen(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Manage Cost Allocation Rules Modal */}
      <Dialog open={allocationOpen} onOpenChange={setAllocationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Overhead Cost Allocation Rules</DialogTitle>
            <DialogDescription>
              Configure indirect expense driver weights across business cost centers. Weights must
              total exactly 100%.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocationSubmit} className="space-y-4">
            <div className="space-y-3.5 mt-2 max-h-[300px] overflow-y-auto p-1">
              {allocationRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 border border-border rounded-xl space-y-2.5 bg-secondary/10"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                    <span>Cost Center: {rule.costCenter}</span>
                    <span className="font-mono text-muted-foreground text-[10px]">{rule.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                        Allocation Driver Key
                      </label>
                      <select
                        value={rule.allocationKey}
                        onChange={(e) =>
                          handleAllocationKeyChange(
                            rule.id,
                            e.target.value as CostAllocationRule["allocationKey"],
                          )
                        }
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                      >
                        <option value="Headcount">Headcount</option>
                        <option value="Square Footage">Square Footage</option>
                        <option value="Direct Revenue">Direct Revenue</option>
                        <option value="Direct Expense">Direct Expense</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                        Weight Allocation (%)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={rule.weight}
                        onChange={(e) => handleWeightChange(rule.id, parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs font-semibold px-1 mt-3">
              <span className="text-muted-foreground">Total Weights Allocated:</span>
              <span
                className={`text-sm font-bold ${
                  allocationRules.reduce((sum, r) => sum + r.weight, 0) === 100
                    ? "text-green-600"
                    : "text-destructive"
                }`}
              >
                {allocationRules.reduce((sum, r) => sum + r.weight, 0)}% / 100%
              </span>
            </div>

            <DialogFooter className="mt-5 border-t border-border pt-3">
              <ErpButton type="button" variant="outline" onClick={() => setAllocationOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={allocationMutation.isPending}>
                Save Allocation Configuration
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Profitability Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Profitability Report</DialogTitle>
            <DialogDescription>
              Compile detailed performance breakdowns by product, region, and sales channel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-secondary/40 p-4 rounded-xl flex gap-3 text-xs text-muted-foreground">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="font-semibold text-foreground block mb-0.5">Report Includes</span>
                Master YTD revenues, COGS allocations, overhead distributions, net margin rankings,
                and monthly trend line charts.
              </div>
            </div>
          </div>
          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </ErpButton>
            <ErpButton
              onClick={() => {
                toast.success(
                  "Profitability PDF report successfully compiled and sent to downloads.",
                );
                setReportOpen(false);
              }}
            >
              Generate Report
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
