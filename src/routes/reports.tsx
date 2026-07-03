import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  FileText,
  Plus,
  TrendingUp,
  Download,
  MoreHorizontal,
  ChevronDown,
  Search,
  CheckCircle,
  Share2,
  Calendar,
  Eye,
  Mail,
  User,
  Settings,
  Star,
  FileSpreadsheet,
  Clock,
  Briefcase,
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
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
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
import { company, formatCurrency } from "@/lib/mock-data";
import {
  reportManagementService,
  reportSchedulerService,
  reportSharingService,
  loadFinancialReportingDashboard,
} from "@/services";
import type {
  ReportRecord,
  ReportScheduleRecord,
  ReportShareRecord,
  RecentReportActivity,
  ReportCategory,
  DashboardQuery,
} from "@/services/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Financial Reporting · Magnertia" },
      {
        name: "description",
        content: "Generate, analyze, and share financial reports and insights.",
      },
    ],
  }),
  component: ReportsPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const CATEGORIES: { label: ReportCategory; count: number }[] = [
  { label: "Financial Statements", count: 9 },
  { label: "Management Reports", count: 6 },
  { label: "Cash Flow Reports", count: 4 },
  { label: "Budget Reports", count: 3 },
  { label: "Tax Reports", count: 2 },
  { label: "Custom Reports", count: 2 },
];

