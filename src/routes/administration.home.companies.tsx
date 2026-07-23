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
import { companyService } from "@/services";
import type { CompanyRecord, NewCompanyInput } from "@/services/types";

export const Route = createFileRoute("/administration/home/companies")({
  head: () => ({ meta: [{ title: "Companies · Magnertia ERP" }] }),
  component: CompaniesPage,
});

const DEFAULT_INPUT: NewCompanyInput = { code: "", name: "", taxId: "" };

function CompaniesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newCompanyInput, setNewCompanyInput] = useState<NewCompanyInput>(DEFAULT_INPUT);

  const companiesQuery = useQuery({
    queryKey: ["administration", "companies"],
    queryFn: () => companyService.fetchCompanies(),
  });

  const createMutation = useMutation({
    mutationFn: companyService.createCompany,
    onSuccess: (newCompany) => {
      toast.success(`Company created: [${newCompany.code}] ${newCompany.name}`);
      setCreateOpen(false);
      setNewCompanyInput(DEFAULT_INPUT);
      queryClient.invalidateQueries({ queryKey: ["administration"] });
    },
    onError: () => toast.error("Failed to create company."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyInput.code || !newCompanyInput.name || !newCompanyInput.taxId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createMutation.mutate(newCompanyInput);
  };

  return (
    <AppShell
      title="Home"
      breadcrumb="Administration"
      description="Manage the legal entities that make up your organization."
      tabs={<AdminHomeTabBar />}
      topbarActions={
        <ErpButton onClick={() => setCreateOpen(true)} size="md">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Company</span>
        </ErpButton>
      }
    >
      {companiesQuery.isLoading ? (
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="card-soft overflow-hidden">
          <DataTable<CompanyRecord>
            data={companiesQuery.data ?? []}
            columns={[
              {
                key: "name",
                header: "Company",
                cell: (r) => (
                  <div>
                    <span className="font-semibold text-foreground block">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.code}</span>
                  </div>
                ),
              },
              {
                key: "taxId",
                header: "Tax ID",
                cell: (r) => (
                  <span className="font-mono text-xs text-muted-foreground">{r.taxId}</span>
                ),
              },
              {
                key: "branchCount",
                header: "Branches",
                align: "right",
                cell: (r) => <span className="tabular text-foreground">{r.branchCount}</span>,
              },
              {
                key: "createdDate",
                header: "Created",
                cell: (r) => <span className="text-xs text-muted-foreground">{r.createdDate}</span>,
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
                  <div className="text-xs text-muted-foreground">{r.code}</div>
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
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>
              Register a new legal entity under your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAG-IN"
                    value={newCompanyInput.code}
                    onChange={(e) =>
                      setNewCompanyInput((prev) => ({ ...prev, code: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tax ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 27AACCM1234F1Z5"
                    value={newCompanyInput.taxId}
                    onChange={(e) =>
                      setNewCompanyInput((prev) => ({ ...prev, taxId: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Magnertia EV Infrastructure Pvt Ltd"
                  value={newCompanyInput.name}
                  onChange={(e) =>
                    setNewCompanyInput((prev) => ({ ...prev, name: e.target.value }))
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
                Create Company
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
