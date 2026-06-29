import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/erp/ComingSoon";

export const Route = createFileRoute("/tax")({
  head: () => ({ meta: [{ title: "Tax Management · Magnertia ERP" }] }),
  component: () => <ComingSoon title="Tax Management" description="GST, TDS, and statutory filings." />,
});
