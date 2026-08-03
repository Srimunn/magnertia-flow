import { createFileRoute } from "@tanstack/react-router";
import { CapacityPlanningNewPage } from "@/routes/development.research-innovation.capacity-planning.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/capacity-planning/")({
  component: () => (
    <CapacityPlanningNewPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
