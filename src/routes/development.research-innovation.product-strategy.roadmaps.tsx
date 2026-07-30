import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Map,
  CheckCircle2,
  Clock,
  Zap,
  Calendar,
  Award,
  ChevronRight,
  Plus,
  Layers,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ProductStrategyTabBar } from "@/components/erp/ProductStrategyTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import { productStrategyService } from "@/services";

export const Route = createFileRoute(
  "/development/research-innovation/product-strategy/roadmaps",
)({
  head: () => ({ meta: [{ title: "Product Roadmaps · Magnertia ERP" }] }),
  component: ProductStrategyRoadmapsPage,
});

export function ProductStrategyRoadmapsPage() {
  const navigate = useNavigate();

  const { data: record } = useQuery({
    queryKey: ["productStrategyRecord"],
    queryFn: () => productStrategyService.fetchRecord(),
  });

  const roadmaps = [
    {
      id: record?.linkedProductRoadmapId ?? "PRM-2024-8842",
      productName: record?.linkedProductName ?? "Smart EV Charger Pro",
      strategyId: record?.strategyId ?? "PS-2024-0017",
      pmName: record?.productManagerName ?? "Vikram Sharma",
      status: "active",
      approvalDate: "2024-04-20",
      milestones: [
        { quarter: "Q3 2024", title: "Alpha Prototype Verification & DISCOM Pilot", status: "completed", date: "15 Sep 2024" },
        { quarter: "Q4 2024", title: "OCPP 2.0.1 Cloud Telemetry & Beta Fleet Trial", status: "in_progress", date: "15 Nov 2024" },
        { quarter: "Q1 2025", title: "Commercial Manufacturing Release (150 Units)", status: "upcoming", date: "31 Mar 2025" },
        { quarter: "Q2 2025", title: "V2G Grid Balancing Software Integration", status: "upcoming", date: "30 Jun 2025" },
      ],
    },
    {
      id: "PRM-2024-4412",
      productName: "BESS Grid Stack 500",
      strategyId: "PS-2024-0018",
      pmName: "Ananya Rao",
      status: "active",
      approvalDate: "2024-05-10",
      milestones: [
        { quarter: "Q3 2024", title: "Cell Pack Thermal Simulation & Safety Testing", status: "completed", date: "30 Aug 2024" },
        { quarter: "Q4 2024", title: "Containerized Power Inverter Integration", status: "in_progress", date: "20 Dec 2024" },
        { quarter: "Q1 2025", title: "Commercial Grid Utility Commissioning", status: "upcoming", date: "15 Apr 2025" },
      ],
    },
  ];

  return (
    <AppShell
      title="Product Roadmaps"
      breadcrumb="Development > Product Strategy"
      description="Execution roadmaps auto-generated upon Executive Committee approval of Product Strategy records."
      tabs={<ProductStrategyTabBar />}
      topbarActions={
        <ErpButton
          variant="primary"
          size="sm"
          onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>New Strategy Form</span>
        </ErpButton>
      }
    >
      <div className="space-y-6 pb-12">
        {roadmaps.map((rm) => (
          <div key={rm.id} className="card-soft p-6 bg-card border border-border/80 rounded-xl space-y-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    {rm.id}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{rm.productName}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Linked Strategy: <strong className="text-foreground">{rm.strategyId}</strong></span>
                  <span>PM: <strong className="text-foreground">{rm.pmName}</strong></span>
                  <span>Approved: <strong>{rm.approvalDate}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status="active" />
                <ErpButton
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: "/development/research-innovation/product-strategy/new" })}
                  className="gap-1 text-xs"
                >
                  <span>View Strategy</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </ErpButton>
              </div>
            </div>

            {/* Milestones Pipeline Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {rm.milestones.map((ms, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    ms.status === "completed"
                      ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                      : ms.status === "in_progress"
                      ? "bg-primary/10 border-primary text-foreground"
                      : "bg-muted/30 border-border text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-primary">{ms.quarter}</span>
                    {ms.status === "completed" ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Done</span>
                    ) : ms.status === "in_progress" ? (
                      <span className="text-[10px] text-primary font-bold bg-primary/20 px-2 py-0.5 rounded">In Progress</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Upcoming</span>
                    )}
                  </div>
                  <p className="font-medium text-foreground leading-snug">{ms.title}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Target: {ms.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
