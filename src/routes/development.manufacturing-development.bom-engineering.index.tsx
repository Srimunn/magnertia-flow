import { createFileRoute } from "@tanstack/react-router";
import { BomEngineeringPage } from "@/routes/development.research-innovation.bom-engineering.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/bom-engineering/")({
  component: () => (
    <BomEngineeringPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
