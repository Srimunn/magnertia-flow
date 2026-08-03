import { createFileRoute } from "@tanstack/react-router";
import { ProductArchitectureFormPage } from "@/routes/development.research-innovation.product-architecture.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/product-architecture/")({
  component: () => (
    <ProductArchitectureFormPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});
