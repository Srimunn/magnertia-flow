import { createFileRoute } from "@tanstack/react-router";
import { ProductReleasePage } from "@/routes/development.research-innovation.product-release-management.new";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";

export const Route = createFileRoute(
  "/development/research-innovation/product-release-management",
)({
  component: () => (
    <ProductReleasePage
      breadcrumb="Development > Research & Innovation"
      tabs={<ResearchInnovationTabBar />}
    />
  ),
});
