import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus,
  Download,
  ChevronDown,
  Search,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  FolderTree,
  Building,
  Upload,
  Calendar,
  Layers,
  FileText,
  User,
  DollarSign,
  ChevronRight,
  Sparkles,
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
import { company, formatCurrency, mockCostCenterCommitments } from "@/lib/mock-data";
import { costCenterService, budgetService, loadCostCentersDashboard } from "@/services";
import type {
  CostCenterRecord,
  NewCostCenterInput,
  NewSubCostCenterInput,
  DashboardQuery,
  CostCenterHierarchyNode,
} from "@/services/types";

export const Route = createFileRoute("/management/finance/cost-centers")({
  head: () => ({
    meta: [
      { title: "Cost Centers · Magnertia" },
      {
        name: "description",
        content: "Manage, monitor, and analyze cost center performance across the organization.",
      },
    ],
  }),
  component: CostCentersPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const TYPES = ["Operational", "Support", "Administrative", "Revenue-Generating"];

const DEPARTMENTS = [
  "Administration",
  "Finance",
  "Marketing",
  "Sales",
  "IT",
  "HR",
  "R&D",
  "Operations",
];

function CostCentersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "overview" | "hierarchy" | "budgets" | "actuals" | "commitments" | "reports"
  >("overview");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");

  // Dialog States
  const [ccOpen, setCcOpen] = useState(false);
  const [subCcOpen, setSubCcOpen] = useState(false);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Form Inputs
  const [newCcInput, setNewCcInput] = useState<NewCostCenterInput>({
    code: "",
    name: "",
    department: "Administration",
    manager: "Amit Mehra",
    budget: 0,
    type: "Operational",
    parentId: "",
  });

  const [newSubCcInput, setNewSubCcInput] = useState<NewSubCostCenterInput>({
    parentId: "Administration",
    code: "",
    name: "",
    department: "Administration",
    manager: "Amit Mehra",
    budget: 0,
  });

  const [budgetAllocationInput, setBudgetAllocationInput] = useState({
    costCenterId: "CC-001",
    increaseAmount: 0,
    reason: "Project Expansion Allocation",
  });

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ["costCenters", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadCostCentersDashboard(QUERY),
  });

  // Mutations
  const ccMutation = useMutation({
    mutationFn: costCenterService.createCostCenter,
    onSuccess: (newCc) => {
      toast.success(`Cost Center created successfully: [${newCc.code}] ${newCc.name}`);
      setCcOpen(false);
      setNewCcInput({
        code: "",
        name: "",
        department: "Administration",
        manager: "Amit Mehra",
        budget: 0,
        type: "Operational",
        parentId: "",
      });
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
    },
    onError: () => toast.error("Failed to create cost center."),
  });

  const subCcMutation = useMutation({
    mutationFn: costCenterService.createSubCostCenter,
    onSuccess: (newCc) => {
      toast.success(
        `Sub Cost Center created: [${newCc.code}] ${newCc.name} under ${newCc.parentId}`,
      );
      setSubCcOpen(false);
      setNewSubCcInput({
        parentId: "Administration",
        code: "",
        name: "",
        department: "Administration",
        manager: "Amit Mehra",
        budget: 0,
      });
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
    },
    onError: () => toast.error("Failed to create sub cost center."),
  });

  const allocateMutation = useMutation({
    mutationFn: (args: typeof budgetAllocationInput) => {
      return new Promise((resolve) => setTimeout(() => resolve(args), 500));
    },
    onSuccess: () => {
      toast.success("Budget funds allocated successfully.");
      setAllocateOpen(false);
      setBudgetAllocationInput({
        costCenterId: "CC-001",
        increaseAmount: 0,
        reason: "Project Expansion Allocation",
      });
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
    },
    onError: () => toast.error("Failed to allocate budget funds."),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: { name: string }) => {
      return new Promise((resolve) => setTimeout(() => resolve(file), 500));
    },
    onSuccess: () => {
      toast.success("Budget spreadsheet uploaded and parsed successfully.");
      setUploadOpen(false);
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
    },
    onError: () => toast.error("Failed to parse budget sheet."),
  });

  const handleCcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCcInput.code || !newCcInput.name || !newCcInput.budget) {
      toast.error("Please fill in all required fields.");
      return;
    }
    ccMutation.mutate(newCcInput);
  };

  const handleSubCcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCcInput.code || !newSubCcInput.name || !newSubCcInput.budget) {
      toast.error("Please fill in all required fields.");
      return;
    }
    subCcMutation.mutate(newSubCcInput);
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAllocationInput.increaseAmount) {
      toast.error("Please specify a valid allocation amount.");
      return;
    }
    allocateMutation.mutate(budgetAllocationInput);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate({ name: "fy2025_cost_centers_budget.csv" });
  };

  const isLoading = dashboardQuery.isLoading;
  const data = dashboardQuery.data;

  // Filter cost centers
  const allCCs = data?.costCenters || [];
  const filteredCCs = allCCs.filter((cc) => {
    const matchesSearch =
      cc.code.toLowerCase().includes(search.toLowerCase()) ||
      cc.name.toLowerCase().includes(search.toLowerCase()) ||
      cc.manager.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || cc.type === typeFilter;
    const matchesStatus = statusFilter === "All" || cc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Hierarchy tree render helper
  const renderHierarchyNode = (node: CostCenterHierarchyNode, depth = 0) => {
    return (
      <div key={node.name} className="space-y-2">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            depth === 0
              ? "bg-primary/10 border-primary/20 text-primary font-bold text-sm"
              : depth === 1
                ? "bg-secondary/60 border-border text-foreground font-semibold text-xs ml-4"
                : "bg-background border-border text-muted-foreground text-[11px] ml-8"
          }`}
        >
          <FolderTree className="h-3.5 w-3.5 shrink-0" />
          <span>{node.name}</span>
        </div>
        {node.children && node.children.map((child) => renderHierarchyNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <AppShell
      title="Finance"
      breadcrumb="Management"
      description="Manage, monitor, and analyze cost center performance across the organization."
      tabs={<FinanceTabBar />}
      topbarActions={
        <ErpButton onClick={() => setCcOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Cost Center</span>
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
              label="Total Cost Centers"
              value={data.kpis.totalCostCenters.toString()}
              neutralText="Active Cost Centers"
              icon={<Building className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Total Budget (FY)"
              value={formatCurrency(data.kpis.totalBudget)}
              neutralText="This Fiscal Year"
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
            />
            <StatCard
              label="Total Actual (YTD)"
              value={formatCurrency(data.kpis.totalActual)}
              neutralText="This Fiscal Year"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
            />
            <StatCard
              label="Variance (Favorable)"
              value={formatCurrency(data.kpis.variance)}
              neutralText={`${data.kpis.variancePercentage}% of Budget`}
              icon={<Sparkles className="h-5 w-5" />}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
            />
            <StatCard
              label="Budget Utilization"
              value={`${data.kpis.budgetUtilization}%`}
              neutralText="This Fiscal Year"
              icon={<Layers className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Customizable widget band (empty by default) */}
          <WidgetBand pageId="finance-cost-centers" />

          {/* Main Layout Grid */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Column */}
            <div className="min-w-0 space-y-5">
              {/* Tab Navigation & Page Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      { label: "Cost Center Overview", value: "overview" },
                      { label: "Cost Center Hierarchy", value: "hierarchy" },
                      { label: "Budgets", value: "budgets" },
                      { label: "Actuals", value: "actuals" },
                      { label: "Commitments", value: "commitments" },
                      { label: "Reports", value: "reports" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setActiveTab(t.value)}
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
                    onClick={() => toast.info("Exporting cost centers report Excel...")}
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
                      <DropdownMenuItem onClick={() => setSubCcOpen(true)}>
                        Create Sub Center
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAllocateOpen(true)}>
                        Allocate Budget
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setUploadOpen(true)}>
                        Upload Budget Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tab Panels */}
              <div className="space-y-5">
                {/* 1. OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <>
                    {/* View Controls toolbar */}
                    <div className="flex flex-wrap items-center gap-3.5 card-soft p-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search by code, name, or manager..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          <option value="All">Type: All</option>
                          {TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>

                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          <option value="Active">Status: Active</option>
                          <option value="Inactive">Status: Inactive</option>
                          <option value="All">Status: All</option>
                        </select>
                      </div>
                    </div>

                    {/* Cost Centers List Table */}
                    <div className="card-soft overflow-hidden">
                      <DataTable<CostCenterRecord>
                        data={filteredCCs}
                        columns={[
                          {
                            key: "code",
                            header: "Cost Center Code",
                            cell: (r) => (
                              <span className="font-bold text-foreground">{r.code}</span>
                            ),
                          },
                          {
                            key: "name",
                            header: "Cost Center Name",
                            cell: (r) => (
                              <span className="font-semibold text-foreground">{r.name}</span>
                            ),
                          },
                          {
                            key: "department",
                            header: "Department",
                            cell: (r) => (
                              <span className="text-muted-foreground">{r.department}</span>
                            ),
                          },
                          {
                            key: "manager",
                            header: "Manager",
                            cell: (r) => <span className="text-foreground">{r.manager}</span>,
                          },
                          {
                            key: "budget",
                            header: "Budget (₹)",
                            align: "right",
                            cell: (r) => (
                              <span className="font-semibold text-foreground tabular">
                                {formatCurrency(r.budget)}
                              </span>
                            ),
                          },
                          {
                            key: "actual",
                            header: "Actual (₹)",
                            align: "right",
                            cell: (r) => (
                              <span className="font-semibold text-foreground tabular">
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
                                className={`font-semibold tabular ${r.variance < 0 ? "text-destructive" : "text-green-600"}`}
                              >
                                {formatCurrency(r.variance)}
                              </span>
                            ),
                          },
                          {
                            key: "utilization",
                            header: "Utilization",
                            align: "right",
                            cell: (r) => (
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={r.utilization} className="h-1.5 w-12" />
                                <span className="font-semibold tabular text-xs">
                                  {r.utilization.toFixed(2)}%
                                </span>
                              </div>
                            ),
                          },
                          {
                            key: "status",
                            header: "Status",
                            cell: (r) => (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  r.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {r.status}
                              </span>
                            ),
                          },
                        ]}
                        mobileCard={(r) => (
                          <div className="space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span>{r.name}</span>
                              <span>{formatCurrency(r.actual)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Budget: {formatCurrency(r.budget)} • {r.status}
                            </div>
                          </div>
                        )}
                      />
                    </div>

                    {/* Bottom Hierarchy Graphic & Totals Combo */}
                    <div className="grid gap-5 md:grid-cols-2">
                      {/* Cost Center Mini Hierarchy Widget */}
                      <div className="card-soft p-5 space-y-3">
                        <CardHeader title="Cost Center Hierarchy" />
                        <div className="space-y-2 mt-3 p-3 bg-secondary/20 rounded-xl border border-border">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">
                              Total Organization
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-[10px] pl-3 border-l border-border mt-1">
                            <span className="bg-background border border-border px-2 py-1 rounded">
                              Administration
                            </span>
                            <span className="bg-background border border-border px-2 py-1 rounded">
                              Finance
                            </span>
                            <span className="bg-background border border-border px-2 py-1 rounded">
                              Operations
                            </span>
                            <span className="bg-background border border-border px-2 py-1 rounded">
                              Commercial
                            </span>
                            <span className="bg-background border border-border px-2 py-1 rounded">
                              Technology
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab("hierarchy")}
                          className="w-full text-center text-xs font-semibold text-primary hover:underline block mt-3"
                        >
                          View Full Hierarchy →
                        </button>
                      </div>

                      {/* Cost Center Summary Widget */}
                      <div className="card-soft p-5">
                        <CardHeader title="Cost Center Summary" />
                        <div className="space-y-3 mt-3 text-sm">
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Total Budget (₹)</span>
                            <span className="font-semibold text-foreground tabular">
                              {formatCurrency(data.summary.totalBudget)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Total Actual (₹)</span>
                            <span className="font-semibold text-foreground tabular">
                              {formatCurrency(data.summary.totalActual)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Total Commitments (₹)</span>
                            <span className="font-semibold text-foreground tabular">
                              {formatCurrency(data.summary.totalCommitments)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Total Forecast (₹)</span>
                            <span className="font-semibold text-primary tabular">
                              {formatCurrency(data.summary.totalForecast)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-muted-foreground font-semibold">
                              Budget Utilization
                            </span>
                            <span className="font-bold text-primary tabular">
                              {data.summary.budgetUtilization}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. HIERARCHY TAB */}
                {activeTab === "hierarchy" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Organizational Breakdown Structure</h3>
                    <div className="card-soft p-6 max-w-xl mx-auto space-y-4 bg-secondary/10">
                      {renderHierarchyNode(data.hierarchy)}
                    </div>
                  </div>
                )}

                {/* 3. BUDGETS TAB */}
                {activeTab === "budgets" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Allocated Budgets</h3>
                    <div className="card-soft overflow-hidden">
                      <DataTable<CostCenterRecord>
                        data={allCCs}
                        columns={[
                          {
                            key: "code",
                            header: "Code",
                            cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
                          },
                          {
                            key: "name",
                            header: "Cost Center",
                            cell: (r) => <span className="font-semibold">{r.name}</span>,
                          },
                          {
                            key: "type",
                            header: "Type",
                            cell: (r) => <span className="text-muted-foreground">{r.type}</span>,
                          },
                          {
                            key: "budget",
                            header: "Master Budget Allocation",
                            align: "right",
                            cell: (r) => (
                              <span className="font-semibold tabular text-foreground">
                                {formatCurrency(r.budget)}
                              </span>
                            ),
                          },
                        ]}
                        mobileCard={(r) => (
                          <div>
                            {r.name} - {formatCurrency(r.budget)}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* 4. ACTUALS TAB */}
                {activeTab === "actuals" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">YTD Ledger Actual Expense Entries</h3>
                    <div className="card-soft overflow-hidden">
                      <DataTable<CostCenterRecord>
                        data={allCCs}
                        columns={[
                          {
                            key: "code",
                            header: "Code",
                            cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
                          },
                          {
                            key: "name",
                            header: "Cost Center",
                            cell: (r) => <span className="font-semibold">{r.name}</span>,
                          },
                          {
                            key: "actual",
                            header: "Accumulated Actual Expense (YTD)",
                            align: "right",
                            cell: (r) => (
                              <span className="font-semibold tabular text-green-600">
                                {formatCurrency(r.actual)}
                              </span>
                            ),
                          },
                        ]}
                        mobileCard={(r) => (
                          <div>
                            {r.name} - {formatCurrency(r.actual)}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* 5. COMMITMENTS TAB */}
                {activeTab === "commitments" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Purchase Order & Contract Commitments</h3>
                    <div className="card-soft overflow-hidden">
                      <DataTable<(typeof mockCostCenterCommitments)[0]>
                        data={mockCostCenterCommitments}
                        columns={[
                          {
                            key: "id",
                            header: "Commitment ID",
                            cell: (r) => <span className="font-mono text-xs">{r.id}</span>,
                          },
                          {
                            key: "costCenter",
                            header: "Cost Center",
                            cell: (r) => <span className="font-semibold">{r.costCenter}</span>,
                          },
                          {
                            key: "description",
                            header: "Commitment Item / Contract Scope",
                            cell: (r) => (
                              <span className="text-muted-foreground">{r.description}</span>
                            ),
                          },
                          {
                            key: "commitmentAmount",
                            header: "Committed Amount (₹)",
                            align: "right",
                            cell: (r) => (
                              <span className="font-semibold tabular text-primary">
                                {formatCurrency(r.commitmentAmount)}
                              </span>
                            ),
                          },
                          {
                            key: "status",
                            header: "Status",
                            cell: (r) => (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                                {r.status}
                              </span>
                            ),
                          },
                        ]}
                        mobileCard={(r) => (
                          <div>
                            {r.id} - {formatCurrency(r.commitmentAmount)}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* 6. REPORTS TAB */}
                {activeTab === "reports" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Cost Center Analytics Reports</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="card-soft p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <span className="font-semibold block text-xs">
                              Cost Center Allocation Report
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Printable hierarchy allocation lists
                            </span>
                          </div>
                        </div>
                        <ErpButton
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info("Downloading Allocation Report...")}
                        >
                          Download
                        </ErpButton>
                      </div>

                      <div className="card-soft p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <span className="font-semibold block text-xs">
                              Variance Performance Summary
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Cost centers variance lists
                            </span>
                          </div>
                        </div>
                        <ErpButton
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info("Downloading Variance Summary...")}
                        >
                          Download
                        </ErpButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-5">
              {/* Budget vs Actual Trend chart */}
              <div className="card-soft p-5">
                <CardHeader title="Budget vs Actual Trend" />

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
                        name="Budget"
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={false}
                        name="Actual"
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={false}
                        name="Forecast"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost by Department Pie/Donut Chart */}
              <div className="card-soft p-5">
                <CardHeader title="Cost by Department (YTD)" />

                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data.departmentSplits}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {data.departmentSplits.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[14px] font-bold text-foreground">
                          ₹1.88Cr
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Total Actual
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-1.5 text-xs">
                    {data.departmentSplits.map((entry, index) => (
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

              {/* Top Over / Under Budget Variance Ranking */}
              <div className="card-soft p-5 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-foreground">Top Over / Under Budget</h3>
                  <button className="text-[11px] font-semibold text-primary hover:underline">
                    View All
                  </button>
                </div>

                <div className="space-y-2.5 text-xs max-h-[220px] overflow-y-auto">
                  {data.topVariances.map((varItem, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 border-b border-border/40"
                    >
                      <span className="text-foreground font-semibold">{varItem.costCenter}</span>
                      <div className="text-right">
                        <span className="font-semibold text-foreground block tabular">
                          {formatCurrency(varItem.variance)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {varItem.percentage}% of Budget
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTION DIALOGS --- */}

      {/* 1. New Cost Center Form Dialog */}
      <Dialog open={ccOpen} onOpenChange={setCcOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Cost Center</DialogTitle>
            <DialogDescription>
              Add a new tracking unit for corporate operational expense allocations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCcSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT-009"
                    value={newCcInput.code}
                    onChange={(e) => setNewCcInput((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technology Support"
                    value={newCcInput.name}
                    onChange={(e) => setNewCcInput((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Department *
                  </label>
                  <select
                    value={newCcInput.department}
                    onChange={(e) =>
                      setNewCcInput((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Manager *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Amit Mehra"
                    value={newCcInput.manager}
                    onChange={(e) =>
                      setNewCcInput((prev) => ({ ...prev, manager: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Budget Allocation *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1000000"
                    value={newCcInput.budget || ""}
                    onChange={(e) =>
                      setNewCcInput((prev) => ({
                        ...prev,
                        budget: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Cost Center Type *
                  </label>
                  <select
                    value={newCcInput.type}
                    onChange={(e) =>
                      setNewCcInput((prev) => ({
                        ...prev,
                        type: e.target.value as CostCenterRecord["type"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setCcOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={ccMutation.isPending}>
                Create Cost Center
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Create Sub Cost Center Form Dialog */}
      <Dialog open={subCcOpen} onOpenChange={setSubCcOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Sub Cost Center Node</DialogTitle>
            <DialogDescription>
              Nest a child cost center tracking unit under a parent division.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubCcSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Parent Cost Center *
                </label>
                <select
                  value={newSubCcInput.parentId}
                  onChange={(e) =>
                    setNewSubCcInput((prev) => ({ ...prev, parentId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                >
                  <option value="Administration">Administration Parent Division</option>
                  <option value="Finance">Finance Division</option>
                  <option value="Operations">Operations Division</option>
                  <option value="Commercial">Commercial Division</option>
                  <option value="Technology">Technology Division</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Sub Center Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HR-009"
                    value={newSubCcInput.code}
                    onChange={(e) =>
                      setNewSubCcInput((prev) => ({ ...prev, code: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Sub Center Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Legal Affairs"
                    value={newSubCcInput.name}
                    onChange={(e) =>
                      setNewSubCcInput((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Sub-Budget Allocation *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="250000"
                    value={newSubCcInput.budget || ""}
                    onChange={(e) =>
                      setNewSubCcInput((prev) => ({
                        ...prev,
                        budget: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Sub-Manager *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Amit Mehra"
                    value={newSubCcInput.manager}
                    onChange={(e) =>
                      setNewSubCcInput((prev) => ({ ...prev, manager: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setSubCcOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={subCcMutation.isPending}>
                Add Sub Center
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Budget Planning Allocation Dialog */}
      <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate Budget Funds</DialogTitle>
            <DialogDescription>
              Increase or reallocate cost center budget allowances.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocateSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Select Target Cost Center *
                </label>
                <select
                  value={budgetAllocationInput.costCenterId}
                  onChange={(e) =>
                    setBudgetAllocationInput((prev) => ({ ...prev, costCenterId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                >
                  {allCCs.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      [{cc.code}] {cc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Budget Increase Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="50000"
                  value={budgetAllocationInput.increaseAmount || ""}
                  onChange={(e) =>
                    setBudgetAllocationInput((prev) => ({
                      ...prev,
                      increaseAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Reason for Reallocation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Expansion Allocation"
                  value={budgetAllocationInput.reason}
                  onChange={(e) =>
                    setBudgetAllocationInput((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setAllocateOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={allocateMutation.isPending}>
                Reallocate
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Upload Budget Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Cost Center Budgets Sheet</DialogTitle>
            <DialogDescription>
              Batch update cost center allocations using CSV or Excel file import templates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/30">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs font-semibold">Drop budget allocation spreadsheet here</span>
              <span className="text-[10px] text-muted-foreground">
                CSV or XLSX format (Max 10MB)
              </span>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={uploadMutation.isPending}>
                Upload File
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
