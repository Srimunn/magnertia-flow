import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Boxes,
  Plus,
  TrendingUp,
  Download,
  MoreHorizontal,
  ChevronDown,
  Search,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  GitCompare,
  FileCheck,
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
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetBand } from "@/widgets/components/WidgetBand";
import { FinanceTabBar } from "@/components/erp/FinanceTabBar";
import { ErpButton } from "@/components/erp/Button";
import { CardHeader } from "@/components/erp/CardHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
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
import {
  budgetService,
  departmentService,
  costCenterService,
  loadBudgetingDashboard,
} from "@/services";
import type {
  DepartmentBudget,
  CostCenterBudget,
  ProjectBudget,
  BudgetVersion,
  DashboardQuery,
} from "@/services/types";

export const Route = createFileRoute("/management/finance/budgeting")({
  head: () => ({
    meta: [
      { title: "Budgeting · Magnertia" },
      {
        name: "description",
        content: "Plan, monitor, and analyze budgets across departments and cost centers.",
      },
    ],
  }),
  component: BudgetingPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const BUDGET_SELECT_OPTIONS = [
  { label: "FY 2024-25 Annual Budget", value: "BV-001" },
  { label: "FY 2024-25 Budget - Revision 1", value: "BV-002" },
  { label: "FY 2024-25 Budget - Forecast", value: "BV-003" },
];

const VIEW_BY_OPTIONS = [
  { label: "Department", value: "department" },
  { label: "Cost Center", value: "cost-center" },
];

const COMPARE_WITH_OPTIONS = [
  { label: "Actual Expenses", value: "actual" },
  { label: "Prior Year Actuals", value: "prior-year" },
];

const PERIOD_OPTIONS = [
  { label: "April 2024 - March 2025", value: "all" },
  { label: "Q1 FY24 (Apr-Jun)", value: "q1" },
  { label: "Q2 FY24 (Jul-Sep)", value: "q2" },
];

function BudgetingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "overview" | "departments" | "cost-centers" | "projects" | "versions"
  >("overview");
  const [selectedBudget, setSelectedBudget] = useState("BV-001");
  const [viewBy, setViewBy] = useState("department");
  const [compareWith, setCompareWith] = useState("actual");
  const [period, setPeriod] = useState("all");

  // Search filter
  const [search, setSearch] = useState("");

  // Dialog States
  const [addOpen, setAddOpen] = useState(false);
  const [newVersionOpen, setNewVersionOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<BudgetVersion | null>(null);

  // Compare versions inputs
  const [compareV1, setCompareV1] = useState("BV-001");
  const [compareV2, setCompareV2] = useState("BV-002");

  // Input states
  const [newBudgetInput, setNewBudgetInput] = useState<{
    name: string;
    totalBudget: number;
    type: BudgetVersion["type"];
    status: "Active" | "Draft";
    createdBy: string;
  }>({
    name: "",
    totalBudget: 0,
    type: "Original",
    status: "Active",
    createdBy: "Amit Mehra",
  });

  const [newVersionInput, setNewVersionInput] = useState<{
    parentVersionId: string;
    name: string;
    type: BudgetVersion["type"];
    totalBudget: number;
    createdBy: string;
  }>({
    parentVersionId: "BV-001",
    name: "",
    type: "Revision",
    totalBudget: 0,
    createdBy: "Amit Mehra",
  });

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ["budgeting", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadBudgetingDashboard(QUERY),
  });

  const deptsQuery = useQuery({
    queryKey: ["budgeting", "departments"],
    queryFn: () => departmentService.fetchDepartmentBudgets(QUERY),
  });

  const costCentersQuery = useQuery({
    queryKey: ["budgeting", "cost-centers"],
    queryFn: () => costCenterService.fetchCostCenterBudgets(QUERY),
  });

  const projectsQuery = useQuery({
    queryKey: ["budgeting", "projects"],
    queryFn: () => budgetService.fetchProjectBudgets(QUERY),
  });

  const versionsQuery = useQuery({
    queryKey: ["budgeting", "versions"],
    queryFn: () => budgetService.fetchBudgetVersions(QUERY),
  });

  const comparisonQuery = useQuery({
    queryKey: ["budgeting", "comparison", compareV1, compareV2],
    queryFn: () => budgetService.compareBudgetVersions(compareV1, compareV2),
    enabled: compareOpen,
  });

  // Mutations
  const createBudgetMutation = useMutation({
    mutationFn: budgetService.saveBudget,
    onSuccess: (newBudget) => {
      toast.success(`Budget "${newBudget.name}" successfully created.`);
      setAddOpen(false);
      setNewBudgetInput({
        name: "",
        totalBudget: 0,
        type: "Original",
        status: "Active",
        createdBy: "Amit Mehra",
      });
      queryClient.invalidateQueries({ queryKey: ["budgeting"] });
    },
    onError: () => toast.error("Failed to create new budget."),
  });

  const createVersionMutation = useMutation({
    mutationFn: budgetService.saveBudgetVersion,
    onSuccess: (newVer) => {
      toast.success(`Budget revision "${newVer.name}" saved as draft.`);
      setNewVersionOpen(false);
      setNewVersionInput({
        parentVersionId: "BV-001",
        name: "",
        type: "Revision",
        totalBudget: 0,
        createdBy: "Amit Mehra",
      });
      queryClient.invalidateQueries({ queryKey: ["budgeting"] });
    },
    onError: () => toast.error("Failed to create new revision."),
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetInput.name || !newBudgetInput.totalBudget) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createBudgetMutation.mutate(newBudgetInput);
  };

  const handleVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionInput.name || !newVersionInput.totalBudget) {
      toast.error("Please fill in all fields.");
      return;
    }
    createVersionMutation.mutate(newVersionInput);
  };

  const isLoading = dashboardQuery.isLoading;
  const data = dashboardQuery.data;

  // Filter department list by search
  const filteredDepts = (deptsQuery.data || []).filter((d) =>
    d.department.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell
      title="Finance"
      breadcrumb="Management"
      description="Plan, allocate, and monitor budgets across departments and cost centers."
      tabs={<FinanceTabBar />}
      topbarActions={
        <ErpButton onClick={() => setAddOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Budget</span>
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
          {/* KPI Header Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Total Budget"
              value={formatCurrency(data.kpis.totalBudget)}
              neutralText="This Fiscal Year"
              icon={<Boxes className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Total Actual"
              value={formatCurrency(data.kpis.totalActual)}
              neutralText="This Fiscal Year"
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Budget Utilization"
              value={`${data.kpis.budgetUtilization}%`}
              neutralText="This Fiscal Year"
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-[#F59E0B]/10"
              iconColor="text-[#F59E0B]"
            />
            <StatCard
              label="Variance (Favorable)"
              value={formatCurrency(data.kpis.variance)}
              neutralText="This Fiscal Year"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Budgets"
              value={data.kpis.activeBudgetsCount.toString()}
              neutralText="Active Budgets"
              icon={<FileCheck className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Customizable widget band (empty by default) */}
          <WidgetBand pageId="finance-budgeting" />

          {/* Main Layout */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Column */}
            <div className="min-w-0 space-y-5">
              {/* Tab Navigation & Sub Header Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      { label: "Budget Overview", value: "overview" },
                      { label: "Department Budgets", value: "departments" },
                      { label: "Cost Center Budgets", value: "cost-centers" },
                      { label: "Projects", value: "projects" },
                      { label: "Budget Versions", value: "versions" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.value}
                      onClick={() => {
                        setActiveTab(t.value);
                        if (t.value === "departments") setViewBy("department");
                        if (t.value === "cost-centers") setViewBy("cost-center");
                      }}
                      className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors -mb-[2px] ${
                        activeTab === t.value
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <ErpButton
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Exporting budget data...")}
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
                      <DropdownMenuItem onClick={() => setNewVersionOpen(true)}>
                        Create Revision
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCompareOpen(true)}>
                        Compare Revisions
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tab Panels */}
              <div className="space-y-5">
                {/* 1. BUDGET OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <>
                    {/* View Controls toolbar */}
                    <div className="flex flex-wrap items-center gap-3.5 card-soft p-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Budget
                        </label>
                        <select
                          value={selectedBudget}
                          onChange={(e) => setSelectedBudget(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          {BUDGET_SELECT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          View By
                        </label>
                        <select
                          value={viewBy}
                          onChange={(e) => setViewBy(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          {VIEW_BY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Compare With
                        </label>
                        <select
                          value={compareWith}
                          onChange={(e) => setCompareWith(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          {COMPARE_WITH_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Period
                        </label>
                        <select
                          value={period}
                          onChange={(e) => setPeriod(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          {PERIOD_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1" />

                      <div className="relative max-w-xs w-full self-end">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Department Summary Table */}
                    {viewBy === "department" ? (
                      <div className="card-soft overflow-hidden">
                        <DataTable<DepartmentBudget>
                          data={filteredDepts}
                          columns={[
                            {
                              key: "department",
                              header: "Department",
                              cell: (r) => (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-foreground font-semibold font-mono text-[10px]">
                                    &gt;
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    {r.department}
                                  </span>
                                </div>
                              ),
                            },
                            {
                              key: "budget",
                              header: "Total Budget (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="font-medium tabular text-foreground">
                                  {formatCurrency(r.budget)}
                                </span>
                              ),
                            },
                            {
                              key: "actual",
                              header: "Total Actual (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular text-muted-foreground">
                                  {formatCurrency(r.actual)}
                                </span>
                              ),
                            },
                            {
                              key: "variance",
                              header: "Variance (₹)",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`font-semibold tabular ${r.variance >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {formatCurrency(r.variance)}
                                </span>
                              ),
                            },
                            {
                              key: "variancePct",
                              header: "Variance %",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`font-semibold tabular ${r.variance >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {r.variancePct.toFixed(2)}%
                                </span>
                              ),
                            },
                            {
                              key: "utilization",
                              header: "Budget Utilization",
                              cell: (r) => (
                                <div className="flex items-center gap-2.5 min-w-[120px]">
                                  <Progress value={r.utilization} className="h-2 flex-1" />
                                  <span className="font-bold tabular text-xs text-foreground shrink-0">
                                    {r.utilization}%
                                  </span>
                                </div>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-2">
                              <div className="flex justify-between font-semibold">
                                <span>{r.department}</span>
                                <span>{formatCurrency(r.budget)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Actual: {formatCurrency(r.actual)}</span>
                                <span
                                  className={
                                    r.variance >= 0 ? "text-green-600" : "text-destructive"
                                  }
                                >
                                  Var: {formatCurrency(r.variance)} ({r.variancePct}%)
                                </span>
                              </div>
                              <Progress value={r.utilization} className="h-1.5" />
                            </div>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="card-soft overflow-hidden">
                        <DataTable<CostCenterBudget>
                          data={costCentersQuery.data as unknown as CostCenterBudget[]}
                          columns={[
                            {
                              key: "costCenter",
                              header: "Cost Center",
                              cell: (r) => (
                                <div>
                                  <span className="font-semibold text-foreground block">
                                    {r.costCenter}
                                  </span>
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    {r.code}
                                  </span>
                                </div>
                              ),
                            },
                            {
                              key: "budget",
                              header: "Budget",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold tabular">
                                  {formatCurrency(r.budget)}
                                </span>
                              ),
                            },
                            {
                              key: "actual",
                              header: "Actual",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular text-muted-foreground">
                                  {formatCurrency(r.actual)}
                                </span>
                              ),
                            },
                            {
                              key: "variance",
                              header: "Variance",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`font-semibold tabular ${r.variance >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {formatCurrency(r.variance)}
                                </span>
                              ),
                            },
                            {
                              key: "utilization",
                              header: "Utilization",
                              cell: (r) => (
                                <div className="flex items-center gap-2 min-w-[120px]">
                                  <Progress value={r.utilization} className="h-2 flex-1" />
                                  <span className="font-bold text-xs shrink-0">
                                    {r.utilization}%
                                  </span>
                                </div>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-1">
                              <div className="flex justify-between font-semibold">
                                <span>
                                  {r.costCenter} ({r.code})
                                </span>
                                <span>{formatCurrency(r.budget)}</span>
                              </div>
                              <Progress value={r.utilization} className="h-1.5" />
                            </div>
                          )}
                        />
                      </div>
                    )}

                    {/* Bottom Budget Versions Registry */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-base text-foreground">Budget Versions</h3>
                        <button
                          onClick={() => setActiveTab("versions")}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View All Budget Versions →
                        </button>
                      </div>

                      <div className="card-soft overflow-hidden">
                        <DataTable<BudgetVersion>
                          data={(versionsQuery.data || []).slice(0, 3)}
                          columns={[
                            {
                              key: "name",
                              header: "Version Name",
                              cell: (r) => (
                                <button
                                  onClick={() => setSelectedVersion(r)}
                                  className="font-semibold text-primary hover:underline text-left"
                                >
                                  {r.name}
                                </button>
                              ),
                            },
                            {
                              key: "type",
                              header: "Version Type",
                              cell: (r) => <span className="text-muted-foreground">{r.type}</span>,
                            },
                            {
                              key: "status",
                              header: "Status",
                              cell: (r) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    r.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : r.status === "Draft"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              ),
                            },
                            {
                              key: "totalBudget",
                              header: "Total Budget (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold text-foreground tabular">
                                  {formatCurrency(r.totalBudget)}
                                </span>
                              ),
                            },
                            {
                              key: "createdBy",
                              header: "Created By",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.createdBy}</span>
                              ),
                            },
                            {
                              key: "lastUpdated",
                              header: "Last Updated",
                              cell: (r) => (
                                <span className="text-muted-foreground text-xs">
                                  {r.lastUpdated}
                                </span>
                              ),
                            },
                            {
                              key: "actions",
                              header: "Actions",
                              align: "center",
                              cell: (r) => (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted">
                                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedVersion(r)}>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCompareV1(r.id);
                                        setCompareOpen(true);
                                      }}
                                    >
                                      Compare Revision
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-1">
                              <div className="flex justify-between font-semibold">
                                <span>{r.name}</span>
                                <span>{formatCurrency(r.totalBudget)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {r.type} • {r.status}
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 2. DEPARTMENT BUDGETS TAB */}
                {activeTab === "departments" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Departmental Cost Allocations</h3>
                    <div className="card-soft overflow-hidden">
                      {deptsQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading departments...
                        </div>
                      ) : (
                        <DataTable<DepartmentBudget>
                          data={deptsQuery.data || []}
                          columns={[
                            {
                              key: "department",
                              header: "Department",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.department}</span>
                              ),
                            },
                            {
                              key: "budget",
                              header: "Budget (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold tabular">
                                  {formatCurrency(r.budget)}
                                </span>
                              ),
                            },
                            {
                              key: "actual",
                              header: "Actual (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular text-muted-foreground">
                                  {formatCurrency(r.actual)}
                                </span>
                              ),
                            },
                            {
                              key: "variance",
                              header: "Variance",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`font-semibold tabular ${r.variance >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {formatCurrency(r.variance)}
                                </span>
                              ),
                            },
                            {
                              key: "utilization",
                              header: "Utilization",
                              cell: (r) => (
                                <div className="flex items-center gap-2 min-w-[150px]">
                                  <Progress value={r.utilization} className="h-2 flex-1" />
                                  <span className="font-bold text-xs">{r.utilization}%</span>
                                </div>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-1">
                              <div className="flex justify-between font-semibold">
                                <span>{r.department}</span>
                                <span>{formatCurrency(r.budget)}</span>
                              </div>
                              <Progress value={r.utilization} className="h-1.5" />
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 3. COST CENTER BUDGETS TAB */}
                {activeTab === "cost-centers" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Cost Center Allocations</h3>
                    <div className="card-soft overflow-hidden">
                      {costCentersQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading cost centers...
                        </div>
                      ) : (
                        <DataTable<CostCenterBudget>
                          data={costCentersQuery.data || []}
                          columns={[
                            {
                              key: "costCenter",
                              header: "Cost Center",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.costCenter}</span>
                              ),
                            },
                            {
                              key: "code",
                              header: "Code",
                              cell: (r) => (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {r.code}
                                </span>
                              ),
                            },
                            {
                              key: "budget",
                              header: "Budget (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold tabular">
                                  {formatCurrency(r.budget)}
                                </span>
                              ),
                            },
                            {
                              key: "actual",
                              header: "Actual (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular text-muted-foreground">
                                  {formatCurrency(r.actual)}
                                </span>
                              ),
                            },
                            {
                              key: "variance",
                              header: "Variance",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`font-semibold tabular ${r.variance >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {formatCurrency(r.variance)}
                                </span>
                              ),
                            },
                            {
                              key: "utilization",
                              header: "Utilization",
                              cell: (r) => (
                                <div className="flex items-center gap-2 min-w-[150px]">
                                  <Progress value={r.utilization} className="h-2 flex-1" />
                                  <span className="font-bold text-xs">{r.utilization}%</span>
                                </div>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-1">
                              <div className="flex justify-between font-semibold">
                                <span>{r.costCenter}</span>
                                <span>{formatCurrency(r.budget)}</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 4. PROJECTS TAB */}
                {activeTab === "projects" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Project Budgets Tracker</h3>
                    <div className="card-soft overflow-hidden">
                      {projectsQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading projects...
                        </div>
                      ) : (
                        <DataTable<ProjectBudget>
                          data={projectsQuery.data || []}
                          columns={[
                            {
                              key: "project",
                              header: "Project Name",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.project}</span>
                              ),
                            },
                            {
                              key: "manager",
                              header: "Project Manager",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.manager}</span>
                              ),
                            },
                            {
                              key: "budget",
                              header: "Budget (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold tabular">
                                  {formatCurrency(r.budget)}
                                </span>
                              ),
                            },
                            {
                              key: "actual",
                              header: "Actual (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular text-muted-foreground">
                                  {formatCurrency(r.actual)}
                                </span>
                              ),
                            },
                            {
                              key: "variance",
                              header: "Variance",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`font-semibold tabular ${r.variance >= 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {formatCurrency(r.variance)}
                                </span>
                              ),
                            },
                            {
                              key: "status",
                              header: "Health Status",
                              cell: (r) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    r.status === "On Track"
                                      ? "bg-green-100 text-green-800"
                                      : r.status === "At Risk"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              ),
                            },
                            {
                              key: "utilization",
                              header: "Utilization",
                              cell: (r) => (
                                <div className="flex items-center gap-2 min-w-[120px]">
                                  <Progress value={r.utilization} className="h-2 flex-1" />
                                  <span className="font-bold text-xs">{r.utilization}%</span>
                                </div>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-1">
                              <div className="flex justify-between font-semibold">
                                <span>{r.project}</span>
                                <span>{formatCurrency(r.budget)}</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 5. BUDGET VERSIONS TAB */}
                {activeTab === "versions" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2.5">
                      <div>
                        <h3 className="font-semibold text-lg">Budget Revisions and Versions</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Audits of all budget logs, forecasts, and draft versions.
                        </p>
                      </div>
                      <ErpButton size="sm" onClick={() => setCompareOpen(true)}>
                        <GitCompare className="mr-1.5 h-3.5 w-3.5" /> Compare Revisions
                      </ErpButton>
                    </div>

                    <div className="card-soft overflow-hidden">
                      {versionsQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading versions...
                        </div>
                      ) : (
                        <DataTable<BudgetVersion>
                          data={versionsQuery.data || []}
                          columns={[
                            {
                              key: "name",
                              header: "Version Name",
                              cell: (r) => (
                                <button
                                  onClick={() => setSelectedVersion(r)}
                                  className="font-semibold text-primary hover:underline"
                                >
                                  {r.name}
                                </button>
                              ),
                            },
                            {
                              key: "type",
                              header: "Type",
                              cell: (r) => <span className="text-muted-foreground">{r.type}</span>,
                            },
                            {
                              key: "status",
                              header: "Status",
                              cell: (r) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    r.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : r.status === "Draft"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              ),
                            },
                            {
                              key: "totalBudget",
                              header: "Total Allocation",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold text-foreground tabular">
                                  {formatCurrency(r.totalBudget)}
                                </span>
                              ),
                            },
                            {
                              key: "createdBy",
                              header: "Created By",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.createdBy}</span>
                              ),
                            },
                            {
                              key: "lastUpdated",
                              header: "Last Updated",
                              cell: (r) => (
                                <span className="text-muted-foreground text-xs">
                                  {r.lastUpdated}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-1">
                              <span className="font-semibold">{r.name}</span>
                              <div className="text-xs text-muted-foreground">
                                {r.type} • {formatCurrency(r.totalBudget)}
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-5">
              {/* Budget vs Actual Trend line chart */}
              <div className="card-soft p-5">
                <CardHeader
                  title="Budget vs Actual Trend"
                  right={
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                      This Fiscal Year
                    </span>
                  }
                />

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3 mt-1.5">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Budget
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" /> Actual
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Forecast
                  </span>
                </div>

                <div className="h-[150px] w-full">
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
                        formatter={(v: number) => formatCurrency(v, true)}
                      />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        stroke="#22C55E"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#22C55E"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Variance by Department Horizontal Bar Chart */}
              <div className="card-soft p-5">
                <CardHeader title="Variance by Department" />
                <div className="h-[180px] w-full mt-3">
                  <ResponsiveContainer>
                    <BarChart
                      data={data.varianceByDept}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                      <XAxis
                        type="number"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${(v / 1_00_00_000).toFixed(1)}Cr`}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#9CA3AF"
                        fontSize={9}
                        width={80}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                        formatter={(v: number) => formatCurrency(v, true)}
                      />
                      <Bar dataKey="variance" fill="#10B981" radius={[0, 4, 4, 0]} barSize={8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Budget Health Pie Chart */}
              <div className="card-soft p-5">
                <CardHeader title="Budget Health" />

                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "On Track", value: data.health.onTrackCount, color: "#10B981" },
                            { name: "At Risk", value: data.health.atRiskCount, color: "#F59E0B" },
                            {
                              name: "Over Budget",
                              value: data.health.overBudgetCount,
                              color: "#EF4444",
                            },
                          ]}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          stroke="none"
                        >
                          <Cell fill="#10B981" />
                          <Cell fill="#F59E0B" />
                          <Cell fill="#EF4444" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[15px] font-bold text-foreground">
                          {data.kpis.activeBudgetsCount}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Total Budgets
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-1.5 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-green-500" /> On Track
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.health.onTrackCount} ({data.health.onTrackPct}%)
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" /> At Risk
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.health.atRiskCount} ({data.health.atRiskPct}%)
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-red-500" /> Over Budget
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.health.overBudgetCount} ({data.health.overBudgetPct}%)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTION DIALOGS --- */}

      {/* 1. Add New Budget Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Annual Budget</DialogTitle>
            <DialogDescription>
              Setup a new master budget for the upcoming financial term.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Budget Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY 2024-25 Master Corporate Budget"
                  value={newBudgetInput.name}
                  onChange={(e) => setNewBudgetInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Total Allocation (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="25000000"
                    value={newBudgetInput.totalBudget || ""}
                    onChange={(e) =>
                      setNewBudgetInput((prev) => ({
                        ...prev,
                        totalBudget: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Budget Type
                  </label>
                  <select
                    value={newBudgetInput.type}
                    onChange={(e) =>
                      setNewBudgetInput((prev) => ({
                        ...prev,
                        type: e.target.value as BudgetVersion["type"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    <option value="Original">Original</option>
                    <option value="Revision">Revision</option>
                    <option value="Forecast">Forecast</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={createBudgetMutation.isPending}>
                Create Budget
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Create Budget Revision Dialog */}
      <Dialog open={newVersionOpen} onOpenChange={setNewVersionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Budget Revision / Forecast</DialogTitle>
            <DialogDescription>
              Create a draft revision branched off an existing active budget version.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVersionSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Parent Budget Version *
                </label>
                <select
                  value={newVersionInput.parentVersionId}
                  onChange={(e) =>
                    setNewVersionInput((prev) => ({ ...prev, parentVersionId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                >
                  {(versionsQuery.data || []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({formatCurrency(v.totalBudget)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Revision Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY 2024-25 Budget - Revision 2"
                  value={newVersionInput.name}
                  onChange={(e) =>
                    setNewVersionInput((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    New Total Budget (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="25500000"
                    value={newVersionInput.totalBudget || ""}
                    onChange={(e) =>
                      setNewVersionInput((prev) => ({
                        ...prev,
                        totalBudget: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Revision Type
                  </label>
                  <select
                    value={newVersionInput.type}
                    onChange={(e) =>
                      setNewVersionInput((prev) => ({
                        ...prev,
                        type: e.target.value as BudgetVersion["type"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    <option value="Revision">Revision</option>
                    <option value="Forecast">Forecast</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setNewVersionOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={createVersionMutation.isPending}>
                Save Revision
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Compare Revisions Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Compare Budget Revisions</DialogTitle>
            <DialogDescription>
              Analyze allocations shifts and variances side-by-side between budget versions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3.5 mb-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Base Version
              </label>
              <select
                value={compareV1}
                onChange={(e) => setCompareV1(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
              >
                {(versionsQuery.data || []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Comparison Version
              </label>
              <select
                value={compareV2}
                onChange={(e) => setCompareV2(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
              >
                {(versionsQuery.data || []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {comparisonQuery.isLoading || !comparisonQuery.data ? (
            <div className="h-48 flex items-center justify-center">
              Loading comparison report...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-secondary/30 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                    Base Total
                  </span>
                  <span className="font-semibold text-foreground text-sm tabular">
                    {formatCurrency(comparisonQuery.data.version1.totalBudget)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                    Comp. Total
                  </span>
                  <span className="font-semibold text-foreground text-sm tabular">
                    {formatCurrency(comparisonQuery.data.version2.totalBudget)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                    Difference
                  </span>
                  <span
                    className={`font-bold text-sm tabular ${comparisonQuery.data.totalDifference >= 0 ? "text-green-600" : "text-destructive"}`}
                  >
                    {comparisonQuery.data.totalDifference >= 0 ? "+" : ""}
                    {formatCurrency(comparisonQuery.data.totalDifference)} (
                    {comparisonQuery.data.differencePct.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="max-h-[220px] overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted text-muted-foreground sticky top-0 border-b border-border">
                    <tr>
                      <th className="p-2.5 font-semibold">Department</th>
                      <th className="p-2.5 text-right font-semibold">Base (₹)</th>
                      <th className="p-2.5 text-right font-semibold">Comparison (₹)</th>
                      <th className="p-2.5 text-right font-semibold">Shift (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonQuery.data.departmentDifferences.map((d, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/30">
                        <td className="p-2.5 font-medium text-foreground">{d.department}</td>
                        <td className="p-2.5 text-right text-muted-foreground tabular">
                          {formatCurrency(d.v1Amount)}
                        </td>
                        <td className="p-2.5 text-right text-foreground tabular">
                          {formatCurrency(d.v2Amount)}
                        </td>
                        <td
                          className={`p-2.5 text-right font-bold tabular ${d.difference > 0 ? "text-green-600" : d.difference < 0 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {d.difference > 0 ? "+" : ""}
                          {formatCurrency(d.difference)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton variant="outline" onClick={() => setCompareOpen(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Version Details Dialog */}
      <Dialog open={!!selectedVersion} onOpenChange={(open) => !open && setSelectedVersion(null)}>
        <DialogContent className="max-w-md">
          {selectedVersion && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle>{selectedVersion.name}</DialogTitle>
                    <span className="text-xs text-muted-foreground">
                      {selectedVersion.type} Revision
                    </span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Version ID</span>
                    <span className="font-semibold text-foreground">{selectedVersion.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Status</span>
                    <span
                      className={`inline-flex items-center text-xs font-semibold ${selectedVersion.status === "Active" ? "text-green-700" : "text-yellow-700"}`}
                    >
                      {selectedVersion.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Created By</span>
                    <span className="font-semibold text-foreground">
                      {selectedVersion.createdBy}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Last Updated</span>
                    <span className="font-semibold text-foreground">
                      {selectedVersion.lastUpdated}
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-border pt-2.5">
                    <span className="text-xs text-muted-foreground block">
                      Total Allocated Amount
                    </span>
                    <span className="font-bold text-primary text-base tabular">
                      {formatCurrency(selectedVersion.totalBudget)}
                    </span>
                  </div>
                </div>

                <div className="bg-secondary/40 p-3 rounded-lg flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground block mb-0.5">Control Logs</span>
                    This revision is currently locked under corporate policy rules. Run comparisons
                    or submit for review before final activation.
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-5 border-t border-border pt-3">
                <ErpButton
                  variant="outline"
                  onClick={() => {
                    setCompareV2(selectedVersion.id);
                    setCompareOpen(true);
                    setSelectedVersion(null);
                  }}
                >
                  <GitCompare className="mr-1.5 h-3.5 w-3.5" /> Compare Version
                </ErpButton>
                <ErpButton variant="outline" onClick={() => setSelectedVersion(null)}>
                  Close
                </ErpButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
