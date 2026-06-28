import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Plus, Wrench } from "lucide-react";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { KpiCard } from "@/components/erp/KpiCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { assets, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/assets")({
  head: () => ({ meta: [{ title: "Assets · Magnertia ERP" }] }),
  component: AssetsPage,
});

type Row = (typeof assets)[number];

function AssetsPage() {
  const totalCost = assets.reduce((s, a) => s + a.cost, 0);
  const totalDep = assets.reduce((s, a) => s + a.depreciated, 0);
  const netValue = totalCost - totalDep;

  const columns: Column<Row>[] = [
    { key: "id", header: "Asset ID", cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.id}</span> },
    { key: "name", header: "Asset", cell: (r) => (
      <div>
        <div className="font-medium text-foreground">{r.name}</div>
        <div className="text-xs text-muted-foreground">{r.type}</div>
      </div>
    )},
    { key: "station", header: "Location", cell: (r) => <span className="text-muted-foreground">{r.station}</span> },
    { key: "cost", header: "Cost", align: "right", cell: (r) => <span className="font-semibold tabular-nums">{formatCurrency(r.cost, true)}</span> },
    { key: "dep", header: "Depreciated", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.depreciated, true)}</span> },
    { key: "net", header: "Net Value", align: "right", cell: (r) => <span className="font-semibold tabular-nums text-primary">{formatCurrency(r.cost - r.depreciated, true)}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Asset Management"
        description="Chargers, transformers, electrical equipment and office assets."
        actions={<ErpButton size="md"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add Asset</span></ErpButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Assets" value={assets.length.toString()} icon={Boxes} />
        <KpiCard label="Total Cost" value={formatCurrency(totalCost, true)} icon={Boxes} />
        <KpiCard label="Accumulated Depreciation" value={formatCurrency(totalDep, true)} icon={Boxes} tone="warning" />
        <KpiCard label="Net Book Value" value={formatCurrency(netValue, true)} icon={Boxes} tone="success" />
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={assets}
          mobileCard={(r) => (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
                  <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.type} · {r.station}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><div className="text-muted-foreground">Cost</div><div className="font-semibold tabular-nums">{formatCurrency(r.cost, true)}</div></div>
                <div><div className="text-muted-foreground">Dep.</div><div className="tabular-nums">{formatCurrency(r.depreciated, true)}</div></div>
                <div className="text-right"><div className="text-muted-foreground">Net</div><div className="font-semibold tabular-nums text-primary">{formatCurrency(r.cost - r.depreciated, true)}</div></div>
              </div>
              <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"><Wrench className="h-3 w-3" /> Maintenance history</button>
            </>
          )}
        />
      </div>
    </AppShell>
  );
}
