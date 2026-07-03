import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { revenueTrend, revenueByStation, formatCurrency } from "@/lib/mock-data";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics · Magnertia ERP" }] }),
  component: ReportsPage,
});

const RANGES = ["Today", "Yesterday", "7D", "30D", "MTD", "QTD", "Half Year", "YTD", "Custom"];

function ReportsPage() {
  const [range, setRange] = useState("30D");

  const profitTrend = revenueTrend.map((r) => ({ month: r.month, profit: r.revenue - r.expenses }));
  const cashFlow = revenueTrend.map((r) => ({
    month: r.month,
    inflow: r.revenue,
    outflow: -r.expenses,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Reports & Analytics"
        description="Deep insights across revenue, expenses, profitability and operations."
        actions={
          <ErpButton variant="outline" size="md">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </ErpButton>
        }
      />

      <div className="card-soft mb-6 flex flex-wrap items-center gap-1 p-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              range === r
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle={`Period · ${range}`}>
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
            />
            <Tooltip contentStyle={tooltip} formatter={(v: number) => formatCurrency(v, true)} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#r1)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Expense Trend" subtitle={`Period · ${range}`}>
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="r2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
            />
            <Tooltip contentStyle={tooltip} formatter={(v: number) => formatCurrency(v, true)} />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--chart-5)"
              strokeWidth={2.5}
              fill="url(#r2)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Profit Trend" subtitle="Revenue minus expenses">
          <LineChart data={profitTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
            />
            <Tooltip contentStyle={tooltip} formatter={(v: number) => formatCurrency(v, true)} />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="var(--chart-3)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Cash Flow" subtitle="Inflow vs outflow">
          <BarChart data={cashFlow} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(Math.abs(v) / 100000).toFixed(0)}L`}
            />
            <Tooltip
              contentStyle={tooltip}
              formatter={(v: number) => formatCurrency(Math.abs(v), true)}
            />
            <Bar dataKey="inflow" fill="var(--chart-3)" stackId="cf" radius={[6, 6, 0, 0]} />
            <Bar dataKey="outflow" fill="var(--chart-5)" stackId="cf" radius={[0, 0, 6, 6]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="mt-6 card-soft p-5">
        <h3 className="font-display text-base font-semibold text-foreground">
          Top Revenue Stations
        </h3>
        <p className="text-xs text-muted-foreground">Performance and ROI</p>
        <div className="mt-4 h-[300px]">
          <ResponsiveContainer>
            <BarChart data={revenueByStation} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="station"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                angle={-20}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip
                contentStyle={tooltip}
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

const tooltip = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
} as const;

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactElement;
}) {
  return (
    <div className="card-soft p-5">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
