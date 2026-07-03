import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Landmark,
  ArrowDownToLine,
  ArrowUpFromLine,
  Calculator,
  CalendarClock,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { CardHeader } from "@/components/erp/CardHeader";
import { FilterButton, FilterSelect } from "@/components/erp/FilterButton";
import { PaginationFooter } from "@/components/erp/PaginationFooter";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { TreeTable, type TreeColumn } from "@/components/erp/TreeTable";
import { EmptyState } from "@/components/erp/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { company, formatCurrency } from "@/lib/mock-data";
import {
  analyticsEngineService,
  chartOfAccountsService,
  generalLedgerService,
  loadGeneralLedgerDashboard,
  reportingEngineService,
} from "@/services";
import type {
  AccountBalanceTrendPoint,
  AccountDistributionSlice,
  AccountFilters,
  AccountNode,
  AccountSummary,
  DashboardQuery,
  LedgerJournalEntry,
  TrialBalanceReport,
} from "@/services/types";

export const Route = createFileRoute("/ledger")({
  head: () => ({ meta: [{ title: "General Ledger · Magnertia" }] }),
  component: GeneralLedgerPage,
});

const QUERY: DashboardQuery = { fiscalYear: company.fiscalYear, companyId: "all" };
const DEFAULT_ACCOUNT_CODE = "1120";

const TYPE_OPTIONS: { label: string; value: AccountFilters["type"] }[] = [
  { label: "All Types", value: "All Types" },
  { label: "Asset", value: "Asset" },
  { label: "Liability", value: "Liability" },
  { label: "Equity", value: "Equity" },
  { label: "Revenue", value: "Revenue" },
  { label: "Expense", value: "Expense" },
];

const STATUS_OPTIONS: { label: string; value: AccountFilters["status"] }[] = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "All Statuses", value: "All Statuses" },
];

const LEVEL_OPTIONS: { label: string; value: AccountFilters["level"] }[] = [
  { label: "All Levels", value: "All Levels" },
  { label: "Level 1", value: "1" },
  { label: "Level 2", value: "2" },
  { label: "Level 3", value: "3" },
];

const DEFAULT_FILTERS: AccountFilters = {
  search: "",
  type: "All Types",
  status: "Active",
  level: "All Levels",
};

function countAllNodes(nodes: AccountNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + (n.children ? countAllNodes(n.children) : 0), 0);
}

