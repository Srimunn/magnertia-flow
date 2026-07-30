import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Target,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Map,
  Plus,
  ArrowRight,
  Zap,
  Briefcase,
  FileCheck,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ProductStrategyTabBar } from "@/components/erp/ProductStrategyTabBar";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import { productStrategyService } from "@/services";

export const Route = createFileRoute(
  "/development/research-innovation/product-strategy/overview",
)({
  head: () => ({ meta: [{ title: "Product Strategy Overview · Magnertia ERP" }] }),
  component: ProductStrategyOverviewPage,
});

function formatCurrency(val: number): string {
  if (!val || isNaN(val)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function ProductStrategyOverviewPage() {
  const navigate = useNavigate();

  const { data: record, isLoading } = useQuery({
    queryKey: ["productStrategyRecord"],
    queryFn: () => productStrategyService.fetchRecord(),
  });

  return (
    <AppShell
      title="Product Strategy Overview"
      breadcrumb="Development > Product Strategy"
      description="Strategic product planning, portfolio alignment, 4-stage workflow governance, and AI-driven market feasibility."
      tabs={<ProductStrategyTabBar />}
      topbarActions={
        <ErpButton
          variant="primary"
          size="sm"
          onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>New Product Strategy</span>
        </ErpButton>
      }
    >
      <div className="space-y-6 pb-12">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Strategies"
            value="12"
            neutralText="Across 4 Business Units"
            icon={<Target className="h-5 w-5" />}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            label="Avg Strategy Score"
            value={`${record?.sidebarSummary?.overallScore ?? 84}/100`}
            neutralText="AI Feasibility Weighted"
            icon={<Sparkles className="h-5 w-5" />}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="3Y Revenue Forecast"
            value={formatCurrency(record?.keyMetrics?.projectedRevenue ?? 680000000)}
            neutralText="Targeted Commercial Rollout"
            icon={<TrendingUp className="h-5 w-5" />}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Active Product Roadmaps"
            value="8"
            neutralText="Post-Committee Approval"
            icon={<Map className="h-5 w-5" />}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>

        {/* Strategic Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: AI & Portfolio Health */}
          <div className="lg:col-span-8 space-y-6">
            {/* AI Strategic Assessment Callout */}
            <div className="card-soft p-5 bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BrainCircuit className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">AI Product Portfolio Intelligence</h3>
                    <p className="text-xs text-muted-foreground">Derived from continuous market telemetry & competitive benchmarks</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                  Real-time Alignment: High
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border text-center space-y-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">Market Readiness</span>
                  <span className="text-xl font-bold text-primary">{record?.sidebarSummary?.marketReadiness ?? 85}/100</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border text-center space-y-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">Innovation Score</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{record?.sidebarSummary?.innovationScore ?? 88}/100</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border text-center space-y-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">Financial Score</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{record?.sidebarSummary?.financialScore ?? 82}/100</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border text-center space-y-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">Strategic Score</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{record?.sidebarSummary?.strategicScore ?? 81}/100</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-primary block">AI Top Strategic Recommendation:</span>
                  <p className="text-foreground font-medium mt-0.5">{record?.aiAssessment?.aiRecommendation ?? "Proceed to Product Development"}</p>
                </div>
                <ErpButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}
                  className="gap-1 text-xs"
                >
                  <span>Open Form</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </ErpButton>
              </div>
            </div>

            {/* Strategy Register Table */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">Active Strategy Records</h3>
                  <p className="text-xs text-muted-foreground">Strategic planning records moving through 4 workflow stages</p>
                </div>
                <Link
                  to="/development/research-innovation/product-strategy/portfolio"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  View All Portfolio <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                      <th className="p-3">Strategy ID</th>
                      <th className="p-3">Strategy Name</th>
                      <th className="p-3">Linked Product</th>
                      <th className="p-3">PM</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-primary">PS-2024-0017</td>
                      <td className="p-3 font-medium text-foreground">Smart EV Charger Pro Strategy</td>
                      <td className="p-3">Smart EV Charger Pro</td>
                      <td className="p-3 font-medium">Vikram Sharma</td>
                      <td className="p-3 font-bold text-emerald-600">84/100</td>
                      <td className="p-3"><StatusBadge status={record?.status ?? "executive_review"} /></td>
                      <td className="p-3 text-right">
                        <ErpButton
                          variant="outline"
                          size="sm"
                          onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}
                        >
                          View Form
                        </ErpButton>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-primary">PS-2024-0018</td>
                      <td className="p-3 font-medium text-foreground">Commercial BESS Power Stack 500kW</td>
                      <td className="p-3">BESS Grid Stack</td>
                      <td className="p-3 font-medium">Ananya Rao</td>
                      <td className="p-3 font-bold text-emerald-600">89/100</td>
                      <td className="p-3"><StatusBadge status="approved" /></td>
                      <td className="p-3 text-right">
                        <ErpButton variant="outline" size="sm" onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}>
                          View Form
                        </ErpButton>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-primary">PS-2024-0019</td>
                      <td className="p-3 font-medium text-foreground">V2G Smart Dispatch Platform</td>
                      <td className="p-3">V2G Cloud Engine</td>
                      <td className="p-3 font-medium">Rahul Saxena</td>
                      <td className="p-3 font-bold text-blue-600">78/100</td>
                      <td className="p-3"><StatusBadge status="market_portfolio_strategy" /></td>
                      <td className="p-3 text-right">
                        <ErpButton variant="outline" size="sm" onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}>
                          View Form
                        </ErpButton>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Workflow Stage Breakdown & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* 4 Stage Workflow Pipeline */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Product Strategy Workflow Stages</h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Stage 1: Strategic Vision</span>
                    <span>Completed ✓</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">Defined product vision, mission statement, value prop, target customer personas.</p>
                </div>

                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Stage 2: Market & Portfolio</span>
                    <span>Completed ✓</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">Market segment qualification, growth potential stars, portfolio priority positioning.</p>
                </div>

                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Stage 3: Financial & Innovation</span>
                    <span>Completed ✓</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">3-Year capex/opex model, gross margin targets, emerging tech & ESG rating.</p>
                </div>

                <div className="p-3 rounded-lg border border-primary bg-primary/10 space-y-1">
                  <div className="flex justify-between font-bold text-primary">
                    <span>Stage 4: Executive Review</span>
                    <span>Active Stage</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">Executive Strategy Committee review for approval & roadmap generation.</p>
                </div>
              </div>
            </div>

            {/* Strategic Quick Links */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Product Strategy Pages</h3>
              <div className="space-y-2 text-xs">
                <Link
                  to="/development/research-innovation/product-strategy/new"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Product Strategy Form</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  to="/development/research-innovation/product-strategy/portfolio"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald-500" />
                    <span>Strategy Portfolio Register</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  to="/development/research-innovation/product-strategy/roadmaps"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-blue-500" />
                    <span>Product Roadmaps</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  to="/development/research-innovation/product-strategy/reports"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span>Strategy Reports & Analytics</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
