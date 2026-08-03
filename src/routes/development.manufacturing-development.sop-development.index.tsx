import { createFileRoute } from "@tanstack/react-router";
import { SopDevelopmentNewPage } from "@/routes/development.research-innovation.sop-development.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/sop-development/")({
  component: () => (
    <SopDevelopmentNewPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
