import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { JigFormInput } from "@/services/types";

export function JigPerformanceSection({
  form,
}: {
  form: UseFormReturn<JigFormInput>;
}) {
  const { register, watch } = form;

  const performanceScore = watch("performanceScore") ?? 84;

  const trendData = [
    { month: "Jan", cycles: 20000, wear: 2.1 },
    { month: "Feb", cycles: 45000, wear: 4.5 },
    { month: "Mar", cycles: 70000, wear: 6.8 },
    { month: "Apr", cycles: 95000, wear: 9.0 },
    { month: "May", cycles: 115000, wear: 10.5 },
    { month: "Jun", cycles: 135000, wear: 12.0 },
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              6
            </span>
            <CardTitle className="text-base font-bold">Performance Monitoring</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Production cycle telemetry, tool wear index, downtime, MTBF, MTTR, and OEE contribution.
          </CardDescription>
        </div>

        {/* Score Card Badge */}
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 block tracking-wider">
              Performance Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                {performanceScore}
              </span>
              <span className="text-xs text-amber-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Jig Rated Life</span>
            <span className="text-sm font-bold text-foreground font-mono">500,000</span>
            <span className="text-[10px] text-muted-foreground block">Cycles</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Production Cycles</span>
            <span className="text-sm font-bold text-primary font-mono">135,000</span>
            <span className="text-[10px] text-muted-foreground block">Cycles</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Tool Wear</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">12 %</span>
            <span className="text-[10px] text-muted-foreground block">Measured</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">Downtime</span>
            <span className="text-sm font-bold text-foreground font-mono">2.20</span>
            <span className="text-[10px] text-muted-foreground block">Hrs/Month</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">MTBF</span>
            <span className="text-sm font-bold text-foreground font-mono">720</span>
            <span className="text-[10px] text-muted-foreground block">Hours</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">MTTR</span>
            <span className="text-sm font-bold text-foreground font-mono">1.15</span>
            <span className="text-[10px] text-muted-foreground block">Hours</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40">
            <span className="text-muted-foreground block text-[11px] font-medium">OEE Contribution</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">13.2 %</span>
            <span className="text-[10px] text-muted-foreground block">Efficiency</span>
          </div>
        </div>

        {/* Recharts Performance Trend Chart */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Production Cycle & Tool Wear Progression Trend
            </span>
            <span className="text-[10px] text-muted-foreground italic">
              *Historical telemetry (Jan – Jun 2024)
            </span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A3C75",
                    borderColor: "#0A3C75",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cycles"
                  stroke="#0A3C75"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0A3C75" }}
                  name="Cycles Run"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
