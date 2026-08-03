import { createFileRoute } from "@tanstack/react-router";
import { FirmwareDevelopmentFormPage } from "@/routes/development.research-innovation.firmware-development.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/firmware-development/")({
  component: () => (
    <FirmwareDevelopmentFormPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

