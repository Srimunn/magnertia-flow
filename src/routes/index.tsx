import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp, Wallet, CircleDollarSign, Clock, PiggyBank,
  Percent, ArrowDownToLine, ArrowUpFromLine, Landmark, CalendarDays, Plus,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { KpiCard } from "@/components/erp/KpiCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import {
  kpis, revenueTrend, revenueSources, expenses, receivables, formatCurrency,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Magnertia ERP" },
      { name: "description", content: "Financial command center for Magnertia's EV charging operations." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell>
      <PageHeader
        title="Financial Overview"
        description="Real-time financial pulse across all charging operations."
        actions={
          <>
            <ErpButton variant="outline" size="md">
              <CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline">Last 30 days</span>
            </ErpButton>
            <ErpButton size="md">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Entry</span>
            </ErpButton>
          </>
        }
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total Revenue" value={formatCurrency(kpis.totalRevenue, true)}
          delta={{ value: "12.4%", positive: true }} icon={TrendingUp} hint="Year to date" />
        <KpiCard label="Today's Revenue" value={formatCurrency(kpis.todayRevenue)}
          delta={{ value: "4.8%", positive: true }} icon={CircleDollarSign} tone="success" />
        <KpiCard label="Monthly Revenue" value={formatCurrency(kpis.monthlyRevenue, true)}
          delta={{ value: "8.2%", positive: true }} icon={TrendingUp} hint="September 2025" />
        <KpiCard label="Net Profit" value={formatCurrency(kpis.netProfit, true)}
          delta={{ value: "6.1%", positive: true }} icon={PiggyBank} tone="success" />
        <KpiCard label="Profit Margin" value={`${kpis.profitMargin.toFixed(1)}%`}
          delta={{ value: "0.8%", positive: true }} icon={Percent} hint="Healthy" />
        <KpiCard label="Expenses" value={formatCurrency(kpis.expenses, true)}
          delta={{ value: "3.2%", positive: false }} icon={Wallet} tone="warning" hint="YTD" />
        <KpiCard label="Pending Payments" value={formatCurrency(kpis.pendingPayments, true)}
          icon={Clock} tone="warning" hint="Across 14 invoices" />
        <KpiCard label="Outstanding Receivables" value={formatCurrency(kpis.outstandingReceivables, true)}
          icon={ArrowDownToLine} hint="6 customers" />
        <KpiCard label="Outstanding Payables" value={formatCurrency(kpis.outstandingPayables, true)}
          icon={ArrowUpFromLine} hint="4 vendors" />
        <KpiCard label="Cash Balance" value={formatCurrency(kpis.cashBalance, true)}
          delta={{ value: "5.4%", positive: true }} icon={Landmark} tone="success" />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-5 lg:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Revenue vs Expenses</h3>
              <p className="text-xs text-muted-foreground">Monthly trend · FY 2025-26</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" /> Revenue</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" /> Expenses</span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v, true)}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#gRev)" />
                <Area type="monotone" dataKey="expenses" stroke="var(--chart-2)" strokeWidth={2.5} fill="url(#gExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-foreground">Revenue Sources</h3>
            <p className="text-xs text-muted-foreground">YTD breakdown</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={revenueSources} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {revenueSources.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v, true)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {revenueSources.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="font-semibold tabular-nums text-foreground">{formatCurrency(s.value, true)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lists row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Recent Expenses</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Link to="/expenses" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          <ul className="divide-y divide-border">
            {expenses.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{e.vendor}</div>
                  <div className="truncate text-xs text-muted-foreground">{e.category} · {e.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(e.amount, true)}</div>
                  <div className="mt-0.5"><StatusBadge status={e.status} /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Outstanding Invoices</h3>
              <p className="text-xs text-muted-foreground">Receivables needing attention</p>
            </div>
            <Link to="/receivables" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          <ul className="divide-y divide-border">
            {receivables.filter(r => r.status !== "Paid").slice(0, 5).map((r) => (
              <li key={r.invoice} className="flex items-center gap-3 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary text-[11px] font-bold">
                  {r.customer.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{r.customer}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.invoice} · Due {r.due}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(r.amount, true)}</div>
                  <div className="mt-0.5"><StatusBadge status={r.status} /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top stations bar */}
      <div className="mt-6 card-soft p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold text-foreground">Top Performing Stations</h3>
          <p className="text-xs text-muted-foreground">Revenue contribution this fiscal year</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer>
            <BarChart data={[
              { name: "Whitefield", revenue: 4820000 },
              { name: "BKC", revenue: 4310000 },
              { name: "Aerocity", revenue: 3950000 },
              { name: "HITEC City", revenue: 3580000 },
              { name: "Hinjewadi", revenue: 3120000 },
              { name: "OMR", revenue: 2880000 },
              { name: "Cyber Hub", revenue: 2640000 },
              { name: "SG Road", revenue: 2210000 },
            ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => formatCurrency(v, true)}
                cursor={{ fill: "var(--secondary)" }}
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  );
}
