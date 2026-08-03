import { createFileRoute } from "@tanstack/react-router";
import { PilotProductionListPage } from "@/routes/manufacturing-development.pilot-production.index";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/pilot-production/")({
  component: () => (
    <PilotProductionListPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
