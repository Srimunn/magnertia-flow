import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/AppShell";
import { FinanceTabBar } from "@/components/erp/FinanceTabBar";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetPage } from "@/widgets/components/WidgetPage";

export const Route = createFileRoute("/management/finance/overview")({
  head: () => ({
    meta: [
      { title: "Finance Overview · Magnertia ERP" },
      {
        name: "description",
        content: "Executive financial dashboard and ledger intelligence center.",
      },
    ],
  }),
  component: FinanceOverview,
});

/**
 * Finance Overview is now a widget surface. Its KPI cards, charts, operations
 * ledger, alerts and AI centre live in src/widgets/content/overview/ and are
 * placed by DEFAULT_LAYOUTS["finance-overview"], which reproduces the previous
 * hardcoded layout. Users can customize it; until they do, nothing changes.
 */
function FinanceOverview() {
  return (
    <AppShell
      title="Finance Overview"
      breadcrumb="Management"
      description="High-level financial intelligence, aggregate sub-ledgers and bank account metrics."
      tabs={<FinanceTabBar />}
    >
      <WidgetPage pageId="finance-overview" skeleton={<OverviewSkeleton />} />
    </AppShell>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[350px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    </div>
  );
}
