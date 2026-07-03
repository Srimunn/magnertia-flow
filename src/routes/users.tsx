import { createFileRoute } from "@tanstack/react-router";
import { Users, Plus, Shield } from "lucide-react";
import { AppShell, PageHeader } from "@/components/erp/AppShell";
import { ErpButton } from "@/components/erp/Button";
import { KpiCard } from "@/components/erp/KpiCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { users } from "@/lib/mock-data";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Users & Roles · Magnertia ERP" }] }),
  component: UsersPage,
});

type Row = (typeof users)[number];

const ROLES = [
  "Super Admin",
  "Finance Manager",
  "Operations Manager",
  "Accountant",
  "Auditor",
  "Viewer",
];

function UsersPage() {
  const active = users.filter((u) => u.status === "Active").length;

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "User",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-primary text-xs font-semibold">
            {r.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{r.name}</div>
            <div className="truncate text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (r) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-semibold text-primary">
          <Shield className="h-3 w-3" /> {r.role}
        </span>
      ),
    },
    {
      key: "last",
      header: "Last Active",
      cell: (r) => <span className="text-muted-foreground">{r.lastActive}</span>,
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Users & Roles"
        description="Role-based access control across the Magnertia organization."
        actions={
          <ErpButton size="md">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite User</span>
          </ErpButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total Users" value={users.length.toString()} icon={Users} />
        <KpiCard label="Active" value={active.toString()} icon={Users} tone="success" />
        <KpiCard label="Roles Configured" value={ROLES.length.toString()} icon={Shield} />
      </div>

      <div className="mt-6 card-soft p-5">
        <h3 className="font-display text-base font-semibold text-foreground">Role Matrix</h3>
        <p className="text-xs text-muted-foreground">Permissions across modules</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              <Shield className="h-3 w-3 text-primary" /> {r}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={users}
          mobileCard={(r) => (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary text-sm font-semibold">
                    {r.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{r.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.email}</div>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 font-semibold text-primary">
                  <Shield className="h-3 w-3" /> {r.role}
                </span>
                <span className="text-muted-foreground">{r.lastActive}</span>
              </div>
            </>
          )}
        />
      </div>
    </AppShell>
  );
}
