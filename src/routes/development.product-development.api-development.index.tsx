import { createFileRoute } from "@tanstack/react-router";
import { ApiDevelopmentNewPage } from "@/routes/development.research-innovation.api-development.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/api-development/")({
  component: () => (
    <ApiDevelopmentNewPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

