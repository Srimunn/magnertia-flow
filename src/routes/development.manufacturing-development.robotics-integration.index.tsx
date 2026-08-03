import { createFileRoute } from "@tanstack/react-router";
import { RoboticsIntegrationListPage } from "@/routes/manufacturing-development.robotics-integration.index";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/robotics-integration/")({
  component: () => (
    <RoboticsIntegrationListPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
