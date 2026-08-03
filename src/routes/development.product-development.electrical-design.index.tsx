import { createFileRoute } from "@tanstack/react-router";
import { ElectricalDesignFormPage } from "@/routes/development.research-innovation.electrical-design.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/electrical-design/")({
  component: () => (
    <ElectricalDesignFormPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

