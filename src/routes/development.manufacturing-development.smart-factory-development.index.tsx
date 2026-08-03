import { createFileRoute } from "@tanstack/react-router";
import { SmartFactoryDevelopmentPage } from "@/routes/development.research-innovation.smart-factory-development.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/smart-factory-development/")({
  component: () => (
    <SmartFactoryDevelopmentPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
