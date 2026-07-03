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
  Shield,
  Eye,
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
import { company } from "@/lib/mock-data";
import { auditTrailService, loadAuditTrailDashboard } from "@/services";
import type {
  AuditLogEntry,
  SensitiveChangeRecord,
  SecurityEventEntry,
  ConfigurationLogEntry,
  DashboardQuery,
} from "@/services/types";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail · Magnertia" },
      {
        name: "description",
        content:
          "Track and review all system changes and user activities for compliance and accountability.",
      },
    ],
  }),
  component: AuditTrailPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

function AuditTrailPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "logs" | "activities" | "data" | "security" | "config"
  >("logs");

  // Filters
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Dialog States
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"PDF" | "CSV" | "JSON">("PDF");

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ["audit", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadAuditTrailDashboard(QUERY),
  });

  const detailQuery = useQuery({
    queryKey: ["audit", "detail", selectedLog?.id],
    queryFn: () => auditTrailService.fetchLogDetails(selectedLog?.id || ""),
    enabled: detailOpen && !!selectedLog,
  });

  const handleRowClick = (row: AuditLogEntry) => {
    setSelectedLog(row);
    setDetailOpen(true);
  };

  const handleQuickFilterClick = (type: string) => {
    setSearch("");
    setModuleFilter("All");
    setTypeFilter("All");
    setStatusFilter("All");

    if (type === "Data Changes") {
      setModuleFilter("General Ledger");
    } else if (type === "User Logins") {
      setTypeFilter("Login");
    } else if (type === "Failed Activities") {
      setStatusFilter("Failed");
    } else if (type === "Sensitive Changes") {
      setTypeFilter("Delete");
    } else if (type === "System Events") {
      setModuleFilter("Consolidation");
    }
    toast.success(`Applied quick filter preset: ${type}`);
  };

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Audit logs successfully compiled and exported in ${exportFormat} format.`);
    setExportOpen(false);
  };

  const isLoading = dashboardQuery.isLoading;
  const data = dashboardQuery.data;

  // Filter logs list
  const logsList = data?.logs || [];
  const filteredLogs = logsList.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.referenceId.toLowerCase().includes(search.toLowerCase());

    const matchesModule = moduleFilter === "All" || log.module === moduleFilter;
    const matchesType = typeFilter === "All" || log.activityType === typeFilter;
    const matchesStatus = statusFilter === "All" || log.status === statusFilter;

    return matchesSearch && matchesModule && matchesType && matchesStatus;
  });

  // Filter active logs display based on tabs
  const tabFilteredLogs = filteredLogs.filter((log) => {
    if (activeTab === "activities")
      return log.activityType === "Login" || log.activityType === "Logout";
    if (activeTab === "data")
      return (
        log.activityType === "Create" ||
        log.activityType === "Update" ||
        log.activityType === "Delete"
      );
    return true; // "logs" tab shows all
  });

  return (
    <AppShell
      title="Audit Trail"
      breadcrumb="Financial Management"
      description="Track and review all system changes and user activities for compliance and accountability."
      topbarActions={
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none">
            <option>Fiscal Year 2024-25</option>
          </select>
          <select className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none">
            <option>All Companies</option>
          </select>
        </div>
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
              label="Total Activities (YTD)"
              value={data.kpis.totalActivitiesYTD.toLocaleString()}
              neutralText={`▲ ${data.kpis.totalActivitiesYTDDelta}% vs PYTD`}
              icon={<Layers className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Unique Users"
              value={data.kpis.uniqueUsersCount.toString()}
              neutralText={`▲ ${data.kpis.uniqueUsersDelta}% vs PYTD`}
              icon={<User className="h-5 w-5" />}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
            />
            <StatCard
              label="Successful Activities"
              value={data.kpis.successfulActivitiesCount.toLocaleString()}
              neutralText={`▲ ${data.kpis.successfulActivitiesDelta}% vs PYTD`}
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
            />
            <StatCard
              label="Failed Activities"
              value={data.kpis.failedActivitiesCount.toString()}
              neutralText={`${data.kpis.failedActivitiesDelta}% vs PYTD`}
              icon={<AlertTriangle className="h-5 w-5" />}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
            />
            <StatCard
              label="Sensitive Changes"
              value={data.kpis.sensitiveChangesCount.toLocaleString()}
              neutralText={`▲ ${data.kpis.sensitiveChangesDelta}% vs PYTD`}
              icon={<Shield className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Column */}
            <div className="min-w-0 space-y-5">
              {/* Tab Navigation & Toolbar Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {(["logs", "activities", "data", "security", "config"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors -mb-[2px] ${
                        activeTab === tab
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "logs" && "Audit Logs"}
                      {tab === "activities" && "User Activities"}
                      {tab === "data" && "Data Changes"}
                      {tab === "security" && "Security Events"}
                      {tab === "config" && "Configuration Changes"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <ErpButton variant="outline" size="sm" onClick={() => setExportOpen(true)}>
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
                      <DropdownMenuItem onClick={() => setExportOpen(true)}>
                        Compile Audit PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleQuickFilterClick("Failed Activities")}>
                        Show Failed Logs
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
                    placeholder="Search by user, description or ref ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="All">All Modules</option>
                    <option value="General Ledger">General Ledger</option>
                    <option value="Accounts Payable">Accounts Payable</option>
                    <option value="Accounts Receivable">Accounts Receivable</option>
                    <option value="Cash & Bank">Cash & Bank</option>
                    <option value="Budgeting">Budgeting</option>
                    <option value="Tax Management">Tax Management</option>
                    <option value="Cost Centers">Cost Centers</option>
                    <option value="Consolidation">Consolidation</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="All">All Activity Types</option>
                    <option value="Create">Create</option>
                    <option value="Update">Update</option>
                    <option value="Delete">Delete</option>
                    <option value="Approve">Approve</option>
                    <option value="Run">Run</option>
                    <option value="Login">Login</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Success">Success</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Grid Logs Table display based on tab selection */}
              {activeTab !== "security" && activeTab !== "config" ? (
                <div className="card-soft overflow-hidden">
                  <DataTable<AuditLogEntry>
                    data={tabFilteredLogs}
                    columns={[
                      {
                        key: "timestamp",
                        header: "Date & Time",
                        cell: (r) => (
                          <span className="text-muted-foreground font-semibold">{r.timestamp}</span>
                        ),
                      },
                      {
                        key: "user",
                        header: "User",
                        cell: (r) => (
                          <span className="font-semibold text-foreground">{r.user}</span>
                        ),
                      },
                      {
                        key: "module",
                        header: "Module",
                        cell: (r) => <span className="text-muted-foreground">{r.module}</span>,
                      },
                      {
                        key: "activityType",
                        header: "Activity Type",
                        cell: (r) => (
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                              r.activityType === "Delete"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : r.activityType === "Create"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : r.activityType === "Approve"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {r.activityType}
                          </span>
                        ),
                      },
                      {
                        key: "description",
                        header: "Description",
                        cell: (r) => (
                          <span className="font-semibold text-foreground">{r.description}</span>
                        ),
                      },
                      {
                        key: "referenceId",
                        header: "Reference ID",
                        cell: (r) => (
                          <span className="font-mono text-muted-foreground">{r.referenceId}</span>
                        ),
                      },
                      {
                        key: "status",
                        header: "Status",
                        cell: (r) => (
                          <span
                            className={`font-semibold ${r.status === "Success" ? "text-green-600" : "text-destructive"}`}
                          >
                            {r.status}
                          </span>
                        ),
                      },
                      {
                        key: "ipAddress",
                        header: "IP Address",
                        cell: (r) => (
                          <span className="font-mono text-muted-foreground text-[10px]">
                            {r.ipAddress}
                          </span>
                        ),
                      },
                      {
                        key: "actions",
                        header: "Action",
                        align: "center",
                        cell: (r) => (
                          <button
                            onClick={() => handleRowClick(r)}
                            className="text-primary hover:underline font-bold text-xs"
                          >
                            Details
                          </button>
                        ),
                      },
                    ]}
                    mobileCard={(r) => (
                      <div className="space-y-1" onClick={() => handleRowClick(r)}>
                        <div className="flex justify-between font-semibold">
                          <span>{r.description}</span>
                          <span>{r.status}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.timestamp} • {r.user}
                        </div>
                      </div>
                    )}
                    onRowClick={handleRowClick}
                  />
                </div>
              ) : activeTab === "security" ? (
                /* Security Events Tab Table */
                <div className="card-soft overflow-hidden">
                  <DataTable<SecurityEventEntry>
                    data={data.securityEvents}
                    columns={[
                      {
                        key: "timestamp",
                        header: "Timestamp",
                        cell: (r) => <span className="text-muted-foreground">{r.timestamp}</span>,
                      },
                      {
                        key: "eventName",
                        header: "Security Event",
                        cell: (r) => (
                          <span className="font-bold text-destructive">{r.eventName}</span>
                        ),
                      },
                      {
                        key: "user",
                        header: "Target User",
                        cell: (r) => <span className="font-semibold">{r.user}</span>,
                      },
                      {
                        key: "severity",
                        header: "Severity",
                        cell: (r) => (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              r.severity === "Critical"
                                ? "bg-red-100 text-red-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {r.severity}
                          </span>
                        ),
                      },
                      {
                        key: "status",
                        header: "Mitigation",
                        cell: (r) => <span className="font-semibold text-primary">{r.status}</span>,
                      },
                      {
                        key: "ipAddress",
                        header: "IP Address",
                        cell: (r) => <span className="font-mono">{r.ipAddress}</span>,
                      },
                    ]}
                    mobileCard={(r) => <div>{r.eventName}</div>}
                  />
                </div>
              ) : (
                /* Configuration Changes Tab Table */
                <div className="card-soft overflow-hidden">
                  <DataTable<ConfigurationLogEntry>
                    data={data.configLogs}
                    columns={[
                      {
                        key: "timestamp",
                        header: "Timestamp",
                        cell: (r) => <span className="text-muted-foreground">{r.timestamp}</span>,
                      },
                      {
                        key: "parameter",
                        header: "System Parameter",
                        cell: (r) => <span className="font-bold">{r.parameter}</span>,
                      },
                      {
                        key: "beforeValue",
                        header: "Before Value",
                        cell: (r) => <span className="text-muted-foreground">{r.beforeValue}</span>,
                      },
                      {
                        key: "afterValue",
                        header: "After Value",
                        cell: (r) => <span className="font-bold text-primary">{r.afterValue}</span>,
                      },
                      {
                        key: "user",
                        header: "Modified By",
                        cell: (r) => <span className="font-semibold">{r.user}</span>,
                      },
                    ]}
                    mobileCard={(r) => <div>{r.parameter}</div>}
                  />
                </div>
              )}

              {/* Bottom Quick Filters Preset grid */}
              <div className="card-soft p-5">
                <CardHeader title="Quick Audit Filters" />
                <div className="grid gap-3.5 mt-3 grid-cols-2 md:grid-cols-5 text-center">
                  {[
                    {
                      label: "Data Changes",
                      count: 6842,
                      icon: <Layers className="h-4 w-4 text-primary" />,
                    },
                    {
                      label: "User Logins",
                      count: 3124,
                      icon: <User className="h-4 w-4 text-blue-500" />,
                    },
                    {
                      label: "Failed Activities",
                      count: 476,
                      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
                    },
                    {
                      label: "Sensitive Changes",
                      count: 2184,
                      icon: <Shield className="h-4 w-4 text-purple-500" />,
                    },
                    {
                      label: "System Events",
                      count: 1832,
                      icon: <Settings className="h-4 w-4 text-green-500" />,
                    },
                  ].map((filter) => (
                    <div
                      key={filter.label}
                      onClick={() => handleQuickFilterClick(filter.label)}
                      className="p-3 border border-border rounded-xl bg-secondary/10 hover:border-primary transition-all cursor-pointer space-y-1"
                    >
                      <div className="grid place-items-center h-7 w-7 rounded-lg bg-card mx-auto shadow-sm">
                        {filter.icon}
                      </div>
                      <span className="font-semibold text-foreground text-[11px] block mt-1">
                        {filter.label}
                      </span>
                      <span className="text-muted-foreground text-[10px] block tabular">
                        {filter.count.toLocaleString()} Activities
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-5">
              {/* Activity Trend Line Chart */}
              <div className="card-soft p-5">
                <CardHeader title="Activity Trend" />

                <div className="h-[180px] w-full mt-3">
                  <ResponsiveContainer>
                    <LineChart
                      data={data.activityTrend}
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
                      <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                        name="Activity Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activities by Module donut splits */}
              <div className="card-soft p-5">
                <CardHeader title="Activities by Module (YTD)" />

                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data.moduleSplits}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {data.moduleSplits.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[14px] font-bold text-foreground">
                          12,458
                        </div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-wider">
                          Total Activities
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-1.5 text-xs">
                    {data.moduleSplits.slice(0, 6).map((entry, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}
                        </span>
                        <span className="font-semibold text-foreground">
                          {entry.percentage}% ({entry.value.toLocaleString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recent Sensitive Changes alerts list */}
              <div className="card-soft p-5 space-y-3">
                <CardHeader title="Recent Sensitive Changes" />

                <div className="space-y-3 mt-3">
                  {data.sensitiveChanges.map((change) => (
                    <div
                      key={change.id}
                      className="flex gap-2.5 text-xs border-b border-border/40 pb-2.5 last:border-0 last:pb-0"
                    >
                      <div
                        className={`mt-0.5 grid place-items-center h-5 w-5 rounded-full shrink-0 ${
                          change.severity === "Critical"
                            ? "bg-red-100 text-red-700"
                            : change.severity === "High"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-foreground truncate">
                            {change.description}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-1">
                            {change.referenceId}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>{change.user}</span>
                          <span>{change.timestamp}</span>
                        </div>
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

      {/* 1. Audit Log JSON Diff Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Activity Log Details</DialogTitle>
            <DialogDescription>
              Immutable verification diff record for ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading || !detailQuery.data ? (
            <div className="h-48 flex items-center justify-center">Loading audit details...</div>
          ) : (
            <div className="space-y-4 py-2 text-xs max-h-[350px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/20 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">User Account</span>
                  <span className="font-semibold text-foreground text-xs block">
                    {detailQuery.data.user}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    Reference IP Address
                  </span>
                  <span className="font-mono text-foreground text-xs block">
                    {detailQuery.data.ipAddress}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    Activity Target Module
                  </span>
                  <span className="font-semibold text-foreground text-xs block">
                    {detailQuery.data.module}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">System Timestamp</span>
                  <span className="text-foreground text-xs block">
                    {detailQuery.data.timestamp}
                  </span>
                </div>
              </div>

              {detailQuery.data.details && (
                <div className="space-y-3">
                  {detailQuery.data.details.before && detailQuery.data.details.after && (
                    <div className="space-y-2">
                      <span className="font-bold text-foreground block">JSON Diff View</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-red-500/5 rounded-xl border border-red-200/50">
                          <span className="text-red-700 font-bold block text-[10px] mb-1">
                            Before Change
                          </span>
                          <pre className="font-mono text-[10px] text-red-800 overflow-x-auto">
                            {JSON.stringify(detailQuery.data.details.before, null, 2)}
                          </pre>
                        </div>
                        <div className="p-3 bg-green-500/5 rounded-xl border border-green-200/50">
                          <span className="text-green-700 font-bold block text-[10px] mb-1">
                            After Change
                          </span>
                          <pre className="font-mono text-[10px] text-green-800 overflow-x-auto">
                            {JSON.stringify(detailQuery.data.details.after, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {detailQuery.data.details.metadata && (
                    <div className="p-3 bg-secondary/10 rounded-xl border border-border">
                      <span className="font-bold text-foreground block text-[10px] mb-1.5">
                        User Metadata Details
                      </span>
                      <pre className="font-mono text-[10px] text-muted-foreground overflow-x-auto">
                        {JSON.stringify(detailQuery.data.details.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton variant="outline" onClick={() => setDetailOpen(false)}>
              Close Details
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Export Logs Wizard */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compile & Export Audit Trail Logs</DialogTitle>
            <DialogDescription>
              Generate encrypted system changes log audit report for compliance reviews.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExportSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Export Target Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as "PDF" | "CSV" | "JSON")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="PDF">Secure Statutory PDF Report</option>
                  <option value="CSV">Spreadsheet CSV File</option>
                  <option value="JSON">Raw JSON Payload Log</option>
                </select>
              </div>

              <div className="bg-secondary/40 p-3 rounded-xl flex gap-3 text-xs text-muted-foreground">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-foreground block mb-0.5">
                    SHA-256 Hashed Compliance Log
                  </span>
                  Statutory exports include system-level SHA-256 hashes verifying that audit logs
                  remain unmodified.
                </div>
              </div>
            </div>

            <DialogFooter className="mt-5 border-t border-border pt-3">
              <ErpButton type="button" variant="outline" onClick={() => setExportOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit">Compile & Download</ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
