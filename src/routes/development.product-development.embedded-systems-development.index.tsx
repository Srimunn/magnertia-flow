import { createFileRoute } from "@tanstack/react-router";
import { EmbeddedDevelopmentFormPage } from "@/routes/development.research-innovation.embedded-systems-development.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/embedded-systems-development/")({
  component: () => (
    <EmbeddedDevelopmentFormPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