function GeneralLedgerPage() {
  const [filters, setFilters] = useState<AccountFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAccountCode, setSelectedAccountCode] = useState(DEFAULT_ACCOUNT_CODE);
  const [activeTab, setActiveTab] = useState<"chart" | "activity" | "trial-balance">("chart");

  const kpisQuery = useQuery({
    queryKey: ["ledger", "kpis", QUERY.fiscalYear],
    queryFn: () => loadGeneralLedgerDashboard(QUERY),
  });

  const accountsQuery = useQuery({
    queryKey: ["ledger", "accounts", filters],
    queryFn: () => chartOfAccountsService.queryAccounts(QUERY, filters),
  });

  const summaryQuery = useQuery({
    queryKey: ["ledger", "account-summary", selectedAccountCode],
    queryFn: () => generalLedgerService.retrieveAccountSummary(selectedAccountCode),
  });

  const trendQuery = useQuery({
    queryKey: ["ledger", "account-trend", selectedAccountCode],
    queryFn: () => analyticsEngineService.generateAccountBalanceTrend(selectedAccountCode),
  });

  const distributionQuery = useQuery({
    queryKey: ["ledger", "account-distribution"],
    queryFn: () => analyticsEngineService.generateAccountDistribution(QUERY),
  });

  const activityQuery = useQuery({
    queryKey: ["ledger", "account-activity", selectedAccountCode],
    queryFn: () => generalLedgerService.fetchTransactionHistory(selectedAccountCode),
    enabled: activeTab === "activity",
  });

  const trialBalanceQuery = useQuery({
    queryKey: ["ledger", "trial-balance", QUERY.fiscalYear],
    queryFn: () => generalLedgerService.generateTrialBalance(QUERY),
    enabled: activeTab === "trial-balance",
  });

  const exportMutation = useMutation({
    mutationFn: (format: "csv" | "xlsx" | "pdf") =>
      reportingEngineService.generateLedgerExport(QUERY, format),
    onSuccess: (result) => toast.success(`Export ready: ${result.fileName}`),
  });

  function updateFilters(patch: Partial<AccountFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  const kpis = kpisQuery.data;
  const allAccounts = accountsQuery.data ?? [];
  const totalAccountCount = countAllNodes(allAccounts);
  const pageStart = (page - 1) * pageSize;
  const pagedAccounts = allAccounts.slice(pageStart, pageStart + pageSize);

  const columns: TreeColumn<AccountNode>[] = [
    {
      key: "code",
      header: "Account Code",
      align: "left",
      cell: (row, depth) => (
        <span
          className={
            depth === 0
              ? "font-bold text-foreground"
              : depth === 1
                ? "font-semibold text-foreground"
                : "text-foreground"
          }
        >
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Account Name",
      cell: (row, depth) => (
        <span
          className={
            depth === 0
              ? "font-bold text-foreground"
              : depth === 1
                ? "font-semibold text-foreground"
                : "text-foreground"
          }
        >
          {row.name}
        </span>
      ),
    },
    {
      key: "type",
      header: "Account Type",
      cell: (row) => <span className="text-muted-foreground">{row.type}</span>,
    },
    {
      key: "debit",
      header: "Debit (YTD)",
      align: "right",
      cell: (row) => (
        <span className="tabular text-foreground">{formatCurrency(row.debit, true)}</span>
      ),
    },
    {
      key: "credit",
      header: "Credit (YTD)",
      align: "right",
      cell: (row) => (
        <span className="tabular text-foreground">{formatCurrency(row.credit, true)}</span>
      ),
    },
    {
      key: "net",
      header: "Net Balance",
      align: "right",
      cell: (row) => {
        const net = row.debit - row.credit;
        return (
          <span
            className={`font-semibold tabular ${net < 0 ? "text-[#EF4444]" : "text-foreground"}`}
          >
            {net < 0 ? `(${formatCurrency(Math.abs(net), true)})` : formatCurrency(net, true)}
          </span>
        );
      },
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <AppShell
      title="General Ledger"
      breadcrumb="Financial Management"
      description="View and analyze all account balances and transactions in your general ledger."
    >
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Accounts"
          value={kpis ? kpis.totalAccounts.toLocaleString() : "—"}
          neutralText="Active Accounts"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          icon={<Landmark className="h-5 w-5" />}
        />
        <StatCard
          label="Total Debits"
          value={kpis ? formatCurrency(kpis.totalDebits, true) : "—"}
          neutralText="This Year"
          iconBg="bg-[#22C55E]/10"
          iconColor="text-[#22C55E]"
          icon={<ArrowDownToLine className="h-5 w-5" />}
        />
        <StatCard
          label="Total Credits"
          value={kpis ? formatCurrency(kpis.totalCredits, true) : "—"}
          neutralText="This Year"
          iconBg="bg-[#3B82F6]/10"
          iconColor="text-[#3B82F6]"
          icon={<ArrowUpFromLine className="h-5 w-5" />}
        />
        <StatCard
          label="Net Income"
          value={kpis ? formatCurrency(kpis.netIncome, true) : "—"}
          neutralText="This Year"
          iconBg="bg-[#F59E0B]/10"
          iconColor="text-[#F59E0B]"
          icon={<Calculator className="h-5 w-5" />}
        />
        <StatCard
          label="Current Period"
          value={kpis ? kpis.currentPeriod : "—"}
          neutralText={kpis?.periodStatus}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          icon={<CalendarClock className="h-5 w-5" />}
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

      {/* Main content + sidebar */}
      <div className="mt-3 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="card-soft overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <div className="border-b border-border px-4 pt-3">
              <TabsList className="h-auto justify-start gap-6 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="chart"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-0.5 pb-3 text-[13px] font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  Chart of Accounts
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-0.5 pb-3 text-[13px] font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  Account Activity
                </TabsTrigger>
                <TabsTrigger
                  value="trial-balance"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-0.5 pb-3 text-[13px] font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  Trial Balance
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chart" className="mt-0">
              <div className="flex flex-wrap items-center gap-2 p-4">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    placeholder="Search accounts…"
                    className="w-full rounded-md border border-border bg-card py-2 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <FilterSelect
                  value={filters.type}
                  onChange={(v) => updateFilters({ type: v as AccountFilters["type"] })}
                  options={TYPE_OPTIONS}
                />
                <FilterSelect
                  value={filters.status}
                  onChange={(v) => updateFilters({ status: v as AccountFilters["status"] })}
                  options={STATUS_OPTIONS}
                />
                <FilterSelect
                  value={filters.level}
                  onChange={(v) => updateFilters({ level: v as AccountFilters["level"] })}
                  options={LEVEL_OPTIONS}
                />
                <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-2 text-[12px] font-medium text-foreground hover:bg-muted/50">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  Filters
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
                <button
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS);
                    setPage(1);
                  }}
                  className="text-[12px] font-medium text-primary hover:underline"
                >
                  Clear All
                </button>
              </div>

              {pagedAccounts.length === 0 ? (
                <EmptyState
                  title="No accounts found"
                  description="Try adjusting your search or filters."
                />
              ) : (
                <div className="overflow-x-auto">
                  <TreeTable
                    columns={columns}
                    data={pagedAccounts}
                    getId={(row) => row.code}
                    getChildren={(row) => row.children}
                    expandColumnKey="code"
                    selectedId={selectedAccountCode}
                    onSelectRow={(row) => setSelectedAccountCode(row.code)}
                  />
                </div>
              )}

              <PaginationFooter
                page={page}
                pageSize={pageSize}
                total={totalAccountCount}
                entityLabel="accounts"
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-0 p-4">
              <AccountActivityView
                accountCode={selectedAccountCode}
                entries={activityQuery.data}
                loading={activityQuery.isLoading}
              />
            </TabsContent>

            <TabsContent value="trial-balance" className="mt-0 p-4">
              <TrialBalanceView
                report={trialBalanceQuery.data}
                loading={trialBalanceQuery.isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <AccountSummaryCard summary={summaryQuery.data} loading={summaryQuery.isLoading} />
          <AccountBalanceTrendCard trend={trendQuery.data ?? []} />
          <AccountDistributionCard
            distribution={distributionQuery.data ?? []}
            totalAccounts={kpis?.totalAccounts ?? 0}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center text-[11px] text-muted-foreground">
        All amounts are in USD &nbsp;|&nbsp; Data as of: May 20, 2025 10:30 AM
      </div>
    </AppShell>
  );
}

