import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/cost-centers")({
  head: () => ({ meta: [{ title: "Cost Centers · Magnertia ERP" }] }),
  component: () => (
    <ComingSoon
      title="Cost Centers"
      description="Allocate and track costs by department or project."
    />
  ),
});
