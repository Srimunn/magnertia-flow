import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link as LinkIcon, BookOpen } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { FinanceTabBar } from "@/components/erp/FinanceTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { generalLedgerService } from "@/services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/management/finance/setup")({
  head: () => ({ meta: [{ title: "Setup & Integrations · Magnertia ERP" }] }),
  component: SetupPage,
});

function SetupPage() {
  const queryClient = useQueryClient();

  const integrationQuery = useQuery({
    queryKey: ["ledger", "integrations"],
    queryFn: () => generalLedgerService.fetchIntegrationSettings(),
  });

  const updateIntegrationsMutation = useMutation({
    mutationFn: (settings: Record<string, string>) =>
      generalLedgerService.updateIntegrationSettings(settings),
    onSuccess: () => {
      toast.success("Integration settings saved to MongoDB successfully!");
      queryClient.invalidateQueries({ queryKey: ["ledger", "integrations"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save settings."),
  });

  const integrations =
    integrationQuery.data && "success" in integrationQuery.data && integrationQuery.data.success
      ? (
          integrationQuery.data as Extract<
            NonNullable<typeof integrationQuery.data>,
            { success: true }
          >
        ).data
      : undefined;

  return (
    <AppShell
      title="Setup & Integrations"
      breadcrumb="Finance"
      description="Configure and manage real-time ledger updates from sub-modules and external ERP gateways."
      tabs={<FinanceTabBar />}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Section K: Workflow Integration toggles */}
        <div className="card-soft p-5 bg-card border border-border rounded-xl">
          <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-display text-[15px] font-semibold text-foreground">
                  ERP Workflow Integrations
                </h3>
                <p className="text-xs text-muted-foreground">
                  Toggle other system modules connection statuses to General Ledger. Saved in
                  MongoDB.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3.5 text-[13px]">
            {integrationQuery.isLoading ? (
              <div className="h-[200px] animate-pulse rounded bg-muted/40" />
            ) : (
              <>
                <IntegrationRow
                  label="Accounts Payable"
                  connected={integrations?.accountsPayable === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      accountsPayable: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="Accounts Receivable"
                  connected={integrations?.accountsReceivable === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      accountsReceivable: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="Banking"
                  connected={integrations?.banking === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      banking: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="Inventory"
                  connected={integrations?.inventory === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      inventory: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="Manufacturing"
                  connected={integrations?.manufacturing === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      manufacturing: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="Payroll"
                  connected={integrations?.payroll === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      payroll: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="Fixed Assets"
                  connected={integrations?.fixedAssets === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      fixedAssets: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="Projects"
                  connected={integrations?.projects === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      projects: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="Tax Management"
                  connected={integrations?.taxManagement === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      taxManagement: c ? "Connected" : "Not Connected",
                    })
                  }
                />
                <IntegrationRow
                  label="ERP Integration Hub"
                  connected={integrations?.erpIntegration === "Connected"}
                  onChange={(c) =>
                    updateIntegrationsMutation.mutate({
                      ...integrations,
                      erpIntegration: c ? "Connected" : "Not Connected",
                    })
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* Section M: Functional modules descriptions */}
        <div className="card-soft p-5 bg-card border border-border rounded-xl">
          <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-display text-[15px] font-semibold text-foreground">
                  GL Functional Modules
                </h3>
                <p className="text-xs text-muted-foreground">
                  List of capabilities included in the enterprise General Ledger framework.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-4 text-[13px]">
            <ModuleDesc
              title="Chart of Accounts Management"
              desc="Create, classify, version, and maintain the enterprise Chart of Accounts with hierarchical account structures."
            />
            <ModuleDesc
              title="Journal Management"
              desc="Create manual, automatic, recurring, reversing, adjusting, accrual, and allocation journal entries with workflow approvals."
            />
            <ModuleDesc
              title="Ledger Posting"
              desc="Validate and post accounting entries from all ERP modules while maintaining double-entry accounting principles."
            />
            <ModuleDesc
              title="Financial Period Management"
              desc="Manage accounting periods, fiscal years, period opening, period closing, year-end closing, and period locking."
            />
            <ModuleDesc
              title="Multi-Dimensional Accounting"
              desc="Support cost centers, profit centers, projects, departments, products, branches, business units, and custom accounting dimensions."
            />
            <ModuleDesc
              title="Multi-Currency Accounting"
              desc="Record foreign currency transactions, exchange rates, realized/unrealized gains & losses, and consolidated reporting."
            />
            <ModuleDesc
              title="Consolidation & Reconciliation"
              desc="Support intercompany accounting, eliminations, ledger reconciliation, trial balance validation, and financial consolidation."
            />
            <ModuleDesc
              title="AI Financial Intelligence"
              desc="Detect abnormal journal entries, predict accounting risks, recommend accruals, automate reconciliations, forecast financial close readiness, identify fraud indicators, and generate dashboards."
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function IntegrationRow({
  label,
  connected,
  onChange,
}: {
  label: string;
  connected: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
      <span className="font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <StatusBadge status={connected ? "Active" : "Inactive"} />
        <button
          onClick={() => onChange(!connected)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all cursor-pointer",
            connected
              ? "bg-[#EF4444]/10 text-[#EF4444] ring-[#EF4444]/25 hover:bg-[#EF4444]/20"
              : "bg-success/10 text-success ring-success/25 hover:bg-success/20",
          )}
        >
          {connected ? "Disconnect" : "Connect Module"}
        </button>
      </div>
    </div>
  );
}

function ModuleDesc({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-border/40 pb-2">
      <div className="font-bold text-foreground">{title}</div>
      <div className="text-muted-foreground text-[12px] mt-0.5 leading-relaxed">{desc}</div>
    </div>
  );
}
