import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign, Briefcase, PieChart as PieChartIcon, Banknote, BarChart3,
  Info, MoreVertical, ArrowUpRight, ChevronDown,
} from "lucide-react";
import {
  ComposedChart, Bar, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import type { ReactNode } from "react";
import { AppShell } from "@/components/erp/AppShell";
import {
  dashKpis, revenueExpenseTrend, cashFlowSummary, netCashFlow,
  expenseDistribution, agingReceivable, agingPayable, recentTxns,
  formatCurrency, formatSignedCurrency,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Financial Management Dashboard · Magnertia" },
      { name: "description", content: "Real-time overview of Magnertia's financial performance — revenue, expenses, cash flow, AR & AP aging." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell
      title="Financial Management Dashboard"
      breadcrumb="Financial Management"
      description="Get a real-time overview of your financial performance."
    >
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total Revenue" value="$24.58M" deltaText="12.6% vs. PY" iconBg="bg-[#6B4EFF]/10" iconColor="text-[#6B4EFF]" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard label="Net Profit" value="$4.32M" deltaText="8.9% vs. PY" iconBg="bg-[#22C55E]/10" iconColor="text-[#22C55E]" icon={<Briefcase className="h-5 w-5" />} />
        <KpiCard label="Total Expenses" value="$18.76M" deltaText="9.3% vs. PY" iconBg="bg-[#3B82F6]/10" iconColor="text-[#3B82F6]" icon={<PieChartIcon className="h-5 w-5" />} />
        <KpiCard label="Cash Balance" value="$6.78M" deltaText="15.2% vs. PY" iconBg="bg-[#F59E0B]/10" iconColor="text-[#F59E0B]" icon={<Banknote className="h-5 w-5" />} />
        <KpiCard label="Current Ratio" value={dashKpis.currentRatio.toFixed(2)} neutralText={`vs. PY ${dashKpis.currentRatioPY.toFixed(2)}`} iconBg="bg-[#6B4EFF]/10" iconColor="text-[#6B4EFF]" icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      {/* Charts row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <RevenueTrendCard />
        <CashFlowCard />
        <ExpenseDonutCard />
      </div>

      {/* Aging + transactions row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <AgingCard title="Aging of Accounts Receivable" data={agingReceivable} />
        <AgingCard title="Aging of Accounts Payable" data={agingPayable} />
        <RecentTransactionsCard />
      </div>
    </AppShell>
  );
}

/* ---------- KPI ---------- */
function KpiCard({
  label, value, deltaText, neutralText, icon, iconBg, iconColor,
}: {
  label: string; value: string; deltaText?: string; neutralText?: string;
  icon: ReactNode; iconBg: string; iconColor: string;
}) {
  return (
    <div className="card-soft p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-4">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-muted-foreground">{label}</div>
          <div className="mt-0.5 font-display text-[22px] font-bold leading-tight text-foreground tabular">{value}</div>
          {deltaText && (
            <div className="mt-1 flex items-center gap-1 text-[12px] font-medium text-[#22C55E]">
              <ArrowUpRight className="h-3 w-3" /> {deltaText}
            </div>
          )}
          {neutralText && (
            <div className="mt-1 text-[12px] font-medium text-muted-foreground">{neutralText}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Card header ---------- */
function CardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        <h3 className="font-display text-[15px] font-semibold text-foreground">{title}</h3>
        <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
      </div>
      {right}
    </div>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-muted/50">
      {label}
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}

/* ---------- Revenue vs Expenses ---------- */
function RevenueTrendCard() {
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
        <LegendDot color="#6B4EFF" label="Revenue" />
        <LegendDot color="#BFD3F5" label="Expenses" />
        <span className="inline-flex items-center gap-1.5">
          <svg width="14" height="6" viewBox="0 0 14 6"><line x1="0" y1="3" x2="14" y2="3" stroke="#22C55E" strokeWidth="2" /><circle cx="7" cy="3" r="2.2" fill="#22C55E" /></svg>
          Net Profit
        </span>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={revenueExpenseTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`} domain={[0, 5_000_000]} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
              formatter={(v: number) => formatCurrency(v, true)}
            />
            <Bar dataKey="revenue" fill="#6B4EFF" radius={[4, 4, 0, 0]} barSize={14} />
            <Bar dataKey="expenses" fill="#BFD3F5" radius={[4, 4, 0, 0]} barSize={14} />
            <Line type="monotone" dataKey="netProfit" stroke="#22C55E" strokeWidth={2} dot={{ r: 3, fill: "#22C55E", strokeWidth: 0 }} />
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
function CashFlowCard() {
  return (
    <div className="card-soft p-5">
      <CardHeader title="Cash Flow Summary" right={<FilterButton label="YTD" />} />
      <div className="divide-y divide-border">
        {cashFlowSummary.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3 text-[13px]">
            <span className="text-muted-foreground">{row.label}</span>
            <span className={`font-semibold tabular ${row.value < 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
              {formatSignedCurrency(row.value, true)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-4 text-sm">
          <span className="font-semibold text-foreground">Net Cash Flow</span>
          <span className="font-bold tabular text-[#22C55E]">{formatCurrency(netCashFlow, true)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Expense Donut ---------- */
function ExpenseDonutCard() {
  return (
    <div className="card-soft p-5">
      <CardHeader title="Expense Distribution" right={<FilterButton label="This Year" />} />
      <div className="flex items-center gap-3">
        <div className="relative h-[160px] w-[160px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={expenseDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={1} stroke="none">
                {expenseDistribution.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-display text-[15px] font-bold text-foreground tabular">$18.76M</div>
              <div className="text-[10px] text-muted-foreground">Total Expenses</div>
            </div>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-[11.5px]">
          {expenseDistribution.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 truncate text-muted-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
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
function AgingCard({ title, data }: { title: string; data: typeof agingReceivable }) {
  return (
    <div className="card-soft p-5">
      <CardHeader title={title} right={<FilterButton label="As of Today" />} />
      <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4">
        <div className="relative h-[140px] w-[140px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.buckets} dataKey="amount" innerRadius={40} outerRadius={62} paddingAngle={1} stroke="none">
                {data.buckets.map((b) => <Cell key={b.bucket} fill={b.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-display text-[14px] font-bold text-foreground tabular">{formatCurrency(data.total, true)}</div>
              <div className="text-[10px] text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-1.5 grid grid-cols-[1fr_auto_auto] gap-x-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Aging Buckets</span><span>Amount</span><span>% of Total</span>
          </div>
          <ul className="space-y-1.5 text-[12px]">
            {data.buckets.map((b) => (
              <li key={b.bucket} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
                <span className="inline-flex items-center gap-1.5 truncate text-foreground">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: b.color }} />
                  {b.bucket}
                </span>
                <span className="font-semibold tabular text-foreground">{formatCurrency(b.amount, true)}</span>
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
function RecentTransactionsCard() {
  return (
    <div className="card-soft p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold text-foreground">Recent Transactions</h3>
        <button className="text-[12px] font-semibold text-[#6B4EFF] hover:underline">View All</button>
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
          {recentTxns.map((t) => (
            <tr key={t.ref}>
              <td className="py-2.5 text-muted-foreground">{t.date}</td>
              <td className="py-2.5"><button className="font-medium text-[#6B4EFF] hover:underline">{t.ref}</button></td>
              <td className="py-2.5 text-foreground">{t.description}</td>
              <td className={`py-2.5 text-right font-semibold tabular ${t.amount < 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
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
