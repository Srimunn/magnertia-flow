import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Wallet,
  ArrowDown,
  Zap,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
  ChevronDown,
  Send,
  CircleCheck,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetBand } from "@/widgets/components/WidgetBand";
import { FinanceTabBar } from "@/components/erp/FinanceTabBar";
import { ErpButton } from "@/components/erp/Button";
import { CardHeader } from "@/components/erp/CardHeader";
import { FilterButton, FilterSelect } from "@/components/erp/FilterButton";
import { PaginationFooter } from "@/components/erp/PaginationFooter";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { EmptyState } from "@/components/erp/DataTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { company, formatCurrency } from "@/lib/mock-data";
import {
  accountsPayableService,
  analyticsEngineService,
  loadAccountsPayableDashboard,
  paymentService,
  reportingEngineService,
  vendorManagementService,
} from "@/services";
import type {
  AgingReport,
  DashboardQuery,
  InvoiceFilters,
  InvoiceStatus,
  PayableInvoice,
  VendorProfile,
} from "@/services/types";

export const Route = createFileRoute("/management/finance/payables")({
  head: () => ({ meta: [{ title: "Accounts Payable · Magnertia" }] }),
  component: AccountsPayablePage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const TABS: { label: string; value: InvoiceStatus | "All" }[] = [
  { label: "All Invoices", value: "All" },
  { label: "Overdue", value: "Overdue" },
  { label: "Due Soon", value: "Due Soon" },
  { label: "Paid", value: "Paid" },
  { label: "Canceled", value: "Canceled" },
];

const STATUS_OPTIONS: { label: string; value: InvoiceFilters["status"] }[] = [
  { label: "All", value: "All" },
  { label: "Paid", value: "Paid" },
  { label: "Due Soon", value: "Due Soon" },
  { label: "Overdue", value: "Overdue" },
  { label: "Canceled", value: "Canceled" },
];

const DEFAULT_FILTERS: InvoiceFilters = { search: "", status: "All", page: 1, pageSize: 10 };

function AccountsPayablePage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<InvoiceFilters>(DEFAULT_FILTERS);
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentInvoiceNo, setPaymentInvoiceNo] = useState<string | null>(null);
  const [approveListOpen, setApproveListOpen] = useState(false);

  const kpisQuery = useQuery({
    queryKey: ["payables", "kpis", QUERY.fiscalYear],
    queryFn: () => loadAccountsPayableDashboard(QUERY),
  });

  const listQuery = useQuery({
    queryKey: ["payables", "list", filters],
    queryFn: () => accountsPayableService.retrieveInvoiceList(QUERY, filters),
  });

  const detailQuery = useQuery({
    queryKey: ["payables", "detail", selectedInvoiceNo],
    queryFn: () => accountsPayableService.retrieveInvoiceDetails(selectedInvoiceNo as string),
    enabled: selectedInvoiceNo !== null,
  });

  const vendorQuery = useQuery({
    queryKey: ["payables", "vendor", detailQuery.data?.vendor],
    queryFn: () => vendorManagementService.fetchVendorInformation(detailQuery.data!.vendor),
    enabled: !!detailQuery.data,
  });

  const agingQuery = useQuery({
    queryKey: ["payables", "aging"],
    queryFn: () => analyticsEngineService.generateApAgingSummary(QUERY),
  });

  const topVendorsQuery = useQuery({
    queryKey: ["payables", "top-vendors"],
    queryFn: () => analyticsEngineService.calculateTopVendors(QUERY),
  });

  const paymentSummaryQuery = useQuery({
    queryKey: ["payables", "payment-summary"],
    queryFn: () => analyticsEngineService.generatePaymentSummary(QUERY),
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["payables"] });
  }

  const createMutation = useMutation({
    mutationFn: accountsPayableService.saveInvoice,
    onSuccess: (invoice) => {
      toast.success(`${invoice.invoiceNo} created`);
      setCreateOpen(false);
      invalidateAll();
    },
  });

  const paymentMutation = useMutation({
    mutationFn: paymentService.processPayment,
    onSuccess: (invoice) => {
      toast.success(`Payment recorded for ${invoice.invoiceNo}`);
      setPaymentInvoiceNo(null);
      invalidateAll();
    },
  });

  const approveMutation = useMutation({
    mutationFn: (invoiceNo: string) => accountsPayableService.updateApprovalStatus(invoiceNo, true),
    onSuccess: (invoice) => {
      toast.success(`${invoice.invoiceNo} approved`);
      invalidateAll();
    },
  });

  const exportMutation = useMutation({
    mutationFn: (format: "csv" | "xlsx" | "pdf") =>
      reportingEngineService.generateAccountsPayableExport(QUERY, format),
    onSuccess: (result) => toast.success(`Export ready: ${result.fileName}`),
  });

  function updateFilters(patch: Partial<InvoiceFilters>) {
    setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));
  }

  const kpis = kpisQuery.data;

  return (
    <AppShell
      title="Finance"
      breadcrumb="Management"
      description="Manage vendor invoices, payments, and liabilities efficiently."
      tabs={<FinanceTabBar />}
      topbarActions={
        <ErpButton onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Invoice
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </ErpButton>
      }
    >
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Payables"
          value={kpis ? formatCurrency(kpis.totalPayables) : "—"}
          neutralText="All Outstanding"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Overdue Amount"
          value={kpis ? formatCurrency(kpis.overdueAmount) : "—"}
          neutralText={kpis ? `${kpis.overduePctOfTotal.toFixed(2)}% of Total` : undefined}
          captionTone="negative"
          iconBg="bg-[#3B82F6]/10"
          iconColor="text-[#3B82F6]"
          icon={<ArrowDown className="h-5 w-5" />}
        />
        <StatCard
          label="Due Within 30 Days"
          value={kpis ? formatCurrency(kpis.dueWithin30Days) : "—"}
          neutralText={kpis ? `${kpis.dueWithin30PctOfTotal.toFixed(2)}% of Total` : undefined}
          iconBg="bg-[#F59E0B]/10"
          iconColor="text-[#F59E0B]"
          icon={<Zap className="h-5 w-5" />}
        />
        <StatCard
          label="Paid This Month"
          value={kpis ? formatCurrency(kpis.paidThisMonth) : "—"}
          neutralText="This Month"
          iconBg="bg-[#22C55E]/10"
          iconColor="text-[#22C55E]"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Open Invoices"
          value={kpis ? kpis.openInvoices.toLocaleString() : "—"}
          neutralText="All Outstanding"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      {/* Customizable widget band (empty by default) */}
      <WidgetBand pageId="finance-payables" />

      {/* Toolbar */}
      <div className="mt-5 flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground shadow-sm hover:bg-muted/50">
              <Download className="h-4 w-4 text-muted-foreground" />
              Export
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportMutation.mutate("csv")}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportMutation.mutate("xlsx")}>
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportMutation.mutate("pdf")}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={() => toast.info("More actions are coming in a future release.")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground shadow-sm hover:bg-muted/50"
        >
          More Actions
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3">
        <Tabs
          value={filters.status}
          onValueChange={(v) => updateFilters({ status: v as InvoiceFilters["status"] })}
        >
          <TabsList className="h-auto justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-none border-b-2 border-transparent bg-transparent px-0.5 pb-3 text-[13px] font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table + sidebar */}
      <div className="mt-3 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="card-soft overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Search by vendor, invoice no., amount…"
                className="w-full rounded-md border border-border bg-card py-2 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <FilterSelect
              value={filters.status}
              onChange={(v) => updateFilters({ status: v as InvoiceFilters["status"] })}
              options={STATUS_OPTIONS}
            />
            <FilterButton label="Apr 1, 2024 – Mar 31, 2025" />
            <FilterButton label="Due Date: All" />
            <FilterButton label="Vendor: All" />
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-2 text-[12px] font-medium text-foreground hover:bg-muted/50">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              Filters
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>

          {listQuery.data && listQuery.data.rows.length === 0 ? (
            <EmptyState
              title="No invoices found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-3 text-left">Invoice No.</th>
                    <th className="px-3 py-3 text-left">Vendor</th>
                    <th className="px-3 py-3 text-left">Invoice Date</th>
                    <th className="px-3 py-3 text-left">Due Date</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-3 py-3 text-left">Status</th>
                    <th className="px-3 py-3 text-right">Due Amount</th>
                    <th className="w-9 px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(listQuery.data?.rows ?? []).map((row) => (
                    <InvoiceRow
                      key={row.invoiceNo}
                      row={row}
                      selected={row.invoiceNo === selectedInvoiceNo}
                      onSelect={() => setSelectedInvoiceNo(row.invoiceNo)}
                      onRecordPayment={() => setPaymentInvoiceNo(row.invoiceNo)}
                      onApprove={() => approveMutation.mutate(row.invoiceNo)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PaginationFooter
            page={filters.page}
            pageSize={filters.pageSize}
            total={listQuery.data?.total ?? 0}
            entityLabel="invoices"
            onPageChange={(page) => updateFilters({ page })}
            onPageSizeChange={(pageSize) => updateFilters({ pageSize, page: 1 })}
          />
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <AgingSummaryCard aging={agingQuery.data} />
          <TopVendorsCard vendors={topVendorsQuery.data ?? []} />
          <PaymentSummaryCard summary={paymentSummaryQuery.data} />
          <QuickActionsCard
            onRecordPayment={() => setPaymentInvoiceNo("")}
            onNewInvoice={() => setCreateOpen(true)}
            onVendorList={() => toast.info("Vendor list is coming in a future release.")}
            onApproveInvoices={() => setApproveListOpen(true)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center text-[11px] text-muted-foreground">
        All amounts are in INR &nbsp;|&nbsp; Data as of: May 20, 2025 10:30 AM
      </div>

      {/* Invoice details */}
      <InvoiceDetailsDialog
        open={selectedInvoiceNo !== null}
        onOpenChange={(open) => !open && setSelectedInvoiceNo(null)}
        invoice={detailQuery.data ?? null}
        vendor={vendorQuery.data ?? null}
        onRecordPayment={() => {
          if (selectedInvoiceNo) {
            setPaymentInvoiceNo(selectedInvoiceNo);
            setSelectedInvoiceNo(null);
          }
        }}
        onApprove={() => {
          if (selectedInvoiceNo) approveMutation.mutate(selectedInvoiceNo);
        }}
      />

      {/* Create invoice */}
      <CreateInvoiceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(input) => createMutation.mutate(input)}
        submitting={createMutation.isPending}
      />

      {/* Record payment */}
      <RecordPaymentDialog
        open={paymentInvoiceNo !== null}
        onOpenChange={(open) => !open && setPaymentInvoiceNo(null)}
        invoiceNo={paymentInvoiceNo}
        invoices={listQuery.data?.rows.filter((r) => r.dueAmount > 0) ?? []}
        onSubmit={(input) => paymentMutation.mutate(input)}
        submitting={paymentMutation.isPending}
      />

      {/* Approve invoices */}
      <ApproveInvoicesDialog
        open={approveListOpen}
        onOpenChange={setApproveListOpen}
        invoices={(listQuery.data?.rows ?? []).filter((r) => !r.approved)}
        onApprove={(invoiceNo) => approveMutation.mutate(invoiceNo)}
        approving={approveMutation.isPending}
      />
    </AppShell>
  );
}

/* ---------- Table row ---------- */
function InvoiceRow({
  row,
  selected,
  onSelect,
  onRecordPayment,
  onApprove,
}: {
  row: PayableInvoice;
  selected: boolean;
  onSelect: () => void;
  onRecordPayment: () => void;
  onApprove: () => void;
}) {
  return (
    <tr
      className={`cursor-pointer transition-colors hover:bg-secondary/30 ${selected ? "bg-secondary/50" : ""}`}
    >
      <td className="px-3 py-2.5" onClick={onSelect}>
        <span className="font-medium text-primary hover:underline">{row.invoiceNo}</span>
      </td>
      <td className="px-3 py-2.5 text-foreground" onClick={onSelect}>
        {row.vendor}
      </td>
      <td className="px-3 py-2.5 text-muted-foreground" onClick={onSelect}>
        {row.invoiceDate}
      </td>
      <td className="px-3 py-2.5 text-muted-foreground" onClick={onSelect}>
        {row.dueDate}
      </td>
      <td className="px-3 py-2.5 text-right tabular text-foreground" onClick={onSelect}>
        {formatCurrency(row.amount)}
      </td>
      <td className="px-3 py-2.5" onClick={onSelect}>
        <StatusBadge status={row.status} />
      </td>
      <td
        className={`px-3 py-2.5 text-right font-semibold tabular ${row.dueAmount > 0 ? "text-[#EF4444]" : "text-foreground"}`}
        onClick={onSelect}
      >
        {formatCurrency(row.dueAmount)}
      </td>
      <td className="px-3 py-2.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              aria-label={`Actions for ${row.invoiceNo}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>View Details</DropdownMenuItem>
            {row.dueAmount > 0 && (
              <DropdownMenuItem onClick={onRecordPayment}>Record Payment</DropdownMenuItem>
            )}
            {!row.approved && <DropdownMenuItem onClick={onApprove}>Approve</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

/* ---------- Aging Summary ---------- */
function AgingSummaryCard({ aging }: { aging?: AgingReport }) {
  return (
    <div className="card-soft p-5">
      <CardHeader title="Aging Summary" right={<FilterButton label="As of Today" />} />
      {!aging ? (
        <div className="h-5 w-32 animate-pulse rounded bg-primary/10" />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-[150px] w-[150px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={aging.buckets}
                  dataKey="amount"
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={1}
                  stroke="none"
                >
                  {aging.buckets.map((b) => (
                    <Cell key={b.bucket} fill={b.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="font-display text-[15px] font-bold text-foreground tabular">
                  {formatCurrency(aging.total, true)}
                </div>
                <div className="text-[10px] text-muted-foreground">Total Payables</div>
              </div>
            </div>
          </div>
          <ul className="w-full space-y-2 text-[13px]">
            {aging.buckets.map((b) => (
              <li key={b.bucket} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 truncate text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: b.color }}
                  />
                  <span className="truncate">{b.bucket}</span>
                </span>
                <span className="shrink-0 font-semibold text-foreground tabular">
                  {formatCurrency(b.amount, true)} ({b.pct.toFixed(2)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Top Vendors ---------- */
function TopVendorsCard({ vendors }: { vendors: { vendor: string; amount: number }[] }) {
  return (
    <div className="card-soft p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold text-foreground">
          Top Vendors by Payables
        </h3>
        <button className="text-[12px] font-semibold text-primary hover:underline">View All</button>
      </div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Vendor</span>
        <span>Amount</span>
      </div>
      <ul className="divide-y divide-border">
        {vendors.map((v) => (
          <li key={v.vendor} className="flex items-center justify-between gap-2 py-2.5 text-[13px]">
            <span className="truncate text-foreground">{v.vendor}</span>
            <span className="shrink-0 font-semibold tabular text-foreground">
              {formatCurrency(v.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Payment Summary ---------- */
function PaymentSummaryCard({
  summary,
}: {
  summary?: {
    totalPaid: number;
    averagePayment: number;
    totalPayments: number;
    discountsTaken: number;
  };
}) {
  return (
    <div className="card-soft p-5">
      <CardHeader title="Payment Summary" right={<FilterButton label="This Month" />} />
      {!summary ? (
        <div className="h-5 w-32 animate-pulse rounded bg-primary/10" />
      ) : (
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <div className="text-muted-foreground">Total Paid</div>
            <div className="mt-0.5 font-display text-[16px] font-bold text-foreground tabular">
              {formatCurrency(summary.totalPaid)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Average Payment</div>
            <div className="mt-0.5 font-display text-[16px] font-bold text-foreground tabular">
              {formatCurrency(summary.averagePayment)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Payments</div>
            <div className="mt-0.5 font-display text-[16px] font-bold text-foreground tabular">
              {summary.totalPayments}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Discounts Taken</div>
            <div className="mt-0.5 font-display text-[16px] font-bold text-[#22C55E] tabular">
              {formatCurrency(summary.discountsTaken)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Quick Actions ---------- */
function QuickActionsCard({
  onRecordPayment,
  onNewInvoice,
  onVendorList,
  onApproveInvoices,
}: {
  onRecordPayment: () => void;
  onNewInvoice: () => void;
  onVendorList: () => void;
  onApproveInvoices: () => void;
}) {
  const actions = [
    {
      label: "Record Payment",
      icon: CircleCheck,
      color: "text-[#22C55E]",
      bg: "bg-[#22C55E]/10",
      onClick: onRecordPayment,
    },
    {
      label: "New Invoice",
      icon: FileText,
      color: "text-[#3B82F6]",
      bg: "bg-[#3B82F6]/10",
      onClick: onNewInvoice,
    },
    {
      label: "Vendor List",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      onClick: onVendorList,
    },
    {
      label: "Approve Invoices",
      icon: ClipboardCheck,
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
      onClick: onApproveInvoices,
    },
  ];
  return (
    <div className="card-soft p-5">
      <h3 className="mb-4 font-display text-[15px] font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex flex-col items-center gap-2 rounded-lg p-2 text-center hover:bg-muted/50"
          >
            <div className={`grid h-10 w-10 place-items-center rounded-full ${a.bg} ${a.color}`}>
              <a.icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium leading-tight text-foreground">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Invoice details dialog ---------- */
function InvoiceDetailsDialog({
  open,
  onOpenChange,
  invoice,
  vendor,
  onRecordPayment,
  onApprove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: PayableInvoice | null | undefined;
  vendor: VendorProfile | null;
  onRecordPayment: () => void;
  onApprove: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {!invoice ? (
          <div className="h-5 w-32 animate-pulse rounded bg-primary/10" />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {invoice.invoiceNo}
                <StatusBadge status={invoice.status} />
              </DialogTitle>
            </DialogHeader>
            <dl className="space-y-2 text-[13px]">
              <Field label="Vendor" value={invoice.vendor} />
              <Field label="Invoice Date" value={invoice.invoiceDate} />
              <Field label="Due Date" value={invoice.dueDate} />
              <Field label="Amount" value={formatCurrency(invoice.amount)} />
              <Field
                label="Due Amount"
                value={formatCurrency(invoice.dueAmount)}
                valueClassName={
                  invoice.dueAmount > 0 ? "text-[#EF4444] font-semibold" : "font-semibold"
                }
              />
              <Field label="Approved" value={invoice.approved ? "Yes" : "No"} />
            </dl>
            {vendor && (
              <div className="border-t border-border pt-3">
                <h4 className="mb-2 text-[13px] font-semibold text-foreground">
                  Vendor Information
                </h4>
                <dl className="space-y-2 text-[13px]">
                  <Field label="Category" value={vendor.category} />
                  <Field label="Email" value={vendor.email} />
                  <Field label="Phone" value={vendor.phone} />
                  <Field label="Payment Terms" value={vendor.paymentTerms} />
                  <Field
                    label="Outstanding Balance"
                    value={formatCurrency(vendor.outstandingBalance)}
                  />
                </dl>
              </div>
            )}
            <DialogFooter>
              {!invoice.approved && (
                <ErpButton variant="outline" onClick={onApprove}>
                  Approve
                </ErpButton>
              )}
              {invoice.dueAmount > 0 && (
                <ErpButton onClick={onRecordPayment}>
                  <Send className="h-4 w-4" /> Record Payment
                </ErpButton>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right text-foreground ${valueClassName ?? ""}`}>{value}</dd>
    </div>
  );
}

/* ---------- Create invoice dialog ---------- */
function CreateInvoiceDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    vendor: string;
    invoiceNo: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
  }) => void;
  submitting: boolean;
}) {
  const [vendor, setVendor] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");

  function reset() {
    setVendor("");
    setInvoiceNo("");
    setInvoiceDate("");
    setDueDate("");
    setAmount("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <FormField label="Vendor">
            <input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className={inputClass}
              placeholder="Vendor name"
            />
          </FormField>
          <FormField label="Invoice No.">
            <input
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className={inputClass}
              placeholder="INV-10035"
            />
          </FormField>
          <FormField label="Invoice Date">
            <input
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className={inputClass}
              placeholder="May 21, 2025"
            />
          </FormField>
          <FormField label="Due Date">
            <input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
              placeholder="Jun 20, 2025"
            />
          </FormField>
          <FormField label="Amount">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              className={inputClass}
              placeholder="0.00"
            />
          </FormField>
        </div>
        <DialogFooter>
          <ErpButton
            disabled={!vendor || !invoiceNo || !invoiceDate || !dueDate || !amount || submitting}
            onClick={() =>
              onSubmit({ vendor, invoiceNo, invoiceDate, dueDate, amount: Number(amount) })
            }
          >
            {submitting ? "Saving…" : "Create Invoice"}
          </ErpButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Record payment dialog ---------- */
function RecordPaymentDialog({
  open,
  onOpenChange,
  invoiceNo,
  invoices,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNo: string | null;
  invoices: PayableInvoice[];
  onSubmit: (input: {
    invoiceNo: string;
    amount: number;
    paymentDate: string;
    method: string;
  }) => void;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState(invoiceNo || "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");

  const current = invoices.find((i) => i.invoiceNo === (invoiceNo || selected));
  const effectiveInvoiceNo = invoiceNo || selected;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setSelected("");
          setAmount("");
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <FormField label="Invoice">
            {invoiceNo ? (
              <div className="text-[13px] font-medium text-foreground">
                {invoiceNo} — {current?.vendor}
              </div>
            ) : (
              <FilterSelect
                value={selected}
                onChange={setSelected}
                options={[
                  { label: "Select an invoice…", value: "" },
                  ...invoices.map((i) => ({
                    label: `${i.invoiceNo} — ${i.vendor} (${formatCurrency(i.dueAmount)})`,
                    value: i.invoiceNo,
                  })),
                ]}
                className="w-full"
              />
            )}
          </FormField>
          <FormField label="Amount">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              className={inputClass}
              placeholder={current ? String(current.dueAmount) : "0.00"}
            />
          </FormField>
          <FormField label="Payment Method">
            <FilterSelect
              value={method}
              onChange={setMethod}
              options={["Bank Transfer", "Credit Card", "Check", "ACH"].map((m) => ({
                label: m,
                value: m,
              }))}
              className="w-full"
            />
          </FormField>
        </div>
        <DialogFooter>
          <ErpButton
            disabled={!effectiveInvoiceNo || !amount || submitting}
            onClick={() =>
              onSubmit({
                invoiceNo: effectiveInvoiceNo,
                amount: Number(amount),
                paymentDate: "May 20, 2025",
                method,
              })
            }
          >
            {submitting ? "Processing…" : "Record Payment"}
          </ErpButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Approve invoices dialog ---------- */
function ApproveInvoicesDialog({
  open,
  onOpenChange,
  invoices,
  onApprove,
  approving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: PayableInvoice[];
  onApprove: (invoiceNo: string) => void;
  approving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Invoices</DialogTitle>
        </DialogHeader>
        {invoices.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            All invoices are approved.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {invoices.map((inv) => (
              <li
                key={inv.invoiceNo}
                className="flex items-center justify-between gap-3 py-2.5 text-[13px]"
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{inv.invoiceNo}</div>
                  <div className="truncate text-muted-foreground">
                    {inv.vendor} — {formatCurrency(inv.amount)}
                  </div>
                </div>
                <ErpButton size="sm" disabled={approving} onClick={() => onApprove(inv.invoiceNo)}>
                  Approve
                </ErpButton>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[12px] font-medium text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";
