import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/overview")({
  head: () => ({ meta: [{ title: "Overview · Magnertia ERP" }] }),
  component: () => <ComingSoon title="Overview" description="High-level financial KPIs across all entities." />,
});
