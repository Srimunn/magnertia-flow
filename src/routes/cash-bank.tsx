import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Landmark,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  FileText,
  Building2,
  RefreshCw,
  Wallet,
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
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { CardHeader } from "@/components/erp/CardHeader";
import { FilterButton, FilterSelect } from "@/components/erp/FilterButton";
import { PaginationFooter } from "@/components/erp/PaginationFooter";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, type Column, EmptyState } from "@/components/erp/DataTable";
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
import { company, formatCurrency, formatSignedCurrency } from "@/lib/mock-data";
import {
  cashBankService,
  bankAccountService,
  bankReconciliatorService,
  loadCashBankDashboard,
} from "@/services";
import type {
  BankAccount,
  BankAccountType,
  BankAccountStatus,
  BankAccountFilters,
  CashTransaction,
  CashTransactionType,
  ChequeRecord,
  DepositRecord,
  DashboardQuery,
  ReconciliationStatus,
} from "@/services/types";

export const Route = createFileRoute("/cash-bank")({
  head: () => ({
    meta: [
      { title: "Cash & Bank · Magnertia" },
      {
        name: "description",
        content: "Monitor cash balances, bank accounts, and cash flows in real time.",
      },
    ],
  }),
  component: CashBankPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };

const TYPE_OPTIONS: { label: string; value: "All Types" | BankAccountType }[] = [
  { label: "All Types", value: "All Types" },
  { label: "Operating", value: "Operating" },
  { label: "Payroll", value: "Payroll" },
  { label: "Collections", value: "Collections" },
  { label: "Petty Cash", value: "Petty Cash" },
  { label: "Savings", value: "Savings" },
];

const STATUS_OPTIONS: { label: string; value: "All Statuses" | BankAccountStatus }[] = [
  { label: "All Statuses", value: "All Statuses" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const CURRENCY_OPTIONS = [
  { label: "All Currency", value: "All Currency" },
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
  { label: "GBP (£)", value: "GBP" },
];

const DEFAULT_FILTERS: BankAccountFilters = {
  search: "",
  type: "All Types",
  status: "All Statuses",
  currency: "All Currency",
};

function CashBankPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "accounts" | "transactions" | "reconciliation" | "cheques" | "deposits"
  >("accounts");
  const [filters, setFilters] = useState<BankAccountFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [recordTxOpen, setRecordTxOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [detailAccount, setDetailAccount] = useState<BankAccount | null>(null);

  // New Bank Account Form State
  const [newAccountInput, setNewAccountInput] = useState({
    name: "",
    bankName: "",
    type: "Operating" as BankAccountType,
    accountNo: "",
    currency: "USD",
    initialBalance: 0,
  });

  // New Transaction Form State
  const [newTxInput, setNewTxInput] = useState({
    date: new Date().toISOString().substring(0, 10),
    description: "",
    type: "Inflow" as CashTransactionType,
    amount: 0,
    bankAccountNo: "",
    category: "Collections",
    reference: "",
  });

  // Statement Reconciliation File State
  const [reconcileAccountNo, setReconcileAccountNo] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Query Dashboard Data
  const dashboardQuery = useQuery({
    queryKey: ["cash-bank", "dashboard", QUERY.fiscalYear],
    queryFn: () => loadCashBankDashboard(QUERY),
  });

  // Query Accounts (filtered)
  const accountsQuery = useQuery({
    queryKey: ["cash-bank", "accounts", filters],
    queryFn: () => bankAccountService.fetchBankAccounts(QUERY, filters),
  });

  // Query Transactions
  const transactionsQuery = useQuery({
    queryKey: ["cash-bank", "transactions"],
    queryFn: () => cashBankService.fetchCashTransactions(QUERY),
    enabled: activeTab === "transactions",
  });

  // Query Cheques
  const chequesQuery = useQuery({
    queryKey: ["cash-bank", "cheques"],
    queryFn: () => cashBankService.fetchCheques(QUERY),
    enabled: activeTab === "cheques",
  });

  // Query Deposits
  const depositsQuery = useQuery({
    queryKey: ["cash-bank", "deposits"],
    queryFn: () => cashBankService.fetchDeposits(QUERY),
    enabled: activeTab === "deposits",
  });

  // Mutations
  const createAccountMutation = useMutation({
    mutationFn: bankAccountService.saveBankAccount,
    onSuccess: (newAcc) => {
      toast.success(`Bank account "${newAcc.name}" created successfully.`);
      setCreateOpen(false);
      setNewAccountInput({
        name: "",
        bankName: "",
        type: "Operating",
        accountNo: "",
        currency: "USD",
        initialBalance: 0,
      });
      queryClient.invalidateQueries({ queryKey: ["cash-bank"] });
    },
    onError: () => {
      toast.error("Failed to create bank account.");
    },
  });

  const recordTxMutation = useMutation({
    mutationFn: cashBankService.saveCashTransaction,
    onSuccess: (newTx) => {
      toast.success(`Cash transaction of ${formatCurrency(newTx.amount)} recorded.`);
      setRecordTxOpen(false);
      setNewTxInput({
        date: new Date().toISOString().substring(0, 10),
        description: "",
        type: "Inflow",
        amount: 0,
        bankAccountNo: "",
        category: "Collections",
        reference: "",
      });
      queryClient.invalidateQueries({ queryKey: ["cash-bank"] });
    },
    onError: () => {
      toast.error("Failed to record transaction.");
    },
  });

  const matchStatementMutation = useMutation({
    mutationFn: ({ accountNo, fileName }: { accountNo: string; fileName: string }) =>
      bankReconciliatorService.matchBankStatement(accountNo, fileName),
    onSuccess: () => {
      toast.success("Bank statement uploaded and matched. Account is now reconciled.");
      setReconcileOpen(false);
      setSelectedFile(null);
      setReconcileAccountNo("");
      queryClient.invalidateQueries({ queryKey: ["cash-bank"] });
    },
    onError: () => {
      toast.error("Failed to reconcile statement.");
    },
  });

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountInput.name || !newAccountInput.bankName || !newAccountInput.accountNo) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createAccountMutation.mutate(newAccountInput);
  };

  const handleRecordTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxInput.description || !newTxInput.amount || !newTxInput.bankAccountNo) {
      toast.error("Please fill in all required fields.");
      return;
    }
    recordTxMutation.mutate(newTxInput);
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileAccountNo || !selectedFile) {
      toast.error("Please select an account and upload a statement file.");
      return;
    }
    matchStatementMutation.mutate({ accountNo: reconcileAccountNo, fileName: selectedFile });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0].name);
    }
  };

  const formatCurrencyLocal = (val: number, currency = "USD") => {
    let symbol = "$";
    if (currency === "EUR") symbol = "€";
    if (currency === "GBP") symbol = "£";

    const sign = val < 0 ? "-" : "";
    const v = Math.abs(val);

    return `${sign}${symbol}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isLoading = dashboardQuery.isLoading || accountsQuery.isLoading;
  const data = dashboardQuery.data;

  return (
    <AppShell
      title="Cash & Bank"
      breadcrumb="Financial Management"
      description="Monitor cash balances, bank accounts and cash flows in real time."
      topbarActions={
        <ErpButton onClick={() => setCreateOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Bank Account</span>
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
          {/* Headline KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Total Cash Balance"
              value={formatCurrency(data.kpis.totalCashBalance.value)}
              delta={{
                label: `${data.kpis.totalCashBalance.deltaPct}% vs. Last Month`,
                direction: data.kpis.totalCashBalance.direction,
                tone: "positive",
              }}
              icon={<Landmark className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Operating Cash"
              value={formatCurrency(data.kpis.operatingCash.value)}
              delta={{
                label: `${data.kpis.operatingCash.deltaPct}% vs. Last Month`,
                direction: data.kpis.operatingCash.direction,
                tone: "positive",
              }}
              icon={<Wallet className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Cash Inflow (MTD)"
              value={formatCurrency(data.kpis.cashInflowMtd.value)}
              delta={{
                label: `${data.kpis.cashInflowMtd.deltaPct}% vs. Last Month`,
                direction: data.kpis.cashInflowMtd.direction,
                tone: "positive",
              }}
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-[#22C55E]/10"
              iconColor="text-[#22C55E]"
            />
            <StatCard
              label="Cash Outflow (MTD)"
              value={formatCurrency(data.kpis.cashOutflowMtd.value)}
              delta={{
                // Green trend to match mockup exactly
                label: `${data.kpis.cashOutflowMtd.deltaPct}% vs. Last Month`,
                direction: data.kpis.cashOutflowMtd.direction,
                tone: "positive",
              }}
              icon={<TrendingDown className="h-5 w-5" />}
              iconBg="bg-[#F59E0B]/10"
              iconColor="text-[#F59E0B]"
            />
            <StatCard
              label="Net Cash Flow (MTD)"
              value={formatCurrency(data.kpis.netCashFlowMtd.value)}
              delta={{
                label: `${data.kpis.netCashFlowMtd.deltaPct}% vs. Last Month`,
                direction: data.kpis.netCashFlowMtd.direction,
                tone: "positive",
              }}
              icon={<Clock className="h-5 w-5" />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Subheader and Main Layout */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Area */}
            <div className="min-w-0 space-y-5">
              {/* Tab Header & Quick Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-1">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      { label: "Bank Accounts", value: "accounts" },
                      { label: "Cash Transactions", value: "transactions" },
                      { label: "Bank Reconciliation", value: "reconciliation" },
                      { label: "Cheques", value: "cheques" },
                      { label: "Deposits", value: "deposits" },
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
                    onClick={() => toast.info("Exporting report...")}
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
                      <DropdownMenuItem onClick={() => setRecordTxOpen(true)}>
                        <Plus className="mr-2 h-3.5 w-3.5" /> Record Cash Transaction
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setReconcileOpen(true)}>
                        <Upload className="mr-2 h-3.5 w-3.5" /> Upload Bank Statement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="space-y-5">
                {/* 1. BANK ACCOUNTS TAB */}
                {activeTab === "accounts" && (
                  <>
                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5 card-soft p-3.5">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search bank accounts..."
                          value={filters.search}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, search: e.target.value }))
                          }
                          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <FilterSelect
                        label="Account Type"
                        value={filters.type}
                        options={TYPE_OPTIONS}
                        onChange={(val) =>
                          setFilters((prev) => ({
                            ...prev,
                            type: val as BankAccountFilters["type"],
                          }))
                        }
                      />

                      <FilterSelect
                        label="Account Status"
                        value={filters.status}
                        options={STATUS_OPTIONS}
                        onChange={(val) =>
                          setFilters((prev) => ({
                            ...prev,
                            status: val as BankAccountFilters["status"],
                          }))
                        }
                      />

                      <FilterSelect
                        label="Currency"
                        value={filters.currency}
                        options={CURRENCY_OPTIONS}
                        onChange={(val) => setFilters((prev) => ({ ...prev, currency: val }))}
                      />

                      <ErpButton
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Reset
                      </ErpButton>
                    </div>

                    {/* Bank Accounts List Table */}
                    <div className="card-soft overflow-hidden">
                      <DataTable
                        data={accountsQuery.data || []}
                        columns={[
                          {
                            key: "name",
                            header: "Account Name",
                            cell: (r) => (
                              <button
                                onClick={() => setDetailAccount(r)}
                                className="flex items-center gap-3 text-left font-medium text-foreground hover:text-primary transition-colors"
                              >
                                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <div>
                                  <span className="font-semibold block">{r.name}</span>
                                </div>
                              </button>
                            ),
                          },
                          {
                            key: "bankName",
                            header: "Bank Name",
                            cell: (r) => (
                              <span className="text-muted-foreground">{r.bankName}</span>
                            ),
                          },
                          {
                            key: "type",
                            header: "Account Type",
                            cell: (r) => (
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold border ${
                                  r.type === "Operating"
                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                    : r.type === "Payroll"
                                      ? "bg-purple-50 border-purple-200 text-purple-700"
                                      : r.type === "Collections"
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : r.type === "Petty Cash"
                                          ? "bg-amber-50 border-amber-200 text-amber-700"
                                          : "bg-gray-50 border-gray-200 text-gray-700"
                                }`}
                              >
                                {r.type}
                              </span>
                            ),
                          },
                          {
                            key: "accountNo",
                            header: "Account No.",
                            cell: (r) => (
                              <span className="font-mono text-xs text-muted-foreground">
                                {r.accountNo}
                              </span>
                            ),
                          },
                          {
                            key: "currency",
                            header: "Currency",
                            cell: (r) => (
                              <span className="font-semibold text-foreground">{r.currency}</span>
                            ),
                          },
                          {
                            key: "currentBalance",
                            header: "Current Balance",
                            align: "right",
                            cell: (r) => (
                              <span className="font-bold tabular text-foreground">
                                {formatCurrencyLocal(r.currentBalance, r.currency)}
                              </span>
                            ),
                          },
                          {
                            key: "status",
                            header: "Status",
                            cell: (r) => (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  r.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {r.status}
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
                                  <DropdownMenuItem onClick={() => setDetailAccount(r)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setReconcileAccountNo(r.accountNo);
                                      setReconcileOpen(true);
                                    }}
                                  >
                                    Reconcile Account
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ),
                          },
                        ]}
                        mobileCard={(r) => (
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <button
                                onClick={() => setDetailAccount(r)}
                                className="font-semibold text-foreground hover:text-primary"
                              >
                                {r.name}
                              </button>
                              <span className="font-bold">
                                {formatCurrencyLocal(r.currentBalance, r.currency)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                {r.bankName} • {r.type}
                              </span>
                              <span>{r.accountNo}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-border">
                              <span
                                className={`text-xs ${r.status === "Active" ? "text-green-600" : "text-gray-500"}`}
                              >
                                {r.status}
                              </span>
                              <div className="flex gap-2">
                                <ErpButton
                                  variant="outline"
                                  size="xs"
                                  onClick={() => setDetailAccount(r)}
                                >
                                  Details
                                </ErpButton>
                                <ErpButton
                                  variant="outline"
                                  size="xs"
                                  onClick={() => {
                                    setReconcileAccountNo(r.accountNo);
                                    setReconcileOpen(true);
                                  }}
                                >
                                  Reconcile
                                </ErpButton>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </div>

                    {/* Cash Flow Summary widget (MTD) */}
                    <div className="card-soft p-5">
                      <CardHeader
                        title="Cash Flow Summary (This Month)"
                        right={
                          <button
                            onClick={() => setActiveTab("transactions")}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            View Cash Flow Statement →
                          </button>
                        }
                      />

                      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center mt-4">
                        {/* 1. Opening Balance */}
                        <div className="flex flex-col items-center p-3 rounded-xl bg-muted/30">
                          <Landmark className="h-5 w-5 text-muted-foreground mb-1.5" />
                          <span className="text-xs text-muted-foreground font-medium">
                            Opening Balance (Apr 1, 2025)
                          </span>
                          <span className="text-[17px] font-bold text-foreground mt-1 tabular">
                            $4,618,370.00
                          </span>
                        </div>

                        {/* Plus */}
                        <div className="text-xl font-bold text-muted-foreground">+</div>

                        {/* 2. Total Inflow */}
                        <div className="flex flex-col items-center p-3 rounded-xl bg-[#22C55E]/5 border border-[#22C55E]/10">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-[#22C55E]" />
                            <span className="text-xs text-muted-foreground font-medium">
                              Total Cash Inflow
                            </span>
                          </div>
                          <span className="text-[17px] font-bold text-[#22C55E] mt-1 tabular">
                            $8,945,320.00
                          </span>
                          <span className="text-[10px] font-semibold text-[#22C55E] mt-1 flex items-center">
                            ▲ 15.67%{" "}
                            <span className="text-muted-foreground font-normal ml-0.5">
                              vs. Last Month
                            </span>
                          </span>
                        </div>

                        {/* Minus */}
                        <div className="text-xl font-bold text-muted-foreground">-</div>

                        {/* 3. Total Outflow */}
                        <div className="flex flex-col items-center p-3 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/10">
                          <div className="flex items-center gap-1.5">
                            <TrendingDown className="h-4 w-4 text-[#F59E0B]" />
                            <span className="text-xs text-muted-foreground font-medium">
                              Total Cash Outflow
                            </span>
                          </div>
                          <span className="text-[17px] font-bold text-foreground mt-1 tabular">
                            $6,781,240.00
                          </span>
                          <span className="text-[10px] font-semibold text-[#22C55E] mt-1 flex items-center">
                            ▲ 9.18%{" "}
                            <span className="text-muted-foreground font-normal ml-0.5">
                              vs. Last Month
                            </span>
                          </span>
                        </div>

                        {/* Equals */}
                        <div className="text-xl font-bold text-muted-foreground">=</div>

                        {/* 4. Closing Balance */}
                        <div className="flex flex-col items-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <CheckCircle2 className="h-5 w-5 text-primary mb-1" />
                          <span className="text-xs text-muted-foreground font-medium">
                            Closing Balance (Apr 30, 2025)
                          </span>
                          <span className="text-[17px] font-bold text-primary mt-1 tabular">
                            $6,782,450.00
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. CASH TRANSACTIONS TAB */}
                {activeTab === "transactions" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <h3 className="font-semibold text-lg">Posted Cash Transactions</h3>
                      <ErpButton size="sm" onClick={() => setRecordTxOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Record Transaction
                      </ErpButton>
                    </div>

                    <div className="card-soft overflow-hidden">
                      {transactionsQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading transactions...
                        </div>
                      ) : !transactionsQuery.data || transactionsQuery.data.length === 0 ? (
                        <EmptyState
                          title="No transactions"
                          description="No cash transactions posted yet."
                        />
                      ) : (
                        <DataTable
                          data={transactionsQuery.data as unknown as Record<string, unknown>[]}
                          columns={[
                            {
                              key: "date",
                              header: "Date",
                              cell: (r: CashTransaction) => (
                                <span className="text-muted-foreground">{r.date}</span>
                              ),
                            },
                            {
                              key: "reference",
                              header: "Ref No.",
                              cell: (r: CashTransaction) => (
                                <span className="font-mono text-xs font-semibold text-foreground">
                                  {r.reference}
                                </span>
                              ),
                            },
                            {
                              key: "description",
                              header: "Description",
                              cell: (r: CashTransaction) => (
                                <span className="font-medium text-foreground">{r.description}</span>
                              ),
                            },
                            {
                              key: "bankAccountNo",
                              header: "Bank Account No.",
                              cell: (r: CashTransaction) => (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {r.bankAccountNo}
                                </span>
                              ),
                            },
                            {
                              key: "category",
                              header: "Category",
                              cell: (r: CashTransaction) => (
                                <span className="text-muted-foreground">{r.category}</span>
                              ),
                            },
                            {
                              key: "type",
                              header: "Type",
                              cell: (r: CashTransaction) => (
                                <span
                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${
                                    r.type === "Inflow"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {r.type}
                                </span>
                              ),
                            },
                            {
                              key: "amount",
                              header: "Amount",
                              align: "right",
                              cell: (r: CashTransaction) => (
                                <span
                                  className={`font-bold tabular ${r.type === "Inflow" ? "text-green-600" : "text-foreground"}`}
                                >
                                  {r.type === "Inflow" ? "+" : "-"}
                                  {formatCurrency(r.amount)}
                                </span>
                              ),
                            },
                            {
                              key: "status",
                              header: "Status",
                              cell: (r: CashTransaction) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    r.status === "Posted"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r: CashTransaction) => (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-foreground">
                                  {r.description}
                                </span>
                                <span
                                  className={`font-bold ${r.type === "Inflow" ? "text-green-600" : "text-foreground"}`}
                                >
                                  {r.type === "Inflow" ? "+" : "-"}
                                  {formatCurrency(r.amount)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {r.date} • {r.reference}
                                </span>
                                <span>{r.category}</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 3. BANK RECONCILIATION TAB */}
                {activeTab === "reconciliation" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div>
                        <h3 className="font-semibold text-lg">Bank Statement Reconciliation</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Compare and reconcile bank statements with ledger balances.
                        </p>
                      </div>
                      <ErpButton size="sm" onClick={() => setReconcileOpen(true)}>
                        <Upload className="h-3.5 w-3.5" />
                        Reconcile Statement
                      </ErpButton>
                    </div>

                    <div className="card-soft overflow-hidden">
                      <DataTable
                        data={data.bankAccounts as unknown as Record<string, unknown>[]}
                        columns={[
                          {
                            key: "name",
                            header: "Bank Account",
                            cell: (r: BankAccount) => (
                              <div>
                                <div className="font-semibold text-foreground">{r.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {r.bankName} • {r.accountNo}
                                </div>
                              </div>
                            ),
                          },
                          {
                            key: "currentBalance",
                            header: "Ledger Balance",
                            cell: (r: BankAccount) => (
                              <span className="font-semibold tabular text-foreground">
                                {formatCurrencyLocal(r.currentBalance, r.currency)}
                              </span>
                            ),
                          },
                          {
                            key: "statementBalance",
                            header: "Statement Balance",
                            cell: (r: BankAccount) => (
                              <span className="font-semibold tabular text-foreground">
                                {formatCurrencyLocal(
                                  r.reconciliationStatus === "Reconciled"
                                    ? r.currentBalance
                                    : r.currentBalance - r.unreconciledAmount,
                                  r.currency,
                                )}
                              </span>
                            ),
                          },
                          {
                            key: "unreconciledAmount",
                            header: "Difference / Unreconciled",
                            cell: (r: BankAccount) => (
                              <span
                                className={`font-bold tabular ${r.unreconciledAmount > 0 ? "text-destructive" : "text-green-600"}`}
                              >
                                {formatCurrencyLocal(r.unreconciledAmount, r.currency)}
                              </span>
                            ),
                          },
                          {
                            key: "reconciliationStatus",
                            header: "Reconciliation Status",
                            cell: (r: BankAccount) => (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  r.reconciliationStatus === "Reconciled"
                                    ? "bg-green-100 text-green-800"
                                    : r.reconciliationStatus === "Partially Reconciled"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {r.reconciliationStatus}
                              </span>
                            ),
                          },
                          {
                            key: "actions",
                            header: "Actions",
                            cell: (r: BankAccount) => (
                              <ErpButton
                                variant="outline"
                                size="xs"
                                disabled={r.reconciliationStatus === "Reconciled"}
                                onClick={() => {
                                  setReconcileAccountNo(r.accountNo);
                                  setReconcileOpen(true);
                                }}
                              >
                                Reconcile
                              </ErpButton>
                            ),
                          },
                        ]}
                        mobileCard={(r: BankAccount) => (
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-foreground">{r.name}</div>
                                <div className="text-xs text-muted-foreground">{r.accountNo}</div>
                              </div>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  r.reconciliationStatus === "Reconciled"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {r.reconciliationStatus}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-border text-xs">
                              <span className="text-muted-foreground">
                                Unreconciled Difference:
                              </span>
                              <span
                                className={`font-bold ${r.unreconciledAmount > 0 ? "text-destructive" : "text-green-600"}`}
                              >
                                {formatCurrencyLocal(r.unreconciledAmount, r.currency)}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* 4. CHEQUES TAB */}
                {activeTab === "cheques" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Cheques Registry</h3>
                    <div className="card-soft overflow-hidden">
                      {chequesQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading cheques...
                        </div>
                      ) : !chequesQuery.data || chequesQuery.data.length === 0 ? (
                        <EmptyState title="No cheques" description="No cheque entries recorded." />
                      ) : (
                        <DataTable
                          data={chequesQuery.data as unknown as Record<string, unknown>[]}
                          columns={[
                            {
                              key: "chequeNo",
                              header: "Cheque No.",
                              cell: (r: ChequeRecord) => (
                                <span className="font-mono text-xs font-semibold text-foreground">
                                  {r.chequeNo}
                                </span>
                              ),
                            },
                            {
                              key: "issueDate",
                              header: "Issue Date",
                              cell: (r: ChequeRecord) => (
                                <span className="text-muted-foreground">{r.issueDate}</span>
                              ),
                            },
                            {
                              key: "payee",
                              header: "Payee",
                              cell: (r: ChequeRecord) => (
                                <span className="font-semibold text-foreground">{r.payee}</span>
                              ),
                            },
                            {
                              key: "bankAccountNo",
                              header: "Bank Account No.",
                              cell: (r: ChequeRecord) => (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {r.bankAccountNo}
                                </span>
                              ),
                            },
                            {
                              key: "amount",
                              header: "Amount",
                              align: "right",
                              cell: (r: ChequeRecord) => (
                                <span className="font-bold tabular text-foreground">
                                  {formatCurrency(r.amount)}
                                </span>
                              ),
                            },
                            {
                              key: "status",
                              header: "Status",
                              cell: (r: ChequeRecord) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    r.status === "Cleared"
                                      ? "bg-green-100 text-green-800"
                                      : r.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r: ChequeRecord) => (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-foreground">{r.payee}</span>
                                <span className="font-bold">{formatCurrency(r.amount)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {r.chequeNo} • {r.issueDate}
                                </span>
                                <span>{r.status}</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 5. DEPOSITS TAB */}
                {activeTab === "deposits" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Deposits Registry</h3>
                    <div className="card-soft overflow-hidden">
                      {depositsQuery.isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          Loading deposits...
                        </div>
                      ) : !depositsQuery.data || depositsQuery.data.length === 0 ? (
                        <EmptyState title="No deposits" description="No deposits recorded." />
                      ) : (
                        <DataTable
                          data={depositsQuery.data as unknown as Record<string, unknown>[]}
                          columns={[
                            {
                              key: "depositNo",
                              header: "Deposit No.",
                              cell: (r: DepositRecord) => (
                                <span className="font-mono text-xs font-semibold text-foreground">
                                  {r.depositNo}
                                </span>
                              ),
                            },
                            {
                              key: "depositDate",
                              header: "Deposit Date",
                              cell: (r: DepositRecord) => (
                                <span className="text-muted-foreground">{r.depositDate}</span>
                              ),
                            },
                            {
                              key: "source",
                              header: "Source",
                              cell: (r: DepositRecord) => (
                                <span className="font-semibold text-foreground">{r.source}</span>
                              ),
                            },
                            {
                              key: "bankAccountNo",
                              header: "Bank Account No.",
                              cell: (r: DepositRecord) => (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {r.bankAccountNo}
                                </span>
                              ),
                            },
                            {
                              key: "amount",
                              header: "Amount",
                              align: "right",
                              cell: (r: DepositRecord) => (
                                <span className="font-bold tabular text-foreground">
                                  {formatCurrency(r.amount)}
                                </span>
                              ),
                            },
                            {
                              key: "status",
                              header: "Status",
                              cell: (r: DepositRecord) => (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    r.status === "Cleared"
                                      ? "bg-green-100 text-green-800"
                                      : r.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              ),
                            },
                          ]}
                          mobileCard={(r: DepositRecord) => (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-foreground">{r.source}</span>
                                <span className="font-bold">{formatCurrency(r.amount)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {r.depositNo} • {r.depositDate}
                                </span>
                                <span>{r.status}</span>
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

            {/* Right Sidebar Area */}
            <div className="space-y-5">
              {/* Account Summary Panel */}
              <div className="card-soft p-5">
                <CardHeader
                  title="Account Summary"
                  right={
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                      As of Today
                    </span>
                  }
                />

                <div className="divide-y divide-border mt-1.5">
                  <div className="flex items-center justify-between py-2 text-[13px]">
                    <span className="text-muted-foreground">Total Accounts</span>
                    <span className="font-bold text-foreground tabular">
                      {data.accountSummary.totalAccounts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-[13px]">
                    <span className="text-muted-foreground">Active Accounts</span>
                    <span className="font-bold text-foreground tabular">
                      {data.accountSummary.activeAccounts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-[13px]">
                    <span className="text-muted-foreground">Inactive Accounts</span>
                    <span className="font-bold text-foreground tabular">
                      {data.accountSummary.inactiveAccounts}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3.5 text-[13px] font-semibold">
                    <span className="text-muted-foreground">Total Balance (USD)</span>
                    <span className="font-bold text-[#22C55E] tabular">
                      {formatCurrency(data.accountSummary.totalBalanceUsd)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-[13px]">
                    <span className="text-muted-foreground">Total Balance (Base Currency)</span>
                    <span className="font-semibold text-foreground tabular">
                      {formatCurrency(data.accountSummary.totalBalanceBaseCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 text-[13px] border-t border-border mt-1">
                    <span className="text-muted-foreground font-semibold">Unreconciled Amount</span>
                    <span className="font-bold text-destructive tabular">
                      {formatCurrency(data.accountSummary.unreconciledAmount)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("accounts")}
                  className="w-full text-center text-xs font-semibold text-primary hover:underline mt-4 pt-3 border-t border-border block"
                >
                  View All Accounts →
                </button>
              </div>

              {/* Cash Position Trend Panel */}
              <div className="card-soft p-5">
                <CardHeader
                  title="Cash Position Trend"
                  right={
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                      This Year
                    </span>
                  }
                />

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E]" /> Inflow
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#EF4444]" /> Outflow
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Net Cash Flow
                  </span>
                </div>

                <div className="h-[180px] w-full mt-2">
                  <ResponsiveContainer>
                    <AreaChart
                      data={data.cashPositionTrend}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
                        domain={[-2000000, 10000000]}
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
                      <defs>
                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="inflow"
                        stroke="#22C55E"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorInflow)"
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="outflow"
                        stroke="#EF4444"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fill="none"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="netFlow"
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: "var(--primary)" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bank Reconciliation Summary Panel */}
              <div className="card-soft p-5">
                <CardHeader
                  title="Bank Reconciliation Summary"
                  right={
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                      This Month
                    </span>
                  }
                />

                <div className="flex flex-col items-center gap-4 mt-2">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Reconciled",
                              value: data.reconciliationSummary.reconciledCount,
                              color: "#22C55E",
                            },
                            {
                              name: "Partially Reconciled",
                              value: data.reconciliationSummary.partiallyReconciledCount,
                              color: "#F59E0B",
                            },
                            {
                              name: "Not Reconciled",
                              value: data.reconciliationSummary.notReconciledCount,
                              color: "#EF4444",
                            },
                          ]}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          stroke="none"
                        >
                          <Cell fill="#22C55E" />
                          <Cell fill="#F59E0B" />
                          <Cell fill="#EF4444" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[15px] font-bold text-foreground">
                          {data.reconciliationSummary.totalAccounts}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Accounts
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="w-full space-y-1.5 mt-1 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                        <span>Reconciled</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.reconciliationSummary.reconciledCount} (
                        {(
                          (data.reconciliationSummary.reconciledCount /
                            data.reconciliationSummary.totalAccounts) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                        <span>Partially Reconciled</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.reconciliationSummary.partiallyReconciledCount} (
                        {(
                          (data.reconciliationSummary.partiallyReconciledCount /
                            data.reconciliationSummary.totalAccounts) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                        <span>Not Reconciled</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {data.reconciliationSummary.notReconciledCount} (
                        {(
                          (data.reconciliationSummary.notReconciledCount /
                            data.reconciliationSummary.totalAccounts) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setActiveTab("reconciliation")}
                  className="w-full text-center text-xs font-semibold text-primary hover:underline mt-4 pt-3 border-t border-border block"
                >
                  Go to Bank Reconciliation →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DIALOGS --- */}

      {/* 1. New Bank Account Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Bank Account</DialogTitle>
            <DialogDescription>
              Add a new company bank account to track and reconcile cash balances.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Account - USD"
                  value={newAccountInput.name}
                  onChange={(e) =>
                    setNewAccountInput((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank"
                    value={newAccountInput.bankName}
                    onChange={(e) =>
                      setNewAccountInput((prev) => ({ ...prev, bankName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Account Type *
                  </label>
                  <select
                    value={newAccountInput.type}
                    onChange={(e) =>
                      setNewAccountInput((prev) => ({
                        ...prev,
                        type: e.target.value as BankAccountType,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Operating">Operating</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Collections">Collections</option>
                    <option value="Petty Cash">Petty Cash</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Account Number"
                  value={newAccountInput.accountNo}
                  onChange={(e) =>
                    setNewAccountInput((prev) => ({ ...prev, accountNo: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Currency *
                  </label>
                  <select
                    value={newAccountInput.currency}
                    onChange={(e) =>
                      setNewAccountInput((prev) => ({ ...prev, currency: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Initial Balance *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0.00"
                    value={newAccountInput.initialBalance}
                    onChange={(e) =>
                      setNewAccountInput((prev) => ({
                        ...prev,
                        initialBalance: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={createAccountMutation.isPending}>
                Add Account
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Record Cash Transaction Dialog */}
      <Dialog open={recordTxOpen} onOpenChange={setRecordTxOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Cash Transaction</DialogTitle>
            <DialogDescription>
              Log a manual cash transaction to track cash movement on bank accounts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordTxSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newTxInput.date}
                    onChange={(e) => setNewTxInput((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Type *
                  </label>
                  <select
                    value={newTxInput.type}
                    onChange={(e) =>
                      setNewTxInput((prev) => ({
                        ...prev,
                        type: e.target.value as CashTransactionType,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Inflow">Inflow (Deposit / Receipt)</option>
                    <option value="Outflow">Outflow (Withdrawal / Payment)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Supplies Purchase"
                  value={newTxInput.description}
                  onChange={(e) =>
                    setNewTxInput((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={newTxInput.amount}
                    onChange={(e) =>
                      setNewTxInput((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Bank Account *
                  </label>
                  <select
                    required
                    value={newTxInput.bankAccountNo}
                    onChange={(e) =>
                      setNewTxInput((prev) => ({ ...prev, bankAccountNo: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">Select Account...</option>
                    {(data?.bankAccounts || []).map((a) => (
                      <option key={a.id} value={a.accountNo}>
                        {a.name} ({a.accountNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Collections, Operating"
                    value={newTxInput.category}
                    onChange={(e) =>
                      setNewTxInput((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Reference No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REC-10030"
                    value={newTxInput.reference}
                    onChange={(e) =>
                      setNewTxInput((prev) => ({ ...prev, reference: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setRecordTxOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={recordTxMutation.isPending}>
                Record Transaction
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Bank Statement Reconciliation Dialog */}
      <Dialog open={reconcileOpen} onOpenChange={setReconcileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reconcile Bank Account</DialogTitle>
            <DialogDescription>
              Upload an electronic bank statement (CSV, OFX, or QIF) to automatically match bank
              statement lines with general ledger transactions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReconcileSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Select Bank Account *
                </label>
                <select
                  required
                  value={reconcileAccountNo}
                  onChange={(e) => setReconcileAccountNo(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select Account...</option>
                  {(data?.bankAccounts || []).map((a) => (
                    <option key={a.id} value={a.accountNo}>
                      {a.name} ({a.accountNo}) - {a.reconciliationStatus}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Statement File *
                </label>
                <div className="mt-1 border-2 border-dashed border-border rounded-xl px-4 py-7 flex flex-col items-center justify-center text-center bg-card hover:bg-muted/10 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.ofx,.qif,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <Upload className="h-7 w-7 text-muted-foreground mb-2" />
                  <span className="text-[13px] font-semibold text-foreground">
                    {selectedFile ? selectedFile : "Click to select or drag file here"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    Supports CSV, OFX, QIF (Max 5MB)
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton
                type="button"
                variant="outline"
                onClick={() => {
                  setReconcileOpen(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </ErpButton>
              <ErpButton
                type="submit"
                loading={matchStatementMutation.isPending}
                disabled={!reconcileAccountNo || !selectedFile}
              >
                Match & Reconcile
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Bank Account Details Modal */}
      <Dialog open={!!detailAccount} onOpenChange={(open) => !open && setDetailAccount(null)}>
        <DialogContent className="max-w-md">
          {detailAccount && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle>{detailAccount.name}</DialogTitle>
                    <span className="text-xs text-muted-foreground">{detailAccount.bankName}</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Account Number</span>
                    <span className="font-mono font-semibold text-foreground">
                      {detailAccount.accountNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Account Type</span>
                    <span className="font-semibold text-foreground">{detailAccount.type}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Currency</span>
                    <span className="font-semibold text-foreground">{detailAccount.currency}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Status</span>
                    <span className="inline-flex items-center text-xs font-semibold text-green-700">
                      Active
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Ledger Balance</span>
                    <span className="font-bold text-foreground text-base">
                      {formatCurrencyLocal(detailAccount.currentBalance, detailAccount.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Reconciliation Status
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${
                        detailAccount.reconciliationStatus === "Reconciled"
                          ? "bg-green-100 text-green-800"
                          : detailAccount.reconciliationStatus === "Partially Reconciled"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {detailAccount.reconciliationStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-secondary/40 p-3 rounded-lg flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground block mb-0.5">
                      Auto Reconciliation Configured
                    </span>
                    Statements are imported automatically on the 1st of every month via API
                    integration.
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-5 border-t border-border pt-3">
                <ErpButton
                  variant="outline"
                  onClick={() => {
                    setReconcileAccountNo(detailAccount.accountNo);
                    setReconcileOpen(true);
                    setDetailAccount(null);
                  }}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Reconcile Statement
                </ErpButton>
                <ErpButton variant="outline" onClick={() => setDetailAccount(null)}>
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
