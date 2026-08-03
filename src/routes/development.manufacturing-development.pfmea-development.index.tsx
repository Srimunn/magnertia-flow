import { createFileRoute } from "@tanstack/react-router";
import { PfmeaDevelopmentPage } from "@/routes/development.research-innovation.pfmea-development.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/pfmea-development/")({
  component: () => (
    <PfmeaDevelopmentPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
