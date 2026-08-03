import { createFileRoute } from "@tanstack/react-router";
import { SimulationAnalysisNewPage } from "@/routes/development.research-innovation.simulation-analysis.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/simulation-analysis/")({
  component: () => (
    <SimulationAnalysisNewPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});
