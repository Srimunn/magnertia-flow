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
  Clock,
  Briefcase,
  AlertTriangle,
  Globe,
  Building,
  Upload,
  Calendar,
  Grid,
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
import {
  taxManagementService,
  taxFilingService,
  taxPaymentService,
  complianceService,
  loadTaxManagementDashboard,
} from "@/services";
import type {
  TaxObligation,
  TaxFiling,
  TaxPayment,
  TaxAuthority,
  TaxReconciliation,
  DashboardQuery,
} from "@/services/types";

export const Route = createFileRoute("/management/finance/tax")({
  head: () => ({
    meta: [
      { title: "Tax Management · Magnertia" },
      {
        name: "description",
        content: "Manage tax obligations, filings, payments, and compliance across jurisdictions.",
      },
    ],
  }),
  component: TaxManagementPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const TAX_TYPES = [
  "GST",
  "TDS - Salaries",
  "TDS - Contractors",
  "Income Tax",
  "Professional Tax",
  "VAT",
  "Customs Duty",
];

const STATUSES = ["Paid", "Partially Paid", "Due Soon", "Pending"];

function TaxManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "obligations" | "filings" | "payments" | "returns" | "authorities" | "reconciliations"
  >("obligations");

  // Filters
  const [search, setSearch] = useState("");
  const [taxTypeFilter, setTaxTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dueDateFilter, setDueDateFilter] = useState("All");

  // Dialog States
  const [filingOpen, setFilingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);

  // Form Inputs
  const [newFilingInput, setNewFilingInput] = useState({
    taxType: "GST",
    period: "May 2025",
    returnAmount: 0,
    filedBy: "Amit Mehra",
  });

  const [newPaymentInput, setNewPaymentInput] = useState({
    taxType: "GST",
    period: "May 2025",
    bankAccount: "HDFC Operating A/c",
    amount: 0,
    transactionRef: "",
  });

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ["tax", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadTaxManagementDashboard(QUERY),
  });

  const obligationsQuery = useQuery({
    queryKey: ["tax", "obligations"],
    queryFn: () => taxManagementService.fetchObligations(QUERY),
  });

  const filingsQuery = useQuery({
    queryKey: ["tax", "filings"],
    queryFn: () => taxFilingService.fetchFilings(QUERY),
  });

  const paymentsQuery = useQuery({
    queryKey: ["tax", "payments"],
    queryFn: () => taxPaymentService.fetchPayments(QUERY),
  });

  const authoritiesQuery = useQuery({
    queryKey: ["tax", "authorities"],
    queryFn: () => taxManagementService.fetchTaxAuthorities(QUERY),
  });

  const reconciliationsQuery = useQuery({
    queryKey: ["tax", "reconciliations"],
    queryFn: () => complianceService.fetchReconciliations(QUERY),
  });

  const calendarQuery = useQuery({
    queryKey: ["tax", "calendar"],
    queryFn: () => taxFilingService.fetchTaxCalendar(QUERY),
  });

  // Mutations
  const filingMutation = useMutation({
    mutationFn: taxFilingService.createFiling,
    onSuccess: (newFil) => {
      toast.success(`Filing recorded successfully: ${newFil.taxType}`);
      setFilingOpen(false);
      setNewFilingInput({
        taxType: "GST",
        period: "May 2025",
        returnAmount: 0,
        filedBy: "Amit Mehra",
      });
      queryClient.invalidateQueries({ queryKey: ["tax"] });
    },
    onError: () => toast.error("Failed to record tax filing."),
  });

  const paymentMutation = useMutation({
    mutationFn: taxPaymentService.recordTaxPayment,
    onSuccess: (newPay) => {
      toast.success(`Payment successfully recorded: ${newPay.taxType}`);
      setPaymentOpen(false);
      setNewPaymentInput({
        taxType: "GST",
        period: "May 2025",
        bankAccount: "HDFC Operating A/c",
        amount: 0,
        transactionRef: "",
      });
      queryClient.invalidateQueries({ queryKey: ["tax"] });
    },
    onError: () => toast.error("Failed to record tax payment."),
  });

  const reconcileMutation = useMutation({
    mutationFn: () => complianceService.performTaxReconciliation(QUERY),
    onSuccess: (res) => {
      toast.success(
        `Reconciliation run complete! Resolved ${res.reconciledCount} differences (${formatCurrency(res.varianceResolved)} reconciled).`,
      );
      setReconcileOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tax"] });
    },
    onError: () => toast.error("Tax reconciliation run failed."),
  });

  const importMutation = useMutation({
    mutationFn: (file: { name: string }) => taxFilingService.importTaxReturn(file),
    onSuccess: () => {
      toast.success("Tax returns document imported and verified successfully.");
      setImportOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tax"] });
    },
    onError: () => toast.error("Failed to import tax returns."),
  });

  const handleFilingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilingInput.returnAmount) {
      toast.error("Please specify a valid filing return amount.");
      return;
    }
    filingMutation.mutate(newFilingInput);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentInput.amount || !newPaymentInput.transactionRef) {
      toast.error("Please fill in all payment details.");
      return;
    }
    paymentMutation.mutate(newPaymentInput);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    importMutation.mutate({ name: "return_draft.xml" });
  };

  const isLoading = dashboardQuery.isLoading;
  const data = dashboardQuery.data;

  // Filter obligations
  const allObligations = obligationsQuery.data || [];
  const filteredObligations = allObligations.filter((o) => {
    const matchesSearch =
      o.taxType.toLowerCase().includes(search.toLowerCase()) ||
      o.jurisdiction.toLowerCase().includes(search.toLowerCase());
    const matchesType = taxTypeFilter === "All" || o.taxType.includes(taxTypeFilter);
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AppShell
      title="Finance"
      breadcrumb="Management"
      description="Manage tax obligations, filings, payments, and compliance across jurisdictions."
      tabs={<FinanceTabBar />}
      topbarActions={
        <ErpButton onClick={() => setFilingOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Tax Filing</span>
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
              label="Total Tax Liability (YTD)"
              value={formatCurrency(data.kpis.totalTaxLiability)}
              neutralText={`${data.kpis.totalTaxLiabilityDelta}% vs PYTD`}
              icon={<Briefcase className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Total Tax Paid (YTD)"
              value={formatCurrency(data.kpis.totalTaxPaid)}
              neutralText={`${data.kpis.totalTaxPaidDelta}% vs PYTD`}
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Tax Payable"
              value={formatCurrency(data.kpis.taxPayable)}
              neutralText="Due within 30 days"
              icon={<Clock className="h-5 w-5" />}
              iconBg="bg-[#EF4444]/10"
              iconColor="text-[#EF4444]"
            />
            <StatCard
              label="Upcoming Filings"
              value={data.kpis.upcomingFilings.toString()}
              neutralText="Due within 30 days"
              icon={<Calendar className="h-5 w-5" />}
              iconBg="bg-[#F59E0B]/10"
              iconColor="text-[#F59E0B]"
            />
            <StatCard
              label="Compliance Status"
              value={`${data.kpis.complianceStatus}%`}
              neutralText="On Track"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Customizable widget band (empty by default) */}
          <WidgetBand pageId="finance-tax" />

          {/* Main Layout */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Column */}
            <div className="min-w-0 space-y-5">
              {/* Tab Navigation & Sub Header Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      { label: "Tax Obligations", value: "obligations" },
                      { label: "Filings", value: "filings" },
                      { label: "Payments", value: "payments" },
                      { label: "Returns", value: "returns" },
                      { label: "Tax Authorities", value: "authorities" },
                      { label: "Reconciliations", value: "reconciliations" },
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
                    onClick={() => toast.info("Exporting tax report files...")}
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
                      <DropdownMenuItem onClick={() => setReconcileOpen(true)}>
                        Reconcile Taxes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setImportOpen(true)}>
                        Import Returns
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCalendarOpen(true)}>
                        Tax Calendar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tab Panels */}
              <div className="space-y-5">
                {/* 1. OBLIGATIONS TAB */}
                {activeTab === "obligations" && (
                  <>
                    {/* View Controls toolbar */}
                    <div className="flex flex-wrap items-center gap-3.5 card-soft p-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search by tax type, authority, or reference..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={taxTypeFilter}
                          onChange={(e) => setTaxTypeFilter(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        >
                          <option value="All">Tax Type: All</option>
                          {TAX_TYPES.map((t) => (
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
                          <option value="All">Status: All</option>
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Obligations Data Table */}
                    <div className="card-soft overflow-hidden">
                      <DataTable<TaxObligation>
                        data={filteredObligations}
                        columns={[
                          {
                            key: "taxType",
                            header: "Tax Type",
                            cell: (r) => (
                              <span className="font-bold text-foreground">{r.taxType}</span>
                            ),
                          },
                          {
                            key: "jurisdiction",
                            header: "Jurisdiction",
                            cell: (r) => (
                              <span className="text-muted-foreground">{r.jurisdiction}</span>
                            ),
                          },
                          {
                            key: "period",
                            header: "Period",
                            cell: (r) => <span className="text-muted-foreground">{r.period}</span>,
                          },
                          {
                            key: "dueDate",
                            header: "Due Date",
                            cell: (r) => (
                              <span className="font-semibold text-foreground tabular">
                                {r.dueDate}
                              </span>
                            ),
                          },
                          {
                            key: "taxLiability",
                            header: "Tax Liability (₹)",
                            align: "right",
                            cell: (r) => (
                              <span className="font-semibold text-foreground tabular">
                                {formatCurrency(r.taxLiability)}
                              </span>
                            ),
                          },
                          {
                            key: "paid",
                            header: "Paid (₹)",
                            align: "right",
                            cell: (r) => (
                              <span className="text-muted-foreground tabular">
                                {formatCurrency(r.paid)}
                              </span>
                            ),
                          },
                          {
                            key: "payable",
                            header: "Payable (₹)",
                            align: "right",
                            cell: (r) => (
                              <span
                                className={`font-semibold tabular ${r.payable > 0 ? "text-destructive" : "text-green-600"}`}
                              >
                                {formatCurrency(r.payable)}
                              </span>
                            ),
                          },
                          {
                            key: "status",
                            header: "Status",
                            cell: (r) => (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  r.status === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : r.status === "Partially Paid"
                                      ? "bg-blue-100 text-blue-800"
                                      : r.status === "Due Soon"
                                        ? "bg-amber-100 text-amber-800"
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
                              <span>{r.taxType}</span>
                              <span>{formatCurrency(r.taxLiability)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Due: {r.dueDate} • {r.status}
                            </div>
                          </div>
                        )}
                      />
                    </div>

                    {/* Bottom Liability Trend & Summary Combo */}
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="card-soft p-5">
                        <CardHeader title="Tax Liability Trend" />
                        <div className="h-[180px] w-full mt-3">
                          <ResponsiveContainer>
                            <LineChart
                              data={data.trend}
                              margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
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
                                formatter={(v: number) => formatCurrency(v, true)}
                              />
                              <Line
                                type="monotone"
                                dataKey="liability"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="paid"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="card-soft p-5 space-y-4">
                        <CardHeader title="Tax Payment Summary" />
                        <div className="space-y-3 mt-3 text-sm">
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Total Tax Liability (YTD)</span>
                            <span className="font-semibold text-foreground tabular">
                              {formatCurrency(data.kpis.totalTaxLiability)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Total Tax Paid (YTD)</span>
                            <span className="font-semibold text-green-600 tabular">
                              {formatCurrency(data.kpis.totalTaxPaid)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Tax Payable</span>
                            <span className="font-semibold text-destructive tabular">
                              {formatCurrency(data.kpis.taxPayable)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-muted-foreground font-semibold">
                              Effective Tax Rate
                            </span>
                            <span className="font-bold text-primary tabular">24.36%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. FILINGS TAB */}
                {activeTab === "filings" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Statutory Returns Filings</h3>
                    <div className="card-soft overflow-hidden">
                      {filingsQuery.isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          Loading filings...
                        </div>
                      ) : (
                        <DataTable<TaxFiling>
                          data={filingsQuery.data || []}
                          columns={[
                            {
                              key: "taxType",
                              header: "Filing Name",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.taxType}</span>
                              ),
                            },
                            {
                              key: "period",
                              header: "Filing Period",
                              cell: (r) => <span>{r.period}</span>,
                            },
                            {
                              key: "filingDate",
                              header: "Filing Date",
                              cell: (r) => (
                                <span className="text-muted-foreground text-xs">
                                  {r.filingDate}
                                </span>
                              ),
                            },
                            {
                              key: "filedBy",
                              header: "Filed By",
                              cell: (r) => <span>{r.filedBy}</span>,
                            },
                            {
                              key: "returnAmount",
                              header: "Return Amount",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold tabular">
                                  {formatCurrency(r.returnAmount)}
                                </span>
                              ),
                            },
                            {
                              key: "acknowledgementNo",
                              header: "Acknowledgement No.",
                              cell: (r) => (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {r.acknowledgementNo}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div>
                              {r.taxType} - {formatCurrency(r.returnAmount)}
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 3. PAYMENTS TAB */}
                {activeTab === "payments" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Tax Payouts Registry</h3>
                    <div className="card-soft overflow-hidden">
                      {paymentsQuery.isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          Loading payments...
                        </div>
                      ) : (
                        <DataTable<TaxPayment>
                          data={paymentsQuery.data || []}
                          columns={[
                            {
                              key: "taxType",
                              header: "Payment Item",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.taxType}</span>
                              ),
                            },
                            {
                              key: "period",
                              header: "Period",
                              cell: (r) => <span>{r.period}</span>,
                            },
                            {
                              key: "paymentDate",
                              header: "Payment Date",
                              cell: (r) => (
                                <span className="text-muted-foreground text-xs">
                                  {r.paymentDate}
                                </span>
                              ),
                            },
                            {
                              key: "bankAccount",
                              header: "Paid From Account",
                              cell: (r) => <span>{r.bankAccount}</span>,
                            },
                            {
                              key: "amount",
                              header: "Paid Amount",
                              align: "right",
                              cell: (r) => (
                                <span className="font-semibold tabular text-green-600">
                                  {formatCurrency(r.amount)}
                                </span>
                              ),
                            },
                            {
                              key: "transactionRef",
                              header: "Challan / Transaction Ref.",
                              cell: (r) => (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {r.transactionRef}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div>
                              {r.taxType} - {formatCurrency(r.amount)}
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 4. RETURNS TAB */}
                {activeTab === "returns" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Tax Returns Documents Archive</h3>
                      <ErpButton size="sm" onClick={() => setImportOpen(true)}>
                        <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Return
                      </ErpButton>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="card-soft p-4 flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 grid place-items-center rounded bg-red-100 text-red-600 font-bold text-xs">
                          XML
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-foreground block truncate">
                            GST_GSTR3B_Apr2025.xml
                          </span>
                          <span className="text-muted-foreground text-[10px] block">
                            Uploaded May 18, 2025 by Amit Mehra
                          </span>
                        </div>
                        <button className="text-xs font-semibold text-primary hover:underline">
                          Download
                        </button>
                      </div>

                      <div className="card-soft p-4 flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 grid place-items-center rounded bg-blue-100 text-blue-600 font-bold text-xs">
                          PDF
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-foreground block truncate">
                            TDS_24Q_Q4_Receipt.pdf
                          </span>
                          <span className="text-muted-foreground text-[10px] block">
                            Uploaded May 10, 2025 by Neha Sharma
                          </span>
                        </div>
                        <button className="text-xs font-semibold text-primary hover:underline">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. TAX AUTHORITIES TAB */}
                {activeTab === "authorities" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Registered Tax Authorities</h3>
                    <div className="card-soft overflow-hidden">
                      {authoritiesQuery.isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          Loading authorities...
                        </div>
                      ) : (
                        <DataTable<TaxAuthority>
                          data={authoritiesQuery.data || []}
                          columns={[
                            {
                              key: "name",
                              header: "Authority Agency",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.name}</span>
                              ),
                            },
                            {
                              key: "jurisdiction",
                              header: "Jurisdiction",
                              cell: (r) => <span>{r.jurisdiction}</span>,
                            },
                            {
                              key: "taxType",
                              header: "Tax Category",
                              cell: (r) => (
                                <span className="text-muted-foreground">{r.taxType}</span>
                              ),
                            },
                            {
                              key: "portalUrl",
                              header: "Portal Link",
                              cell: (r) => (
                                <a
                                  href={r.portalUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <Globe className="h-3 w-3" /> Visit Portal
                                </a>
                              ),
                            },
                            {
                              key: "contactPerson",
                              header: "Officer Name",
                              cell: (r) => <span>{r.contactPerson}</span>,
                            },
                            {
                              key: "email",
                              header: "Officer Email",
                              cell: (r) => <span className="text-muted-foreground">{r.email}</span>,
                            },
                          ]}
                          mobileCard={(r) => <div>{r.name}</div>}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 6. RECONCILIATIONS TAB */}
                {activeTab === "reconciliations" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Tax Returns vs Books Reconciliations
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Audits comparing figures declared in filings against internal ledger
                          accounts.
                        </p>
                      </div>
                      <ErpButton size="sm" onClick={() => setReconcileOpen(true)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Reconcile Taxes
                      </ErpButton>
                    </div>

                    <div className="card-soft overflow-hidden">
                      {reconciliationsQuery.isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          Loading reconciliations...
                        </div>
                      ) : (
                        <DataTable<TaxReconciliation>
                          data={reconciliationsQuery.data || []}
                          columns={[
                            {
                              key: "taxType",
                              header: "Tax obligation",
                              cell: (r) => (
                                <span className="font-bold text-foreground">{r.taxType}</span>
                              ),
                            },
                            {
                              key: "period",
                              header: "Period",
                              cell: (r) => <span>{r.period}</span>,
                            },
                            {
                              key: "returnsLiability",
                              header: "Returns Liability (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular font-semibold text-foreground">
                                  {formatCurrency(r.returnsLiability)}
                                </span>
                              ),
                            },
                            {
                              key: "booksLiability",
                              header: "Books Liability (₹)",
                              align: "right",
                              cell: (r) => (
                                <span className="tabular text-muted-foreground">
                                  {formatCurrency(r.booksLiability)}
                                </span>
                              ),
                            },
                            {
                              key: "difference",
                              header: "Variance",
                              align: "right",
                              cell: (r) => (
                                <span
                                  className={`tabular font-bold ${r.difference === 0 ? "text-green-600" : "text-destructive"}`}
                                >
                                  {formatCurrency(r.difference)}
                                </span>
                              ),
                            },
                            {
                              key: "status",
                              header: "Audit Status",
                              cell: (r) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    r.status === "Reconciled"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r) => (
                            <div>
                              {r.taxType} - {r.status}
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
              {/* Tax Liability by Type Donut chart */}
              <div className="card-soft p-5">
                <CardHeader title="Tax Liability by Type (YTD)" />

                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data.typeDistribution}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {data.typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[14px] font-bold text-foreground">
                          ₹1.29Cr
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Total Liability
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-1.5 text-xs">
                    {data.typeDistribution.map((entry, index) => (
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

              {/* Upcoming Filings List */}
              <div className="card-soft p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-foreground">Upcoming Filings</h3>
                  <button className="text-[11px] font-semibold text-primary hover:underline">
                    View All
                  </button>
                </div>

                <ul className="space-y-3">
                  {data.upcomingFilingsList.map((fil, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground block truncate">
                          {fil.name}
                        </span>
                        <span className="text-muted-foreground block text-[10px]">
                          {fil.period} • {fil.dueDate}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 self-start ${
                          fil.daysLeft <= 10
                            ? "bg-green-100 text-green-800"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {fil.daysLeft} Days
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Compliance Overview */}
              <div className="card-soft p-5">
                <CardHeader title="Compliance Overview" />

                <div className="grid grid-cols-3 gap-2 text-center mt-3">
                  <div className="bg-secondary/40 p-2.5 rounded-xl border border-border">
                    <span className="font-bold text-[#22C55E] text-base block">
                      {data.compliance.onTrackCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">On Track</span>
                  </div>
                  <div className="bg-secondary/40 p-2.5 rounded-xl border border-border">
                    <span className="font-bold text-[#F59E0B] text-base block">
                      {data.compliance.dueSoonCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Due Soon</span>
                  </div>
                  <div className="bg-secondary/40 p-2.5 rounded-xl border border-border">
                    <span className="font-bold text-[#EF4444] text-base block">
                      {data.compliance.overdueCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Overdue</span>
                  </div>
                </div>

                <button
                  onClick={() => toast.info("Displaying compliance details report...")}
                  className="w-full text-center text-xs font-semibold text-primary hover:underline mt-4 block"
                >
                  View Compliance Report →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTION DIALOGS --- */}

      {/* 1. New Tax Filing Form Dialog */}
      <Dialog open={filingOpen} onOpenChange={setFilingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Statutory Tax Filing</DialogTitle>
            <DialogDescription>
              Save returns and acknowledgement receipt reference codes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFilingSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tax Type *
                  </label>
                  <select
                    value={newFilingInput.taxType}
                    onChange={(e) =>
                      setNewFilingInput((prev) => ({ ...prev, taxType: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    {TAX_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Filing Period *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. May 2025"
                    value={newFilingInput.period}
                    onChange={(e) =>
                      setNewFilingInput((prev) => ({ ...prev, period: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Return Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="500000"
                  value={newFilingInput.returnAmount || ""}
                  onChange={(e) =>
                    setNewFilingInput((prev) => ({
                      ...prev,
                      returnAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setFilingOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={filingMutation.isPending}>
                Save Filing
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Record Tax Payment Form Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Tax Payment Challan</DialogTitle>
            <DialogDescription>Register tax payout bank cleared entries.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tax Type *
                  </label>
                  <select
                    value={newPaymentInput.taxType}
                    onChange={(e) =>
                      setNewPaymentInput((prev) => ({ ...prev, taxType: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    {TAX_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Period *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. May 2025"
                    value={newPaymentInput.period}
                    onChange={(e) =>
                      setNewPaymentInput((prev) => ({ ...prev, period: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Paid From Account *
                  </label>
                  <select
                    value={newPaymentInput.bankAccount}
                    onChange={(e) =>
                      setNewPaymentInput((prev) => ({ ...prev, bankAccount: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                  >
                    <option value="HDFC Operating A/c">HDFC Operating A/c</option>
                    <option value="SBI Treasury A/c">SBI Treasury A/c</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="200000"
                    value={newPaymentInput.amount || ""}
                    onChange={(e) =>
                      setNewPaymentInput((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Transaction Ref / Challan No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-GST-9923-HD"
                  value={newPaymentInput.transactionRef}
                  onChange={(e) =>
                    setNewPaymentInput((prev) => ({ ...prev, transactionRef: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setPaymentOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={paymentMutation.isPending}>
                Record Payment
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Reconcile Taxes Dialog */}
      <Dialog open={reconcileOpen} onOpenChange={setReconcileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Perform Tax Reconciliation</DialogTitle>
            <DialogDescription>
              Run statutory audit tools checking returns declarations vs GL ledger accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/40 p-4 rounded-xl flex gap-3 text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-0.5">
                  Reconciliation Scope
                </span>
                Audits all Indian and regional direct/indirect tax codes (GST, TDS, Professional
                Tax, VAT) for the current fiscal term.
              </div>
            </div>
          </div>
          <DialogFooter className="mt-5">
            <ErpButton variant="outline" onClick={() => setReconcileOpen(false)}>
              Cancel
            </ErpButton>
            <ErpButton
              onClick={() => reconcileMutation.mutate()}
              loading={reconcileMutation.isPending}
            >
              Run Reconciliation
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Import Returns Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Returns Document</DialogTitle>
            <DialogDescription>
              Upload official XML/JSON filing schema receipts from government portals.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/30">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs font-semibold">Click to upload return file</span>
              <span className="text-[10px] text-muted-foreground">
                Supports XML, JSON, or PDF receipts (Max 10MB)
              </span>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setImportOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={importMutation.isPending}>
                Import File
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Tax Calendar Modal */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Tax Obligations Calendar</DialogTitle>
                <span className="text-xs text-muted-foreground">
                  Upcoming due dates and filing events.
                </span>
              </div>
            </div>
          </DialogHeader>

          {calendarQuery.isLoading || !calendarQuery.data ? (
            <div className="h-48 flex items-center justify-center">Loading calendar...</div>
          ) : (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Styled monthly grid template with dots */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `2025-05-${dayNum.toString().padStart(2, "0")}`;
                  const events = calendarQuery.data.filter((e) => e.date === dateStr);

                  return (
                    <div
                      key={i}
                      className="min-h-[50px] border border-border/60 rounded p-1 flex flex-col justify-between hover:bg-secondary/40"
                    >
                      <span className="font-semibold text-[10px] text-muted-foreground text-left">
                        {dayNum}
                      </span>
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {events.map((ev, idx) => (
                          <span
                            key={idx}
                            title={ev.title}
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              ev.type === "filing" ? "bg-amber-500" : "bg-primary"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-3">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Filing Returns
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Challan Payments
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-5 border-t border-border pt-3">
            <ErpButton variant="outline" onClick={() => setCalendarOpen(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
