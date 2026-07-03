import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/budgeting")({
  head: () => ({ meta: [{ title: "Budgeting · Magnertia ERP" }] }),
  component: () => (
    <ComingSoon
      title="Budgeting"
      description="Plan, allocate, and track budgets across departments."
    />
  ),
});
