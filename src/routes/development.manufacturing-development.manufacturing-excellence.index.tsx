import { createFileRoute } from "@tanstack/react-router";
import { ManufacturingExcellencePage } from "@/routes/development.research-innovation.manufacturing-excellence.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/manufacturing-excellence/")({
  component: () => (
    <ManufacturingExcellencePage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});

