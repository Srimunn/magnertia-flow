import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  ExternalLink,
  Target,
  Zap,
  TrendingUp,
  Download,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ProductStrategyTabBar } from "@/components/erp/ProductStrategyTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import { productStrategyService } from "@/services";

export const Route = createFileRoute(
  "/development/research-innovation/product-strategy/portfolio",
)({
  head: () => ({ meta: [{ title: "Strategy Portfolio Register · Magnertia ERP" }] }),
  component: ProductStrategyPortfolioPage,
});

function formatCurrency(val: number): string {
  if (!val || isNaN(val)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function ProductStrategyPortfolioPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const { data: record } = useQuery({
    queryKey: ["productStrategyRecord"],
    queryFn: () => productStrategyService.fetchRecord(),
  });

  const recordsList = [
    {
      id: record?.id ?? "ps-record-0017",
      strategyId: record?.strategyId ?? "PS-2024-0017",
      formCode: record?.formCode ?? "PS-2024-08",
      strategyName: record?.strategyName ?? "Smart EV Charger Pro Strategy 2024-2027",
      productName: record?.linkedProductName ?? "Smart EV Charger Pro",
      businessUnit: record?.businessUnit ?? "Smart EV Infrastructure",
      pmName: record?.productManagerName ?? "Vikram Sharma",
      avatar: record?.productManagerAvatar ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      period: `${record?.strategyPeriodStart ?? "2024-04-01"} – ${record?.strategyPeriodEnd ?? "2027-03-31"}`,
      tam: record?.keyMetrics?.tam ?? 1250000000,
      revenueForecast: record?.keyMetrics?.projectedRevenue ?? 680000000,
      overallScore: record?.sidebarSummary?.overallScore ?? 84,
      status: record?.status ?? "executive_review",
      roadmapId: record?.linkedProductRoadmapId ?? null,
    },
    {
      id: "ps-record-0018",
      strategyId: "PS-2024-0018",
      formCode: "PS-2024-09",
      strategyName: "Commercial BESS Power Stack 500kW",
      productName: "BESS Grid Stack 500",
      businessUnit: "Battery Energy Storage",
      pmName: "Ananya Rao",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      period: "2024-05-01 – 2027-04-30",
      tam: 2100000000,
      revenueForecast: 950000000,
      overallScore: 89,
      status: "approved",
      roadmapId: "PRM-2024-4412",
    },
    {
      id: "ps-record-0019",
      strategyId: "PS-2024-0019",
      formCode: "PS-2024-10",
      strategyName: "V2G Bi-Directional Cloud Dispatch",
      productName: "V2G Gateway Software",
      businessUnit: "Grid Software & SaaS",
      pmName: "Rahul Saxena",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      period: "2024-06-01 – 2027-05-31",
      tam: 850000000,
      revenueForecast: 420000000,
      overallScore: 78,
      status: "market_portfolio_strategy",
      roadmapId: null,
    },
    {
      id: "ps-record-0020",
      strategyId: "PS-2024-0020",
      formCode: "PS-2024-11",
      strategyName: "Residential 22kW Fast Charger Series",
      productName: "HomeCharger Ultra",
      businessUnit: "Consumer Mobility",
      pmName: "Pooja Hegde",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      period: "2024-07-01 – 2027-06-30",
      tam: 450000000,
      revenueForecast: 180000000,
      overallScore: 72,
      status: "financial_innovation_strategy",
      roadmapId: null,
    },
  ];

  const filteredRecords = recordsList.filter((r) => {
    const matchesSearch =
      r.strategyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.strategyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pmName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === "all" || r.status === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <AppShell
      title="Strategy Portfolio Register"
      breadcrumb="Development > Product Strategy"
      description="Central register of strategic product plans, market opportunity sizing, and stage status."
      tabs={<ProductStrategyTabBar />}
      topbarActions={
        <ErpButton
          variant="primary"
          size="sm"
          onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>New Strategy Record</span>
        </ErpButton>
      }
    >
      <div className="space-y-6 pb-12">
        {/* Search & Filter Toolbar */}
        <div className="card-soft p-4 bg-card border border-border/80 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search strategies, product names, PMs, or IDs..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="p-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Workflow Stages</option>
                <option value="strategic_vision">Strategic Vision</option>
                <option value="market_portfolio_strategy">Market & Portfolio Strategy</option>
                <option value="financial_innovation_strategy">Financial & Innovation Strategy</option>
                <option value="executive_review">Executive Review</option>
                <option value="approved">Approved</option>
                <option value="revision_required">Revision Required</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Showing {filteredRecords.length} records</span>
            <ErpButton variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </ErpButton>
          </div>
        </div>

        {/* Master Portfolio Table */}
        <div className="card-soft p-5 bg-card border border-border/80 rounded-xl shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                  <th className="p-3">Strategy ID</th>
                  <th className="p-3">Strategy Name</th>
                  <th className="p-3">Linked Product</th>
                  <th className="p-3">Business Unit</th>
                  <th className="p-3">Product Manager</th>
                  <th className="p-3">TAM (Market Size)</th>
                  <th className="p-3">3Y Revenue</th>
                  <th className="p-3">AI Score</th>
                  <th className="p-3">Workflow Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-semibold text-primary">
                      <div>{r.strategyId}</div>
                      <span className="text-[10px] text-muted-foreground">{r.formCode}</span>
                    </td>
                    <td className="p-3 font-medium text-foreground max-w-[220px] truncate" title={r.strategyName}>
                      {r.strategyName}
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        <span>{r.productName}</span>
                      </div>
                    </td>
                    <td className="p-3">{r.businessUnit}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={r.avatar} alt={r.pmName} className="w-5 h-5 rounded-full object-cover border border-primary/30" />
                        <span>{r.pmName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{formatCurrency(r.tam)}</td>
                    <td className="p-3 font-mono text-emerald-600 font-semibold">{formatCurrency(r.revenueForecast)}</td>
                    <td className="p-3 font-bold text-primary">{r.overallScore}/100</td>
                    <td className="p-3">
                      <StatusBadge status={r.status} />
                      {r.roadmapId && (
                        <div className="text-[10px] font-semibold text-emerald-600 mt-1">Roadmap: {r.roadmapId}</div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <ErpButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}
                        className="gap-1 text-xs"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </ErpButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
