import { createFileRoute } from "@tanstack/react-router";
import { SoftwareDevelopmentFormPage } from "@/routes/development.research-innovation.software-development.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/software-development/")({
  component: () => (
    <SoftwareDevelopmentFormPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});
