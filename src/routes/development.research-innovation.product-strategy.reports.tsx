import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Printer,
  Download,
  Calculator,
  TrendingUp,
  Sparkles,
  Zap,
  BarChart3,
  DollarSign,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ProductStrategyTabBar } from "@/components/erp/ProductStrategyTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import { productStrategyService } from "@/services";

export const Route = createFileRoute(
  "/development/research-innovation/product-strategy/reports",
)({
  head: () => ({ meta: [{ title: "Strategy Reports · Magnertia ERP" }] }),
  component: ProductStrategyReportsPage,
});

function formatCurrency(val: number): string {
  if (!val || isNaN(val)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function ProductStrategyReportsPage() {
  const navigate = useNavigate();

  const { data: record } = useQuery({
    queryKey: ["productStrategyRecord"],
    queryFn: () => productStrategyService.fetchRecord(),
  });

  return (
    <AppShell
      title="Strategy Reports & Analytics"
      breadcrumb="Development > Product Strategy"
      description="Financial projections, capex/opex breakdown, and AI executive briefs for Product Strategy governance."
      tabs={<ProductStrategyTabBar />}
      topbarActions={
        <div className="flex items-center gap-2">
          <ErpButton variant="outline" size="sm" className="gap-1.5 text-xs">
            <Printer className="h-4 w-4" />
            <span>Print Brief</span>
          </ErpButton>
          <ErpButton variant="primary" size="sm" className="gap-1.5 text-xs">
            <Download className="h-4 w-4" />
            <span>Export Executive PDF</span>
          </ErpButton>
        </div>
      }
    >
      <div className="space-y-6 pb-12">
        {/* Executive Summary Card */}
        <div className="card-soft p-6 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  {record?.strategyName ?? "Smart EV Charger Pro Strategy 2024-2027"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Record ID: {record?.strategyId ?? "PS-2024-0017"} | Form Code: {record?.formCode ?? "PS-2024-08"}
              </p>
            </div>
            <StatusBadge status={record?.status ?? "executive_review"} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
              <span className="font-semibold text-muted-foreground block">1. Product Vision</span>
              <p className="text-foreground leading-relaxed">
                {record?.input?.productVision ?? "Premier provider of intelligent commercial EV charging infrastructure."}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
              <span className="font-semibold text-muted-foreground block">2. Market Opportunity (TAM)</span>
              <p className="text-foreground font-bold text-sm">
                {formatCurrency(record?.keyMetrics?.tam ?? 1250000000)}
              </p>
              <p className="text-muted-foreground text-[11px]">
                Target Segments: Fleet Management, Commercial Real Estate, DISCOM Corridors.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
              <span className="font-semibold text-muted-foreground block">3. Financial Projections</span>
              <p className="text-foreground font-bold text-sm text-emerald-600">
                {formatCurrency(record?.keyMetrics?.projectedRevenue ?? 680000000)} (3Y)
              </p>
              <p className="text-muted-foreground text-[11px]">
                Gross Margin: {record?.keyMetrics?.grossMargin ?? 42.5}% | Break-even: {record?.keyMetrics?.breakevenMonths ?? 18} Mos
              </p>
            </div>
          </div>
        </div>

        {/* Financial Model Breakdown Table */}
        <div className="card-soft p-6 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-bold text-foreground">3-Year Financial Model Breakdown</h3>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Currency: INR (₹)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                  <th className="p-3">Financial Metric</th>
                  <th className="p-3">Year 1 (FY25)</th>
                  <th className="p-3">Year 2 (FY26)</th>
                  <th className="p-3">Year 3 (FY27)</th>
                  <th className="p-3 font-bold text-foreground">3-Year Cumulative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-3 font-semibold">Revenue Target</td>
                  <td className="p-3">₹12.5 Cr</td>
                  <td className="p-3">₹24.0 Cr</td>
                  <td className="p-3 font-bold text-emerald-600">₹31.5 Cr</td>
                  <td className="p-3 font-bold text-emerald-600">₹68.0 Cr</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Hardware Units Shipped</td>
                  <td className="p-3">150 Units</td>
                  <td className="p-3">450 Units</td>
                  <td className="p-3 font-bold">900 Units</td>
                  <td className="p-3 font-bold">1,500 Units</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">SaaS & Telemetry Revenue</td>
                  <td className="p-3">₹1.2 Cr</td>
                  <td className="p-3">₹4.5 Cr</td>
                  <td className="p-3 font-bold text-blue-600">₹9.8 Cr</td>
                  <td className="p-3 font-bold text-blue-600">₹15.5 Cr</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Gross Margin (%)</td>
                  <td className="p-3">38.0%</td>
                  <td className="p-3">42.5%</td>
                  <td className="p-3 font-bold text-emerald-600">45.0%</td>
                  <td className="p-3 font-bold text-emerald-600">42.5% Avg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
