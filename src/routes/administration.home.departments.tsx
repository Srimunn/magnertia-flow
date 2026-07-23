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
import { branchService, departmentService } from "@/services";
import type { DepartmentRecord, NewDepartmentInput } from "@/services/types";

export const Route = createFileRoute("/administration/home/departments")({
  head: () => ({ meta: [{ title: "Departments · Magnertia ERP" }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const branchesQuery = useQuery({
    queryKey: ["administration", "branches"],
    queryFn: () => branchService.fetchBranches(),
  });
  const departmentsQuery = useQuery({
    queryKey: ["administration", "departments"],
    queryFn: () => departmentService.fetchDepartments(),
  });

  const defaultInput = (): NewDepartmentInput => ({
    code: "",
    name: "",
    branchId: branchesQuery.data?.[0]?.id ?? "",
    head: "",
  });
  const [newDeptInput, setNewDeptInput] = useState<NewDepartmentInput>(defaultInput());

  const createMutation = useMutation({
    mutationFn: departmentService.createDepartment,
    onSuccess: (newDept) => {
      toast.success(`Department created: [${newDept.code}] ${newDept.name}`);
      setCreateOpen(false);
      setNewDeptInput(defaultInput());
      queryClient.invalidateQueries({ queryKey: ["administration"] });
    },
    onError: () => toast.error("Failed to create department."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptInput.code || !newDeptInput.name || !newDeptInput.head) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createMutation.mutate(newDeptInput);
  };

  return (
    <AppShell
      title="Home"
      breadcrumb="Administration"
      description="Manage departments within each branch."
      tabs={<AdminHomeTabBar />}
      topbarActions={
        <ErpButton onClick={() => setCreateOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Department</span>
        </ErpButton>
      }
    >
      {departmentsQuery.isLoading ? (
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="card-soft overflow-hidden">
          <DataTable<DepartmentRecord>
            data={departmentsQuery.data ?? []}
            columns={[
              {
                key: "name",
                header: "Department",
                cell: (r) => (
                  <div>
                    <span className="font-semibold text-foreground block">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.code}</span>
                  </div>
                ),
              },
              {
                key: "branchName",
                header: "Branch",
                cell: (r) => <span className="text-muted-foreground">{r.branchName}</span>,
              },
              {
                key: "head",
                header: "Department Head",
                cell: (r) => <span className="text-foreground">{r.head}</span>,
              },
              {
                key: "employeeCount",
                header: "Employees",
                align: "right",
                cell: (r) => <span className="tabular text-foreground">{r.employeeCount}</span>,
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
                    {r.branchName} • {r.head}
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
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>Add a new department under a branch.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Branch *
                </label>
                <select
                  value={newDeptInput.branchId}
                  onChange={(e) =>
                    setNewDeptInput((prev) => ({ ...prev, branchId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                >
                  {(branchesQuery.data ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MKT"
                    value={newDeptInput.code}
                    onChange={(e) => setNewDeptInput((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Department Head *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anita Rao"
                    value={newDeptInput.head}
                    onChange={(e) => setNewDeptInput((prev) => ({ ...prev, head: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing"
                  value={newDeptInput.name}
                  onChange={(e) => setNewDeptInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={createMutation.isPending}>
                Create Department
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
