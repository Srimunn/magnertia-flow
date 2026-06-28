import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, AlertTriangle, CheckCircle2, Clock, Send, Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { KpiCard } from "@/components/erp/KpiCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { receivables, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/receivables")({
  head: () => ({ meta: [{ title: "Accounts Receivable · Magnertia ERP" }] }),
  component: ReceivablesPage,
});

type Row = (typeof receivables)[number];

function ReceivablesPage() {
  const total = receivables.reduce((s, r) => s + r.amount, 0);
  const overdue = receivables.filter(r => r.status === "Overdue").reduce((s, r) => s + r.amount, 0);
  const pending = receivables.filter(r => r.status === "Pending").reduce((s, r) => s + r.amount, 0);
  const paid = receivables.filter(r => r.status === "Paid").reduce((s, r) => s + r.amount, 0);

  const columns: Column<Row>[] = [
    { key: "invoice", header: "Invoice", cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.invoice}</span> },
    { key: "customer", header: "Customer", cell: (r) => <span className="font-medium text-foreground">{r.customer}</span> },
    { key: "amount", header: "Amount Due", align: "right", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
    { key: "due", header: "Due Date", cell: (r) => <span className="text-muted-foreground">{r.due}</span> },
    { key: "days", header: "Aging", align: "right", cell: (r) =>
      r.days > 0 ? <span className="font-medium text-destructive">{r.days}d overdue</span> : <span className="text-muted-foreground">—</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "", align: "right", cell: (r) =>
      r.status !== "Paid" ? <ErpButton size="sm" variant="outline"><Send className="h-3 w-3" /> Remind</ErpButton> : null },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Accounts Receivable"
        description="Customer invoices, payment status and collection tracking."
        actions={
          <ErpButton size="md"><Plus className="h-4 w-4" /><span className="hidden sm:inline">New Invoice</span></ErpButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Receivables" value={formatCurrency(total, true)} icon={ArrowDownToLine} hint={`${receivables.length} invoices`} />
        <KpiCard label="Overdue" value={formatCurrency(overdue, true)} icon={AlertTriangle} tone="danger" hint={`${receivables.filter(r=>r.status==='Overdue').length} invoices`} />
        <KpiCard label="Pending" value={formatCurrency(pending, true)} icon={Clock} tone="warning" />
        <KpiCard label="Collected (MTD)" value={formatCurrency(paid, true)} icon={CheckCircle2} tone="success" />
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={receivables}
          mobileCard={(r) => (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{r.customer}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{r.invoice} · Due {r.due}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums text-foreground">{formatCurrency(r.amount, true)}</div>
                  <div className="mt-1"><StatusBadge status={r.status} /></div>
                </div>
              </div>
              {r.days > 0 && <div className="mt-2 text-xs font-medium text-destructive">{r.days} days overdue</div>}
            </>
          )}
        />
      </div>
    </AppShell>
  );
}
