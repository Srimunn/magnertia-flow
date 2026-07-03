import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  FileText,
  DollarSign,
  CalendarDays,
  CalendarRange,
  Clock,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
  ChevronDown,
  X,
  Pencil,
  Send,
  FileOutput,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { CardHeader } from "@/components/erp/CardHeader";
import { FilterButton, FilterSelect } from "@/components/erp/FilterButton";
import { PaginationFooter } from "@/components/erp/PaginationFooter";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { TypeBadge } from "@/components/erp/TypeBadge";
import { EmptyState } from "@/components/erp/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { company, formatCurrency, formatSignedCurrency } from "@/lib/mock-data";
import { loadTransactionsData, reportingEngineService, transactionService } from "@/services";
import type {
  DashboardQuery,
  TransactionDetail,
  TransactionFilters,
  TransactionRecord,
  TransactionStatus,
  TransactionUpdate,
} from "@/services/types";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transactions · Magnertia" }] }),
  component: TransactionsPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const TYPE_OPTIONS: { label: string; value: TransactionFilters["type"] }[] = [
  { label: "All Types", value: "All Types" },
  { label: "Invoice", value: "Invoice" },
  { label: "Payment", value: "Payment" },
  { label: "Journal Entry", value: "Journal Entry" },
  { label: "Bill", value: "Bill" },
  { label: "Receipt", value: "Receipt" },
];

const STATUS_OPTIONS: { label: string; value: TransactionFilters["status"] }[] = [
  { label: "All Statuses", value: "All Statuses" },
  { label: "Posted", value: "Posted" },
  { label: "Approved", value: "Approved" },
  { label: "Pending", value: "Pending" },
];

const DEFAULT_FILTERS: TransactionFilters = {
  search: "",
  type: "All Types",
  status: "All Statuses",
  sortDir: "desc",
  page: 1,
  pageSize: 10,
};

function TransactionsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const kpisQuery = useQuery({
    queryKey: ["transactions", "kpis", QUERY.fiscalYear],
    queryFn: () => loadTransactionsData(QUERY),
  });

  const listQuery = useQuery({
    queryKey: ["transactions", "list", filters],
    queryFn: () => transactionService.searchTransactions(QUERY, filters),
  });

  const detailQuery = useQuery({
    queryKey: ["transactions", "detail", selectedRef],
    queryFn: () => transactionService.fetchTransactionDetails(selectedRef as string),
    enabled: selectedRef !== null,
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { ref: string; patch: TransactionUpdate }) =>
      transactionService.updateTransaction(vars.ref, vars.patch),
    onSuccess: (updated) => {
      toast.success(`${updated.ref} updated`);
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const remindMutation = useMutation({
    mutationFn: (ref: string) => transactionService.notifyCustomerOrSupplier(ref),
    onSuccess: (_result, ref) => toast.success(`Reminder sent for ${ref}`),
  });

  const viewInvoiceMutation = useMutation({
    mutationFn: (ref: string) => reportingEngineService.generateInvoiceDocument(QUERY, ref),
    onSuccess: (result) => toast.success(`Invoice generated: ${result.fileName}`),
  });

  const exportMutation = useMutation({
    mutationFn: (format: "csv" | "xlsx" | "pdf") =>
      reportingEngineService.generateExport(QUERY, format),
    onSuccess: (result) => toast.success(`Export ready: ${result.fileName}`),
  });

  function updateFilters(patch: Partial<TransactionFilters>) {
    setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));
  }

  function selectTransaction(ref: string, startEditing = false) {
    setSelectedRef(ref);
    setEditing(startEditing);
  }

  const kpis = kpisQuery.data;

  return (
    <AppShell
      title="Transactions"
      breadcrumb="Financial Management"
      description="View, search and manage all financial transactions."
      topbarActions={
        <ErpButton
          onClick={() =>
            toast.info("Creating transactions isn't wired up yet — coming in a future release.")
          }
        >
          <Plus className="h-4 w-4" />
          New Transaction
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </ErpButton>
      }
    >
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Transactions"
          value={kpis ? kpis.totalTransactions.toLocaleString() : "—"}
          neutralText="This Year"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Total Amount"
          value={kpis ? formatCurrency(kpis.totalAmount, true) : "—"}
          neutralText="This Year"
          iconBg="bg-[#22C55E]/10"
          iconColor="text-[#22C55E]"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Transactions Today"
          value={kpis ? String(kpis.transactionsToday.count) : "—"}
          neutralText={kpis ? formatCurrency(kpis.transactionsToday.amount, true) : undefined}
          iconBg="bg-[#3B82F6]/10"
          iconColor="text-[#3B82F6]"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          label="This Month"
          value={kpis ? String(kpis.thisMonth.count) : "—"}
          neutralText={kpis ? formatCurrency(kpis.thisMonth.amount, true) : undefined}
          iconBg="bg-[#F59E0B]/10"
          iconColor="text-[#F59E0B]"
          icon={<CalendarRange className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Approval"
          value={kpis ? String(kpis.pendingApproval.count) : "—"}
          neutralText={kpis ? formatCurrency(kpis.pendingApproval.amount, true) : undefined}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

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

      {/* Table + detail panel */}
      <div
        className={`mt-3 grid items-start gap-4 ${selectedRef ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "xl:grid-cols-1"}`}
      >
        <div className="card-soft overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Search by reference, description, amount…"
                className="w-full rounded-md border border-border bg-card py-2 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <FilterButton label="Apr 1, 2024 – Mar 31, 2025" />
            <FilterSelect
              value={filters.type}
              onChange={(v) => updateFilters({ type: v as TransactionFilters["type"] })}
              options={TYPE_OPTIONS}
            />
            <FilterSelect
              value={filters.status}
              onChange={(v) => updateFilters({ status: v as TransactionFilters["status"] })}
              options={STATUS_OPTIONS}
            />
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-2 text-[12px] font-medium text-foreground hover:bg-muted/50">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              Filters
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Clear All
            </button>
            <button
              onClick={() => toast.info("Saved views are coming in a future release.")}
              className="text-[12px] font-medium text-muted-foreground hover:underline"
            >
              Save View
            </button>
          </div>

          {listQuery.data && listQuery.data.rows.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="w-9 px-4 py-3">
                      <Checkbox aria-label="Select all" />
                    </th>
                    <th className="px-3 py-3 text-left">
                      <button
                        onClick={() =>
                          updateFilters({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })
                        }
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        Date <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3 py-3 text-left">Reference</th>
                    <th className="px-3 py-3 text-left">Description</th>
                    <th className="px-3 py-3 text-left">Type</th>
                    <th className="px-3 py-3 text-left">Account</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-3 py-3 text-left">Status</th>
                    <th className="w-9 px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(listQuery.data?.rows ?? []).map((row) => (
                    <TransactionRow
                      key={row.ref}
                      row={row}
                      selected={row.ref === selectedRef}
                      onSelect={() => selectTransaction(row.ref)}
                      onEdit={() => selectTransaction(row.ref, true)}
                      onRemind={() => remindMutation.mutate(row.ref)}
                      onViewInvoice={() => viewInvoiceMutation.mutate(row.ref)}
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
            entityLabel="entries"
            onPageChange={(page) => updateFilters({ page })}
            onPageSizeChange={(pageSize) => updateFilters({ pageSize, page: 1 })}
          />
        </div>

        {selectedRef && (
          <TransactionDetailsPanel
            detail={detailQuery.data ?? null}
            loading={detailQuery.isLoading}
            editing={editing}
            onClose={() => {
              setSelectedRef(null);
              setEditing(false);
            }}
            onStartEdit={() => setEditing(true)}
            onCancelEdit={() => setEditing(false)}
            onSave={(patch) => updateMutation.mutate({ ref: selectedRef, patch })}
            saving={updateMutation.isPending}
            onRemind={() => remindMutation.mutate(selectedRef)}
            onViewInvoice={() => viewInvoiceMutation.mutate(selectedRef)}
          />
        )}
      </div>

      <div className="mt-4 flex justify-center text-[11px] text-muted-foreground">
        All amounts are in USD &nbsp;|&nbsp; Data as of: May 20, 2025 10:30 AM
      </div>
    </AppShell>
  );
}

/* ---------- Table row ---------- */
function TransactionRow({
  row,
  selected,
  onSelect,
  onEdit,
  onRemind,
  onViewInvoice,
}: {
  row: TransactionRecord;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemind: () => void;
  onViewInvoice: () => void;
}) {
  const canViewInvoice = row.type === "Invoice" || row.type === "Receipt";
  return (
    <tr
      className={`cursor-pointer transition-colors hover:bg-secondary/30 ${selected ? "bg-secondary/50" : ""}`}
    >
      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
        <Checkbox aria-label={`Select ${row.ref}`} />
      </td>
      <td className="px-3 py-2.5 text-muted-foreground" onClick={onSelect}>
        {row.date}
      </td>
      <td className="px-3 py-2.5" onClick={onSelect}>
        <span className="font-medium text-primary hover:underline">{row.ref}</span>
      </td>
      <td className="px-3 py-2.5 text-foreground" onClick={onSelect}>
        {row.description}
      </td>
      <td className="px-3 py-2.5" onClick={onSelect}>
        <TypeBadge type={row.type} />
      </td>
      <td className="px-3 py-2.5 text-muted-foreground" onClick={onSelect}>
        {row.account}
      </td>
      <td
        className={`px-3 py-2.5 text-right font-semibold tabular ${row.amount < 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}
        onClick={onSelect}
      >
        {row.amount < 0 ? `(${formatCurrency(Math.abs(row.amount))})` : formatCurrency(row.amount)}
      </td>
      <td className="px-3 py-2.5" onClick={onSelect}>
        <StatusBadge status={row.status} />
      </td>
      <td className="px-3 py-2.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              aria-label={`Actions for ${row.ref}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onRemind}>Send Reminder</DropdownMenuItem>
            {canViewInvoice && (
              <DropdownMenuItem onClick={onViewInvoice}>View Invoice</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

/* ---------- Details panel ---------- */
function TransactionDetailsPanel({
  detail,
  loading,
  editing,
  onClose,
  onStartEdit,
  onCancelEdit,
  onSave,
  saving,
  onRemind,
  onViewInvoice,
}: {
  detail: TransactionDetail | null;
  loading: boolean;
  editing: boolean;
  onClose: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: TransactionUpdate) => void;
  saving: boolean;
  onRemind: () => void;
  onViewInvoice: () => void;
}) {
  const [draft, setDraft] = useState<TransactionUpdate>({});

  if (loading || !detail) {
    return (
      <div className="card-soft p-5">
        <div className="h-5 w-32 animate-pulse rounded bg-primary/10" />
      </div>
    );
  }

  const counterparty =
    detail.source === "invoice"
      ? detail.customer
      : detail.source === "payment"
        ? detail.vendor
        : null;
  const dueDate = detail.source !== "journal" ? detail.dueDate : null;
  const hasFinancialSummary = detail.source === "invoice" || detail.source === "payment";

  function startEdit() {
    setDraft({
      description: detail!.description,
      status: detail!.status,
      dueDate: dueDate ?? undefined,
    });
    onStartEdit();
  }

  return (
    <div className="card-soft p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold text-foreground">
          Transaction Details
        </h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="font-display text-lg font-bold text-foreground">{detail.ref}</span>
        <StatusBadge status={detail.status} />
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4 grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <dl className="space-y-2.5 text-[13px]">
            <Field label="Type" value={detail.type} />
            <Field label="Date" value={detail.date} />
            <Field label="Reference" value={detail.ref} />
            <Field label="Description">
              {editing ? (
                <input
                  value={draft.description ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  className="w-full rounded-md border border-border bg-card px-2 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              ) : (
                detail.description
              )}
            </Field>
            {counterparty && (
              <Field
                label={detail.source === "invoice" ? "Customer" : "Vendor"}
                value={counterparty}
              />
            )}
            <Field label="Account" value={detail.account} valueClassName="text-primary" />
            <Field
              label="Amount"
              value={
                detail.amount < 0
                  ? `(${formatCurrency(Math.abs(detail.amount))})`
                  : formatCurrency(detail.amount)
              }
              valueClassName={
                detail.amount < 0 ? "text-[#EF4444] font-semibold" : "text-[#22C55E] font-semibold"
              }
            />
            {dueDate && (
              <Field label="Due Date">
                {editing ? (
                  <input
                    value={draft.dueDate ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
                    className="w-full rounded-md border border-border bg-card px-2 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                ) : (
                  dueDate
                )}
              </Field>
            )}
            <Field label="Status">
              {editing ? (
                <FilterSelect
                  value={draft.status ?? detail.status}
                  onChange={(v) => setDraft((d) => ({ ...d, status: v as TransactionStatus }))}
                  options={["Posted", "Approved", "Pending"].map((s) => ({ label: s, value: s }))}
                />
              ) : (
                <StatusBadge status={detail.status} />
              )}
            </Field>
          </dl>

          {hasFinancialSummary && "subtotal" in detail && (
            <div className="mt-5 border-t border-border pt-4">
              <h4 className="mb-2 text-[13px] font-semibold text-foreground">Summary</h4>
              <dl className="space-y-2 text-[13px]">
                <Field label="Subtotal" value={formatCurrency(detail.subtotal)} />
                <Field
                  label={`Tax (${detail.taxRate.toFixed(1)}%)`}
                  value={formatCurrency(detail.tax)}
                />
                <Field
                  label="Total Amount"
                  value={formatCurrency(detail.totalAmount)}
                  valueClassName="font-semibold"
                />
                <Field
                  label="Amount Paid"
                  value={formatCurrency(detail.amountPaid)}
                  valueClassName="text-[#22C55E] font-semibold"
                />
                <Field
                  label="Balance Due"
                  value={formatCurrency(detail.balanceDue)}
                  valueClassName={
                    detail.balanceDue > 0 ? "text-[#EF4444] font-semibold" : "font-semibold"
                  }
                />
              </dl>
            </div>
          )}

          {detail.source === "journal" && (
            <div className="mt-5 border-t border-border pt-4">
              <h4 className="mb-2 text-[13px] font-semibold text-foreground">Summary</h4>
              <dl className="space-y-2 text-[13px]">
                <Field label="Memo" value={detail.memo} />
                <Field label="Debit" value={formatCurrency(detail.debit)} />
                <Field label="Credit" value={formatCurrency(detail.credit)} />
              </dl>
            </div>
          )}

          <div className="mt-5 space-y-2">
            {editing ? (
              <div className="flex gap-2">
                <ErpButton
                  variant="outline"
                  className="flex-1"
                  onClick={onCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </ErpButton>
                <ErpButton className="flex-1" onClick={() => onSave(draft)} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </ErpButton>
              </div>
            ) : (
              <div className="flex gap-2">
                {detail.source === "invoice" && (
                  <ErpButton variant="outline" className="flex-1" onClick={onViewInvoice}>
                    <FileOutput className="h-4 w-4" /> View Invoice
                  </ErpButton>
                )}
                <ErpButton variant="outline" className="flex-1" onClick={startEdit}>
                  <Pencil className="h-4 w-4" /> Edit
                </ErpButton>
              </div>
            )}
            {!editing && counterparty && (
              <ErpButton className="w-full" onClick={onRemind}>
                <Send className="h-4 w-4" /> Send Reminder
              </ErpButton>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            No history recorded yet.
          </p>
        </TabsContent>
        <TabsContent value="attachments">
          <p className="py-8 text-center text-[13px] text-muted-foreground">No attachments yet.</p>
        </TabsContent>
        <TabsContent value="notes">
          <p className="py-8 text-center text-[13px] text-muted-foreground">No notes yet.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  value,
  valueClassName,
  children,
}: {
  label: string;
  value?: string;
  valueClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right text-foreground ${valueClassName ?? ""}`}>{children ?? value}</dd>
    </div>
  );
}
