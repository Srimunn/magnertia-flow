import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/AppShell";
import { PrdFormPage } from "@/routes/development.research-innovation.prd.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute(
  "/development/product-development/prd/"
)({
  component: ProductDevelopmentRequirements,
});

function ProductDevelopmentRequirements() {
  return (
    <PrdFormPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  );
}

