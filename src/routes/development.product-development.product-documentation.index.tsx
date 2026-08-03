import { createFileRoute } from "@tanstack/react-router";
import { ProductDocumentationPage } from "@/routes/development.research-innovation.product-documentation.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/product-documentation/")({
  component: () => (
    <ProductDocumentationPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});
