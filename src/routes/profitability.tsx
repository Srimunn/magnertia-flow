import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/profitability")({
  head: () => ({ meta: [{ title: "Profitability Analysis · Magnertia ERP" }] }),
  component: () => (
    <ComingSoon
      title="Profitability Analysis"
      description="Margin and profitability across products, regions and channels."
    />
  ),
});
