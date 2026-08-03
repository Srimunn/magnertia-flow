import { createFileRoute } from "@tanstack/react-router";
import { FactoryLayoutDesignNewPage } from "@/routes/development.research-innovation.factory-layout-design.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/factory-layout-design/")({
  component: () => (
    <FactoryLayoutDesignNewPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
