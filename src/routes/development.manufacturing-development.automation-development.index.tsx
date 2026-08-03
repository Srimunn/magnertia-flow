import { createFileRoute } from "@tanstack/react-router";
import { AutomationDevelopmentListPage } from "@/routes/manufacturing-development.automation-development.index";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/automation-development/")({
  component: () => (
    <AutomationDevelopmentListPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
