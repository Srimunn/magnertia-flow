import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CapacityFormInput } from "@/services/types";

export function CapacitySummarySection({
  form,
}: {
  form: UseFormReturn<CapacityFormInput>;
}) {
  const { watch, setValue } = form;

  const assessmentScore = watch("assessmentScore") ?? 88;
  const resourceScore = watch("resourceScore") ?? 86;
  const bottleneckScore = watch("bottleneckScore") ?? 85;
  const simulationScore = watch("simulationScore") ?? 86;
  const performanceScore = watch("performanceScore") ?? 84;
  const overallReadiness = watch("overallCapacityReadiness") ?? 87;

  const recommendations = [
    "Approve Capacity Plan",
    "Expand Line 3 Capacity",
    "Add Automated Testing Rig",
    "Optimize Shift Pattern",
    "Reallocate Workforce",
    "Revalidate Plan",
    "Archive Plan",
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            8
          </span>
          <CardTitle className="text-base font-bold">Capacity Planning Summary & Decision Scorecard</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Executive readiness scorecard, weighted metric summary & final plant sign-off recommendation.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-center">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block">
              Assessment Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
                {assessmentScore}
              </span>
              <span className="text-[10px] text-blue-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 text-center">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
              Resource Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {resourceScore}
              </span>
              <span className="text-[10px] text-emerald-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-center">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block">
              Bottleneck Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
                {bottleneckScore}
              </span>
              <span className="text-[10px] text-purple-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 text-center">
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 block">
              Simulation Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-300 font-mono">
                {simulationScore}
              </span>
              <span className="text-[10px] text-teal-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/40 text-center">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 block">
              Performance Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
                {performanceScore}
              </span>
              <span className="text-[10px] text-amber-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-primary bg-primary/5 dark:bg-primary/20 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-primary block">
              Overall Readiness
            </span>
            <div className="relative my-1 inline-flex items-center justify-center">
              <span className="text-3xl font-extrabold text-primary font-mono">
                {overallReadiness}
              </span>
              <span className="text-xs text-primary font-bold font-mono">/100</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-foreground block">Engineering Recommendation</span>
            <span className="text-muted-foreground text-[11px]">
              Final action recommendation for plant executive review board.
            </span>
          </div>

          <div className="w-full sm:w-72">
            <Select
              value={watch("recommendation") || "Approve Capacity Plan"}
              onValueChange={(v) => setValue("recommendation", v)}
            >
              <SelectTrigger className="h-9 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300">
                <SelectValue placeholder="Select Recommendation" />
              </SelectTrigger>
              <SelectContent>
                {recommendations.map((rec) => (
                  <SelectItem key={rec} value={rec} className="text-xs font-medium">
                    {rec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
