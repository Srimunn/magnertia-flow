import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transactions · Magnertia ERP" }] }),
  component: () => <ComingSoon title="Transactions" description="All financial transactions across accounts and entities." />,
});
