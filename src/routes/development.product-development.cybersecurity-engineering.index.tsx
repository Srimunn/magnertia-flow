import { createFileRoute } from "@tanstack/react-router";
import { CybersecurityEngineeringNewPage } from "@/routes/development.research-innovation.cybersecurity-engineering.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/cybersecurity-engineering/")({
  component: () => (
    <CybersecurityEngineeringNewPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

