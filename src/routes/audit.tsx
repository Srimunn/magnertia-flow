import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit Trail · Magnertia ERP" }] }),
  component: () => (
    <ComingSoon title="Audit Trail" description="Immutable log of all financial actions." />
  ),
});
