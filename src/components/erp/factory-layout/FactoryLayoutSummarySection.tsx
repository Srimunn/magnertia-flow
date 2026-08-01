import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FactoryLayoutFormInput } from "@/services/types";

export function FactoryLayoutSummarySection({
  form,
}: {
  form: UseFormReturn<FactoryLayoutFormInput>;
}) {
  const { watch, setValue } = form;

  const layoutScore = watch("layoutPlanningScore") ?? 88;
  const infraScore = watch("infrastructureScore") ?? 86;
  const logisticsScore = watch("logisticsScore") ?? 85;
  const safetyScore = watch("utilitySafetyScore") ?? 88;
  const overallReadiness = watch("overallFactoryReadiness") ?? 87;

  const recommendations = [
    "Approve Factory Layout",
    "Optimize Material Flow",
    "Improve Space Utilization",
    "Increase Automation",
    "Expand Capacity",
    "Revalidate Layout",
    "Archive Project",
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            8
          </span>
          <CardTitle className="text-base font-bold">Factory Layout Summary & Decision Scorecard</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Executive readiness scorecard, weighted metric summary & final construction sign-off recommendation.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-center">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block">
              Layout Planning Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
                {layoutScore}
              </span>
              <span className="text-[10px] text-blue-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 text-center">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
              Infrastructure Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {infraScore}
              </span>
              <span className="text-[10px] text-emerald-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-center">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block">
              Logistics Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
                {logisticsScore}
              </span>
              <span className="text-[10px] text-purple-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 text-center">
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 block">
              Safety Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-300 font-mono">
                {safetyScore}
              </span>
              <span className="text-[10px] text-teal-500 font-bold font-mono">/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-primary bg-primary/5 dark:bg-primary/20 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-primary block">
              Overall Factory Readiness
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
              value={watch("recommendation") || "Approve Factory Layout"}
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
