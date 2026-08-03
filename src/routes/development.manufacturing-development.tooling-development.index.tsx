import { createFileRoute } from "@tanstack/react-router";
import { ToolingDevelopmentNewPage } from "@/routes/development.research-innovation.tooling-development.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/tooling-development/")({
  component: () => (
    <ToolingDevelopmentNewPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
