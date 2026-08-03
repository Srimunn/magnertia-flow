import { createFileRoute } from "@tanstack/react-router";
import { MechanicalDesignFormPage } from "@/routes/development.research-innovation.mechanical-design.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/mechanical-design/")({
  component: () => (
    <MechanicalDesignFormPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

