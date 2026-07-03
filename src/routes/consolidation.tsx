import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/consolidation")({
  head: () => ({ meta: [{ title: "Consolidation · Magnertia ERP" }] }),
  component: () => (
    <ComingSoon title="Consolidation" description="Multi-entity financial consolidation." />
  ),
});
