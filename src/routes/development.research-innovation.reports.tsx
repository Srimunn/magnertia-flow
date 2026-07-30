import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { ReportBuilder } from "@/components/erp/reports/ReportBuilder";
import { RI_REPORT_CONFIG } from "@/components/erp/reports/ri.config";

export const Route = createFileRoute("/development/research-innovation/reports")({
  head: () => ({ meta: [{ title: "R&I Reports · Magnertia ERP" }] }),
  component: ResearchInnovationReportsPage,
});

function ResearchInnovationReportsPage() {
  return (
    <AppShell
      title="Reports"
      breadcrumb="Development · Research & Innovation"
      description="Generate innovation-pipeline reports and export to CSV, Excel, or PDF."
      tabs={<ResearchInnovationTabBar />}
    >
      <ReportBuilder config={RI_REPORT_CONFIG} />
    </AppShell>
  );
}
