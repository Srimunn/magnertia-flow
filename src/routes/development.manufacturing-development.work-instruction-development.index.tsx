import { createFileRoute } from "@tanstack/react-router";
import { WorkInstructionDevelopmentNewPage } from "@/routes/development.research-innovation.work-instruction-development.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/work-instruction-development/")({
  component: () => (
    <WorkInstructionDevelopmentNewPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
