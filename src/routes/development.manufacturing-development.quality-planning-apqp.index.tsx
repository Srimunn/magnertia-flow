import { createFileRoute } from "@tanstack/react-router";
import { ApqpQualityPlanningPage } from "@/routes/development.research-innovation.quality-planning-apqp.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/quality-planning-apqp/")({
  component: () => (
    <ApqpQualityPlanningPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
