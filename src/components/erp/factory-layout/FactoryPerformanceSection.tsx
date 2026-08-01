import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { FactoryLayoutFormInput } from "@/services/types";

export function FactoryPerformanceSection({
  form,
}: {
  form: UseFormReturn<FactoryLayoutFormInput>;
}) {
  const { watch } = form;

  const perfScore = watch("factoryEfficiencyScore") ?? 87;

  const efficiencyTrendData = [
    { month: "Jan", efficiency: 72 },
    { month: "Feb", efficiency: 76 },
    { month: "Mar", efficiency: 80 },
    { month: "Apr", efficiency: 83 },
    { month: "May", efficiency: 85 },
    { month: "Jun", efficiency: 87 },
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              6
            </span>
            <CardTitle className="text-base font-bold">Factory Performance & Efficiency Telemetry</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Space utilization index, material transport distance, annual throughput, warehouse & energy efficiency rating.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 block tracking-wider">
              Factory Efficiency Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                {perfScore}
              </span>
              <span className="text-xs text-amber-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Space Utilization</span>
            <span className="text-sm font-bold text-primary font-mono">78 %</span>
            <span className="text-[10px] text-muted-foreground block">Optimized</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Material Travel</span>
            <span className="text-sm font-bold text-foreground font-mono">1.62</span>
            <span className="text-[10px] text-muted-foreground block">km/day</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Production Throughput</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">250,000</span>
            <span className="text-[10px] text-muted-foreground block">Units/Year</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Warehouse Efficiency</span>
            <span className="text-sm font-bold text-foreground font-mono">92 %</span>
            <span className="text-[10px] text-muted-foreground block">Storage Index</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Energy Efficiency</span>
            <span className="text-sm font-bold text-foreground font-mono">86 %</span>
            <span className="text-[10px] text-muted-foreground block">Green Benchmark</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Equipment Access</span>
            <span className="text-sm font-bold text-foreground font-mono">90 %</span>
            <span className="text-[10px] text-muted-foreground block">Maintenance Clearance</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Efficiency Progression Trend (Jan – Jun 2024)
            </span>
            <span className="text-[10px] text-muted-foreground italic">
              *Validated by Digital Twin Simulation
            </span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A3C75",
                    borderColor: "#0A3C75",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="efficiency" fill="#0A3C75" radius={[4, 4, 0, 0]} name="Efficiency %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
