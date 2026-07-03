import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Briefcase,
  PieChart as PieChartIcon,
  Banknote,
  BarChart3,
  MoreVertical,
  TrendingUp,
  Coins,
  ClipboardList,
  Clock,
  Timer,
  Landmark,
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
import type { ComponentType, ReactNode } from "react";
import { AppShell } from "@/components/erp/AppShell";
import { CardHeader } from "@/components/erp/CardHeader";
import { FilterButton } from "@/components/erp/FilterButton";
import { StatCard, StatDeltaLine } from "@/components/erp/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { company, formatCurrency, formatSignedCurrency } from "@/lib/mock-data";
import { loadDashboardData } from "@/services";
import type { AgingReport, DashboardData, FinancialInsights } from "@/services/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Financial Management Dashboard · Magnertia" },
      {
        name: "description",
        content:
          "Real-time overview of Magnertia's financial performance — revenue, expenses, cash flow, AR & AP aging.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "financial-management", company.fiscalYear, "all"],
    queryFn: () => loadDashboardData({ fiscalYear: company.fiscalYear, companyId: "all" }),
  });

  return (
    <AppShell
      title="Financial Management Dashboard"
      breadcrumb="Financial Management"
      description="Get a real-time overview of your financial performance."
    >
      {!data || isLoading ? <DashboardSkeleton /> : <DashboardContent data={data} />}
    </AppShell>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <>
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue, true)}
          delta={{ label: "12.6% vs. PY", direction: "up", tone: "positive" }}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(data.netProfit, true)}
          delta={{ label: "8.9% vs. PY", direction: "up", tone: "positive" }}
          iconBg="bg-[#22C55E]/10"
          iconColor="text-[#22C55E]"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(data.totalExpenses, true)}
          delta={{ label: "9.3% vs. PY", direction: "up", tone: "positive" }}
          iconBg="bg-[#3B82F6]/10"
          iconColor="text-[#3B82F6]"
          icon={<PieChartIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Cash Balance"
          value={formatCurrency(data.cashPosition.cashBalance, true)}
          delta={{ label: "15.2% vs. PY", direction: "up", tone: "positive" }}
          iconBg="bg-[#F59E0B]/10"
          iconColor="text-[#F59E0B]"
          icon={<Banknote className="h-5 w-5" />}
        />
        <StatCard
          label="Current Ratio"
          value={data.currentRatio.currentRatio.toFixed(2)}
          neutralText={`vs. PY ${data.currentRatio.currentRatioPY.toFixed(2)}`}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <RevenueTrendCard trend={data.revenueExpenseTrend} />
        <CashFlowCard summary={data.cashFlowSummary} />
        <ExpenseDonutCard
          distribution={data.expenseDistribution}
          totalExpenses={data.totalExpenses}
        />
      </div>

      {/* Aging + transactions row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <AgingCard title="Aging of Accounts Receivable" data={data.receivableAging} />
        <AgingCard title="Aging of Accounts Payable" data={data.payableAging} />
        <RecentTransactionsCard transactions={data.recentTransactions} />
      </div>

      {/* Quick financial insights */}
      <div className="mt-5">
        <QuickInsightsCard insights={data.financialInsights} />
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl" />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <Skeleton className="h-[340px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[340px] rounded-xl" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[260px] rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
      </div>
      <div className="mt-5">
        <Skeleton className="h-[110px] rounded-xl" />
      </div>
    </>
  );
}

