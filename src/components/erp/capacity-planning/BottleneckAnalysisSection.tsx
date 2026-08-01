import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { CapacityFormInput } from "@/services/types";

export function BottleneckAnalysisSection({
  form,
}: {
  form: UseFormReturn<CapacityFormInput>;
}) {
  const { watch } = form;

  const bottleneckScore = watch("bottleneckScore") ?? 85;
  const bottlenecks = watch("bottlenecks") || [];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Bottleneck Identification & Root Cause Analysis
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Capacity constraints, machine cycle time bottlenecks, root causes & estimated capacity gain.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-purple-600 dark:text-purple-400 block tracking-wider">
              Resolution Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                {bottleneckScore}
              </span>
              <span className="text-xs text-purple-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border border-border/80 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 text-xs">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold text-muted-foreground uppercase text-[10px] border-b border-border">
            <div className="col-span-2">Workstation</div>
            <div className="col-span-3">Equipment / Process</div>
            <div className="col-span-2">Constraint</div>
            <div className="col-span-3">Root Cause & Action</div>
            <div className="col-span-2 text-right">Estimated Gain</div>
          </div>

          <div className="divide-y divide-border/60">
            {bottlenecks.map((btn) => (
              <div key={btn.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-white dark:hover:bg-slate-800/80 transition-colors">
                <div className="col-span-2 font-bold text-primary font-mono flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  {btn.workstation}
                </div>

                <div className="col-span-3 font-semibold text-foreground">
                  {btn.equipment}
                </div>

                <div className="col-span-2 font-medium text-slate-700 dark:text-slate-300">
                  <Badge
                    variant="outline"
                    className={
                      btn.impact === "High"
                        ? "bg-red-50 text-red-700 border-red-200 text-[10px]"
                        : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                    }
                  >
                    {btn.constraint}
                  </Badge>
                </div>

                <div className="col-span-3 text-[11px] text-muted-foreground space-y-0.5">
                  <p className="text-foreground font-medium">{btn.rootCause}</p>
                  <p className="text-primary text-[10px] italic">Action: {btn.improvementActions}</p>
                </div>

                <div className="col-span-2 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {btn.estimatedGain}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