const DATE_RANGE_OPTIONS = [
  { label: "This Fiscal Year", value: "this-fy" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Quarter to Date", value: "qtd" },
];

const COMPANIES = [
  { label: "All Companies", value: "all" },
  { label: "Magnertia Corp", value: "corp" },
];

function ReportsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "reports" | "favorites" | "recent" | "shared" | "scheduled"
  >("reports");
  const [selectedCategory, setSelectedCategory] = useState<"All Reports" | ReportCategory>(
    "All Reports",
  );

  // Filters
  const [search, setSearch] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState<"All" | "Standard" | "Custom">("All");
  const [sortBy, setSortBy] = useState("name-asc");
  const [dateRange, setDateRange] = useState("this-fy");
  const [companyId, setCompanyId] = useState("all");

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedReportForShare, setSelectedReportForShare] = useState<string>("");
  const [selectedReportForSchedule, setSelectedReportForSchedule] = useState<string>("");
  const [previewReport, setPreviewReport] = useState<ReportRecord | null>(null);

  // Form Inputs
  const [newReportInput, setNewReportInput] = useState({
    name: "",
    description: "",
    category: "Financial Statements" as ReportCategory,
    type: "Custom" as const,
  });

  const [newScheduleInput, setNewScheduleInput] = useState({
    reportId: "",
    frequency: "Monthly" as const,
    format: "PDF" as const,
    recipients: "",
  });

  const [newShareInput, setNewShareInput] = useState({
    reportId: "",
    sharedWith: "",
    accessLevel: "View" as const,
    message: "",
  });

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ["reporting", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadFinancialReportingDashboard(QUERY),
  });

  const reportsQuery = useQuery({
    queryKey: ["reporting", "reports"],
    queryFn: () => reportManagementService.fetchReports(QUERY),
  });

  const schedulesQuery = useQuery({
    queryKey: ["reporting", "schedules"],
    queryFn: () => reportSchedulerService.fetchScheduledReports(QUERY),
  });

  const sharesQuery = useQuery({
    queryKey: ["reporting", "shares"],
    queryFn: () => reportSharingService.fetchSharedReportsLogs(QUERY),
  });

  // Mutations
  const createReportMutation = useMutation({
    mutationFn: reportManagementService.saveReportTemplate,
    onSuccess: (newRep) => {
      toast.success(`Custom Report "${newRep.name}" successfully created.`);
      setCreateOpen(false);
      setNewReportInput({
        name: "",
        description: "",
        category: "Financial Statements",
        type: "Custom",
      });
      queryClient.invalidateQueries({ queryKey: ["reporting"] });
    },
    onError: () => toast.error("Failed to create custom report template."),
  });

  const scheduleMutation = useMutation({
    mutationFn: reportSchedulerService.configureSchedule,
    onSuccess: (newSch) => {
      toast.success(`Report delivery scheduled: ${newSch.reportName}`);
      setScheduleOpen(false);
      setNewScheduleInput({
        reportId: "",
        frequency: "Monthly",
        format: "PDF",
        recipients: "",
      });
      queryClient.invalidateQueries({ queryKey: ["reporting"] });
    },
    onError: () => toast.error("Failed to configure schedule."),
  });

  const shareMutation = useMutation({
    mutationFn: reportSharingService.shareReport,
    onSuccess: (newShare) => {
      toast.success(`Report successfully shared with ${newShare.sharedWith}`);
      setShareOpen(false);
      setNewShareInput({
        reportId: "",
        sharedWith: "",
        accessLevel: "View",
        message: "",
      });
      queryClient.invalidateQueries({ queryKey: ["reporting"] });
    },
    onError: () => toast.error("Failed to share report."),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      reportManagementService.manageReport(id, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reporting"] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportInput.name || !newReportInput.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createReportMutation.mutate(newReportInput);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleInput.reportId || !newScheduleInput.recipients) {
      toast.error("Please fill in all fields.");
      return;
    }
    scheduleMutation.mutate(newScheduleInput);
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShareInput.reportId || !newShareInput.sharedWith) {
      toast.error("Please fill in all fields.");
      return;
    }
    shareMutation.mutate(newShareInput);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All Reports");
    setReportTypeFilter("All");
    setDateRange("this-fy");
    setCompanyId("all");
    toast.info("Filters reset.");
  };

  const isLoading = dashboardQuery.isLoading;
  const data = dashboardQuery.data;

  // Filtered reports calculation
  const allReportsList = reportsQuery.data || [];
  const filteredReports = allReportsList.filter((r) => {
    // Search match
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    // Category match
    const matchesCategory = selectedCategory === "All Reports" || r.category === selectedCategory;
    // Type match
    const matchesType = reportTypeFilter === "All" || r.type === reportTypeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort
  filteredReports.sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  // Category splits
  const allReportsCount = allReportsList.length;

  return (
    <AppShell
      title="Financial Reporting"
      breadcrumb="Financial Management"
      description="Generate, analyze, and share financial reports and insights."
      topbarActions={
        <ErpButton onClick={() => setCreateOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Report</span>
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
              label="Total Revenue (YTD)"
              value={formatCurrency(data.kpis.totalRevenue)}
              neutralText={`${data.kpis.totalRevenueDelta}% vs PYTD`}
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Gross Profit (YTD)"
              value={formatCurrency(data.kpis.grossProfit)}
              neutralText={`${data.kpis.grossProfitDelta}% vs PYTD`}
              icon={<FileSpreadsheet className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Net Income (YTD)"
              value={formatCurrency(data.kpis.netIncome)}
              neutralText={`${data.kpis.netIncomeDelta}% vs PYTD`}
              icon={<DollarSignIcon className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Total Assets"
              value={formatCurrency(data.kpis.totalAssets)}
              neutralText={`${data.kpis.totalAssetsDelta}% vs Prior Year`}
              icon={<Briefcase className="h-5 w-5" />}
              iconBg="bg-[#F59E0B]/10"
              iconColor="text-[#F59E0B]"
            />
            <StatCard
              label="Total Liabilities"
              value={formatCurrency(data.kpis.totalLiabilities)}
              neutralText={`${data.kpis.totalLiabilitiesDelta}% vs Prior Year`}
              icon={<FileText className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Main Layout */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Column */}
            <div className="min-w-0 space-y-5">
              {/* Tab Navigation & Sub Header Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      { label: "Reports", value: "reports" },
                      { label: "Favorites", value: "favorites" },
                      { label: "Recent", value: "recent" },
                      { label: "Shared Reports", value: "shared" },
                      { label: "Scheduled Reports", value: "scheduled" },
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
                    onClick={() => toast.info("Exporting reporting logs...")}
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
                      <DropdownMenuItem onClick={() => setScheduleOpen(true)}>
                        Configure Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShareOpen(true)}>
                        Share Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tab Panels */}
              <div className="space-y-5">
                {/* 1. REPORTS TAB */}
                {activeTab === "reports" && (
                  <div className="grid gap-5 md:grid-cols-[200px_1fr]">
                    {/* Left Category Menu + Filters */}
                    <div className="space-y-5">
                      <div className="card-soft p-4 space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Report Categories
                          </h4>
                          <ul className="space-y-1">
                            <li>
                              <button
                                onClick={() => setSelectedCategory("All Reports")}
                                className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                                  selectedCategory === "All Reports"
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-secondary"
                                }`}
                              >
                                <span>All Reports</span>
                                <span className="font-semibold text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-foreground">
                                  {allReportsCount}
                                </span>
                              </button>
                            </li>
                            {CATEGORIES.map((c) => (
                              <li key={c.label}>
                                <button
                                  onClick={() => setSelectedCategory(c.label)}
                                  className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                                    selectedCategory === c.label
                                      ? "bg-primary/10 text-primary"
                                      : "text-muted-foreground hover:bg-secondary"
                                  }`}
                                >
                                  <span>{c.label}</span>
                                  <span className="font-semibold text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-foreground">
                                    {c.count}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-border pt-4 space-y-3.5">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Filters
                          </h4>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              Date Range
                            </label>
                            <select
                              value={dateRange}
                              onChange={(e) => setDateRange(e.target.value)}
                              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                            >
                              {DATE_RANGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              Company
                            </label>
                            <select
                              value={companyId}
                              onChange={(e) => setCompanyId(e.target.value)}
                              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                            >
                              {COMPANIES.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={resetFilters}
                            className="w-full text-center text-xs font-semibold text-primary hover:underline"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Center Library List */}
                    <div className="space-y-4">
                      {/* Search Toolbar */}
                      <div className="flex flex-wrap items-center gap-3 card-soft p-4">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search reports by name or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>

                        <select
                          value={reportTypeFilter}
                          onChange={(e) =>
                            setReportTypeFilter(e.target.value as "All" | "Standard" | "Custom")
                          }
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          <option value="All">Report Type: All</option>
                          <option value="Standard">Standard</option>
                          <option value="Custom">Custom</option>
                        </select>

                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          <option value="name-asc">Sort: Name (A-Z)</option>
                          <option value="name-desc">Sort: Name (Z-A)</option>
                        </select>
                      </div>

                      {/* Reports Data Table */}
                      <div className="card-soft overflow-hidden">
                        <DataTable<ReportRecord>
                          data={filteredReports}
                          columns={[
                            {
                              key: "favorite",
                              header: "",
                              cell: (r) => (
                                <button
                                  onClick={() =>
                                    toggleFavoriteMutation.mutate({
                                      id: r.id,
                                      isFavorite: !r.isFavorite,
                                    })
                                  }
                                  className="grid place-items-center"
                                >
                                  <Star
                                    className={`h-4 w-4 ${r.isFavorite ? "fill-[#F59E0B] text-[#F59E0B]" : "text-muted-foreground hover:text-[#F59E0B]"}`}
                                  />
                                </button>
                              ),
                            },
                            {
                              key: "name",
                              header: "Report Name",
                              cell: (r) => (
                                <div>
                                  <button
                                    onClick={() => setPreviewReport(r)}
                                    className="font-semibold text-primary hover:underline text-left block"
                                  >
                                    {r.name}
                                  </button>
                                  <span className="text-xs text-muted-foreground block">
                                    {r.description}
                                  </span>
                                </div>
                              ),
                            },
                            {
                              key: "category",
                              header: "Category",
                              cell: (r) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    r.category === "Financial Statements"
                                      ? "bg-indigo-100 text-indigo-800"
                                      : r.category === "Cash Flow Reports"
                                        ? "bg-green-100 text-green-800"
                                        : r.category === "Budget Reports"
                                          ? "bg-amber-100 text-amber-800"
                                          : r.category === "Tax Reports"
                                            ? "bg-rose-100 text-rose-800"
                                            : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {r.category}
                                </span>
                              ),
                            },
                            {
                              key: "type",
                              header: "Report Type",
                              cell: (r) => <span className="text-muted-foreground">{r.type}</span>,
                            },
                            {
                              key: "lastModified",
                              header: "Last Modified",
                              cell: (r) => (
                                <div>
                                  <span className="text-foreground text-xs font-semibold block">
                                    {r.lastModified}
                                  </span>
                                  <span className="text-muted-foreground text-[10px] block">
                                    {r.lastModifiedBy}
                                  </span>
                                </div>
                              ),
                            },
                            {
                              key: "actions",
                              header: "Actions",
                              align: "center",
                              cell: (r) => (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setSelectedReportForShare(r.id);
                                      setNewShareInput((p) => ({ ...p, reportId: r.id }));
                                      setShareOpen(true);
                                    }}
                                    title="Share Report"
                                    className="p-1 rounded hover:bg-muted"
                                  >
                                    <Share2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                  </button>
                                  <button
                                    onClick={() => setPreviewReport(r)}
                                    title="Open Report"
                                    className="p-1 rounded hover:bg-muted"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted">
                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setPreviewReport(r)}>
                                        View Report
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedReportForSchedule(r.id);
                                          setNewScheduleInput((p) => ({ ...p, reportId: r.id }));
                                          setScheduleOpen(true);
                                        }}
                                      >
                                        Schedule Delivery
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div className="space-y-1">
                              <span className="font-semibold">{r.name}</span>
                              <div className="text-xs text-muted-foreground">{r.description}</div>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FAVORITES TAB */}
                {activeTab === "favorites" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Favorite Reports</h3>
                    <div className="card-soft overflow-hidden">
                      <DataTable<ReportRecord>
                        data={allReportsList.filter((r) => r.isFavorite)}
                        columns={[
                          {
                            key: "name",
                            header: "Report Name",
                            cell: (r) => (
                              <button
                                onClick={() => setPreviewReport(r)}
                                className="font-bold text-primary hover:underline"
                              >
                                {r.name}
                              </button>
                            ),
                          },
                          {
                            key: "category",
                            header: "Category",
                            cell: (r) => (
                              <span className="text-muted-foreground">{r.category}</span>
                            ),
                          },
                          { key: "type", header: "Type", cell: (r) => <span>{r.type}</span> },
                          {
                            key: "lastModified",
                            header: "Last Modified",
                            cell: (r) => (
                              <span className="text-xs text-muted-foreground">
                                {r.lastModified}
                              </span>
                            ),
                          },
                        ]}
                        mobileCard={(r) => <div className="font-semibold">{r.name}</div>}
                      />
                    </div>
                  </div>
                )}

                {/* 3. RECENT TAB */}
                {activeTab === "recent" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Recently Viewed / Generated Reports</h3>
                    <div className="card-soft overflow-hidden">
                      <DataTable<RecentReportActivity>
                        data={data.activities}
                        columns={[
                          {
                            key: "reportName",
                            header: "Report Name",
                            cell: (r) => (
                              <span className="font-bold text-foreground">{r.reportName}</span>
                            ),
                          },
                          {
                            key: "activity",
                            header: "Activity Logs",
                            cell: (r) => (
                              <span className="text-muted-foreground">{r.activity}</span>
                            ),
                          },
                          {
                            key: "performedBy",
                            header: "Action By",
                            cell: (r) => <span>{r.performedBy}</span>,
                          },
                          {
                            key: "timestamp",
                            header: "Timestamp",
                            cell: (r) => (
                              <span className="text-xs text-muted-foreground">{r.timestamp}</span>
                            ),
                          },
                        ]}
                        mobileCard={(r) => <div className="font-semibold">{r.reportName}</div>}
                      />
                    </div>
                  </div>
                )}

                {/* 4. SHARED REPORTS TAB */}
                {activeTab === "shared" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Shared Reports Audit</h3>
                    <div className="card-soft overflow-hidden">
                      {sharesQuery.isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          Loading shared logs...
                        </div>
                      ) : (
                        <DataTable<ReportShareRecord>
                          data={sharesQuery.data || []}
                          columns={[
                            {
                              key: "reportName",
                              header: "Report",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.reportName}</span>
                              ),
                            },
                            {
                              key: "sharedWith",
                              header: "Shared With",
                              cell: (r) => (
                                <span className="text-primary font-medium">{r.sharedWith}</span>
                              ),
                            },
                            {
                              key: "dateShared",
                              header: "Date Shared",
                              cell: (r) => (
                                <span className="text-muted-foreground text-xs">
                                  {r.dateShared}
                                </span>
                              ),
                            },
                            {
                              key: "accessLevel",
                              header: "Access Level",
                              cell: (r) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    r.accessLevel === "View"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  Can {r.accessLevel}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div>
                              {r.reportName} shared with {r.sharedWith}
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 5. SCHEDULED REPORTS TAB */}
                {activeTab === "scheduled" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Automated Scheduled Reports</h3>
                    <div className="card-soft overflow-hidden">
                      {schedulesQuery.isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          Loading schedules...
                        </div>
                      ) : (
                        <DataTable<ReportScheduleRecord>
                          data={schedulesQuery.data || []}
                          columns={[
                            {
                              key: "reportName",
                              header: "Report",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.reportName}</span>
                              ),
                            },
                            {
                              key: "frequency",
                              header: "Frequency",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.frequency}</span>
                              ),
                            },
                            {
                              key: "format",
                              header: "Format",
                              cell: (r) => (
                                <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded text-foreground">
                                  {r.format}
                                </span>
                              ),
                            },
                            {
                              key: "recipients",
                              header: "Recipients",
                              cell: (r) => (
                                <span className="text-primary text-xs">{r.recipients}</span>
                              ),
                            },
                            {
                              key: "nextRun",
                              header: "Next Run",
                              cell: (r) => (
                                <span className="text-xs text-muted-foreground">{r.nextRun}</span>
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
                            <div>
                              {r.reportName} - {r.frequency}
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
              {/* Financial Performance Trend line chart */}
              <div className="card-soft p-5">
                <CardHeader
                  title="Financial Performance Trend"
                  right={
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                      This Fiscal Year
                    </span>
                  }
                />

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3 mt-1.5">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Revenue
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Gross Profit
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" /> Net Income
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
                        tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
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
                        dataKey="revenue"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="grossProfit"
                        stroke="#22C55E"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="netIncome"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reports by Category Donut Panel */}
              <div className="card-soft p-5">
                <CardHeader title="Reports by Category" />

                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data.categoryDistribution}
                          dataKey="count"
                          nameKey="name"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {data.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[15px] font-bold text-foreground">
                          {allReportsCount}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Total Reports
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-1.5 text-xs">
                    {data.categoryDistribution.map((entry, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground max-w-[160px] truncate">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}
                        </span>
                        <span className="font-semibold text-foreground shrink-0">
                          {entry.count} ({entry.percentage}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recent Report Activity */}
              <div className="card-soft p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-foreground">Recent Report Activity</h3>
                  <button
                    onClick={() => setActiveTab("recent")}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>

                <ul className="space-y-3">
                  {data.activities.slice(0, 3).map((act) => (
                    <li key={act.id} className="flex items-start gap-2.5 text-xs">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground block truncate">
                          {act.reportName}
                        </span>
                        <span className="text-muted-foreground block text-[11px]">
                          {act.activity}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 self-start">
                        {act.timestamp.split(" ")[2] || ""} {act.timestamp.split(" ")[3] || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="card-soft p-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Actions
            </h4>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5 text-center">
              <button
                onClick={() => setCreateOpen(true)}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Create Custom Report</span>
                <span className="text-[10px] text-muted-foreground">Build new custom layouts</span>
              </button>

              <button
                onClick={() => setScheduleOpen(true)}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Schedule Report</span>
                <span className="text-[10px] text-muted-foreground">
                  Automate report deliveries
                </span>
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <Share2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Share Report</span>
                <span className="text-[10px] text-muted-foreground">
                  Distribute reports to team
                </span>
              </button>

              <button
                onClick={() => toast.info("Export to Excel, PDF trigger...")}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Export Report</span>
                <span className="text-[10px] text-muted-foreground">Export logs to PDF, Excel</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory("Custom Reports");
                  setActiveTab("reports");
                  toast.info("Filtered by custom reports");
                }}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-1.5 col-span-2 md:col-span-1"
              >
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Manage Reports</span>
                <span className="text-[10px] text-muted-foreground">
                  Configure custom definitions
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTION DIALOGS --- */}

      {/* 1. Create Custom Report Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Report</DialogTitle>
            <DialogDescription>
              Design a new custom report template linked to financial GL ledgers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Report Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q2 Branch-wise Operating P&L"
                  value={newReportInput.name}
                  onChange={(e) => setNewReportInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Summarize what this custom report computes."
                  value={newReportInput.description}
                  onChange={(e) =>
                    setNewReportInput((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={newReportInput.category}
                    onChange={(e) =>
                      setNewReportInput((prev) => ({
                        ...prev,
                        category: e.target.value as ReportCategory,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    <option value="Financial Statements">Financial Statements</option>
                    <option value="Management Reports">Management Reports</option>
                    <option value="Cash Flow Reports">Cash Flow Reports</option>
                    <option value="Budget Reports">Budget Reports</option>
                    <option value="Tax Reports">Tax Reports</option>
                    <option value="Custom Reports">Custom Reports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Report Source
                  </label>
                  <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none">
                    <option>General Ledger Ledger</option>
                    <option>Accounts Payable Accounts</option>
                    <option>Accounts Receivable Accounts</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={createReportMutation.isPending}>
                Save Template
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Schedule Report Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Report Schedule</DialogTitle>
            <DialogDescription>
              Setup automated compilation and recurring delivery logs.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Select Report *
                </label>
                <select
                  value={newScheduleInput.reportId}
                  onChange={(e) =>
                    setNewScheduleInput((prev) => ({ ...prev, reportId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                >
                  <option value="">-- Choose Report --</option>
                  {allReportsList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Delivery Frequency
                  </label>
                  <select
                    value={newScheduleInput.frequency}
                    onChange={(e) =>
                      setNewScheduleInput((prev) => ({
                        ...prev,
                        frequency: e.target.value as ReportScheduleRecord["frequency"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Format Type
                  </label>
                  <select
                    value={newScheduleInput.format}
                    onChange={(e) =>
                      setNewScheduleInput((prev) => ({
                        ...prev,
                        format: e.target.value as ReportScheduleRecord["format"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    <option value="PDF">PDF document</option>
                    <option value="XLSX">Excel Spreadsheet</option>
                    <option value="CSV">CSV tabular data</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Recipients (emails comma-separated) *
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="board@magnertia.com, executive@magnertia.com"
                    value={newScheduleInput.recipients}
                    onChange={(e) =>
                      setNewScheduleInput((prev) => ({ ...prev, recipients: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setScheduleOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={scheduleMutation.isPending}>
                Schedule Delivery
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Share Report Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Report Template</DialogTitle>
            <DialogDescription>
              Distribute statements internally or externally with secure access controls.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleShareSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Select Report *
                </label>
                <select
                  value={newShareInput.reportId}
                  onChange={(e) =>
                    setNewShareInput((prev) => ({ ...prev, reportId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                >
                  <option value="">-- Choose Report --</option>
                  {allReportsList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Share Target (Emails / Users) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. audit-team@magnertia.com"
                      value={newShareInput.sharedWith}
                      onChange={(e) =>
                        setNewShareInput((prev) => ({ ...prev, sharedWith: e.target.value }))
                      }
                      className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Access Level
                  </label>
                  <select
                    value={newShareInput.accessLevel}
                    onChange={(e) =>
                      setNewShareInput((prev) => ({
                        ...prev,
                        accessLevel: e.target.value as ReportShareRecord["accessLevel"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    <option value="View">Can View</option>
                    <option value="Edit">Can Edit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Custom Message
                </label>
                <textarea
                  rows={2}
                  placeholder="Write a message explaining the attachment..."
                  value={newShareInput.message}
                  onChange={(e) =>
                    setNewShareInput((prev) => ({ ...prev, message: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setShareOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={shareMutation.isPending}>
                Share Report
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Report Preview / Details Modal */}
      <Dialog open={!!previewReport} onOpenChange={(open) => !open && setPreviewReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {previewReport && (
            <>
              <DialogHeader className="border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle>{previewReport.name}</DialogTitle>
                    <span className="text-xs text-muted-foreground">
                      {previewReport.category} • {previewReport.type} Report
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Styled report data preview details */}
              <div className="space-y-4 my-4">
                <div className="bg-secondary/30 p-4 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reporting entity:</span>
                    <span className="font-semibold text-foreground">
                      Magnertia Corp Group consolidated
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reporting period:</span>
                    <span className="font-semibold text-foreground">
                      April 1, 2024 to March 31, 2025
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Audit Status:</span>
                    <span className="font-semibold text-green-600">Unconditionally Approved</span>
                  </div>
                </div>

                {previewReport.name.includes("Balance Sheet") ? (
                  <div className="border border-border rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-muted border-b border-border font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-2.5">Classification</th>
                          <th className="p-2.5 text-right">Debit (USD)</th>
                          <th className="p-2.5 text-right">Credit (USD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border font-semibold text-foreground bg-secondary/10">
                          <td className="p-2.5" colSpan={3}>
                            ASSETS
                          </td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">
                            Cash and Cash Equivalents
                          </td>
                          <td className="p-2.5 text-right tabular">18,765,430.00</td>
                          <td className="p-2.5 text-right"></td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">Trade Receivables</td>
                          <td className="p-2.5 text-right tabular">12,450,680.00</td>
                          <td className="p-2.5 text-right"></td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">Fixed Assets NBV</td>
                          <td className="p-2.5 text-right tabular">37,707,430.00</td>
                          <td className="p-2.5 text-right"></td>
                        </tr>
                        <tr className="border-b border-border font-bold bg-muted/40">
                          <td className="p-2.5 pl-3">Total Assets</td>
                          <td className="p-2.5 text-right tabular">68,923,540.00</td>
                          <td className="p-2.5 text-right"></td>
                        </tr>

                        <tr className="border-b border-border font-semibold text-foreground bg-secondary/10">
                          <td className="p-2.5" colSpan={3}>
                            LIABILITIES & EQUITY
                          </td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">Trade Payables</td>
                          <td className="p-2.5 text-right"></td>
                          <td className="p-2.5 text-right tabular">14,215,760.00</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">Accrued Taxes</td>
                          <td className="p-2.5 text-right"></td>
                          <td className="p-2.5 text-right tabular">14,100,000.00</td>
                        </tr>
                        <tr className="border-b border-border font-bold bg-muted/40">
                          <td className="p-2.5 pl-3">Total Liabilities</td>
                          <td className="p-2.5 text-right"></td>
                          <td className="p-2.5 text-right tabular">28,315,760.00</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">Paid Up Capital</td>
                          <td className="p-2.5 text-right"></td>
                          <td className="p-2.5 text-right tabular">32,751,370.00</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">
                            Retained Earnings (YTD)
                          </td>
                          <td className="p-2.5 text-right"></td>
                          <td className="p-2.5 text-right tabular">7,856,410.00</td>
                        </tr>
                        <tr className="border-b border-border font-bold bg-primary/10 text-primary">
                          <td className="p-2.5 pl-3">Total Equity & Liabilities</td>
                          <td className="p-2.5 text-right"></td>
                          <td className="p-2.5 text-right tabular">68,923,540.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-muted border-b border-border font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-2.5">Line Item</th>
                          <th className="p-2.5 text-right">YTD Value (USD)</th>
                          <th className="p-2.5 text-right">Prior Year (USD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border font-bold bg-secondary/10">
                          <td className="p-2.5">Revenue / Turnover</td>
                          <td className="p-2.5 text-right tabular">48,753,920.00</td>
                          <td className="p-2.5 text-right tabular">43,354,210.00</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">
                            Cost of Goods Sold (COGS)
                          </td>
                          <td className="p-2.5 text-right tabular">(30,508,290.00)</td>
                          <td className="p-2.5 text-right tabular">(27,100,000.00)</td>
                        </tr>
                        <tr className="border-b border-border font-bold bg-muted/40">
                          <td className="p-2.5 pl-3">Gross Profit</td>
                          <td className="p-2.5 text-right tabular">18,245,630.00</td>
                          <td className="p-2.5 text-right tabular">16,254,210.00</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">
                            Operational Admin Expenses
                          </td>
                          <td className="p-2.5 text-right tabular">(8,254,120.00)</td>
                          <td className="p-2.5 text-right tabular">(7,354,000.00)</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2.5 pl-5 text-muted-foreground">
                            Selling & Distribution Costs
                          </td>
                          <td className="p-2.5 text-right tabular">(2,135,100.00)</td>
                          <td className="p-2.5 text-right tabular">(1,900,000.00)</td>
                        </tr>
                        <tr className="border-b border-border font-bold bg-primary/10 text-primary">
                          <td className="p-2.5 pl-3">Net Operating Income</td>
                          <td className="p-2.5 text-right tabular">7,856,410.00</td>
                          <td className="p-2.5 text-right tabular">7,000,210.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-5 border-t border-border pt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <ErpButton
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("PDF Download initiated")}
                  >
                    <Download className="mr-1 h-3.5 w-3.5" /> PDF
                  </ErpButton>
                  <ErpButton
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("Excel Spreadsheet download initiated")}
                  >
                    <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> Excel
                  </ErpButton>
                </div>
                <ErpButton variant="outline" onClick={() => setPreviewReport(null)}>
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

// Simple Dollar Icon component to avoid lucide imports collision
function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
