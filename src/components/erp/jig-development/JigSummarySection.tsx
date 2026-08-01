import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import type { JigFormInput } from "@/services/types";

export function JigSummarySection({
  form,
}: {
  form: UseFormReturn<JigFormInput>;
}) {
  const { watch, setValue } = form;

  const designScore = watch("designReviewScore") ?? 88;
  const mfgScore = watch("manufacturingReadinessScore") ?? 85;
  const validationScore = watch("validationScore") ?? 87;
  const commissioningScore = watch("commissioningScore") ?? 86;
  const performanceScore = watch("performanceScore") ?? 84;
  const overallReadiness = watch("overallJigReadiness") ?? 87;

  const recommendations = [
    "Approve for Production",
    "Improve Jig Design",
    "Improve Tool Guidance",
    "Revalidate Jig",
    "Schedule Preventive Maintenance",
    "Upgrade Jig",
    "Archive Project",
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            8
          </span>
          <CardTitle className="text-base font-bold">Jig Development Summary</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Executive readiness scorecard, weighted metric summary & final release decision recommendation.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Ring Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3">
          {/* Design Score */}
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-center">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block">
              Design Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
                {designScore}
              </span>
              <span className="text-[10px] text-blue-500 font-bold font-mono">/100</span>
            </div>
          </div>

          {/* Manufacturing Score */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 text-center">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
              Manufacturing Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {mfgScore}
              </span>
              <span className="text-[10px] text-emerald-500 font-bold font-mono">/100</span>
            </div>
          </div>

          {/* Validation Score */}
          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-center">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block">
              Validation Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
                {validationScore}
              </span>
              <span className="text-[10px] text-purple-500 font-bold font-mono">/100</span>
            </div>
          </div>

          {/* Commissioning Score */}
          <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 text-center">
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 block">
              Commissioning Score
            </span>
            <div className="relative my-2 inline-flex items-center justify-center">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-300 font-mono">
                {commissioningScore}
              </span>
              <span className="text-[10px] text-teal-500 font-bold font-mono">/100</span>
            </div>
          </div>

          {/* Overall Readiness Score Ring */}
          <div className="p-3.5 rounded-xl border-2 border-primary bg-primary/5 dark:bg-primary/20 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-primary block">
              Overall Jig Readiness
            </span>
            <div className="relative my-1 inline-flex items-center justify-center">
              <span className="text-3xl font-extrabold text-primary font-mono">
                {overallReadiness}
              </span>
              <span className="text-xs text-primary font-bold font-mono">/100</span>
            </div>
          </div>
        </div>

        {/* Recommendation Dropdown Row */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-foreground block">Engineering Recommendation</span>
            <span className="text-muted-foreground text-[11px]">
              Final action recommendation for executive review board sign-off.
            </span>
          </div>

          <div className="w-full sm:w-72">
            <Select
              value={watch("recommendation") || "Approve for Production"}
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
