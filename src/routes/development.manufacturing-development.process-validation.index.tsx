import { createFileRoute } from "@tanstack/react-router";
import { ProcessValidationPage } from "@/routes/development.research-innovation.process-validation.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/process-validation/")({
  component: () => (
    <ProcessValidationPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
