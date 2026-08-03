import { createFileRoute } from "@tanstack/react-router";
import { ProductReleasePage } from "@/routes/development.research-innovation.product-release-management.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/product-release-management/")({
  component: () => (
    <ProductReleasePage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});
