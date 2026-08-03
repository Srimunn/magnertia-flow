import { createFileRoute } from "@tanstack/react-router";
import { JigDevelopmentNewPage } from "@/routes/development.research-innovation.jig-development.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/jig-development/")({
  component: () => (
    <JigDevelopmentNewPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
