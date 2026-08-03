import { createFileRoute } from "@tanstack/react-router";
import { FixtureDevelopmentNewPage } from "@/routes/development.research-innovation.fixture-development.new";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/fixture-development/")({
  component: () => (
    <FixtureDevelopmentNewPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
