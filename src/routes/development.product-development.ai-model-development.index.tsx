import { createFileRoute } from "@tanstack/react-router";
import { AiModelDevelopmentNewPage } from "@/routes/development.research-innovation.ai-model-development.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/ai-model-development/")({
  component: () => (
    <AiModelDevelopmentNewPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

