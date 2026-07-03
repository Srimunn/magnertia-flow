import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Plus, Download, Filter, MoreHorizontal } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { KpiCard } from "@/components/erp/KpiCard";
import { expenses, expenseCategories, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses · Magnertia ERP" }] }),
  component: ExpensesPage,
});

type Expense = (typeof expenses)[number];

function ExpensesPage() {
  const total = expenseCategories.reduce((s, c) => s + c.amount, 0);

  const columns: Column<Expense>[] = [
    {
      key: "id",
      header: "Reference",
      cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.id}</span>,
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => <span className="text-muted-foreground">{r.date}</span>,
    },
    {
      key: "category",
      header: "Category",
      cell: (r) => (
        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {r.category}
        </span>
      ),
    },
    {
      key: "vendor",
      header: "Vendor",
      cell: (r) => <span className="font-medium text-foreground">{r.vendor}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span>,
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: () => (
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Expense Management"
        description="Track operating costs across electricity, maintenance, payroll and more."
        actions={
          <>
            <ErpButton variant="outline" size="md">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </ErpButton>
            <ErpButton variant="outline" size="md">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </ErpButton>
            <ErpButton size="md">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </ErpButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Expenses (YTD)"
          value={formatCurrency(total, true)}
          icon={Wallet}
          tone="warning"
          delta={{ value: "3.2%", positive: false }}
        />
        <KpiCard
          label="Electricity Cost"
          value={formatCurrency(expenseCategories[0].amount, true)}
          icon={Wallet}
          hint="43% of total"
        />
        <KpiCard
          label="Pending Approvals"
          value="3"
          icon={Wallet}
          tone="warning"
          hint="₹277K pending"
        />
        <KpiCard
          label="Recurring Monthly"
          value={formatCurrency(3200000, true)}
          icon={Wallet}
          hint="Auto-scheduled"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-5">
          <h3 className="font-display text-base font-semibold text-foreground">
            Expense Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">By category · YTD</p>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {expenseCategories.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatCurrency(v, true)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5 lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-foreground">
            Category Performance
          </h3>
          <p className="text-xs text-muted-foreground">Share of total spend</p>
          <ul className="mt-4 space-y-3">
            {expenseCategories.map((c) => {
              const pct = (c.amount / total) * 100;
              return (
                <li key={c.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 font-medium text-foreground">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                      {c.category}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatCurrency(c.amount, true)}
                      <span className="ml-2 text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: c.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Recent Expenses</h3>
          <span className="text-xs text-muted-foreground">{expenses.length} entries</span>
        </div>
        <DataTable
          columns={columns}
          data={expenses}
          mobileCard={(r) => (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{r.vendor}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {r.category} · {r.date}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{r.id}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums text-foreground">
                    {formatCurrency(r.amount, true)}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              </div>
            </>
          )}
        />
      </div>
    </AppShell>
  );
}
