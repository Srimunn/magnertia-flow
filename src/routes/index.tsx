import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetPage } from "@/widgets/components/WidgetPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Financial Management Dashboard · Magnertia" },
      {
        name: "description",
        content:
          "Real-time overview of Magnertia's financial performance — revenue, expenses, cash flow, AR & AP aging.",
      },
    ],
  }),
  component: Dashboard,
});

/**
 * The Dashboard is now a widget surface. Its KPI cards, charts, tables and
 * insights live in src/widgets/content/dashboard/ and are placed by
 * DEFAULT_LAYOUTS.dashboard, which reproduces the previous hardcoded layout
 * exactly. Users can customize it; until they do, nothing changes.
 */
function Dashboard() {
  return (
    <AppShell
      title="Financial Management Dashboard"
      breadcrumb="Financial Management"
      description="Get a real-time overview of your financial performance."
    >
      <WidgetPage pageId="dashboard" skeleton={<DashboardSkeleton />} />
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl" />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <Skeleton className="h-[340px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[340px] rounded-xl" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[260px] rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
      </div>
      <div className="mt-5">
        <Skeleton className="h-[110px] rounded-xl" />
      </div>
    </>
  );
}
