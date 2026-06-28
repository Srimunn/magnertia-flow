import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpFromLine, Clock, CheckCircle2, Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { KpiCard } from "@/components/erp/KpiCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { payables, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/payables")({
  head: () => ({ meta: [{ title: "Accounts Payable · Magnertia ERP" }] }),
  component: PayablesPage,
});

type Row = (typeof payables)[number];

function PayablesPage() {
  const total = payables.reduce((s, r) => s + r.amount, 0);
  const pending = payables.filter(r => r.status === "Pending").reduce((s, r) => s + r.amount, 0);
  const paid = payables.filter(r => r.status === "Paid").reduce((s, r) => s + r.amount, 0);

  const columns: Column<Row>[] = [
    { key: "invoice", header: "Invoice", cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.invoice}</span> },
    { key: "vendor", header: "Vendor", cell: (r) => <span className="font-medium text-foreground">{r.vendor}</span> },
    { key: "amount", header: "Amount", align: "right", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
    { key: "due", header: "Payment Date", cell: (r) => <span className="text-muted-foreground">{r.due}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "", align: "right", cell: (r) =>
      r.status !== "Paid" ? <ErpButton size="sm">Pay Now</ErpButton> : null },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Accounts Payable"
        description="Vendor bills, payment schedules and approvals."
        actions={
          <ErpButton size="md"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Record Bill</span></ErpButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Total Payables" value={formatCurrency(total, true)} icon={ArrowUpFromLine} hint={`${payables.length} bills`} />
        <KpiCard label="Awaiting Payment" value={formatCurrency(pending, true)} icon={Clock} tone="warning" />
        <KpiCard label="Paid This Month" value={formatCurrency(paid, true)} icon={CheckCircle2} tone="success" />
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={payables}
          mobileCard={(r) => (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{r.vendor}</div>
                <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{r.invoice} · {r.due}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold tabular-nums text-foreground">{formatCurrency(r.amount, true)}</div>
                <div className="mt-1"><StatusBadge status={r.status} /></div>
              </div>
            </div>
          )}
        />
      </div>
    </AppShell>
  );
}
