import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/cash-bank")({
  head: () => ({ meta: [{ title: "Cash & Bank · Magnertia ERP" }] }),
  component: () => (
    <ComingSoon
      title="Cash & Bank"
      description="Bank accounts, reconciliations, and cash position."
    />
  ),
});
