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
  Check,
  RefreshCw,
  Plus,
  Play,
  Settings,
  ChevronUp,
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
import { consolidationService, loadConsolidationDashboard } from "@/services";
import type {
  ConsolidationRecord,
  AccountMappingRecord,
  DashboardQuery,
  IntercompanyTransaction,
  EntityValidationResult,
} from "@/services/types";

export const Route = createFileRoute("/management/finance/consolidation")({
  head: () => ({
    meta: [
      { title: "Consolidation · Magnertia" },
      {
        name: "description",
        content: "Consolidate financial results across entities with accuracy and compliance.",
      },
    ],
  }),
  component: ConsolidationPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

function ConsolidationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "overview" | "entities" | "groups" | "intercompany" | "eliminations" | "process" | "reports"
  >("overview");

  // Filters
  const [search, setSearch] = useState("");
  const [consolidationVersion, setConsolidationVersion] = useState("FY 2024-25 - Final");
  const [viewMode, setViewMode] = useState("Group View");
  const [groupSelect, setGroupSelect] = useState("All Groups");
  const [currencySelect, setCurrencySelect] = useState("USD");
  const [periodSelect, setPeriodSelect] = useState("Apr 2024 - Mar 2025");

  // Expansion
  const [isGroupExpanded, setIsGroupExpanded] = useState(true);

  // Dialog States
  const [runOpen, setRunOpen] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runStep, setRunStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const [validationOpen, setValidationOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState<"Consolidation" | "Intercompany" | "Elimination">(
    "Consolidation",
  );

  // Mapping Form State
  const [mappings, setMappings] = useState<AccountMappingRecord[]>([
    {
      id: "MAP-001",
      sourceAccount: "1100 - Accounts Receivable (Sub)",
      targetAccount: "1105 - Consolidated Accounts Receivable",
      entity: "Technologies Inc.",
    },
    {
      id: "MAP-002",
      sourceAccount: "2100 - Accounts Payable (Sub)",
      targetAccount: "2105 - Consolidated Accounts Payable",
      entity: "Solutions LLC",
    },
    {
      id: "MAP-003",
      sourceAccount: "4100 - Direct Sales Revenue",
      targetAccount: "4000 - Consolidated Revenue",
      entity: "Europe GmbH",
    },
  ]);
  const [newMap, setNewMap] = useState({
    sourceAccount: "",
    targetAccount: "",
    entity: "Technologies Inc.",
  });

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ["consolidation", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadConsolidationDashboard(QUERY),
  });

  // Mutations
  const runMutation = useMutation({
    mutationFn: () => consolidationService.runConsolidation(QUERY),
    onSuccess: (res) => {
      setRunLogs([]);
      setRunStep(0);
      setIsValidating(true);

      // Simulate progress timeline
      const steps = res.log;
      let current = 0;
      const interval = setInterval(() => {
        if (current < steps.length) {
          setRunLogs((prev) => [...prev, steps[current]]);
          setRunStep(current + 1);
          current++;
        } else {
          clearInterval(interval);
          setIsValidating(false);
          toast.success("Consolidation run executed successfully. All periods consolidated.");
          queryClient.invalidateQueries({ queryKey: ["consolidation"] });
        }
      }, 900);
    },
    onError: () => {
      setIsValidating(false);
      toast.error("Failed to run consolidation process.");
    },
  });

  const mappingMutation = useMutation({
    mutationFn: consolidationService.updateAccountMapping,
    onSuccess: () => {
      toast.success("Account mappings updated successfully.");
      setMappingOpen(false);
      queryClient.invalidateQueries({ queryKey: ["consolidation"] });
    },
    onError: () => toast.error("Failed to save account mapping schema."),
  });

  const handleRunSubmit = () => {
    runMutation.mutate();
  };

  const handleAddMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMap.sourceAccount || !newMap.targetAccount) {
      toast.error("Please provide both source and target accounts.");
      return;
    }
    const created: AccountMappingRecord = {
      id: `MAP-${Math.floor(Math.random() * 900) + 100}`,
      ...newMap,
    };
    setMappings((prev) => [...prev, created]);
    setNewMap({ sourceAccount: "", targetAccount: "", entity: "Technologies Inc." });
    toast.success("New account mapping rule added.");
  };

  const handleRemoveMapping = (id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveMappings = () => {
    mappingMutation.mutate(mappings);
  };

  const handleOpenReport = (type: typeof reportType) => {
    setReportType(type);
    setReportOpen(true);
  };

  const isLoading = dashboardQuery.isLoading;
  const data = dashboardQuery.data;

  // Overview rows
  const allRows = data?.summaryData || [];
  const parentRow = allRows.find((r) => r.code === "GP-001");
  const childRows = allRows.filter((r) => r.code !== "GP-001" && r.code !== "ELIM-001");
  const elimRow = allRows.find((r) => r.code === "ELIM-001");

  return (
    <AppShell
      title="Finance"
      breadcrumb="Management"
      description="Consolidate financial results across entities with accuracy and compliance."
      tabs={<FinanceTabBar />}
      topbarActions={
        <ErpButton onClick={() => setRunOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          <span>New Consolidation</span>
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
              label="Total Entities"
              value={data.kpis.totalEntities.toString()}
              neutralText="2 Parent • 10 Subsidiaries"
              icon={<Building className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Consolidated Revenue (YTD)"
              value={formatCurrency(data.kpis.consolidatedRevenueYTD)}
              neutralText={`▲ ${data.kpis.consolidatedRevenueYTDDelta}% vs PYTD`}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
            />
            <StatCard
              label="Consolidated Net Profit (YTD)"
              value={formatCurrency(data.kpis.consolidatedNetProfitYTD)}
              neutralText={`▲ ${data.kpis.consolidatedNetProfitYTDDelta}% vs PYTD`}
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
            />
            <StatCard
              label="Elimination Entries (YTD)"
              value={formatCurrency(data.kpis.eliminationEntriesYTD)}
              neutralText={`${data.kpis.eliminationEntriesCount} Journal Entries`}
              icon={<Layers className="h-5 w-5" />}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
            />
            <StatCard
              label="Consolidation Status"
              value={data.kpis.status}
              neutralText="All Periods Closed"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Customizable widget band (empty by default) */}
          <WidgetBand pageId="finance-consolidation" />

          {/* Main Layout Grid */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Column */}
            <div className="min-w-0 space-y-5">
              {/* Tab Navigation & Toolbar Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      "overview",
                      "entities",
                      "groups",
                      "intercompany",
                      "eliminations",
                      "process",
                      "reports",
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors -mb-[2px] capitalize ${
                        activeTab === tab
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "overview"
                        ? "Consolidation Overview"
                        : tab === "intercompany"
                          ? "Intercompany Transactions"
                          : tab}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <ErpButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["consolidation"] });
                      toast.success("Consolidation metrics refreshed.");
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh</span>
                  </ErpButton>
                  <ErpButton
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Exporting consolidation details...")}
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
                      <DropdownMenuItem onClick={() => setRunOpen(true)}>
                        Run Consolidation Run
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setValidationOpen(true)}>
                        Validate Entity Ledgers
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMappingOpen(true)}>
                        Manage Account Mappings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* View Controls toolbar */}
              <div className="flex flex-wrap items-center gap-3.5 card-soft p-4">
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Consolidation Version
                  </label>
                  <select
                    value={consolidationVersion}
                    onChange={(e) => setConsolidationVersion(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="FY 2024-25 - Final">{consolidationVersion}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    View Mode
                  </label>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Group View">{viewMode}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Group
                  </label>
                  <select
                    value={groupSelect}
                    onChange={(e) => setGroupSelect(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="All Groups">{groupSelect}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Currency
                  </label>
                  <select
                    value={currencySelect}
                    onChange={(e) => setCurrencySelect(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="USD">{currencySelect}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Period
                  </label>
                  <select
                    value={periodSelect}
                    onChange={(e) => setPeriodSelect(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Apr 2024 - Mar 2025">{periodSelect}</option>
                  </select>
                </div>
              </div>

              {/* Consolidation Overview Tab View */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  {/* Expanded Custom Table */}
                  <div className="card-soft overflow-hidden">
                    <div className="px-5 py-4 border-b border-border bg-card">
                      <h3 className="font-bold text-sm text-foreground">
                        Consolidated Financial Summary
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                            <th className="p-3.5 pl-5">Group / Entity</th>
                            <th className="p-3.5 text-right">Total Revenue (₹)</th>
                            <th className="p-3.5 text-right">Total Expenses (₹)</th>
                            <th className="p-3.5 text-right">Operating Profit (₹)</th>
                            <th className="p-3.5 text-right">Net Profit (₹)</th>
                            <th className="p-3.5 text-right">Net Profit Margin (%)</th>
                            <th className="p-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Parent Row */}
                          {parentRow && (
                            <tr className="border-b border-border font-bold bg-secondary/10 hover:bg-secondary/20 transition-colors">
                              <td className="p-3.5 pl-5 flex items-center gap-2">
                                <button
                                  onClick={() => setIsGroupExpanded(!isGroupExpanded)}
                                  className="h-4 w-4 inline-flex items-center justify-center rounded border border-border bg-card"
                                >
                                  {isGroupExpanded ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                </button>
                                <span className="text-foreground">{parentRow.name}</span>
                              </td>
                              <td className="p-3.5 text-right tabular">
                                {formatCurrency(parentRow.revenue)}
                              </td>
                              <td className="p-3.5 text-right tabular">
                                {formatCurrency(parentRow.expenses)}
                              </td>
                              <td className="p-3.5 text-right tabular">
                                {formatCurrency(parentRow.operatingProfit)}
                              </td>
                              <td className="p-3.5 text-right tabular">
                                {formatCurrency(parentRow.netProfit)}
                              </td>
                              <td className="p-3.5 text-right tabular">
                                {parentRow.netMargin?.toFixed(2)}%
                              </td>
                              <td className="p-3.5 text-center">
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                                  {parentRow.status}
                                </span>
                              </td>
                            </tr>
                          )}

                          {/* Children Rows */}
                          {isGroupExpanded &&
                            childRows.map((child) => (
                              <tr
                                key={child.code}
                                className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                              >
                                <td className="p-3.5 pl-11 text-muted-foreground">{child.name}</td>
                                <td className="p-3.5 text-right text-foreground tabular">
                                  {formatCurrency(child.revenue)}
                                </td>
                                <td className="p-3.5 text-right text-muted-foreground tabular">
                                  {formatCurrency(child.expenses)}
                                </td>
                                <td className="p-3.5 text-right text-foreground tabular">
                                  {formatCurrency(child.operatingProfit)}
                                </td>
                                <td className="p-3.5 text-right text-foreground tabular">
                                  {formatCurrency(child.netProfit)}
                                </td>
                                <td className="p-3.5 text-right text-muted-foreground tabular">
                                  {child.netMargin?.toFixed(2)}%
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                    {child.status}
                                  </span>
                                </td>
                              </tr>
                            ))}

                          {/* Elimination Adjustments */}
                          {elimRow && (
                            <tr className="border-b border-border bg-red-500/5 font-semibold text-destructive hover:bg-red-500/10 transition-colors">
                              <td className="p-3.5 pl-5">{elimRow.name}</td>
                              <td className="p-3.5 text-right tabular">
                                ({formatCurrency(Math.abs(elimRow.revenue))})
                              </td>
                              <td className="p-3.5 text-right tabular">
                                ({formatCurrency(Math.abs(elimRow.expenses))})
                              </td>
                              <td className="p-3.5 text-right tabular">
                                {formatCurrency(elimRow.operatingProfit)}
                              </td>
                              <td className="p-3.5 text-right tabular">
                                ({formatCurrency(Math.abs(elimRow.netProfit))})
                              </td>
                              <td className="p-3.5 text-right tabular">N/A</td>
                              <td className="p-3.5 text-center">
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                                  {elimRow.status}
                                </span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Consolidation Timeline milestones and Profit Trend Chart */}
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Consolidation Timeline Milestones */}
                    <div className="card-soft p-5 space-y-4">
                      <CardHeader title="Consolidation Process Timeline" />

                      <div className="space-y-4 relative pl-3.5 before:absolute before:left-1 before:top-2.5 before:bottom-2 before:w-0.5 before:bg-border/60">
                        {data.timeline.map((milestone, idx) => (
                          <div key={idx} className="relative flex items-start gap-3">
                            <div className="absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                            <div className="flex-1 text-xs">
                              <span className="font-bold text-foreground block">
                                {milestone.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                {milestone.date}
                              </span>
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
                                <Check className="h-3 w-3" />
                                {milestone.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Net Profit Trend Chart */}
                    <div className="card-soft p-5">
                      <CardHeader title="Net Profit Trend (₹)" />

                      <div className="h-[180px] w-full mt-3">
                        <ResponsiveContainer>
                          <BarChart
                            data={data.profitTrend}
                            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#F3F4F6"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="month"
                              stroke="#9CA3AF"
                              fontSize={9}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#9CA3AF"
                              fontSize={9}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(v) => `₹${(v / 1_00_00_000).toFixed(1)}Cr`}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "var(--card)",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                fontSize: 11,
                              }}
                            />
                            <Bar
                              dataKey="netProfit"
                              fill="var(--primary)"
                              radius={[4, 4, 0, 0]}
                              name="Net Profit"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs display details */}
              {activeTab === "entities" && (
                <div className="card-soft p-5 space-y-3">
                  <CardHeader title="Consolidated Subsidiaries Directory" />
                  <div className="border border-border rounded-xl overflow-hidden mt-3">
                    <DataTable<ConsolidationRecord>
                      data={childRows}
                      columns={[
                        {
                          key: "code",
                          header: "Entity Code",
                          cell: (r) => <span className="font-bold">{r.code}</span>,
                        },
                        {
                          key: "name",
                          header: "Legal Name",
                          cell: (r) => <span className="font-semibold">{r.name}</span>,
                        },
                        {
                          key: "status",
                          header: "Consolidation Method",
                          cell: (r) => <span>Full Integration</span>,
                        },
                        {
                          key: "netProfit",
                          header: "Net profit Contribution",
                          cell: (r) => (
                            <span className="tabular">{formatCurrency(r.netProfit)}</span>
                          ),
                        },
                      ]}
                      mobileCard={(r) => <div>{r.name}</div>}
                    />
                  </div>
                </div>
              )}

              {activeTab === "groups" && (
                <div className="card-soft p-5 text-center py-10">
                  <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <span className="font-bold text-sm text-foreground block">
                    Global Entity Group Definition
                  </span>
                  <span className="text-muted-foreground text-xs block max-w-sm mx-auto mt-1">
                    Manage Parent Holding Groups and set subsidiary ownership percentage thresholds.
                  </span>
                </div>
              )}

              {activeTab === "intercompany" && (
                <div className="card-soft p-5 space-y-3">
                  <CardHeader title="Intercompany Transactions Log" />
                  <div className="border border-border rounded-xl overflow-hidden mt-3">
                    <DataTable<IntercompanyTransaction>
                      data={data.topIntercompany}
                      columns={[
                        {
                          key: "ref",
                          header: "Transaction Ref",
                          cell: (r) => <span className="font-mono">{r.ref}</span>,
                        },
                        {
                          key: "date",
                          header: "Matching Date",
                          cell: (r) => <span>{r.date}</span>,
                        },
                        {
                          key: "fromEntity",
                          header: "Selling Entity",
                          cell: (r) => <span className="font-semibold">{r.fromEntity}</span>,
                        },
                        {
                          key: "toEntity",
                          header: "Buying Entity",
                          cell: (r) => <span className="font-semibold">{r.toEntity}</span>,
                        },
                        {
                          key: "amount",
                          header: "Amount (₹)",
                          align: "right",
                          cell: (r) => (
                            <span className="tabular font-bold text-foreground">
                              {formatCurrency(r.amount)}
                            </span>
                          ),
                        },
                        {
                          key: "matched",
                          header: "Status Check",
                          cell: (r) => (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Fully Matched
                            </span>
                          ),
                        },
                      ]}
                      mobileCard={(r) => <div>{r.ref}</div>}
                    />
                  </div>
                </div>
              )}

              {activeTab === "eliminations" && (
                <div className="card-soft p-5 space-y-3">
                  <CardHeader title="Elimination Journal Postings (YTD)" />
                  <div className="p-4 bg-secondary/30 rounded-xl flex gap-3 text-xs text-muted-foreground border border-border">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="font-bold text-foreground block mb-0.5">
                        Automated Elimination Posting Rule
                      </span>
                      All intercompany accounts payable/receivable balances are eliminated against
                      parent investments to remove group sales duplication.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "process" && (
                <div className="card-soft p-5 text-center py-10">
                  <Settings className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
                  <span className="font-bold text-sm text-foreground block">
                    Consolidation Engine Process Configuration
                  </span>
                  <span className="text-muted-foreground text-xs block max-w-sm mx-auto mt-1">
                    Define exchange rate rules, automatic reconciliation targets, and validation
                    warnings threshold.
                  </span>
                </div>
              )}

              {activeTab === "reports" && (
                <div className="card-soft p-5 space-y-3">
                  <CardHeader title="Consolidated Financial Reports Archives" />
                  <div className="grid gap-3.5 mt-3 sm:grid-cols-3">
                    <div
                      className="p-4 border border-border rounded-xl hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleOpenReport("Consolidation")}
                    >
                      <FileText className="h-6 w-6 text-primary mb-2" />
                      <span className="font-bold text-xs text-foreground block">
                        Consolidated Balance Sheet
                      </span>
                      <span className="text-muted-foreground text-[10px] block mt-0.5">
                        PDF • Compiled Apr 12, 2025
                      </span>
                    </div>
                    <div
                      className="p-4 border border-border rounded-xl hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleOpenReport("Intercompany")}
                    >
                      <FileText className="h-6 w-6 text-primary mb-2" />
                      <span className="font-bold text-xs text-foreground block">
                        Intercompany Balance Audit Report
                      </span>
                      <span className="text-muted-foreground text-[10px] block mt-0.5">
                        PDF • Compiled Apr 10, 2025
                      </span>
                    </div>
                    <div
                      className="p-4 border border-border rounded-xl hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleOpenReport("Elimination")}
                    >
                      <FileText className="h-6 w-6 text-primary mb-2" />
                      <span className="font-bold text-xs text-foreground block">
                        Elimination Ledger Audit Trail
                      </span>
                      <span className="text-muted-foreground text-[10px] block mt-0.5">
                        PDF • Compiled Apr 08, 2025
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-5">
              {/* Consolidation Progress Circular progress */}
              <div className="card-soft p-5">
                <CardHeader title="Consolidation Progress" />

                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[{ value: 100 }, { value: 0 }]}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={0}
                          stroke="none"
                        >
                          <Cell fill="var(--primary)" />
                          <Cell fill="#E5E7EB" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[14px] font-bold text-foreground">
                          {data.progress.percentage}%
                        </div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-wider">
                          Complete
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-2 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Data Collected
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.progress.dataCollected}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Intercompany Matching
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.progress.intercompanyMatching}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Eliminations
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.progress.eliminations}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        Consolidation
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.progress.consolidation}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Intercompany Balance Trend */}
              <div className="card-soft p-5">
                <CardHeader title="Intercompany Balance (YTD)" />

                <div className="mt-3">
                  <span className="font-bold text-lg text-foreground block tabular">
                    {formatCurrency(1245780.0)}
                  </span>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-0.5">
                    <span>Variance: ₹0</span>
                    <span className="text-green-600 font-semibold flex items-center gap-0.5">
                      <Check className="h-3 w-3" /> All balances matched
                    </span>
                  </div>
                </div>

                <div className="h-[120px] w-full mt-3">
                  <ResponsiveContainer>
                    <LineChart
                      data={data.intercompanyTrend}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#9CA3AF"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${(v / 1_00_00_000).toFixed(1)}Cr`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 10,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--primary)"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Intercompany Transactions */}
              <div className="card-soft p-5 space-y-3">
                <CardHeader title="Top Intercompany Transactions" />

                <div className="space-y-3 mt-3">
                  {data.topIntercompany.slice(0, 3).map((trx, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs py-1 border-b border-border/40"
                    >
                      <div>
                        <span className="font-semibold text-foreground block">
                          {trx.fromEntity.replace("Magnertia ", "")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          → {trx.toEntity.replace("Magnertia ", "")}
                        </span>
                      </div>
                      <span className="font-bold text-foreground tabular">
                        {formatCurrency(trx.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab("intercompany")}
                  className="text-primary text-[11px] font-bold flex items-center gap-1 mt-1 hover:underline"
                >
                  View All Transactions <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTION DIALOGS --- */}

      {/* 1. Run Consolidation Progress Modal */}
      <Dialog open={runOpen} onOpenChange={setRunOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Run Financial Consolidation Run</DialogTitle>
            <DialogDescription>
              Execute full currency translations and post intercompany elimination ledger entries.
            </DialogDescription>
          </DialogHeader>

          {runMutation.isPending || isValidating ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Running consolidation steps...</span>
                <span>{Math.round((runStep / 5) * 100)}%</span>
              </div>
              <Progress value={(runStep / 5) * 100} className="h-2" />

              <div className="bg-secondary/40 rounded-xl p-3 border border-border font-mono text-[10px] space-y-1.5 max-h-[150px] overflow-y-auto">
                {runLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 text-green-600">
                    <span>✔</span>
                    <span>{log}</span>
                  </div>
                ))}
                {isValidating && (
                  <div className="flex gap-2 text-primary animate-pulse">
                    <span>⚙</span>
                    <span>Running translation matrix calculations...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-3">
              <div className="bg-secondary/30 rounded-xl p-4 border border-border flex gap-3 text-xs text-muted-foreground">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block mb-0.5">Ready to Consolide</span>
                  Executing will lock subsidiary local ledger adjustments and generate elimination
                  adjustment entries.
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton
              variant="outline"
              disabled={runMutation.isPending}
              onClick={() => setRunOpen(false)}
            >
              Cancel
            </ErpButton>
            <ErpButton onClick={handleRunSubmit} loading={runMutation.isPending || isValidating}>
              <Play className="mr-1.5 h-4 w-4" />
              <span>Execute Consolidation</span>
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Data Validation Dialog */}
      <Dialog open={validationOpen} onOpenChange={setValidationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Entity Ledgers Validation Check</DialogTitle>
            <DialogDescription>
              Verify trial balances mapping status and translation criteria.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 border border-border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
            <DataTable<EntityValidationResult>
              data={data?.validations ?? []}
              columns={[
                {
                  key: "checkName",
                  header: "Audit Point Check",
                  cell: (r) => <span className="font-bold text-foreground">{r.checkName}</span>,
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => (
                    <span className="text-green-600 font-bold flex items-center gap-0.5">
                      <CheckCircle className="h-3.5 w-3.5" /> Passed
                    </span>
                  ),
                },
                {
                  key: "message",
                  header: "Description",
                  cell: (r) => <span className="text-muted-foreground">{r.message}</span>,
                },
              ]}
              mobileCard={(r) => <div>{r.checkName}</div>}
            />
          </div>

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton variant="outline" onClick={() => setValidationOpen(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Manage Account Mapping Dialog */}
      <Dialog open={mappingOpen} onOpenChange={setMappingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Account Mapping Schema Manager</DialogTitle>
            <DialogDescription>
              Map subsidiary chart of accounts codes to consolidated holding group accounts.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleAddMapping}
            className="grid grid-cols-3 gap-2 mt-2 p-3 bg-secondary/20 rounded-xl border border-border"
          >
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                Subsidiary Account
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1100 - AR"
                value={newMap.sourceAccount}
                onChange={(e) => setNewMap((prev) => ({ ...prev, sourceAccount: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                Consolidated Account
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1105 - Consolidated AR"
                value={newMap.targetAccount}
                onChange={(e) => setNewMap((prev) => ({ ...prev, targetAccount: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <ErpButton type="submit" variant="outline" size="sm" className="w-full h-8">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Rule
              </ErpButton>
            </div>
          </form>

          <div className="mt-3 border border-border rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
            <DataTable<AccountMappingRecord>
              data={mappings}
              columns={[
                {
                  key: "entity",
                  header: "Entity",
                  cell: (r) => (
                    <span className="font-semibold text-muted-foreground">{r.entity}</span>
                  ),
                },
                {
                  key: "sourceAccount",
                  header: "Subsidiary Account Code",
                  cell: (r) => <span className="font-mono text-foreground">{r.sourceAccount}</span>,
                },
                {
                  key: "targetAccount",
                  header: "Consolidated Target Code",
                  cell: (r) => <span className="font-mono text-foreground">{r.targetAccount}</span>,
                },
                {
                  key: "actions",
                  header: "Action",
                  align: "center",
                  cell: (r) => (
                    <button
                      type="button"
                      onClick={() => handleRemoveMapping(r.id)}
                      className="text-destructive hover:underline font-semibold text-[10px]"
                    >
                      Remove
                    </button>
                  ),
                },
              ]}
              mobileCard={(r) => <div>{r.sourceAccount}</div>}
            />
          </div>

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton type="button" variant="outline" onClick={() => setMappingOpen(false)}>
              Cancel
            </ErpButton>
            <ErpButton
              type="button"
              onClick={handleSaveMappings}
              loading={mappingMutation.isPending}
            >
              Save Mappings Schema
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Report Preview Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>View Consolidated {reportType} Report</DialogTitle>
            <DialogDescription>
              Compiled multi-entity balance sheets and audit ledger trails.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-secondary/40 p-4 rounded-xl flex gap-3 text-xs text-muted-foreground mt-2">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div>
              <span className="font-bold text-foreground block mb-0.5">
                Statutory Group Audit Trail
              </span>
              Consolidated financial reports are generated in compliance with GAAP/IFRS translation
              rules.
            </div>
          </div>

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton variant="outline" onClick={() => setReportOpen(false)}>
              Close
            </ErpButton>
            <ErpButton
              onClick={() => {
                toast.success(`${reportType} audit report successfully exported and printed.`);
                setReportOpen(false);
              }}
            >
              Download PDF Report
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
