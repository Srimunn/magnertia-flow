import { createFileRoute } from "@tanstack/react-router";
import { MassProductionReadinessListPage } from "@/routes/manufacturing-development.mass-production-readiness.index";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/mass-production-readiness/")({
  component: () => (
    <MassProductionReadinessListPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
