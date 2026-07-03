import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Star } from "lucide-react";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { KpiCard } from "@/components/erp/KpiCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { vendors, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Vendors · Magnertia ERP" }] }),
  component: VendorsPage,
});

type Row = (typeof vendors)[number];

function VendorsPage() {
  const totalOutstanding = vendors.reduce((s, v) => s + v.outstanding, 0);
  const active = vendors.filter((v) => v.status === "Active").length;

  const columns: Column<Row>[] = [
    {
      key: "id",
      header: "ID",
      cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.id}</span>,
    },
    {
      key: "name",
      header: "Vendor",
      cell: (r) => <span className="font-medium text-foreground">{r.name}</span>,
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
      key: "rating",
      header: "Rating",
      cell: (r) => (
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: "out",
      header: "Outstanding",
      align: "right",
      cell: (r) =>
        r.outstanding > 0 ? (
          <span className="font-semibold text-destructive tabular-nums">
            {formatCurrency(r.outstanding, true)}
          </span>
        ) : (
          <span className="text-muted-foreground">Settled</span>
        ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Vendor Management"
        description="Suppliers, service providers and partner relationships."
        actions={
          <ErpButton size="md">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Vendor</span>
          </ErpButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total Vendors" value={vendors.length.toString()} icon={Building2} />
        <KpiCard label="Active" value={active.toString()} icon={Building2} tone="success" />
        <KpiCard
          label="Total Outstanding"
          value={formatCurrency(totalOutstanding, true)}
          icon={Building2}
          tone="warning"
        />
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={vendors}
          mobileCard={(r) => (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{r.name}</div>
                <div className="text-xs text-muted-foreground">
                  {r.category} · {r.id}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-warning text-warning" /> {r.rating.toFixed(1)}
                </div>
              </div>
              <div className="text-right">
                {r.outstanding > 0 ? (
                  <div className="font-semibold text-destructive tabular-nums">
                    {formatCurrency(r.outstanding, true)}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Settled</div>
                )}
                <div className="mt-1">
                  <StatusBadge status={r.status} />
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </AppShell>
  );
}
