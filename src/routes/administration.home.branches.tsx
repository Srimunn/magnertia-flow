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
import { companyService, branchService } from "@/services";
import type { BranchRecord, NewBranchInput } from "@/services/types";

export const Route = createFileRoute("/administration/home/branches")({
  head: () => ({ meta: [{ title: "Branches · Magnertia ERP" }] }),
  component: BranchesPage,
});

function BranchesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const companiesQuery = useQuery({
    queryKey: ["administration", "companies"],
    queryFn: () => companyService.fetchCompanies(),
  });
  const branchesQuery = useQuery({
    queryKey: ["administration", "branches"],
    queryFn: () => branchService.fetchBranches(),
  });

  const defaultInput = (): NewBranchInput => ({
    code: "",
    name: "",
    companyId: companiesQuery.data?.[0]?.id ?? "",
    city: "",
  });
  const [newBranchInput, setNewBranchInput] = useState<NewBranchInput>(defaultInput());

  const createMutation = useMutation({
    mutationFn: branchService.createBranch,
    onSuccess: (newBranch) => {
      toast.success(`Branch created: [${newBranch.code}] ${newBranch.name}`);
      setCreateOpen(false);
      setNewBranchInput(defaultInput());
      queryClient.invalidateQueries({ queryKey: ["administration"] });
    },
    onError: () => toast.error("Failed to create branch."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchInput.code || !newBranchInput.name || !newBranchInput.city) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createMutation.mutate(newBranchInput);
  };

  return (
    <AppShell
      title="Home"
      breadcrumb="Administration"
      description="Manage branch offices and locations across all companies."
      tabs={<AdminHomeTabBar />}
      topbarActions={
        <ErpButton onClick={() => setCreateOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Branch</span>
        </ErpButton>
      }
    >
      {branchesQuery.isLoading ? (
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="card-soft overflow-hidden">
          <DataTable<BranchRecord>
            data={branchesQuery.data ?? []}
            columns={[
              {
                key: "name",
                header: "Branch",
                cell: (r) => (
                  <div>
                    <span className="font-semibold text-foreground block">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.code}</span>
                  </div>
                ),
              },
              {
                key: "companyName",
                header: "Company",
                cell: (r) => <span className="text-muted-foreground">{r.companyName}</span>,
              },
              {
                key: "city",
                header: "Location",
                cell: (r) => <span className="text-muted-foreground">{r.city}</span>,
              },
              {
                key: "departmentCount",
                header: "Departments",
                align: "right",
                cell: (r) => <span className="tabular text-foreground">{r.departmentCount}</span>,
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
                    {r.companyName} • {r.city}
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
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>Add a new branch office under a company.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Company *
                </label>
                <select
                  value={newBranchInput.companyId}
                  onChange={(e) =>
                    setNewBranchInput((prev) => ({ ...prev, companyId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                >
                  {(companiesQuery.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
                    placeholder="e.g. BLR-02"
                    value={newBranchInput.code}
                    onChange={(e) =>
                      setNewBranchInput((prev) => ({ ...prev, code: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, India"
                    value={newBranchInput.city}
                    onChange={(e) =>
                      setNewBranchInput((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru South Office"
                  value={newBranchInput.name}
                  onChange={(e) => setNewBranchInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <ErpButton type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton type="submit" loading={createMutation.isPending}>
                Create Branch
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
