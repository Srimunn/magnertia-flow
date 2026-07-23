import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { AdminHomeTabBar } from "@/components/erp/AdminHomeTabBar";
import { ErpButton } from "@/components/erp/Button";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable } from "@/components/erp/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { roleService } from "@/services";
import type { RoleRecord, NewRoleInput } from "@/services/types";

export const Route = createFileRoute("/administration/home/roles")({
  head: () => ({ meta: [{ title: "Roles · Magnertia ERP" }] }),
  component: RolesPage,
});

const DEFAULT_INPUT: NewRoleInput = { name: "", description: "" };

function RolesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState<NewRoleInput>(DEFAULT_INPUT);

  const rolesQuery = useQuery({
    queryKey: ["administration", "roles"],
    queryFn: () => roleService.fetchRoles(),
  });

  const createMutation = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: (newRole) => {
      toast.success(`Role created: ${newRole.name}`);
      setCreateOpen(false);
      setNewRoleInput(DEFAULT_INPUT);
      queryClient.invalidateQueries({ queryKey: ["administration"] });
    },
    onError: () => toast.error("Failed to create role."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleInput.name || !newRoleInput.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createMutation.mutate(newRoleInput);
  };

  return (
    <AppShell
      title="Home"
      breadcrumb="Administration"
      description="Manage roles and their assigned permissions."
      tabs={<AdminHomeTabBar />}
      topbarActions={
        <ErpButton onClick={() => setCreateOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Role</span>
        </ErpButton>
      }
    >
      {rolesQuery.isLoading ? (
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="card-soft overflow-hidden">
          <DataTable<RoleRecord>
            data={rolesQuery.data ?? []}
            columns={[
              {
                key: "name",
                header: "Role",
                cell: (r) => <span className="font-semibold text-foreground">{r.name}</span>,
              },
              {
                key: "description",
                header: "Description",
                cell: (r) => (
                  <span className="text-muted-foreground line-clamp-1">{r.description}</span>
                ),
              },
              {
                key: "permissionsCount",
                header: "Permissions",
                align: "right",
                cell: (r) => <span className="tabular text-foreground">{r.permissionsCount}</span>,
              },
              {
                key: "usersAssignedCount",
                header: "Users Assigned",
                align: "right",
                cell: (r) => (
                  <span className="tabular text-foreground">{r.usersAssignedCount}</span>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (r) => <StatusBadge status={r.status} />,
              },
            ]}
            mobileCard={(r) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.usersAssignedCount} users assigned
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            )}
          />
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Define a new role to assign to users.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Manager"
                  value={newRoleInput.name}
                  onChange={(e) => setNewRoleInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="What can this role access or do?"
                  value={newRoleInput.description}
                  onChange={(e) =>
                    setNewRoleInput((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={createMutation.isPending}>
                Create Role
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
