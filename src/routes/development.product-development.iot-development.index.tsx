import { createFileRoute } from "@tanstack/react-router";
import { IotPage } from "@/routes/development.research-innovation.iot-development.new";
import { ProductDevelopmentTabBar } from "@/components/erp/ProductDevelopmentTabBar";

export const Route = createFileRoute("/development/product-development/iot-development/")({
  component: () => (
    <IotPage
      breadcrumb="Development > Product Development"
      tabs={<ProductDevelopmentTabBar />}
    />
  ),
});

