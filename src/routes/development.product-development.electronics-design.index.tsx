import { createFileRoute } from "@tanstack/react-router";
import { ElectronicsDesignFormPage } from "@/routes/development.research-innovation.electronics-design.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/electronics-design/")({
  component: () => (
    <ElectronicsDesignFormPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

