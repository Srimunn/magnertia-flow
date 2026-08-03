import { createFileRoute } from "@tanstack/react-router";
import { LeanManufacturingListPage } from "@/routes/manufacturing-development.lean-manufacturing.index";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export const Route = createFileRoute("/development/manufacturing-development/lean-manufacturing/")({
  component: () => (
    <LeanManufacturingListPage
      breadcrumb="Development > Manufacturing Development"
      tabs={<ManufacturingDevelopmentTabBar />}
    />
  ),
});
