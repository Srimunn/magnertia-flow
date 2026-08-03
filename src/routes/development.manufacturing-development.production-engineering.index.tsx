import { createFileRoute } from "@tanstack/react-router";
import { ProductionEngineeringNewPage } from "@/routes/development.research-innovation.production-engineering.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/production-engineering/")({
  component: () => (
    <ProductionEngineeringNewPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});