/* ---------- Account Summary ---------- */
function AccountSummaryCard({
  summary,
  loading,
}: {
  summary: AccountSummary | null | undefined;
  loading: boolean;
}) {
  if (loading || !summary) {
    return (
      <div className="card-soft p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-primary/10" />
      </div>
    );
  }
  return (
    <div className="card-soft p-5">
      <h3 className="mb-1 font-display text-[15px] font-semibold text-foreground">
        Account Summary
      </h3>
      <div className="mb-3 flex items-center gap-2">
        <span className="font-display text-[14px] font-bold text-foreground">
          {summary.code} - {summary.name}
        </span>
        <StatusBadge status={summary.status} />
      </div>
      <dl className="space-y-2 text-[13px]">
        <SummaryRow label="Account Type" value={summary.accountType} />
        <SummaryRow label="Account Group" value={summary.accountGroup} />
        <SummaryRow label="Normal Balance" value={summary.normalBalance} />
        <SummaryRow label="Currency" value={summary.currency} />
        <SummaryRow
          label="Opening Balance (Apr 1, 2024)"
          value={formatCurrency(summary.openingBalance)}
        />
        <div className="pt-1 text-muted-foreground">Period Activity</div>
        <SummaryRow label="Debit" value={formatCurrency(summary.periodDebit)} indent />
        <SummaryRow label="Credit" value={formatCurrency(summary.periodCredit)} indent />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <dt className="text-muted-foreground">Ending Balance (May 20, 2025)</dt>
          <dd className="font-bold text-[#22C55E] tabular">
            {formatCurrency(summary.endingBalance)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function SummaryRow({ label, value, indent }: { label: string; value: string; indent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={`text-muted-foreground ${indent ? "pl-3" : ""}`}>{label}</dt>
      <dd className="font-semibold text-foreground tabular">{value}</dd>
    </div>
  );
}

/* ---------- Balance Trend ---------- */
function AccountBalanceTrendCard({ trend }: { trend: AccountBalanceTrendPoint[] }) {
  return (
    <div className="card-soft p-5">
      <CardHeader title="Account Balance Trend" right={<FilterButton label="This Year" />} />
      <div className="mb-3 flex items-center gap-4 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Debit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--chart-bar-expense)" }}
          />{" "}
          Credit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="14" height="6" viewBox="0 0 14 6">
            <line x1="0" y1="3" x2="14" y2="3" stroke="#22C55E" strokeWidth="2" />
            <circle cx="7" cy="3" r="2.2" fill="#22C55E" />
          </svg>
          Net Balance
        </span>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer>
          <ComposedChart
            data={trend}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            barCategoryGap={8}
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
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number) => formatCurrency(v, true)}
            />
            <Bar dataKey="debit" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={10} />
            <Bar
              dataKey="credit"
              fill="var(--chart-bar-expense)"
              radius={[4, 4, 0, 0]}
              barSize={10}
            />
            <Line
              type="monotone"
              dataKey="netBalance"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ r: 3, fill: "#22C55E", strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------- Distribution ---------- */
function AccountDistributionCard({
  distribution,
  totalAccounts,
}: {
  distribution: AccountDistributionSlice[];
  totalAccounts: number;
}) {
  return (
    <div className="card-soft p-5">
      <CardHeader title="Account Distribution" right={<FilterButton label="By Account Type" />} />
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-[150px] w-[150px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="name"
                innerRadius={46}
                outerRadius={70}
                paddingAngle={1}
                stroke="none"
              >
                {distribution.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-display text-[15px] font-bold text-foreground tabular">
                {totalAccounts.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">Total Accounts</div>
            </div>
          </div>
        </div>
        <ul className="w-full space-y-2 text-[13px]">
          {distribution.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 truncate text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="truncate">{s.name}</span>
              </span>
              <span className="shrink-0 font-semibold text-foreground tabular">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Account Activity ---------- */
function AccountActivityView({
  accountCode,
  entries,
  loading,
}: {
  accountCode: string;
  entries?: LedgerJournalEntry[];
  loading: boolean;
}) {
  if (loading) return <div className="h-5 w-40 animate-pulse rounded bg-primary/10" />;
  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        title="No activity"
        description={`No journal activity found for account ${accountCode}.`}
      />
    );
  }
  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr className="border-b border-border text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <th className="pb-2 text-left font-medium">Date</th>
          <th className="pb-2 text-left font-medium">Reference</th>
          <th className="pb-2 text-left font-medium">Description</th>
          <th className="pb-2 text-right font-medium">Debit</th>
          <th className="pb-2 text-right font-medium">Credit</th>
          <th className="pb-2 text-right font-medium">Balance</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {entries.map((e) => (
          <tr key={e.ref}>
            <td className="py-2.5 text-muted-foreground">{e.date}</td>
            <td className="py-2.5 font-medium text-primary">{e.ref}</td>
            <td className="py-2.5 text-foreground">{e.description}</td>
            <td className="py-2.5 text-right tabular text-foreground">
              {e.debit > 0 ? formatCurrency(e.debit) : "—"}
            </td>
            <td className="py-2.5 text-right tabular text-foreground">
              {e.credit > 0 ? formatCurrency(e.credit) : "—"}
            </td>
            <td className="py-2.5 text-right font-semibold tabular text-foreground">
              {formatCurrency(e.balance)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------- Trial Balance ---------- */
function TrialBalanceView({ report, loading }: { report?: TrialBalanceReport; loading: boolean }) {
  if (loading || !report) return <div className="h-5 w-40 animate-pulse rounded bg-primary/10" />;
  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr className="border-b border-border text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <th className="pb-2 text-left font-medium">Account Code</th>
          <th className="pb-2 text-left font-medium">Account Name</th>
          <th className="pb-2 text-right font-medium">Debit</th>
          <th className="pb-2 text-right font-medium">Credit</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {report.rows.map((r) => (
          <tr key={r.code}>
            <td className="py-2.5 font-medium text-foreground">{r.code}</td>
            <td className="py-2.5 text-foreground">{r.name}</td>
            <td className="py-2.5 text-right tabular text-foreground">
              {r.debit > 0 ? formatCurrency(r.debit, true) : "—"}
            </td>
            <td className="py-2.5 text-right tabular text-foreground">
              {r.credit > 0 ? formatCurrency(r.credit, true) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-border font-bold">
          <td className="py-3 text-foreground" colSpan={2}>
            Total
          </td>
          <td className="py-3 text-right tabular text-foreground">
            {formatCurrency(report.totalDebit, true)}
          </td>
          <td className="py-3 text-right tabular text-foreground">
            {formatCurrency(report.totalCredit, true)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
