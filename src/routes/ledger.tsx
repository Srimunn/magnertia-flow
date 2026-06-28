import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Download, Plus, Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { KpiCard } from "@/components/erp/KpiCard";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { ledger, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/ledger")({
  head: () => ({ meta: [{ title: "General Ledger · Magnertia ERP" }] }),
  component: LedgerPage,
});

type Row = (typeof ledger)[number];

function LedgerPage() {
  const totalDebit = ledger.reduce((s, r) => s + r.debit, 0);
  const totalCredit = ledger.reduce((s, r) => s + r.credit, 0);

  const columns: Column<Row>[] = [
    { key: "date", header: "Date", cell: (r) => <span className="text-muted-foreground">{r.date}</span> },
    { key: "ref", header: "Ref", cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.ref}</span> },
    { key: "desc", header: "Description", cell: (r) => <span className="text-foreground">{r.desc}</span> },
    { key: "debit", header: "Debit", align: "right", cell: (r) =>
      r.debit > 0 ? <span className="font-semibold text-destructive">{formatCurrency(r.debit)}</span> : <span className="text-muted-foreground">—</span> },
    { key: "credit", header: "Credit", align: "right", cell: (r) =>
      r.credit > 0 ? <span className="font-semibold text-success">{formatCurrency(r.credit)}</span> : <span className="text-muted-foreground">—</span> },
    { key: "balance", header: "Balance", align: "right", cell: (r) => <span className="font-semibold text-foreground">{formatCurrency(r.balance)}</span> },
  ];

  return (
    <AppShell>
      <PageHeader
        title="General Ledger"
        description="Complete transaction history with full audit trail."
        actions={
          <>
            <ErpButton variant="outline" size="md"><Download className="h-4 w-4" /><span className="hidden sm:inline">Export</span></ErpButton>
            <ErpButton size="md"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Journal Entry</span></ErpButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total Debits" value={formatCurrency(totalDebit, true)} icon={BookOpen} tone="warning" />
        <KpiCard label="Total Credits" value={formatCurrency(totalCredit, true)} icon={BookOpen} tone="success" />
        <KpiCard label="Closing Balance" value={formatCurrency(ledger[ledger.length-1].balance, true)} icon={BookOpen} />
      </div>

      <div className="mt-6 card-soft p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search entries by reference, description, account…"
            className="h-10 w-full rounded-md border border-input bg-secondary/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={ledger}
          mobileCard={(r) => (
            <>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-foreground">{r.ref}</span>
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
              <div className="mt-1.5 text-sm text-foreground">{r.desc}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Debit</div>
                  <div className="font-semibold text-destructive tabular-nums">{r.debit > 0 ? formatCurrency(r.debit, true) : "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Credit</div>
                  <div className="font-semibold text-success tabular-nums">{r.credit > 0 ? formatCurrency(r.credit, true) : "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Balance</div>
                  <div className="font-semibold text-foreground tabular-nums">{formatCurrency(r.balance, true)}</div>
                </div>
              </div>
            </>
          )}
        />
      </div>
    </AppShell>
  );
}
