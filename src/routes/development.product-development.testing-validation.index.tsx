import { createFileRoute } from "@tanstack/react-router";
import { TestingValidationNewPage } from "@/routes/development.research-innovation.testing-validation.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/testing-validation/")({
  component: () => (
    <TestingValidationNewPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});