/* ---------- Revenue vs Expenses ---------- */
function RevenueTrendCard({ trend }: { trend: DashboardData["revenueExpenseTrend"] }) {
  return (
    <div className="card-soft p-5 lg:col-span-2">
      <CardHeader
        title="Revenue vs. Expenses Trend"
        right={
          <div className="flex items-center gap-1.5">
            <FilterButton label="Monthly" />
            <button className="rounded-md p-1 text-muted-foreground hover:bg-muted">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        }
      />
      <div className="mb-3 flex items-center gap-4 text-[12px] text-muted-foreground">
        <LegendDot color="var(--primary)" label="Revenue" />
        <LegendDot color="var(--chart-bar-expense)" label="Expenses" />
        <span className="inline-flex items-center gap-1.5">
          <svg width="14" height="6" viewBox="0 0 14 6">
            <line x1="0" y1="3" x2="14" y2="3" stroke="#22C55E" strokeWidth="2" />
            <circle cx="7" cy="3" r="2.2" fill="#22C55E" />
          </svg>
          Net Profit
        </span>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer>
          <ComposedChart
            data={trend}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            barCategoryGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
              domain={[0, 5_000_000]}
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
            <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={14} />
            <Bar
              dataKey="expenses"
              fill="var(--chart-bar-expense)"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
            <Line
              type="monotone"
              dataKey="netProfit"
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ---------- Cash Flow ---------- */
function CashFlowCard({ summary }: { summary: DashboardData["cashFlowSummary"] }) {
  return (
    <div className="card-soft p-5">
      <CardHeader title="Cash Flow Summary" right={<FilterButton label="YTD" />} />
      <div className="divide-y divide-border">
        {summary.lines.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3 text-[13px]">
            <span className="text-muted-foreground">{row.label}</span>
            <span
              className={`font-semibold tabular ${row.value < 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}
            >
              {formatSignedCurrency(row.value, true)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-4 text-sm">
          <span className="font-semibold text-foreground">Net Cash Flow</span>
          <span className="font-bold tabular text-[#22C55E]">
            {formatCurrency(summary.netCashFlow, true)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Expense Donut ---------- */
function ExpenseDonutCard({
  distribution,
  totalExpenses,
}: {
  distribution: DashboardData["expenseDistribution"];
  totalExpenses: number;
}) {
  return (
    <div className="card-soft p-5">
      <CardHeader title="Expense Distribution" right={<FilterButton label="This Year" />} />
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-[160px] w-[160px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={75}
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
                {formatCurrency(totalExpenses, true)}
              </div>
              <div className="text-[10px] text-muted-foreground">Total Expenses</div>
            </div>
          </div>
        </div>
        <ul className="w-full space-y-2 mt-1 text-[13px]">
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

/* ---------- Aging ---------- */
function AgingCard({ title, data }: { title: string; data: AgingReport }) {
  return (
    <div className="card-soft p-5">
      <CardHeader title={title} right={<FilterButton label="As of Today" />} />
      <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4">
        <div className="relative h-[140px] w-[140px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data.buckets}
                dataKey="amount"
                innerRadius={40}
                outerRadius={62}
                paddingAngle={1}
                stroke="none"
              >
                {data.buckets.map((b) => (
                  <Cell key={b.bucket} fill={b.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-display text-[14px] font-bold text-foreground tabular">
                {formatCurrency(data.total, true)}
              </div>
              <div className="text-[10px] text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-1.5 grid grid-cols-[1fr_auto_auto] gap-x-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Aging Buckets</span>
            <span>Amount</span>
            <span>% of Total</span>
          </div>
          <ul className="space-y-1.5 text-[12px]">
            {data.buckets.map((b) => (
              <li key={b.bucket} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
                <span className="inline-flex items-center gap-1.5 truncate text-foreground">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: b.color }} />
                  {b.bucket}
                </span>
                <span className="font-semibold tabular text-foreground">
                  {formatCurrency(b.amount, true)}
                </span>
                <span className="tabular text-muted-foreground">{b.pct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- Recent Transactions ---------- */
function RecentTransactionsCard({
  transactions,
}: {
  transactions: DashboardData["recentTransactions"];
}) {
  return (
    <div className="card-soft p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold text-foreground">
          Recent Transactions
        </h3>
        <button className="text-[12px] font-semibold text-primary hover:underline">View All</button>
      </div>
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-border text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <th className="pb-2 text-left font-medium">Date</th>
            <th className="pb-2 text-left font-medium">Reference</th>
            <th className="pb-2 text-left font-medium">Description</th>
            <th className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {transactions.map((t) => (
            <tr key={t.ref}>
              <td className="py-2.5 text-muted-foreground">{t.date}</td>
              <td className="py-2.5">
                <button className="font-medium text-primary hover:underline">{t.ref}</button>
              </td>
              <td className="py-2.5 text-foreground">{t.description}</td>
              <td
                className={`py-2.5 text-right font-semibold tabular ${t.amount < 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}
              >
                {t.amount < 0
                  ? `(${formatCurrency(Math.abs(t.amount))})`
                  : formatCurrency(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Quick Financial Insights ---------- */
const INSIGHT_ITEMS: {
  key: keyof FinancialInsights;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}[] = [
  { key: "grossMargin", icon: TrendingUp, iconBg: "bg-primary/10", iconColor: "text-primary" },
  { key: "operatingMargin", icon: Coins, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]" },
  {
    key: "expenseRatio",
    icon: ClipboardList,
    iconBg: "bg-[#3B82F6]/10",
    iconColor: "text-[#3B82F6]",
  },
  { key: "dso", icon: Clock, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]" },
  { key: "dpo", icon: Timer, iconBg: "bg-secondary", iconColor: "text-primary" },
  {
    key: "cashConversionCycle",
    icon: Landmark,
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
  },
];

function QuickInsightsCard({ insights }: { insights: FinancialInsights }) {
  return (
    <div className="card-soft p-5">
      <h3 className="mb-4 font-display text-[15px] font-semibold text-foreground">
        Quick Financial Insights
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-border">
        {INSIGHT_ITEMS.map(({ key, icon: Icon, iconBg, iconColor }) => {
          const metric = insights[key];
          return (
            <div key={key} className="flex items-center gap-3 lg:pl-4 lg:first:pl-0">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${iconBg} ${iconColor}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium text-muted-foreground">
                  {metric.label}
                </div>
                <div className="font-display text-[16px] font-bold text-foreground tabular">
                  {metric.value}
                </div>
                <StatDeltaLine
                  delta={{
                    label: metric.deltaLabel,
                    direction: metric.direction,
                    tone: metric.tone,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
