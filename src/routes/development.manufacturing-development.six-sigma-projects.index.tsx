import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/erp/AppShell";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";
import { Gauge, Target, TrendingUp, Filter, Plus, FileCheck, CheckSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/development/manufacturing-development/six-sigma-projects/")({
  component: SixSigmaProjectsPage,
});

export function SixSigmaProjectsPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs = <ManufacturingDevelopmentTabBar />,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const projects = [
    { id: "SS-2026-001", title: "SMT Solder Defect Reduction (DPMO Reduction)", phase: "Control", lead: "Dr. Rajesh Kumar", cpk: "1.67", dpmo: "3.4", savings: "$145,000", status: "Active" },
    { id: "SS-2026-002", title: "Automated Stator Winding Variance Minimization", phase: "Improve", lead: "Sarah Jenkins", cpk: "1.52", dpmo: "12.8", savings: "$98,000", status: "Active" },
    { id: "SS-2026-003", title: "Enclosure Injection Mold Shrinkage Control", phase: "Analyze", lead: "Michael Chang", cpk: "1.33", dpmo: "45.0", savings: "$72,000", status: "In Review" },
    { id: "SS-2026-004", title: "High-Voltage Harness Terminal Crimp Yield", phase: "Measure", lead: "Priya Sharma", cpk: "1.28", dpmo: "68.2", savings: "$110,000", status: "Active" },
  ];

  return (
    <AppShell
      title="Six Sigma Projects"
      breadcrumb={breadcrumb}
      description="Manage DMAIC projects, statistical process control, process capability (Cpk), and defect reduction."
      tabs={tabs}
    >
      <div className="space-y-6 pb-16">
        {/* Header Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Active DMAIC Projects</span>
              <Gauge className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">12 Projects</div>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">↑ 3 Completed this quarter</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Avg Process Capability (Cpk)</span>
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">1.54 Cpk</div>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">Target ≥ 1.67 Six Sigma</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Overall Defect Rate (DPMO)</span>
              <CheckSquare className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">14.2 DPMO</div>
            <p className="mt-1 text-[11px] text-purple-600 font-medium">↓ 42% reduction YTD</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Cost Savings Realized</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">$425,000</div>
            <p className="mt-1 text-[11px] text-blue-600 font-medium">Validated by Finance</p>
          </div>
        </div>

        {/* Filter & Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="relative flex-1 w-full sm:w-auto max-w-md">
            <input
              type="text"
              placeholder="Search DMAIC projects, leads, or phases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" /> Launch DMAIC Project
            </Button>
          </div>
        </div>

        {/* Project Table */}
        <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3">Project ID & Title</th>
                  <th className="px-4 py-3">DMAIC Phase</th>
                  <th className="px-4 py-3">Project Lead</th>
                  <th className="px-4 py-3">Process Cpk</th>
                  <th className="px-4 py-3">DPMO</th>
                  <th className="px-4 py-3">Annual Savings</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-[10px] text-muted-foreground">{p.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {p.phase}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-muted-foreground">{p.lead}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{p.cpk}</td>
                    <td className="px-4 py-3 font-medium">{p.dpmo}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{p.savings}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        {p.status}
                      </span>
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
