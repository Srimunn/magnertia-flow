import { createFileRoute } from "@tanstack/react-router";
import { ControlPlanDevelopmentPage } from "@/routes/development.research-innovation.control-plan.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/control-plan/")({
  component: () => (
    <ControlPlanDevelopmentPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
