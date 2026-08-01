import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Bot,
  Play,
  ArrowRight,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { CapacityFormInput, CapacityPlanningRecord } from "@/services/types";
import { toast } from "sonner";

export function CapacityOverviewSection({
  form,
  record,
}: {
  form: UseFormReturn<CapacityFormInput>;
  record: CapacityPlanningRecord;
}) {
  const { watch } = form;

  const overallReadiness = watch("overallCapacityReadiness") ?? 87;

  const demandTrendData = [
    { month: "Jul 2024", demand: 52000, available: 75000, planned: 48000 },
    { month: "Aug 2024", demand: 75000, available: 95000, planned: 72000 },
    { month: "Sep 2024", demand: 82000, available: 110000, planned: 78000 },
    { month: "Oct 2024", demand: 78000, available: 108000, planned: 75000 },
    { month: "Nov 2024", demand: 80000, available: 110000, planned: 77000 },
    { month: "Dec 2024", demand: 85000, available: 122000, planned: 82000 },
    { month: "Jan 2025", demand: 82000, available: 118000, planned: 79000 },
    { month: "Feb 2025", demand: 86000, available: 120000, planned: 83000 },
    { month: "Mar 2025", demand: 95000, available: 130000, planned: 92000 },
    { month: "Apr 2025", demand: 102000, available: 140000, planned: 98000 },
    { month: "May 2025", demand: 98000, available: 135000, planned: 95000 },
    { month: "Jun 2025", demand: 120000, available: 145000, planned: 118000 },
  ];

  const machineUtilData = [
    { line: "Line 1", util: 82 },
    { line: "Line 2", util: 76 },
    { line: "Line 3", util: 85 },
    { line: "Line 4", util: 71 },
    { line: "Line 5", util: 80 },
  ];

  const workforceData = [
    { station: "S1", loading: 75 },
    { station: "S2", loading: 82 },
    { station: "S3", loading: 77 },
    { station: "S4", loading: 69 },
    { station: "S5", loading: 80 },
  ];

  const oeeTrendData = [
    { month: "Jan 2025", oee: 78 },
    { month: "Feb 2025", oee: 80 },
    { month: "Mar 2025", oee: 83 },
    { month: "Apr 2025", oee: 81 },
    { month: "May 2025", oee: 85 },
    { month: "Jun 2025", oee: 84 },
  ];

  return (
    <div className="space-y-6">
      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Readiness Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Overall Capacity Readiness
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {overallReadiness}
              </span>
              <span className="text-[9px] text-emerald-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">High Readiness</span>
        </Card>

        {/* Demand Forecast */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            Total Demand Forecast
          </span>
          <div className="my-1">
            <span className="text-2xl font-extrabold text-foreground font-mono">120,000</span>
            <span className="text-[10px] text-muted-foreground block font-medium">For Selected Period</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" /> ▲ 12.5% vs Last Period
          </div>
        </Card>

        {/* Production Volume */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            Planned Production Volume
          </span>
          <div className="my-1">
            <span className="text-2xl font-extrabold text-foreground font-mono">118,000</span>
            <span className="text-[10px] text-muted-foreground block font-medium">For Selected Period</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" /> ▲ 10.3% vs Last Period
          </div>
        </Card>

        {/* Capacity Utilization */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            Capacity Utilization
          </span>
          <div className="my-1 inline-flex items-center justify-center">
            <div className="h-14 w-14 rounded-full border-4 border-blue-500 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <span className="text-base font-bold text-blue-700 dark:text-blue-300 font-mono">
                78%
              </span>
            </div>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">Overall Optimal</span>
        </Card>

        {/* OEE */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            OEE Rating
          </span>
          <div className="my-1 inline-flex items-center justify-center">
            <div className="h-14 w-14 rounded-full border-4 border-teal-500 bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
              <span className="text-base font-bold text-teal-700 dark:text-teal-300 font-mono">
                82%
              </span>
            </div>
          </div>
          <span className="text-[10px] text-teal-600 font-semibold">Overall World Class</span>
        </Card>

        {/* Bottleneck Status */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            Bottleneck Status
          </span>
          <div className="my-1 flex flex-col items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mb-0.5" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
              Identified
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">2 Active Bottlenecks</span>
        </Card>
      </div>

      {/* Main Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recharts Trend Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Demand vs Capacity Trend Chart */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Demand vs Capacity Trend (Units)</CardTitle>
                <CardDescription className="text-xs">
                  Monthly demand forecast vs available capacity vs planned production volume.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                Monthly View
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demandTrendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0A3C75",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="demand"
                      stroke="#2563eb"
                      strokeWidth={2}
                      name="Demand Forecast"
                    />
                    <Line
                      type="monotone"
                      dataKey="available"
                      stroke="#059669"
                      strokeWidth={2}
                      name="Available Capacity"
                    />
                    <Line
                      type="monotone"
                      dataKey="planned"
                      stroke="#d97706"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Planned Production"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Machine & Workforce Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Machine Utilization Bar Chart */}
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold">Machine Utilization (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={machineUtilData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="line" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="util" fill="#0A3C75" radius={[4, 4, 0, 0]} name="Utilization %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Workforce Loading Bar Chart */}
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold">Workforce Loading (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workforceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="station" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="loading" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Loading %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Bottlenecks Table */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold">Top Bottlenecks</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] h-7 text-primary gap-1"
                onClick={() => toast.info("Navigating to Bottleneck Analysis")}
              >
                View All Bottlenecks <ArrowRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-xs">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-muted-foreground uppercase text-[10px]">
                  <div className="col-span-3">Workstation</div>
                  <div className="col-span-4">Equipment</div>
                  <div className="col-span-3">Constraint</div>
                  <div className="col-span-2 text-right">Impact</div>
                </div>

                {record.bottlenecks.map((b) => (
                  <div key={b.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center">
                    <div className="col-span-3 font-bold text-primary font-mono">{b.workstation}</div>
                    <div className="col-span-4 font-medium text-foreground">{b.equipment}</div>
                    <div className="col-span-3 text-muted-foreground">{b.constraint}</div>
                    <div className="col-span-2 text-right">
                      <Badge
                        variant="outline"
                        className={
                          b.impact === "High"
                            ? "bg-red-50 text-red-700 border-red-200 text-[10px]"
                            : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                        }
                      >
                        {b.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resource Allocation Summary Cards */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Resource Allocation Summary</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] h-7 text-primary gap-1"
                onClick={() => toast.info("Navigating to Resource Planning")}
              >
                View Resource Plan <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block font-mono">68 / 80</span>
                  <span className="text-[10px] text-muted-foreground block">Machines</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block font-mono">320 / 360</span>
                  <span className="text-[10px] text-muted-foreground block">Workforce</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-purple-600 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block font-mono">95%</span>
                  <span className="text-[10px] text-muted-foreground block">Tools</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block font-mono">94%</span>
                  <span className="text-[10px] text-muted-foreground block">Materials</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                <Zap className="h-5 w-5 text-teal-600 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block font-mono">100%</span>
                  <span className="text-[10px] text-muted-foreground block">Utilities</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: AI Capacity Insights & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Capacity Insights Widget */}
          <Card className="border-border/80 shadow-xs bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/40 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI Capacity Insights
              </CardTitle>
              <Badge className="bg-indigo-600 text-white text-[10px]">
                Score {watch("aiCapacityScore") ?? 88}/100
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> AI Demand Forecast
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiDemandForecastInsight") || "Q3 demand will increase by 18%."}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> AI Capacity Optimization
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiCapacityOptimization") || "Increase Line 3 shifts for +12% capacity."}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> AI Expansion Recommendation
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiExpansionRecommendation") || "Add 1 Testing Station to reduce bottleneck."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              {[
                "Run Capacity Simulation",
                "Generate Capacity Plan",
                "Export Capacity Report",
                "View Capacity Dashboard",
                "View Bottleneck Analysis",
                "View Resource Plan",
                "View AI Recommendations",
              ].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => toast.info(`Action triggered: ${act}`)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground transition-colors font-medium text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    {act}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
