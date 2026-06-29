import { AppShell } from "@/components/erp/AppShell";
import { Sparkles } from "lucide-react";

export function ComingSoon({ title, breadcrumb = "Financial Management", description }: {
  title: string; breadcrumb?: string; description?: string;
}) {
  return (
    <AppShell title={title} breadcrumb={breadcrumb} description={description}>
      <div className="card-soft grid place-items-center px-6 py-20 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#6B4EFF]/10 text-[#6B4EFF]">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-foreground">{title} module</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This workspace is part of the Magnertia ERP roadmap. Detailed views, filters, and
          reporting for {title.toLowerCase()} are being rolled out in the next release.
        </p>
      </div>
    </AppShell>
  );
}
