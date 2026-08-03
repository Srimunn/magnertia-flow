import { createFileRoute } from "@tanstack/react-router";
import { RoutingDevelopmentPage } from "@/routes/development.research-innovation.routing-development.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/routing-development/")({
  component: () => (
    <RoutingDevelopmentPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
