import { createFileRoute } from "@tanstack/react-router";
import { CloudPlatformDevelopmentNewPage } from "@/routes/development.research-innovation.cloud-platform-development.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/cloud-platform-development/")({
  component: () => (
    <CloudPlatformDevelopmentNewPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

